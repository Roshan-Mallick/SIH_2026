import { createClient } from "@/lib/supabase/server";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user?.id)
    .single();

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Subscription</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Manage your billing cycle and plan details.</p>

      <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--orange)', marginBottom: '24px' }}>Current Plan</h2>
        
        {subscription ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 600 }}>{subscription.plans?.name || 'Professional'}</p>
                <p style={{ color: 'var(--muted)' }}>Status: <span style={{ color: subscription.status === 'active' ? '#4ade80' : 'var(--orange)' }}>{subscription.status}</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>${subscription.plans?.price || 20} <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 400 }}>/{subscription.plans?.billing_interval || 'mo'}</span></p>
              </div>
            </div>
            
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>Current period ends: <strong style={{ color: 'var(--text)' }}>{new Date(subscription.current_period_end).toLocaleDateString()}</strong></p>
              {subscription.cancel_at_period_end && (
                <p style={{ fontSize: '14px', color: '#ef4444' }}>Cancels at period end.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <form action="/api/billing-portal" method="POST" style={{ flex: 1 }}>
                <button type="submit" className="hero-btn hero-btn-secondary" style={{ width: '100%' }}>Manage Billing</button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>You are currently on the Free Community plan.</p>
            <a href="/pricing" className="hero-btn hero-btn-primary">Upgrade Plan</a>
          </div>
        )}
      </div>
    </div>
  );
}
