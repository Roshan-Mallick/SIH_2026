import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-07-29.dahlia',
  appInfo: {
    name: 'Aegis PreFlight',
    version: '0.1.0',
  },
})
