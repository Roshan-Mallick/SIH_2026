document.addEventListener("DOMContentLoaded", async () => {
  var SUPABASE_URL      = "https://aiexfmkkvqacyxrgjdgl.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_c1tgCLDnsaa4qVSHLWH_9g_1WIU9Hwp";
  var LOGIN_URL         = "login.html";

  var sb = null;
  if (typeof supabase !== "undefined" && supabase.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // ── Supabase handles the #access_token hash from OAuth redirect ──
  // getSession() will pick it up automatically
  if (!sb) {
    document.getElementById("userDisplay").textContent = "Guest";
    return;
  }

  // Wait for session (handles hash fragment from OAuth)
  let { data: { session }, error } = await sb.auth.getSession();

  // PKCE race fix: after an OAuth redirect the URL carries ?code=... and the
  // client is still exchanging it for a session. getSession() may return null
  // before the exchange completes — wait briefly for SIGNED_IN instead of
  // bouncing the user to the login page.
  if (!session && new URLSearchParams(window.location.search).has("code")) {
    session = await new Promise((resolve) => {
      const { data: { subscription } } = sb.auth.onAuthStateChange((event, s) => {
        if (s) { clearTimeout(timer); subscription.unsubscribe(); resolve(s); }
      });
      const timer = setTimeout(() => { subscription.unsubscribe(); resolve(null); }, 5000);
    });
  }

  if (!session) {
    // Not logged in — go back to login
    window.location.replace(LOGIN_URL);
    return;
  }

  // Show user name or email
  const user = session.user;
  const name = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split("@")[0]
    || "User";
  document.getElementById("userDisplay").textContent = name;

  // Listen for auth changes (e.g. token refresh or sign-out)
  sb.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") window.location.href = LOGIN_URL;
  });

  // ── Sign out ──
  document.getElementById("signoutBtn")?.addEventListener("click", async () => {
    await sb.auth.signOut();
    window.location.href = LOGIN_URL;
  });

  // ── Theme toggle ──
  const themeBtn  = document.getElementById("themeBtn");
  const themeIcon = document.getElementById("themeIcon");

  function applyTheme(isLight) {
    document.body.classList.toggle("light", isLight);
    if (themeIcon) {
      themeIcon.className = isLight ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
    const logo = document.getElementById("sidebar-logo");
    if (logo) logo.src = isLight ? "../assets/images/logo-light.png" : "../assets/images/logo-dark.png";
  }

  const saved = localStorage.getItem("aegis-theme");
  applyTheme(saved === "light");

  themeBtn?.addEventListener("click", () => {
    const next = !document.body.classList.contains("light");
    localStorage.setItem("aegis-theme", next ? "light" : "dark");
    applyTheme(next);
  });
});
