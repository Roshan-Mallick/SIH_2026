import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSafeReturnPath } from '@/lib/auth/redirects'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getSafeReturnPath(requestUrl.searchParams.get('next'))

  // Handle OAuth provider errors (e.g. user cancelled, access denied)
  const oauthError = requestUrl.searchParams.get('error')
  if (oauthError) {
    const errorDesc = requestUrl.searchParams.get('error_description') ?? ''
    if (process.env.NODE_ENV !== 'production') {
      console.error('AUTH CALLBACK OAuth error', { oauthError, errorDesc })
    }
    const code = oauthError === 'access_denied' ? 'oauth_cancelled' : 'oauth_failed'
    return NextResponse.redirect(new URL(`/login?error=${code}`, requestUrl.origin))
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('AUTH CALLBACK', { stage: 'error', message: error.message })
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', requestUrl.origin))
}
