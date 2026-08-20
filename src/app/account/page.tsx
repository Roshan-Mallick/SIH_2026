import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Account Overview</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Manage your Aegis PreFlight account settings and subscriptions.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--orange)', marginBottom: '16px' }}>Profile Information</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>EMAIL</p>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>{user?.email}</p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>ACCOUNT ID</p>
          <p style={{ fontSize: '14px', fontFamily: 'monospace' }}>{user?.id}</p>
        </div>

        <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--orange)', marginBottom: '16px' }}>Active Subscription</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>CURRENT PLAN</p>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>Free Tier</p>
          <button className="mini-btn" style={{ background: 'transparent', border: '1px solid var(--orange)', color: 'var(--orange)' }}>
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
