const DEFAULT_AUTH_DESTINATION = '/account'

export function getSafeReturnPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== 'string') {
    return DEFAULT_AUTH_DESTINATION
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_AUTH_DESTINATION
  }

  try {
    const parsed = new URL(trimmed, 'http://aegis.local')

    if (parsed.origin !== 'http://aegis.local') {
      return DEFAULT_AUTH_DESTINATION
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return DEFAULT_AUTH_DESTINATION
  }
}

export function getAuthErrorMessage(code: string | string[] | undefined) {
  const value = Array.isArray(code) ? code[0] : code

  switch (value) {
    case 'missing_fields':
      return 'Enter your email address and password.'
    case 'password_too_short':
      return 'Use a password with at least 8 characters.'
    case 'invalid_email':
      return 'Enter a valid email address.'
    case 'invalid_credentials':
      return 'Invalid email or password.'
    case 'signup_failed':
      return 'Unable to create your account. Please check your email and password.'
    case 'login_failed':
      return 'Unable to log in. Please try again.'
    case 'auth_callback_failed':
      return 'Unable to confirm your email link. Please try logging in.'
    case 'oauth_cancelled':
      return 'Sign-in was cancelled. Please try again.'
    case 'oauth_failed':
      return 'Unable to sign in with that provider. Please try again or use email and password.'
    default:
      return null
  }
}

export function getAuthMessage(code: string | string[] | undefined) {
  const value = Array.isArray(code) ? code[0] : code

  switch (value) {
    case 'check_email':
      return 'Check your email to confirm your account, then log in.'
    default:
      return null
  }
}
