'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSafeReturnPath } from '@/lib/auth/redirects'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const returnUrl = getSafeReturnPath(formData.get('returnUrl'))

  if (!email || !password) {
    redirect(`/login?error=missing_fields&returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('AUTH LOGIN', { email, returnUrl, stage: 'start' })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('AUTH LOGIN', { email, stage: 'error', message: error.message })
    }

    redirect(`/login?error=invalid_credentials&returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('AUTH LOGIN', {
      email,
      stage: 'success',
      userId: data.user?.id,
      session: data.session ? 'present' : 'absent',
    })
  }

  revalidatePath('/', 'layout')
  redirect(returnUrl)
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const returnUrl = getSafeReturnPath(formData.get('returnUrl'))

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
    },
  })

  if (error || !data.url) {
    redirect(`/login?error=oauth_failed&returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  redirect(data.url)
}

export async function signInWithGitHub(formData: FormData) {
  const supabase = await createClient()
  const returnUrl = getSafeReturnPath(formData.get('returnUrl'))

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
    },
  })

  if (error || !data.url) {
    redirect(`/login?error=oauth_failed&returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  redirect(data.url)
}
