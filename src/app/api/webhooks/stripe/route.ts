import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const reqHeaders = await headers()
  const signature = reqHeaders.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  // Need service role key to bypass RLS for webhooks
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Idempotency check
  const { data: existingEvent } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    return NextResponse.json({ received: true, message: 'Already processed' })
  }

  // Log event
  await supabase.from('stripe_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event,
    processed: false
  })

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as any;
        // Map Stripe customer back to Supabase user
        const { data: userProfile } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        // Normally we'd handle mapping plan_id here based on price
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userProfile?.user_id, // Note: Need a proper customer-user mapping
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' });
        
        break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // On checkout complete, we map customer to user_id via client_reference_id
        if (session.client_reference_id) {
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: session.client_reference_id,
              stripe_customer_id: session.customer as string,
              status: 'incomplete', // Will be updated by subscription webhook
            });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Mark processed
    await supabase
      .from('stripe_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id)

  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
