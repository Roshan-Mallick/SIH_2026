import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { signup } from "./actions";

export default function RegisterPage() {
  return (
    <main>
      <section className="hero" style={{ minHeight: '100vh', padding: '24px' }}>
        <div className="hero-bg">
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="hero-glass" style={{ maxWidth: '480px' }}>
          <div className="hero-inner" style={{ minHeight: 'auto', padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Link href="/">
                <img src="/assets/logo.png" alt="Aegis" style={{ height: '42px', margin: '0 auto' }} />
              </Link>
              <h1 className="hero-title" style={{ fontSize: '32px', marginTop: '24px', marginBottom: '8px' }}>Sign Up</h1>
              <p className="hero-desc" style={{ margin: '0 auto' }}>Create an Aegis PreFlight account</p>
            </div>

            <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  minLength={6}
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
                SIGN UP
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--muted)' }}>
              Already have an account? <Link href="/login" style={{ color: 'var(--orange)' }}>Log in</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
