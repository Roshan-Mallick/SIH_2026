import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-shell" style={{ borderBottom: '1px solid var(--line)', padding: '20px 40px' }}>
        <Navbar type="site" />
      </header>

      <div style={{ display: 'flex', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <aside style={{ width: '260px', padding: '40px 20px', borderRight: '1px solid var(--line)' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--orange)', letterSpacing: '0.1em', marginBottom: '16px' }}>ACCOUNT</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/account" style={{ color: 'var(--text)', fontSize: '14px', fontWeight: 500 }}>Overview</Link>
              <Link href="/account/subscription" style={{ color: 'var(--muted)', fontSize: '14px' }}>Subscription</Link>
              <Link href="/account/license" style={{ color: 'var(--muted)', fontSize: '14px' }}>License Keys</Link>
              <Link href="/account/billing" style={{ color: 'var(--muted)', fontSize: '14px' }}>Billing</Link>
              <Link href="/downloads" style={{ color: 'var(--muted)', fontSize: '14px' }}>Downloads</Link>
            </nav>
          </div>

          <form action="/auth/signout" method="post">
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </aside>

        <section style={{ flex: 1, padding: '40px' }}>
          {children}
        </section>
      </div>
    </main>
  );
}
