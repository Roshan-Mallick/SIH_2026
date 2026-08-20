const FREE_FEATURES = {
  basic_agent: true,
  basic_filesystem: true,
  basic_scanning: true,
  advanced_sandbox: false,
  advanced_reports: false,
  premium_support: false,
}

const trimEnv = (name) => String(process.env[name] ?? '').trim()

function createSupabaseAdmin(url, serviceRoleKey) {
  const baseUrl = url.replace(/\/+$/, '')
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  }

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`${options.method ?? 'GET'} ${path} failed (${response.status}): ${body}`)
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  return {
    auth: {
      listUsers: (page, perPage) => request(`/auth/v1/admin/users?page=${page}&per_page=${perPage}`),
      createUser: (body) => request('/auth/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      updateUser: (id, body) => request(`/auth/v1/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    },
    db: {
      select: (table, query) => request(`/rest/v1/${table}?${query}`, {
        headers: { Accept: 'application/json' },
      }),
      insert: (table, body) => request(`/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(body),
      }),
      patch: (table, query, body) => request(`/rest/v1/${table}?${query}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(body),
      }),
    },
  }
}

async function verifyPasswordSession(supabaseUrl, anonKey, email, password) {
  const baseUrl = supabaseUrl.replace(/\/+$/, '')
  const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Password synchronization verification failed (${response.status}): ${body}`)
  }

  const data = await response.json()

  return {
    hasSession: Boolean(data.access_token && data.refresh_token),
    userId: data.user?.id ?? null,
  }
}

function fail(message) {
  console.error(`ERROR:\n${message}`)
  process.exit(1)
}

function assertDevelopmentOnly() {
  const nodeEnv = trimEnv('NODE_ENV')
  const vercelEnv = trimEnv('VERCEL_ENV')

  if (nodeEnv === 'production' || vercelEnv === 'production') {
    fail('Test user creation is disabled in production.')
  }
}

function requireEnv(name) {
  const value = trimEnv(name)

  if (!value) {
    fail(`${name} is required.`)
  }

  return value
}

async function findUserByEmail(supabase, email) {
  let page = 1
  const perPage = 100

  while (true) {
    const data = await supabase.auth.listUsers(page, perPage)
    const users = data?.users ?? []
    const user = users.find((candidate) => candidate.email?.toLowerCase() === email)

    if (user || users.length < perPage) {
      return user ?? null
    }

    page += 1
  }
}

async function ensureUser(supabase, email, password) {
  const existingUser = await findUserByEmail(supabase, email)

  if (existingUser) {
    const data = await supabase.auth.updateUser(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        development_test_user: true,
      },
    })
    return { user: data, created: false }
  }

  const data = await supabase.auth.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      development_test_user: true,
    },
  })
  return { user: data, created: true }
}

async function ensureProfile(supabase, userId) {
  const existing = await supabase.db.select('profiles', `select=id&user_id=eq.${encodeURIComponent(userId)}&limit=1`)

  if (!existing?.length) {
    await supabase.db.insert('profiles', { user_id: userId })
  }
}

async function ensureFreePlan(supabase) {
  const body = {
    name: 'FREE',
    slug: 'free',
    description: 'Basic protection for individual users.',
    price: 0,
    billing_interval: 'mo',
    currency: 'usd',
    is_active: true,
    stripe_product_id: null,
    stripe_price_id: null,
    features: FREE_FEATURES,
  }

  const existing = await supabase.db.select('plans', 'select=*&slug=eq.free&limit=1')

  if (existing?.length) {
    const updated = await supabase.db.patch('plans', 'slug=eq.free', body)
    return updated[0]
  }

  const created = await supabase.db.insert('plans', body)
  return created[0]
}

async function ensureFreeSubscription(supabase, userId, planId) {
  const existingRows = await supabase.db.select('subscriptions', `select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.asc&limit=1`)
  const existing = existingRows?.[0]

  if (existing) {
    const updated = await supabase.db.patch(
      'subscriptions',
      `id=eq.${encodeURIComponent(existing.id)}`,
      {
        plan_id: planId,
        status: 'active',
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        canceled_at: null,
        trial_start: null,
        trial_end: null,
      },
    )

    return updated[0]
  }

  const created = await supabase.db.insert('subscriptions', {
      user_id: userId,
      plan_id: planId,
      status: 'active',
  })

  return created[0]
}

async function ensureEntitlements(supabase, userId, subscriptionId, features) {
  const desired = Object.entries(features).map(([featureKey, enabled]) => ({
    feature_key: featureKey,
    value: String(enabled),
  }))

  const existing = await supabase.db.select('entitlements', `select=id,feature_key&user_id=eq.${encodeURIComponent(userId)}&source=eq.free_plan`)

  const existingByKey = new Map((existing ?? []).map((row) => [row.feature_key, row.id]))

  for (const entitlement of desired) {
    const existingId = existingByKey.get(entitlement.feature_key)

    if (existingId) {
      await supabase.db.patch(
        'entitlements',
        `id=eq.${encodeURIComponent(existingId)}`,
        {
          subscription_id: subscriptionId,
          value: entitlement.value,
          expires_at: null,
        },
      )

      continue
    }

    await supabase.db.insert('entitlements', {
      user_id: userId,
      subscription_id: subscriptionId,
      feature_key: entitlement.feature_key,
      source: 'free_plan',
      value: entitlement.value,
      expires_at: null,
    })
  }
}

async function verifySeed(supabase, userId) {
  const [profiles, subscriptions, entitlements] = await Promise.all([
    supabase.db.select('profiles', `select=id&user_id=eq.${encodeURIComponent(userId)}&limit=1`),
    supabase.db.select('subscriptions', `select=status,plans(name,slug)&user_id=eq.${encodeURIComponent(userId)}&order=created_at.asc&limit=1`),
    supabase.db.select('entitlements', `select=feature_key,value&user_id=eq.${encodeURIComponent(userId)}&source=eq.free_plan`),
  ])
  const subscription = subscriptions?.[0]

  return {
    hasProfile: Boolean(profiles?.[0]),
    planName: subscription?.plans?.name ?? null,
    subscriptionStatus: subscription?.status ?? null,
    entitlementCount: entitlements?.length ?? 0,
  }
}

async function main() {
  assertDevelopmentOnly()

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const email = requireEnv('DEV_TEST_EMAIL').toLowerCase()
  const password = requireEnv('DEV_TEST_PASSWORD')

  if (password.length < 8) {
    fail('DEV_TEST_PASSWORD must be at least 8 characters.')
  }

  const supabase = createSupabaseAdmin(supabaseUrl, serviceRoleKey)

  const { user, created } = await ensureUser(supabase, email, password)
  const freePlan = await ensureFreePlan(supabase)
  await ensureProfile(supabase, user.id)
  const subscription = await ensureFreeSubscription(supabase, user.id, freePlan.id)
  await ensureEntitlements(supabase, user.id, subscription.id, freePlan.features ?? FREE_FEATURES)

  const verification = await verifySeed(supabase, user.id)
  const passwordVerification = await verifyPasswordSession(supabaseUrl, anonKey, email, password)

  if (!verification.hasProfile || verification.planName !== 'FREE' || verification.subscriptionStatus !== 'active') {
    fail('Test user was created, but profile or Free plan verification failed.')
  }

  if (!passwordVerification.hasSession || passwordVerification.userId !== user.id) {
    fail('Test user password was updated, but Supabase did not return a matching login session.')
  }

  console.log('Aegis development test user')
  console.log(`User ID: ${user.id}`)
  console.log(`Email: ${email}`)
  console.log(`Confirmed: ${user.email_confirmed_at ? 'yes' : 'no'}`)
  console.log('Password: synchronized')
  console.log(`Plan: ${verification.planName}`)
  console.log(`Status: ${verification.subscriptionStatus}`)
  console.log(`Entitlements: ${verification.entitlementCount}`)
  console.log(`Created now: ${created ? 'yes' : 'no'}`)
}

main().catch((error) => {
  console.error('ERROR:')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
