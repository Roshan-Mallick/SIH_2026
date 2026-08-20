import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/pricing')
  }

  const formData = await req.formData()
  const priceId = formData.get('planId') as string

  // Using a placeholder price check for MVP. In reality, fetch from database.
  if (priceId === 'price_placeholder_pro' && !process.env.STRIPE_SECRET_KEY) {
    // Development mode fallback if Stripe is not configured
    return NextResponse.json({ error: 'Stripe is not configured in this environment.' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    })

    if (session.url) {
      redirect(session.url)
    } else {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
