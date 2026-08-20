import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AccountOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }, { data: licenses }, { data: activity }, { data: entitlements }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('user_id', user?.id).single(),
    supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user?.id).single(),
    supabase.from('licenses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
    supabase.from('audit_logs').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('entitlements').select('feature_key, value').eq('user_id', user?.id).order('feature_key')
  ]);

  const planName = subscription?.plans?.name || 'FREE';
  const planIsActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const license = licenses?.[0];
  const enabledEntitlements = (entitlements ?? []).filter((entitlement) => entitlement.value === 'true');
  const entitlementLabels: Record<string, string> = {
    basic_agent: 'Basic agent',
    basic_filesystem: 'Basic filesystem controls',
    basic_scanning: 'Basic scanning',
    advanced_sandbox: 'Advanced sandbox',
    advanced_reports: 'Advanced reports',
    premium_support: 'Premium support',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Overview</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Your Aegis security posture at a glance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* A. Account Status */}
        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>ACCOUNT</div>
          <p style={{ fontSize: '16px', marginBottom: '24px' }}>{profile?.display_name || user?.email}</p>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '8px' }}>SECURITY STATUS</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
            PROTECTED
          </div>
        </div>

        {/* B. Subscription */}
        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>CURRENT PLAN</div>
          <p style={{ fontSize: '24px', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--orange)', marginBottom: '8px', textTransform: 'uppercase' }}>{planName}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', color: planIsActive ? '#4ade80' : 'var(--muted)' }}>
              {planIsActive ? 'Active' : 'Inactive'}
            </span>
            {subscription?.plans?.price != null && (
              <span style={{ fontSize: '14px' }}>${subscription.plans.price} / mo</span>
            )}
          </div>
          
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
            Next billing: <strong style={{ color: 'var(--text)' }}>
              {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
            </strong>
          </p>
          
          <Link href="/account/subscription" className="hero-btn hero-btn-secondary" style={{ width: '100%', textAlign: 'center', padding: '10px', fontSize: '12px', display: 'block' }}>
            Manage Subscription
          </Link>
        </div>

        {/* C. License */}
        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>LICENSE</div>
          
          {license ? (
            <>
              <p style={{ fontSize: '24px', fontFamily: 'Space Grotesk, sans-serif', color: '#4ade80', marginBottom: '24px' }}>{license.status.toUpperCase()}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Activations</span>
                  <span>{license.activation_count} / {license.activation_limit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Expires</span>
                  <span>{license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
              <Link href="/account/license" className="hero-btn hero-btn-secondary" style={{ width: '100%', textAlign: 'center', padding: '10px', fontSize: '12px', display: 'block' }}>
                Manage License
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>Basic / Limited</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px', flex: 1 }}>Free plan access is active. Upgrade your plan to unlock full Aegis PreFlight licensing.</p>
              <Link href="/pricing" className="hero-btn hero-btn-primary" style={{ width: '100%', textAlign: 'center', padding: '10px', fontSize: '12px', display: 'block' }}>
                Upgrade
              </Link>
            </div>
          )}
        </div>

      </div>

      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>FEATURES</div>
        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          {enabledEntitlements.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '14px' }}>
              {enabledEntitlements.map((entitlement) => (
                <li key={entitlement.feature_key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--orange)' }}>✓</span>
                  <span>{entitlementLabels[entitlement.feature_key] ?? entitlement.feature_key.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>No entitlements found for this account.</p>
          )}
        </div>
      </div>

      {/* D. Security Activity */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>RECENT ACTIVITY</div>
        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          {activity && activity.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activity.map(log => (
                <li key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--orange)' }}>✓</span>
                  <span>{log.action.replace(/_/g, ' ')}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '12px', marginLeft: 'auto' }}>
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>No recent activity.</p>
          )}
        </div>
      </div>
      
    </div>
  );
}
