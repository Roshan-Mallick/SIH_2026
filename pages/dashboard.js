document.addEventListener("DOMContentLoaded", async () => {
  var LOGIN_URL = "login.html";
  var userDisplay = document.getElementById("userDisplay");

  var sb = window.AegisAuth ? AegisAuth.getClient() : null;

  if (!sb) {
    if (userDisplay) userDisplay.textContent = "Guest";
    return;
  }

  // OAuth providers may return with ?error=...&error_description=...
  // (e.g. sign-up blocked server-side). Show it instead of silently bouncing.
  if (AegisAuth.getOAuthError()) {
    var msg = AegisAuth.getOAuthError();
    AegisAuth.clearOAuthParams();
    window.location.replace(AegisAuth.getLoginUrl() + "?error=" + encodeURIComponent(msg));
    return;
  }

  // INITIAL_SESSION fires only after supabase-js finished initializing —
  // i.e. after restoring localStorage AND consuming any OAuth session from
  // the redirect URL (#access_token=...). Deciding navigation on anything
  // earlier is a race and caused login <-> dashboard ping-pong.
  AegisAuth.onSession((session) => {
    if (!session) {
      window.location.replace(LOGIN_URL);
      return;
    }
    const user = session.user;
    const name = user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split("@")[0]
      || "User";
    if (userDisplay) userDisplay.textContent = name;
  });

  // ── Sign out ──
  document.getElementById("signoutBtn")?.addEventListener("click", async () => {
    await sb.auth.signOut();
    window.location.replace(AegisAuth.getLoginUrl());
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
