import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription || !subscription.stripe_customer_id) {
      return NextResponse.json({ error: 'No active customer found' }, { status: 400 })
    }

    // Development mode fallback if Stripe is not fully configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json({ error: 'Stripe is not configured in this environment.' }, { status: 501 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Billing portal error:', error)
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 })
  }
}
