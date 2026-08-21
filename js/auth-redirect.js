// Landing page auth state: bounce authenticated users to the dashboard.
(function () {
  var SUPABASE_URL = "https://aiexfmkkvqacyxrgjdgl.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_c1tgCLDnsaa4qVSHLWH_9g_1WIU9Hwp";

  if (typeof supabase === "undefined" || !supabase.createClient) return;

  var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  var path = window.location.pathname;
  var isLandingPage = path === "/" || path === "/index.html";
  if (!isLandingPage) return;

  var redirecting = false;
  function goToDashboard() {
    if (redirecting) return;
    redirecting = true;
    window.location.replace("/pages/dashboard.html");
  }

  // Handles OAuth callbacks that land on "/" (e.g. legacy links without
  // redirectTo): the client exchanges ?code=... and fires SIGNED_IN.
  sb.auth.getSession().then(function ({ data: { session } }) {
    if (session) goToDashboard();
  });

  sb.auth.onAuthStateChange(function (event, session) {
    if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
      goToDashboard();
    }
  });
})();
