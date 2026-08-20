import Link from "next/link";
import { login } from "./actions";
import { getAuthErrorMessage, getAuthMessage, getSafeReturnPath } from "@/lib/auth/redirects";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    message?: string | string[];
    returnUrl?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params?.error);
  const statusMessage = getAuthMessage(params?.message);
  const rawReturnUrl = Array.isArray(params?.returnUrl) ? params?.returnUrl[0] : params?.returnUrl;
  const returnUrl = getSafeReturnPath(rawReturnUrl);

  return (
    <main>
      <section className="hero" style={{ minHeight: '100vh', padding: '24px' }}>
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>

        <div className="hero-glass" style={{ maxWidth: '480px' }}>
          <div className="hero-inner" style={{ minHeight: 'auto', padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Link href="/">
                <img src="/assets/logo.png" alt="Aegis" style={{ height: '42px', margin: '0 auto' }} />
              </Link>
              <h1 className="hero-title" style={{ fontSize: '32px', marginTop: '24px', marginBottom: '8px' }}>Log In</h1>
              <p className="hero-desc" style={{ margin: '0 auto' }}>Welcome back to Aegis PreFlight</p>
            </div>

            <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="returnUrl" value={returnUrl} />

              {errorMessage && (
                <div role="alert" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.35)', background: 'rgba(248, 113, 113, 0.08)', color: '#fecaca', fontSize: '13px', lineHeight: 1.5 }}>
                  {errorMessage}
                </div>
              )}

              {statusMessage && (
                <div role="status" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.35)', background: 'rgba(74, 222, 128, 0.08)', color: '#bbf7d0', fontSize: '13px', lineHeight: 1.5 }}>
                  {statusMessage}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="email" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--orange)', letterSpacing: '0.1em' }}>EMAIL</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid var(--line)', 
                    color: 'var(--text)', 
                    fontSize: '14px',
                    outline: 'none'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="password" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--orange)', letterSpacing: '0.1em' }}>PASSWORD</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid var(--line)', 
                    color: 'var(--text)', 
                    fontSize: '14px',
                    outline: 'none'
                  }} 
                />
              </div>

              <button type="submit" className="hero-btn hero-btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                LOG IN
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--muted)' }}>
              Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--orange)' }}>Sign up</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
