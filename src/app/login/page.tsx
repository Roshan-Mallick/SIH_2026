import Link from "next/link";
import { login, signInWithGoogle, signInWithGitHub } from "./actions";
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

            {errorMessage && (
              <div role="alert" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.35)', background: 'rgba(248, 113, 113, 0.08)', color: '#fecaca', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
                {errorMessage}
              </div>
            )}

            {statusMessage && (
              <div role="status" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.35)', background: 'rgba(74, 222, 128, 0.08)', color: '#bbf7d0', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
                {statusMessage}
              </div>
            )}

            {/* OAuth Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <form action={signInWithGoogle}>
                <input type="hidden" name="returnUrl" value={returnUrl} />
                <button type="submit" className="oauth-btn">
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.54C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"/>
                    <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                    <path fill="#FBBC05" d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              <form action={signInWithGitHub}>
                <input type="hidden" name="returnUrl" value={returnUrl} />
                <button type="submit" className="oauth-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Continue with GitHub
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="oauth-divider">
              <span>or</span>
            </div>

            {/* Email/Password Form */}
            <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="returnUrl" value={returnUrl} />

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
