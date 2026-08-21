document.addEventListener("DOMContentLoaded", () => {
  var sb = window.AegisAuth ? AegisAuth.getClient() : null;
  var REDIRECT_URL = window.AegisAuth ? AegisAuth.getDashboardUrl() : (window.location.origin + "/pages/dashboard.html");

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

  function signInWithProvider(provider) {
    if (!sb) { showMessage("Auth not configured.", true); return; }
    sb.auth.signInWithOAuth({
      provider: provider,
      options: {
        // Supabase returns here with the session after the provider consent.
        redirectTo: REDIRECT_URL,
      },
    }).then(({ error }) => {
      if (error) showMessage(error.message, true);
    });
  }

  // ── Google OAuth ──────────────────────────────────────
  document.getElementById("googleBtn")?.addEventListener("click", () => signInWithProvider("google"));

  // ── GitHub OAuth ──────────────────────────────────────
  document.getElementById("githubBtn")?.addEventListener("click", () => signInWithProvider("github"));

  // Surface OAuth failures that land back on this page (?error=...)
  if (window.AegisAuth && AegisAuth.getOAuthError()) {
    showMessage("Google/GitHub sign-in failed: " + AegisAuth.getOAuthError(), true);
    AegisAuth.clearOAuthParams();
  }

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
      setTimeout(() => { window.location.replace(REDIRECT_URL); }, 600);
    } else {
      showMessage("Check your email to confirm your account, then sign in.", false);
    }
  });

  // Redirect if already logged in (INITIAL_SESSION fires after restore)
  AegisAuth.onSession((session) => {
    if (session) window.location.replace(REDIRECT_URL);
  });
});
