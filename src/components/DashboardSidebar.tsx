'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function DashboardSidebar({ userEmail }: { userEmail: string | undefined }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Overview', href: '/account' },
    { name: 'Subscription', href: '/account/subscription' },
    { name: 'License', href: '/account/license' },
    { name: 'Billing', href: '/account/billing' },
    { name: 'Downloads', href: '/downloads' },
    { name: 'Settings', href: '/account/settings' }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'none', // Hidden on desktop, shown on mobile via CSS
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 50,
          background: 'rgba(20, 14, 12, 0.8)',
          border: '1px solid var(--border)',
          color: 'var(--orange)',
          padding: '8px',
          borderRadius: '8px'
        }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar Container */}
      <aside 
        className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          padding: '40px 24px',
          borderRight: '1px solid var(--border)',
          background: 'rgba(13, 11, 10, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          transition: 'transform 0.3s ease',
          zIndex: 40
        }}
      >
        {/* Logo and Status */}
        <div style={{ marginBottom: '48px' }}>
          <Link href="/">
            <img src="/assets/logo.png" alt="Aegis PreFlight" style={{ height: '36px', marginBottom: '24px' }} />
          </Link>
          <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: 600 }}>
            SYSTEM SECURE ●
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  color: isActive ? 'var(--orange)' : 'var(--text)',
                  background: isActive ? 'rgba(255, 107, 44, 0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(255, 107, 44, 0.2)' : 'transparent'}`,
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ marginRight: '10px', fontSize: '12px' }}>
                  {isActive ? '◉' : '○'}
                </span>
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer Area */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
          <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--muted)', wordBreak: 'break-all' }}>
            {userEmail}
          </div>
          <form action="/auth/signout" method="post">
            <button 
              type="submit" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'none', 
                border: 'none', 
                color: 'var(--text)', 
                cursor: 'pointer', 
                fontSize: '14px', 
                padding: '8px 0',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--orange)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text)'}
            >
              <span style={{ marginRight: '10px' }}>↪</span> Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
