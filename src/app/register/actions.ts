'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSafeReturnPath } from '@/lib/auth/redirects'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/register?error=missing_fields')
  }

  if (password.length < 8) {
    redirect('/register?error=password_too_short')
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('AUTH SIGNUP', { email, stage: 'start' })
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=/account`,
    },
  })

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('AUTH SIGNUP', { email, stage: 'error', message: error.message })
    }

    const code = error.message.toLowerCase().includes('email') ? 'invalid_email' : 'signup_failed'
    redirect(`/register?error=${code}`)
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('AUTH SIGNUP', {
      email,
      stage: 'success',
      userId: data.user?.id,
      session: data.session ? 'present' : 'absent',
    })
  }

  revalidatePath('/', 'layout')

  if (data.session) {
    redirect('/account')
  }

  redirect('/login?message=check_email')
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const returnUrl = getSafeReturnPath(formData.get('returnUrl') ?? '/account')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
    },
  })

  if (error || !data.url) {
    redirect('/register?error=oauth_failed')
  }

  redirect(data.url)
}

export async function signInWithGitHub(formData: FormData) {
  const supabase = await createClient()
  const returnUrl = getSafeReturnPath(formData.get('returnUrl') ?? '/account')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
    },
  })

  if (error || !data.url) {
    redirect('/register?error=oauth_failed')
  }

  redirect(data.url)
}
