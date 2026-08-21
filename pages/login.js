document.addEventListener("DOMContentLoaded", () => {
  var SUPABASE_URL = "https://aiexfmkkvqacyxrgjdgl.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_c1tgCLDnsaa4qVSHLWH_9g_1WIU9Hwp";
  var REDIRECT_URL = window.location.origin + "/pages/dashboard.html";

  var sb = null;
  if (typeof supabase !== "undefined" && supabase.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

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

  // Google OAuth
  document.getElementById("googleBtn")?.addEventListener("click", () => {
    if (!sb) { showMessage("Auth not configured.", true); return; }
    sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_URL },
    });
  });

  // GitHub OAuth
  document.getElementById("githubBtn")?.addEventListener("click", () => {
    if (!sb) { showMessage("Auth not configured.", true); return; }
    sb.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: REDIRECT_URL },
    }).then(({ error }) => {
      if (error) console.error("[aegis] GitHub OAuth error:", error);
    });
  });

  // Theme switch
  document.getElementById("themeBtn")?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("aegis-theme", document.body.classList.contains("light") ? "light" : "dark");
  });

  // Restore saved theme
  if (localStorage.getItem("aegis-theme") === "light") {
    document.body.classList.add("light");
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
    setTimeout(() => { window.location.href = REDIRECT_URL; }, 1000);
  });

  // Check existing session — skip redirect if already on dashboard
  if (sb) {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = REDIRECT_URL;
    });

    sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) window.location.href = REDIRECT_URL;
    });
  }
});
