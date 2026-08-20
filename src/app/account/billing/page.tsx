import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user?.id)
    .single();

  const planName = subscription?.plans?.name || 'FREE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Billing overview</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Manage your payment methods and billing history.</p>
      </div>

      <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '600px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '24px' }}>CURRENT BILLING</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--muted)' }}>Current plan</span>
          <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{planName}</span>
        </div>

        {subscription && subscription.stripe_customer_id ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--muted)' }}>Payment method</span>
              <span>•••• ••••</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <span style={{ color: 'var(--muted)' }}>Next payment</span>
              <span>{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}</span>
            </div>
            
            <form action="/api/billing-portal" method="POST">
              <button type="submit" className="hero-btn hero-btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '12px' }}>Manage via Stripe</button>
            </form>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--muted)' }}>Payment method</span>
              <span>None</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <span style={{ color: 'var(--muted)' }}>Next payment</span>
              <span>N/A</span>
            </div>
            <Link href="/pricing" className="hero-btn hero-btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '12px', fontSize: '12px' }}>
              View Paid Plans
            </Link>
          </>
        )}
      </div>

      <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '600px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '24px' }}>BILLING HISTORY</div>
        
        {subscription && subscription.stripe_customer_id ? (
          <div>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>View your past invoices and receipts securely in the Stripe customer portal.</p>
            <form action="/api/billing-portal" method="POST">
              <button type="submit" className="hero-btn hero-btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '12px' }}>View Invoices</button>
            </form>
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No billing history available.</p>
        )}
      </div>
    </div>
  );
}
