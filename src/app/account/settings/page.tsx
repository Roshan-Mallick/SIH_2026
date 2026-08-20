import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Manage your account security and preferences.</p>
      </div>

      <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '600px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '24px' }}>PROFILE</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Email Address</label>
            <input type="email" value={user?.email} disabled style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--muted)', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Account ID</label>
            <input type="text" value={user?.id} disabled style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--muted)', fontSize: '14px', fontFamily: 'monospace' }} />
          </div>
        </div>

      </div>

      <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', maxWidth: '600px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '24px' }}>SECURITY</div>
        
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Password reset functionality is currently handled via email.</p>
        <button className="hero-btn hero-btn-secondary" style={{ padding: '12px', fontSize: '12px' }}>Request Password Reset</button>
      </div>
    </div>
  );
}
