// Landing page auth state: bounce authenticated users to the dashboard.
(function () {
  var path = window.location.pathname;
  var isLandingPage = path === "/" || path === "/index.html";
  if (!isLandingPage) return;

  if (!window.AegisAuth) return;

  // OAuth error fallback (e.g. redirect_to rejected, provider failure):
  // surface it on the login page instead of silently sitting on the landing page.
  var oauthError = AegisAuth.getOAuthError();
  if (oauthError) {
    AegisAuth.clearOAuthParams();
    window.location.replace(AegisAuth.getLoginUrl() + "?error=" + encodeURIComponent(oauthError));
    return;
  }

  // INITIAL_SESSION arrives only after Supabase finished restoring the
  // session (localStorage or OAuth hash) — no race with client init.
  AegisAuth.onSession(function (session) {
    if (session) window.location.replace(AegisAuth.getDashboardUrl());
  });
})();
