document.addEventListener("DOMContentLoaded", () => {
  var sb = window.AegisAuth ? AegisAuth.getClient() : null;
  var REDIRECT_URL = window.AegisAuth ? AegisAuth.getDashboardUrl() : (window.location.origin + "/pages/dashboard.html");

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.origText = btn.textContent;
      btn.textContent = "Please wait...";
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.origText || btn.textContent;
      btn.disabled = false;
    }
  }

  function showMessage(msg, isError) {
    var el = document.getElementById("signinMessage");
    if (el) {
      el.textContent = msg;
      el.style.color = isError ? "#ff5555" : "#7ee787";
    }
  }

  // Show / hide password
  document.querySelectorAll(".show-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      button.textContent = isPassword ? "HIDE" : "SHOW";
    });
  });

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

  // Google OAuth
  document.getElementById("googleBtn")?.addEventListener("click", () => signInWithProvider("google"));

  // GitHub OAuth
  document.getElementById("githubBtn")?.addEventListener("click", () => signInWithProvider("github"));

  // Theme switch
  document.getElementById("themeBtn")?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("aegis-theme", document.body.classList.contains("light") ? "light" : "dark");
  });

  // Restore saved theme
  if (localStorage.getItem("aegis-theme") === "light") {
    document.body.classList.add("light");
  }

  // Surface OAuth failures that land back on this page (?error=...)
  if (window.AegisAuth && AegisAuth.getOAuthError()) {
    showMessage("Google/GitHub sign-in failed: " + AegisAuth.getOAuthError(), true);
    AegisAuth.clearOAuthParams();
  }

  // Sign-in form
  const signinForm = document.getElementById("signinForm");
  signinForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!sb) { showMessage("Auth not configured.", true); return; }

    const email = document.getElementById("signinUsername").value.trim();
    const password = document.getElementById("signinPassword").value;
    const submitBtn = signinForm.querySelector(".primary-btn");

    if (!email || !password) {
      showMessage("Please enter your email and password.", true);
      return;
    }

    setLoading(submitBtn, true);

    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    setLoading(submitBtn, false);

    if (error) {
      showMessage(error.message, true);
      return;
    }

    showMessage("Login successful! Redirecting...", false);
    setTimeout(() => { window.location.replace(REDIRECT_URL); }, 600);
  });

  // Session guard — INITIAL_SESSION fires after restore completes,
  // so an already-signed-in visitor goes straight to the dashboard
  // without flashing the form or racing client initialization.
  AegisAuth.onSession((session) => {
    if (session) window.location.replace(REDIRECT_URL);
  });
});
