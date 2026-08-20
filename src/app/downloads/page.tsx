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
      <section className="hero" style={{ minHeight: '100vh', padding: '24px' }}>
        {/* Background orbs */}
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-5"></div>
          <div className="orb orb-6"></div>
          <div className="orb orb-7"></div>
        </div>

        <div className="hero-glass" style={{ maxWidth: '1000px' }}>
          <div className="hero-inner" style={{ padding: '40px 48px 60px' }}>
            <Navbar type="site" />

            <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '80px' }}>
              <p className="pill">DOWNLOADS</p>
              <h1 className="hero-title">Aegis <span>Desktop</span></h1>
              <p className="hero-desc" style={{ margin: '20px auto 0' }}>
                Download the local sandbox environment and security engine.
              </p>
            </div>

            <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {releases && releases.length > 0 ? (
                releases.map((release: { id: string; platform: string; architecture: string; version: string; created_at: string; download_url: string }) => (
                  <div
                    key={release.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '28px 32px',
                      border: '1px solid var(--line)',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>{release.platform} {release.architecture}</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                        Version {release.version} · {new Date(release.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <a href={release.download_url} className="hero-btn hero-btn-primary">Download</a>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px',
                  border: '1px dashed var(--line)',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  <div style={{ fontSize: '48px', color: 'var(--orange)', marginBottom: '16px', opacity: 0.5 }}>☁</div>
                  <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Coming Soon</h3>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>The desktop application is currently in early access.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
