import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnUrl=/account");
  }

  // Fetch profile to get display_name if exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .single();

  const userDisplayName = profile?.display_name || user.email;

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Sidebar handles mobile logic and navigation */}
      <DashboardSidebar userEmail={userDisplayName} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
