import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function DownloadsPage() {
  const supabase = await createClient();
  const { data: releases } = await supabase
    .from('releases')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <main>
      <header className="site-shell" style={{ borderBottom: '1px solid var(--line)', padding: '20px 40px' }}>
        <Navbar type="site" />
      </header>
      
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '120px' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p className="pill">DOWNLOADS</p>
          <h1 className="hero-title">Aegis <span>Desktop</span></h1>
          <p className="hero-desc" style={{ margin: '20px auto 0' }}>Download the local sandbox environment and security engine.</p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {releases && releases.length > 0 ? (
            releases.map(release => (
              <div key={release.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px', border: '1px solid var(--line)', borderRadius: '16px', background: 'rgba(20, 14, 12, 0.78)' }}>
                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{release.platform} {release.architecture}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Version {release.version} • {new Date(release.created_at).toLocaleDateString()}</p>
                </div>
                <a href={release.download_url} className="hero-btn hero-btn-primary">Download</a>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--line)', borderRadius: '16px' }}>
              <div style={{ fontSize: '48px', color: 'var(--line)', marginBottom: '16px' }}>☁</div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Coming Soon</h3>
              <p style={{ color: 'var(--muted)' }}>The desktop application is currently in early access.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
