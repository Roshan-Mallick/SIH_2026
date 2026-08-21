import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'

export async function GET() {
  try {
    const supabase = await createApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: licenses, error } = await supabase
      .from('licenses')
      .select('id, status, product, issued_at, expires_at, activation_limit, activation_count')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching licenses:', error)
      return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 })
    }

    return NextResponse.json({ licenses: licenses || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
