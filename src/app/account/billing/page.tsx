import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Billing</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Manage your payment methods and billing history.</p>

      <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '600px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--orange)', marginBottom: '16px' }}>Payment Method</h2>
        
        {subscription && subscription.stripe_customer_id ? (
          <div>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Your payment methods are securely managed by Stripe.</p>
            <form action="/api/billing-portal" method="POST">
              <button type="submit" className="hero-btn hero-btn-secondary">Update Payment Method</button>
            </form>
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>You don't have a payment method on file.</p>
        )}
      </div>

      <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--orange)', marginBottom: '16px' }}>Billing History</h2>
        
        {subscription && subscription.stripe_customer_id ? (
          <div>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>View your past invoices and receipts.</p>
            <form action="/api/billing-portal" method="POST">
              <button type="submit" className="hero-btn hero-btn-secondary">View Invoices</button>
            </form>
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>No billing history available.</p>
        )}
      </div>
    </div>
  );
}
