import { createServerClient } from '@supabase/ssr'
import { headers } from 'next/headers'

export async function createApiClient() {
  const reqHeaders = await headers()
  const authHeader = reqHeaders.get('authorization')
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {}
      },
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined
      }
    }
  )
}
