import { createClient } from "@/lib/supabase/server";

export default async function LicensePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: licenses }, { data: subscription }] = await Promise.all([
    supabase.from('licenses').select('*').eq('user_id', user?.id),
    supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user?.id).single()
  ]);

  const planName = subscription?.plans?.name || 'FREE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>License Keys</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Manage your Aegis desktop application licenses.</p>
      </div>

      {licenses && licenses.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {licenses.map(license => (
            <div key={license.id} style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '800px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '16px' }}>AEGIS PRE FLIGHT LICENSE</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Status</div>
                  <div style={{ color: license.status === 'active' ? '#4ade80' : 'var(--orange)', fontSize: '16px', fontWeight: 600 }}>
                    {license.status.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Plan</div>
                  <div style={{ color: 'var(--orange)', fontSize: '16px', fontWeight: 600 }}>
                    {planName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Activations</div>
                  <div style={{ fontSize: '16px' }}>
                    {license.activation_count} / {license.activation_limit}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Issued</div>
                  <div style={{ fontSize: '16px' }}>
                    {new Date(license.issued_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Expires</div>
                  <div style={{ fontSize: '16px' }}>
                    {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontFamily: 'monospace', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', userSelect: 'all', fontSize: '15px' }}>{license.license_key}</span>
                <button style={{ background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>COPY</button>
              </div>

              {license.status === 'active' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="hero-btn hero-btn-secondary" style={{ padding: '8px 16px', minWidth: 'auto', fontSize: '11px', height: 'auto' }}>Deactivate</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '64px', border: '1px dashed var(--line)', borderRadius: '12px', textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: 'var(--text)', fontSize: '18px', marginBottom: '8px' }}>No active license</p>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>No active license is associated with this account. Upgrade your plan to unlock Aegis PreFlight.</p>
          <a href="/pricing" className="hero-btn hero-btn-primary" style={{ display: 'inline-block' }}>View Plans</a>
        </div>
      )}
    </div>
  );
}
