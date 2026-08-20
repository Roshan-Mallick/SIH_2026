import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user?.id)
    .single();

  const isFree = !subscription || !subscription.plans || subscription.plans.name === 'FREE';
  const planName = subscription?.plans?.name || 'FREE';
  
  let features = [
    'Single local agent',
    'Basic filesystem controls',
    'Basic secret/leak scanning',
    'Basic security checks',
    'Community support'
  ];

  if (planName === 'PLUS') {
    features = [
      'Everything in Free',
      'Multi-agent support',
      'Advanced security policies',
      'Dependency & code scanning',
      'Detailed security reports',
      'Priority support'
    ];
  } else if (planName === 'PREMIUM') {
    features = [
      'Everything in Plus',
      'Advanced sandboxing',
      'Advanced threat analysis',
      'Full audit reports',
      'Expanded license activations',
      'Premium support'
    ];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Subscription</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Manage your plan, features, and billing cycle.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Current Plan */}
          <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>YOUR PLAN</div>
            <p style={{ fontSize: '32px', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--orange)', marginBottom: '8px', textTransform: 'uppercase' }}>{planName}</p>
            
            <div style={{ marginBottom: '24px', color: subscription?.status === 'active' ? '#4ade80' : 'var(--muted)', fontSize: '14px' }}>
              {isFree ? 'Active' : (subscription?.status === 'active' ? 'Active' : (subscription?.status || 'Inactive'))}
            </div>

            <p style={{ fontSize: '20px', fontWeight: 500, marginBottom: '24px' }}>
              {isFree ? '$0' : `$${subscription?.plans?.price || 0}`} <span style={{ fontSize: '14px', color: 'var(--muted)' }}>/ month</span>
            </p>

            {!isFree && subscription && (
              <>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                    Next billing date: <strong style={{ color: 'var(--text)' }}>
                      {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                    </strong>
                  </p>
                  {subscription.cancel_at_period_end && (
                    <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>Cancels at period end. Access remains active until then.</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <form action="/api/billing-portal" method="POST" style={{ flex: 1 }}>
                    <button type="submit" className="hero-btn hero-btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '12px' }}>
                      Manage Billing
                    </button>
                  </form>
                </div>
              </>
            )}
            {isFree && (
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>You are currently on the free tier.</p>
            )}
          </div>

          {/* Plan Features */}
          <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>PLAN FEATURES</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--body-copy)' }}>
              {features.map((f, i) => (
                <li key={i}>✓ {f}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Change Plan */}
        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '24px' }}>CHANGE PLAN</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Free */}
            <div style={{ padding: '16px', border: `1px solid ${planName === 'FREE' ? 'var(--orange)' : 'var(--line)'}`, borderRadius: '8px', background: planName === 'FREE' ? 'rgba(255,107,44,0.05)' : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>FREE</h4>
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>$0/mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Basic protection</p>
                {planName === 'FREE' ? (
                  <span style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: 700 }}>CURRENT PLAN</span>
                ) : (
                  <form action="/api/billing-portal" method="POST">
                    <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text)', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>Downgrade</button>
                  </form>
                )}
              </div>
            </div>

            {/* Plus */}
            <div style={{ padding: '16px', border: `1px solid ${planName === 'PLUS' ? 'var(--orange)' : 'var(--line)'}`, borderRadius: '8px', background: planName === 'PLUS' ? 'rgba(255,107,44,0.05)' : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>PLUS</h4>
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>$20/mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Advanced protection</p>
                {planName === 'PLUS' ? (
                  <span style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: 700 }}>CURRENT PLAN</span>
                ) : (
                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="planId" value="price_placeholder_plus" />
                    <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text)', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>
                      {planName === 'FREE' ? 'Upgrade' : 'Switch'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Premium */}
            <div style={{ padding: '16px', border: `1px solid ${planName === 'PREMIUM' ? 'var(--orange)' : 'var(--line)'}`, borderRadius: '8px', background: planName === 'PREMIUM' ? 'rgba(255,107,44,0.05)' : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>PREMIUM</h4>
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>$50/mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Maximum protection</p>
                {planName === 'PREMIUM' ? (
                  <span style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: 700 }}>CURRENT PLAN</span>
                ) : (
                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="planId" value="price_placeholder_premium" />
                    <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text)', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>Upgrade</button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
