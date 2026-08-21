import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabase = await createApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { plan_slug } = body

    if (!plan_slug) {
      return NextResponse.json({ error: 'Plan slug is required' }, { status: 400 })
    }

    // Resolve the server-side Stripe price ID using service role to bypass RLS if needed,
    // though plans are readable by anyone.
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('stripe_price_id')
      .eq('slug', plan_slug)
      .eq('is_active', true)
      .single()

    if (planError || !plan || !plan.stripe_price_id) {
      return NextResponse.json({ error: 'Invalid or unavailable plan' }, { status: 400 })
    }

    // Development mode fallback if Stripe is not fully configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json({ error: 'Stripe is not configured in this environment.' }, { status: 501 })
    }
    
    // Find if user already has a stripe customer id
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()
      
    let customerId = subscription?.stripe_customer_id
    
    if (!customerId) {
       // Create stripe customer if not exists
       const customer = await stripe.customers.create({
         email: user.email,
         metadata: {
           user_id: user.id
         }
       })
       customerId = customer.id
       
       // Note: we can insert a skeleton subscription here or wait for webhook
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
