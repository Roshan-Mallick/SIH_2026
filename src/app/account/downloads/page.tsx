import { createClient } from "@/lib/supabase/server";

export default async function AccountDownloadsPage() {
  const supabase = await createClient();
  const { data: releases } = await supabase
    .from('releases')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Downloads</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Download the local sandbox environment and security engine.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {releases && releases.length > 0 ? (
          releases.map(release => (
            <div key={release.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px', border: '1px solid var(--line)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{release.platform} {release.architecture}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Version {release.version} • {new Date(release.created_at).toLocaleDateString()}</p>
              </div>
              <a href={release.download_url} className="hero-btn hero-btn-primary">Download</a>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '48px', color: 'var(--line)', marginBottom: '16px' }}>☁</div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Coming Soon</h3>
            <p style={{ color: 'var(--muted)' }}>The desktop application is currently in early access.</p>
          </div>
        )}
      </div>
    </div>
  );
}
