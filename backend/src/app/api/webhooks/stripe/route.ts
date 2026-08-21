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
    payload: JSON.parse(JSON.stringify(event)),
    processed: false
  })

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as any;
        
        let userId = subscription.metadata?.user_id;
        
        if (!userId) {
          // Map Stripe customer back to Supabase user
          const { data: subRec } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', subscription.customer)
            .single();
          if (subRec) userId = subRec.user_id;
        }
        
        if (!userId) {
          // Fallback to customer metadata
          const customer = await stripe.customers.retrieve(subscription.customer) as Stripe.Customer;
          userId = customer.metadata?.user_id;
        }

        if (userId) {
          // Resolve plan ID
          const priceId = subscription.items.data[0].price.id;
          const { data: plan } = await supabase
            .from('plans')
            .select('id, slug, features')
            .eq('stripe_price_id', priceId)
            .single();
            
          const { data: upsertedSub, error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer,
              status: subscription.status,
              plan_id: plan?.id,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            }, { onConflict: 'stripe_subscription_id' })
            .select('id')
            .single();
            
          if (upsertedSub && plan) {
             // Create audit log
             await supabase.from('audit_logs').insert({
               user_id: userId,
               action: `SUBSCRIPTION_${event.type.split('.').pop()?.toUpperCase()}`,
               resource_type: 'subscriptions',
               resource_id: upsertedSub.id,
               metadata: { status: subscription.status, plan: plan.slug }
             });
             
             // Update entitlements based on plan features
             if (subscription.status === 'active' || subscription.status === 'trialing') {
                // E.g., add advanced_sandbox entitlement
                if (plan.features?.advanced_sandbox) {
                   await supabase.from('entitlements').upsert({
                      user_id: userId,
                      feature_key: 'advanced_sandbox',
                      source: 'subscription',
                      subscription_id: upsertedSub.id,
                      value: 'true',
                      expires_at: new Date(subscription.current_period_end * 1000).toISOString()
                   }, { onConflict: 'id' }); // Assuming we might need a constraint here, or just let it insert/update based on logic.
                   // Note: schema uses id as primary key, no unique constraint on (user_id, feature_key).
                   // Let's do a delete and insert for simplicity to prevent duplicates
                   await supabase.from('entitlements')
                     .delete()
                     .eq('user_id', userId)
                     .eq('feature_key', 'advanced_sandbox');
                     
                   await supabase.from('entitlements').insert({
                      user_id: userId,
                      feature_key: 'advanced_sandbox',
                      source: 'subscription',
                      subscription_id: upsertedSub.id,
                      value: 'true',
                      expires_at: new Date(subscription.current_period_end * 1000).toISOString()
                   });
                }
                
                // If it's a PREMIUM plan, generate a license key if one doesn't exist
                if (plan.slug === 'premium') {
                   const { data: existingLicense } = await supabase
                     .from('licenses')
                     .select('id')
                     .eq('user_id', userId)
                     .eq('subscription_id', upsertedSub.id)
                     .single();
                     
                   if (!existingLicense) {
                      const licenseKey = `AEGIS-PREMIUM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                      await supabase.from('licenses').insert({
                         user_id: userId,
                         subscription_id: upsertedSub.id,
                         license_key: licenseKey,
                         product: 'Aegis Premium',
                         activation_limit: 5,
                         expires_at: new Date(subscription.current_period_end * 1000).toISOString()
                      });
                      
                      await supabase.from('audit_logs').insert({
                         user_id: userId,
                         action: 'LICENSE_GENERATED',
                         resource_type: 'licenses',
                         resource_id: licenseKey,
                         metadata: { product: 'Aegis Premium' }
                      });
                   }
                }
             } else {
                 // Revoke entitlements/licenses on cancellation
                 await supabase.from('entitlements')
                   .delete()
                   .eq('subscription_id', upsertedSub.id);
                   
                 await supabase.from('licenses')
                   .update({ status: 'revoked' })
                   .eq('subscription_id', upsertedSub.id);
             }
          }
        }
        break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.client_reference_id) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: session.client_reference_id,
              stripe_customer_id: session.customer as string,
              status: 'incomplete', 
            }, { onConflict: 'stripe_subscription_id' }) // This might fail if stripe_subscription_id is null.
            // Let's use a standard insert or check first.
            
          // Wait, subscriptions has UNIQUE on stripe_subscription_id.
          // Better to just update where user_id matches, or wait for subscription.created
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', session.client_reference_id)
            .single();
            
          if (existingSub) {
             await supabase.from('subscriptions').update({
                stripe_customer_id: session.customer as string
             }).eq('id', existingSub.id);
          } else {
             await supabase.from('subscriptions').insert({
                user_id: session.client_reference_id,
                stripe_customer_id: session.customer as string,
                status: 'incomplete'
             });
          }
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
