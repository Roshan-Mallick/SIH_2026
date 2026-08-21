document.addEventListener("DOMContentLoaded", () => {
  var SUPABASE_URL     = "https://aiexfmkkvqacyxrgjdgl.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_c1tgCLDnsaa4qVSHLWH_9g_1WIU9Hwp";
  var REDIRECT_URL     = "https://aegis-preflight.vercel.app/pages/dashboard.html";

  var sb = null;
  if (typeof supabase !== "undefined" && supabase.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function showMessage(msg, isError) {
    var el = document.getElementById("signupMessage");
    if (el) {
      el.textContent = msg;
      el.style.color = isError ? "#ff5555" : "#7ee787";
    }
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.orig = btn.textContent;
      btn.textContent  = "Please wait...";
      btn.disabled     = true;
    } else {
      btn.textContent = btn.dataset.orig || btn.textContent;
      btn.disabled    = false;
    }
  }

  // Show / hide password
  document.querySelectorAll(".show-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const isPass = input.type === "password";
      input.type   = isPass ? "text" : "password";
      btn.textContent = isPass ? "HIDE" : "SHOW";
    });
  });

  // Theme toggle
  document.getElementById("themeBtn")?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("aegis-theme", document.body.classList.contains("light") ? "light" : "dark");
  });
  if (localStorage.getItem("aegis-theme") === "light") document.body.classList.add("light");

  // ── Google OAuth ──────────────────────────────────────
  document.getElementById("googleBtn")?.addEventListener("click", () => {
    if (!sb) { showMessage("Auth not configured.", true); return; }
    sb.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo: REDIRECT_URL },
    });
  });

  // ── GitHub OAuth ──────────────────────────────────────
  document.getElementById("githubBtn")?.addEventListener("click", () => {
    if (!sb) { showMessage("Auth not configured.", true); return; }
    sb.auth.signInWithOAuth({
      provider: "github",
      options:  { redirectTo: REDIRECT_URL },
    }).then(({ error }) => {
      if (error) showMessage(error.message, true);
    });
  });

  // ── Email / Password Sign Up ──────────────────────────
  const form = document.getElementById("signupForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!sb) { showMessage("Auth not configured.", true); return; }

    const name     = document.getElementById("signupName").value.trim();
    const email    = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm  = document.getElementById("signupConfirm").value;
    const btn      = form.querySelector(".primary-btn");

    if (!name || !email || !password) {
      showMessage("Please fill in all fields.", true); return;
    }
    if (password.length < 8) {
      showMessage("Password must be at least 8 characters.", true); return;
    }
    if (password !== confirm) {
      showMessage("Passwords do not match.", true); return;
    }

    setLoading(btn, true);

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: REDIRECT_URL,
      },
    });

    setLoading(btn, false);

    if (error) { showMessage(error.message, true); return; }

    // Supabase may auto-confirm or require email verification
    if (data?.session) {
      showMessage("Account created! Redirecting...", false);
      setTimeout(() => { window.location.href = REDIRECT_URL; }, 1200);
    } else {
      showMessage("Check your email to confirm your account, then sign in.", false);
    }
  });

  // Redirect if already logged in
  if (sb) {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = REDIRECT_URL;
    });
    sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) window.location.href = REDIRECT_URL;
    });
  }
});
