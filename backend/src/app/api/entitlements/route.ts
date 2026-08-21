import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'

export async function GET() {
  try {
    const supabase = await createApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: entitlements, error } = await supabase
      .from('entitlements')
      .select('feature_key, value, expires_at')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching entitlements:', error)
      return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 })
    }
    
    // Also fetch plan features as a base
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plans(features, slug)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
      
    let plan = 'free'
    let planFeatures = {}
    
    if (sub && sub.plans) {
      plan = sub.plans.slug
      planFeatures = sub.plans.features || {}
    } else {
      const { data: freePlan } = await supabase
        .from('plans')
        .select('features')
        .eq('slug', 'free')
        .single()
      if (freePlan) {
        planFeatures = freePlan.features || {}
      }
    }

    return NextResponse.json({ 
      plan,
      entitlements: entitlements || [],
      plan_features: planFeatures
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
