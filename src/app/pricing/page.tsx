import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
        
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <Navbar type="site" />
          
          <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '80px' }}>
            <p className="pill">PRICING</p>
            <h1 className="hero-title">Choose your <span>protection.</span></h1>
            <p className="hero-desc" style={{ margin: '20px auto 0' }}>Security that scales with your workflow.</p>
          </div>

          <div className="cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', margin: '0 auto' }}>
            {/* Free Plan */}
            <article className="card visual-card" style={{ padding: '32px' }}>
              <div className="scan-lines"></div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>FREE</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', minHeight: '40px' }}>For getting started.</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>$0</span>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--body-copy)' }}>
                <li>✓ Single local agent</li>
                <li>✓ Basic filesystem controls</li>
                <li>✓ Basic secret/leak scanning</li>
                <li>✓ Basic security checks</li>
                <li>✓ Community support</li>
              </ul>
              {user ? (
                <Link href="/account" className="hero-btn hero-btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Go to Account</Link>
              ) : (
                <Link href="/register" className="hero-btn hero-btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Get Started</Link>
              )}
            </article>

            {/* Plus Plan */}
            <article className="card intelligence-card" style={{ padding: '32px', borderColor: 'var(--orange)' }}>
              <div className="card-icon" style={{ top: '32px', right: '32px' }}>♧</div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--orange)' }}>PLUS</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', minHeight: '40px' }}>For serious developers.</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>$20</span>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--body-copy)' }}>
                <li>✓ Everything in Free</li>
                <li>✓ Multi-agent support</li>
                <li>✓ Advanced security policies</li>
                <li>✓ Dependency & code scanning</li>
                <li>✓ Detailed security reports</li>
                <li>✓ Priority support</li>
              </ul>
              {user ? (
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="planId" value="price_placeholder_plus" />
                  <button type="submit" className="hero-btn hero-btn-primary" style={{ width: '100%' }}>Choose Plus</button>
                </form>
              ) : (
                <Link href="/login?redirect=/pricing" className="hero-btn hero-btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Choose Plus</Link>
              )}
            </article>
            
            {/* Premium Plan */}
            <article className="card code-card" style={{ padding: '32px' }}>
              <div className="card-icon" style={{ top: '32px', right: '32px' }}>☁</div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>PREMIUM</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', minHeight: '40px' }}>For advanced teams/security.</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>$50</span>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--body-copy)' }}>
                <li>✓ Everything in Plus</li>
                <li>✓ Advanced sandboxing</li>
                <li>✓ Advanced threat analysis</li>
                <li>✓ Full audit reports</li>
                <li>✓ Expanded license activations</li>
                <li>✓ Premium support</li>
              </ul>
              {user ? (
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="planId" value="price_placeholder_premium" />
                  <button type="submit" className="hero-btn hero-btn-secondary" style={{ width: '100%' }}>Choose Premium</button>
                </form>
              ) : (
                <Link href="/login?redirect=/pricing" className="hero-btn hero-btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Choose Premium</Link>
              )}
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
