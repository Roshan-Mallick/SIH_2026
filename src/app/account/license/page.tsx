import { createClient } from "@/lib/supabase/server";

export default async function LicensePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: licenses } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', user?.id);

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>License Keys</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Manage your Aegis desktop application licenses.</p>

      {licenses && licenses.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {licenses.map(license => (
            <div key={license.id} style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--orange)' }}>Aegis Desktop {license.product}</h3>
                <span style={{ padding: '4px 8px', borderRadius: '4px', background: license.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 107, 44, 0.1)', color: license.status === 'active' ? '#4ade80' : 'var(--orange)', fontSize: '12px', fontWeight: 600 }}>{license.status.toUpperCase()}</span>
              </div>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontFamily: 'monospace', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', userSelect: 'all' }}>{license.license_key}</span>
                <button style={{ background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>COPY</button>
              </div>
              <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--muted)' }}>
                <span>Activations: <strong style={{ color: 'var(--text)' }}>{license.activation_count} / {license.activation_limit}</strong></span>
                {license.expires_at && <span>Expires: <strong style={{ color: 'var(--text)' }}>{new Date(license.expires_at).toLocaleDateString()}</strong></span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '48px', border: '1px dashed var(--line)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>You don't have any active licenses.</p>
          <a href="/pricing" className="hero-btn hero-btn-primary">View Plans</a>
        </div>
      )}
    </div>
  );
}
