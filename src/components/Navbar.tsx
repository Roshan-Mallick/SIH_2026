'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar({ type = "hero" }: { type?: "hero" | "site" }) {
  const pathname = usePathname();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    setIsLightMode(document.body.classList.contains('light-mode'));
  }, []);

  const toggleTheme = () => {
    const newMode = !document.body.classList.contains('light-mode');
    if (newMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('aegis-theme', newMode ? 'light' : 'dark');
    setIsLightMode(newMode);
  };

  const navClass = type === 'hero' ? 'hero-nav' : 'site-nav';
  const logoClass = type === 'hero' ? 'hero-logo' : 'site-logo';
  const linksClass = type === 'hero' ? 'hero-nav-links' : 'nav-links';

  return (
    <nav className={navClass} aria-label="Main navigation">
      <Link href="/" className={logoClass}>
        <img id="theme-logo" src={isLightMode ? "/assets/logo2.png" : "/assets/logo.png"} alt="Aegis" />
      </Link>
      <div className={linksClass}>
        <Link className={pathname === '/' ? 'active' : 'inactive'} href="/">HOME</Link>
        <Link className={pathname === '/about' ? 'active' : 'inactive'} href="/about">ABOUT</Link>
        <Link className={pathname === '/pricing' ? 'active' : 'inactive'} href="/pricing">PRODUCT</Link>
        <Link className={pathname === '/account' ? 'active' : 'inactive'} href="/account">ACCOUNT</Link>
        <button 
          className="theme-toggle" 
          type="button" 
          aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"} 
          aria-pressed={isLightMode}
          onClick={toggleTheme}
        >
          <span className="theme-icon" aria-hidden="true">{isLightMode ? "☾" : "☼"}</span>
        </button>
      </div>
    </nav>
  );
}
