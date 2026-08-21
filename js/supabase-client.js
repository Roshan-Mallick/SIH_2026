// Shared Supabase configuration + auth helpers for all Aegis PreFlight pages.
(function () {
  // Publishable/anon key — safe for frontend use by design.
  // Secrets (service_role) must never live here; they stay in Supabase.
  var SUPABASE_URL = "https://aiexfmkkvqacyxrgjdgl.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_c1tgCLDnsaa4qVSHLWH_9g_1WIU9Hwp";

  // Optional deploy-time override (e.g. injected via Vercel env vars) so the
  // same static bundle works across environments without code edits.
  var injected = window.__AEGIS_SUPABASE_CONFIG__ || {};
  SUPABASE_URL = injected.url || SUPABASE_URL;
  SUPABASE_ANON_KEY = injected.anonKey || SUPABASE_ANON_KEY;

  var client = null;

  function getClient() {
    if (!client && typeof supabase !== "undefined" && supabase.createClient) {
      client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return client;
  }

  function getDashboardUrl() {
    return new URL("/pages/dashboard.html", window.location.origin).href;
  }

  function getLoginUrl() {
    return new URL("/pages/login.html", window.location.origin).href;
  }

  function getOAuthError() {
    var params = new URLSearchParams(window.location.search);
    if (!params.has("error")) return null;
    return params.get("error_description") || params.get("error") || "Authentication failed.";
  }

  function clearOAuthParams() {
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Reliable session notification:
  // - INITIAL_SESSION fires exactly once, AFTER the client finished restoring
  //   the session from localStorage AND after consuming any OAuth tokens from
  //   the redirect URL (#access_token=... / ?code=...). No race with init.
  // - SIGNED_IN covers sign-ins that happen while the page is open.
  // - SIGNED_OUT covers logout in this tab or another.
  function onSession(cb) {
    var sb = getClient();
    if (!sb) {
      cb(null);
      return function () {};
    }
    var { data: { subscription } } = sb.auth.onAuthStateChange(function (event, session) {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" ||
          event === "PASSWORD_RECOVERY") {
        cb(session);
      } else if (event === "SIGNED_OUT") {
        cb(null);
      }
    });
    return subscription;
  }

  window.AegisAuth = {
    getClient: getClient,
    getDashboardUrl: getDashboardUrl,
    getLoginUrl: getLoginUrl,
    getOAuthError: getOAuthError,
    clearOAuthParams: clearOAuthParams,
    onSession: onSession
  };
})();
