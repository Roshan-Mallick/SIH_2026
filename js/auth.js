(function () {
  var REDIRECT_URL = "https://aegis-preflight.vercel.app/pages/dashboard.html";

  function getSupabase() {
    if (window.__aegis && window.__aegis.supabase) return window.__aegis.supabase;
    if (typeof supabase !== "undefined" && supabase.createClient) {
      window.__aegis.supabase = supabase.createClient(
        window.__aegis.supabaseUrl,
        window.__aegis.supabaseAnonKey
      );
      return window.__aegis.supabase;
    }
    return null;
  }

  function getClient() {
    var c = getSupabase();
    if (!c) console.error("[aegis] Supabase client not available");
    return c;
  }

  function showFormError(form, msg) {
    var el = form.querySelector(".auth-error");
    if (el) {
      el.textContent = msg;
      el.style.display = "block";
    }
  }

  function hideFormError(form) {
    var el = form.querySelector(".auth-error");
    if (el) el.style.display = "none";
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

  /* ---- Google OAuth ---- */
  function signInWithGoogle() {
    var sb = getClient();
    if (!sb) return;
    sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_URL },
    });
  }

  /* ---- GitHub OAuth ---- */
  function signInWithGitHub() {
    var sb = getClient();
    if (!sb) return;
    sb.auth.signInWithOAuth({
      provider: "github",
    }).then(function (res) {
      if (res.error) console.error("[aegis] GitHub OAuth error:", res.error);
    });
  }

  /* ---- Email/Password Sign Up ---- */
  function signUpWithEmail(form) {
    var sb = getClient();
    if (!sb) return;
    hideFormError(form);

    var name = form.querySelector('[name="name"]');
    var email = form.querySelector('[name="email"]');
    var password = form.querySelector('[name="password"]');
    var confirm = form.querySelector('[name="confirm"]');
    var submitBtn = form.querySelector(".login-submit");

    if (!email || !password) return;

    if (confirm && password.value !== confirm.value) {
      showFormError(form, "Passwords do not match.");
      return;
    }

    if (password.value.length < 6) {
      showFormError(form, "Password must be at least 6 characters.");
      return;
    }

    setLoading(submitBtn, true);

    sb.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: name ? name.value : "",
          avatar_url: "",
        },
      },
    }).then(function (res) {
      setLoading(submitBtn, false);
      if (res.error) {
        showFormError(form, res.error.message);
        return;
      }
      if (res.data && res.data.user && !res.data.session) {
        showFormError(form);
        var el = form.querySelector(".auth-error");
        if (el) {
          el.textContent = "Check your email for a confirmation link.";
          el.className = "auth-error auth-success";
          el.style.display = "block";
        }
      } else {
        onAuthSuccess();
      }
    }).catch(function (err) {
      setLoading(submitBtn, false);
      showFormError(form, err.message || "Signup failed.");
    });
  }

  /* ---- Email/Password Sign In ---- */
  function signInWithEmail(form) {
    var sb = getClient();
    if (!sb) return;
    hideFormError(form);

    var email = form.querySelector('[name="email"]');
    var password = form.querySelector('[name="password"]');
    var submitBtn = form.querySelector(".login-submit");

    if (!email || !password) return;

    setLoading(submitBtn, true);

    sb.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    }).then(function (res) {
      setLoading(submitBtn, false);
      if (res.error) {
        showFormError(form, res.error.message);
        return;
      }
      onAuthSuccess();
    }).catch(function (err) {
      setLoading(submitBtn, false);
      showFormError(form, err.message || "Login failed.");
    });
  }

  /* ---- Password Reset ---- */
  function resetPassword(form) {
    var sb = getClient();
    if (!sb) return;

    var emailInput = form.querySelector('[name="email"]');
    if (!emailInput) return;

    sb.auth.resetPasswordForEmail(emailInput.value, {
      redirectTo: REDIRECT_URL,
    }).then(function (res) {
      var el = form.querySelector(".auth-error");
      if (el) {
        el.textContent = "Password reset email sent. Check your inbox.";
        el.className = "auth-error auth-success";
        el.style.display = "block";
      }
    });
  }

  /* ---- Auth State Handler ---- */
  function onAuthSuccess() {
    window.location.href = REDIRECT_URL;
  }

  function updateNavForAuth(isLoggedIn) {
    var btns = document.querySelector(".hero-btns");
    if (!btns) return;
    if (isLoggedIn) {
      btns.innerHTML =
        '<a href="#dashboard" class="hero-btn hero-btn-primary">Dashboard</a>' +
        '<button type="button" class="hero-btn hero-btn-secondary" id="auth-logout">Log Out</button>';
      var logoutBtn = document.getElementById("auth-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
          var sb = getClient();
          if (sb) sb.auth.signOut().then(function () { location.reload(); });
        });
      }
    }
  }

  function checkSession() {
    var sb = getClient();
    if (!sb) return;

    sb.auth.getSession().then(function (res) {
      if (res.data && res.data.session && res.data.session.user) {
        onAuthSuccess();
      }
    });

    sb.auth.onAuthStateChange(function (event, session) {
      if (event === "SIGNED_IN" && session) {
        onAuthSuccess();
      } else if (event === "SIGNED_OUT") {
        location.reload();
      }
    });
  }

  /* ---- Wire up buttons ---- */
  function wireOAuthButtons() {
    document.querySelectorAll(".oauth-google").forEach(function (btn) {
      btn.addEventListener("click", signInWithGoogle);
    });
    document.querySelectorAll(".oauth-github").forEach(function (btn) {
      btn.addEventListener("click", signInWithGitHub);
    });
  }

  function wireForms() {
    var signupForm = document.getElementById("signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        signUpWithEmail(signupForm);
      });
    }

    var loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        signInWithEmail(loginForm);
      });
    }

    var forgotLink = document.querySelector(".login-forgot");
    if (forgotLink) {
      forgotLink.addEventListener("click", function (e) {
        e.preventDefault();
        var loginForm = document.getElementById("login-form");
        if (loginForm) resetPassword(loginForm);
      });
    }
  }

  /* ---- Init ---- */
  function init() {
    wireOAuthButtons();
    wireForms();
    checkSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
