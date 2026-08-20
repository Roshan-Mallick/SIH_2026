globalThis.WebSocket = class WebSocket { constructor() {} send() {} close() {} };
import { createClient } from '@supabase/supabase-js'

const FREE_FEATURES = {
  basic_agent: true,
  basic_filesystem: true,
  basic_scanning: true,
  advanced_sandbox: false,
  advanced_reports: false,
  premium_support: false,
}

const trimEnv = (name) => String(process.env[name] ?? '').trim()

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
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error

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
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        development_test_user: true,
      },
    })
    if (error) throw error
    return { user: data.user, created: false }
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      development_test_user: true,
    },
  })
  if (error) throw error
  return { user: data.user, created: true }
}

async function ensureProfile(supabase, userId) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (!existing?.length) {
    await supabase.from('profiles').insert({ user_id: userId })
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

  const { data: existing } = await supabase
    .from('plans')
    .select('*')
    .eq('slug', 'free')
    .limit(1)

  if (existing?.length) {
    const { data } = await supabase
      .from('plans')
      .update(body)
      .eq('slug', 'free')
      .select()
    return data[0]
  }

  const { data } = await supabase
    .from('plans')
    .insert(body)
    .select()
  return data[0]
}

async function ensureFreeSubscription(supabase, userId, planId) {
  const { data: existingRows } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
  
  const existing = existingRows?.[0]

  if (existing) {
    const { data } = await supabase
      .from('subscriptions')
      .update({
        plan_id: planId,
        status: 'active',
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        canceled_at: null,
        trial_start: null,
        trial_end: null,
      })
      .eq('id', existing.id)
      .select()

    return data[0]
  }

  const { data } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
    })
    .select()

  return data[0]
}

async function ensureEntitlements(supabase, userId, subscriptionId, features) {
  const desired = Object.entries(features).map(([featureKey, enabled]) => ({
    feature_key: featureKey,
    value: String(enabled),
  }))

  const { data: existing } = await supabase
    .from('entitlements')
    .select('id, feature_key')
    .eq('user_id', userId)
    .eq('source', 'free_plan')

  const existingByKey = new Map((existing ?? []).map((row) => [row.feature_key, row.id]))

  for (const entitlement of desired) {
    const existingId = existingByKey.get(entitlement.feature_key)

    if (existingId) {
      await supabase
        .from('entitlements')
        .update({
          subscription_id: subscriptionId,
          value: entitlement.value,
          expires_at: null,
        })
        .eq('id', existingId)
      continue
    }

    await supabase.from('entitlements').insert({
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
  const [profilesRes, subscriptionsRes, entitlementsRes] = await Promise.all([
    supabase.from('profiles').select('id').eq('user_id', userId).limit(1),
    supabase.from('subscriptions').select('status, plans(name, slug)').eq('user_id', userId).order('created_at', { ascending: true }).limit(1),
    supabase.from('entitlements').select('feature_key, value').eq('user_id', userId).eq('source', 'free_plan'),
  ])

  const subscription = subscriptionsRes.data?.[0]
  const plans = subscription?.plans

  // If plans is an array (due to how Supabase returns joins sometimes)
  const planName = Array.isArray(plans) ? plans[0]?.name : plans?.name

  return {
    hasProfile: Boolean(profilesRes.data?.[0]),
    planName: planName ?? null,
    subscriptionStatus: subscription?.status ?? null,
    entitlementCount: entitlementsRes.data?.length ?? 0,
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

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const { user, created } = await ensureUser(supabaseAdmin, email, password)
  const freePlan = await ensureFreePlan(supabaseAdmin)
  await ensureProfile(supabaseAdmin, user.id)
  const subscription = await ensureFreeSubscription(supabaseAdmin, user.id, freePlan.id)
  await ensureEntitlements(supabaseAdmin, user.id, subscription.id, freePlan.features ?? FREE_FEATURES)

  const verification = await verifySeed(supabaseAdmin, user.id)

  const supabaseAnon = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  })

  if (!verification.hasProfile || verification.planName !== 'FREE' || verification.subscriptionStatus !== 'active') {
    fail('Test user was created, but profile or Free plan verification failed.')
  }

  if (authError || !authData.session || authData.user.id !== user.id) {
    fail(`Test user password verification failed. Error: ${authError?.message || 'No session created.'}`)
  }

  console.log('Test authentication: PASS')
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
