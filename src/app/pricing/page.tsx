import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main>
      <section className="hero" style={{ minHeight: 'auto', padding: '120px 24px 60px' }}>
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-6"></div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
          <Navbar type="site" />
          
          <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '80px' }}>
            <p className="pill">PRICING</p>
            <h1 className="hero-title">Choose your <span>protection.</span></h1>
            <p className="hero-desc" style={{ margin: '20px auto 0' }}>Select the Aegis PreFlight plan that fits your security needs.</p>
          </div>

          <div className="cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Free Plan */}
            <article className="card visual-card" style={{ padding: '32px' }}>
              <div className="scan-lines"></div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Community</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>Essential security controls</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>$0</span>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--body-copy)' }}>
                <li>✓ Single local agent</li>
                <li>✓ Basic filesystem control</li>
                <li>✓ Gitleaks scanning</li>
              </ul>
              {user ? (
                <button className="hero-btn hero-btn-secondary" style={{ width: '100%' }} disabled>Current Plan</button>
              ) : (
                <a href="/register" className="hero-btn hero-btn-secondary" style={{ width: '100%', textAlign: 'center' }}>Sign Up</a>
              )}
            </article>

            {/* Pro Plan */}
            <article className="card intelligence-card" style={{ padding: '32px', borderColor: 'var(--orange)' }}>
              <div className="card-icon" style={{ top: '32px', right: '32px' }}>♧</div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--orange)' }}>Professional</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>Advanced sandboxing & reports</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>$20</span>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--body-copy)' }}>
                <li>✓ Multi-agent support</li>
                <li>✓ Advanced security policies</li>
                <li>✓ Dependency & code scanning</li>
                <li>✓ Full audit reports</li>
              </ul>
              <form action="/api/checkout" method="POST">
                <input type="hidden" name="planId" value="price_placeholder_pro" />
                <button type="submit" className="hero-btn hero-btn-primary" style={{ width: '100%' }}>Subscribe</button>
              </form>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
