import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'

export async function GET() {
  try {
    const supabase = await createApiClient()
    const { data: plans, error } = await supabase
      .from('plans')
      .select('id, name, slug, description, price, currency, billing_interval, features')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) {
      console.error('Error fetching plans:', error)
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
    }

    return NextResponse.json({ plans })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
