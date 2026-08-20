import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription || !subscription.stripe_customer_id) {
    return NextResponse.json({ error: 'No active customer found' }, { status: 400 })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`,
    })

    redirect(session.url)
  } catch (error: any) {
    console.error('Billing portal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
