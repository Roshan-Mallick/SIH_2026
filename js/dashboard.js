(function () {
  var sb = null;
  if (typeof supabase !== "undefined" && supabase.createClient && window.__aegis) {
    sb = supabase.createClient(
      window.__aegis.supabaseUrl,
      window.__aegis.supabaseAnonKey
    );
  }

  var HOME_URL = "https://aegis-preflight.vercel.app/index.html";

  function redirectIfNoAuth() {
    if (!sb) { window.location.href = HOME_URL; return; }
    sb.auth.getSession().then(function (res) {
      if (!res.data.session) window.location.href = HOME_URL;
    });
  }

  function getInitial(name) {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  function loadProfile(user) {
    var meta = user.user_metadata || {};
    var name = meta.full_name || meta.name || user.email || "User";
    var email = user.email || "—";
    var avatar = meta.avatar_url || "";
    var provider = user.app_metadata?.provider || "email";
    var joined = user.created_at;

    var dashName = document.getElementById("dash-name");
    var dashEmail = document.getElementById("dash-email");
    var dashAvatar = document.getElementById("dash-avatar");

    if (dashName) dashName.textContent = "Welcome back, " + name.split(" ")[0];
    if (dashEmail) dashEmail.textContent = email;
    if (dashAvatar) {
      if (avatar) {
        dashAvatar.innerHTML = '<img src="' + avatar + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />';
      } else {
        dashAvatar.textContent = getInitial(name);
      }
    }

    var acctName = document.getElementById("acct-name");
    var acctEmail = document.getElementById("acct-email");
    var acctProvider = document.getElementById("acct-provider");
    var acctJoined = document.getElementById("acct-joined");
    var acctId = document.getElementById("acct-id");
    var acctAvatar = document.getElementById("account-avatar");

    if (acctName) acctName.textContent = name;
    if (acctEmail) acctEmail.textContent = email;
    if (acctProvider) acctProvider.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
    if (acctJoined) acctJoined.textContent = formatDate(joined);
    if (acctId) acctId.textContent = user.id;
    if (acctAvatar) {
      if (avatar) {
        acctAvatar.innerHTML = '<img src="' + avatar + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />';
      } else {
        acctAvatar.textContent = getInitial(name);
      }
    }
  }

  function loadProjects(userId) {
    if (!sb) return;
    sb.from("projects").select("id, name, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(function (res) {
        var el = document.getElementById("projects-list");
        var statEl = document.getElementById("stat-projects");
        if (res.error || !res.data || res.data.length === 0) {
          if (el) el.innerHTML = '<p class="dash-empty">No projects yet. Create your first project to get started.</p>';
          if (statEl) statEl.textContent = "0";
          return;
        }
        if (statEl) statEl.textContent = res.data.length;
        if (el) {
          el.innerHTML = res.data.map(function (p) {
            return '<div class="dash-item">' +
              '<div><div class="dash-item-name">' + esc(p.name) + '</div>' +
              '<div class="dash-item-meta">Created ' + formatDate(p.created_at) + '</div></div>' +
              '<span class="dash-item-status ' + esc(p.status) + '">' + esc(p.status) + '</span>' +
              '</div>';
          }).join("");
        }
      });
  }

  function loadScans(userId) {
    if (!sb) return;
    sb.from("scans").select("id, status, scan_type, summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(function (res) {
        var el = document.getElementById("scans-list");
        var statScans = document.getElementById("stat-scans");
        var statIssues = document.getElementById("stat-issues");
        var statClean = document.getElementById("stat-clean");

        if (res.error || !res.data || res.data.length === 0) {
          if (el) el.innerHTML = '<p class="dash-empty">No scans yet. Run a scan on a project to see results here.</p>';
          if (statScans) statScans.textContent = "0";
          if (statIssues) statIssues.textContent = "0";
          if (statClean) statClean.textContent = "0";
          return;
        }

        var totalIssues = 0;
        var cleanScans = 0;

        res.data.forEach(function (s) {
          if (s.summary && s.summary.total_issues) totalIssues += s.summary.total_issues;
          if (s.status === "completed" && (!s.summary || !s.summary.total_issues || s.summary.total_issues === 0)) {
            cleanScans++;
          }
        });

        if (statScans) statScans.textContent = res.data.length;
        if (statIssues) statIssues.textContent = totalIssues;
        if (statClean) statClean.textContent = cleanScans;

        if (el) {
          el.innerHTML = res.data.map(function (s) {
            var issueText = "";
            if (s.summary && s.summary.total_issues !== undefined) {
              issueText = s.summary.total_issues + " issues";
            }
            return '<div class="dash-item">' +
              '<div><div class="dash-item-name">' + esc(s.scan_type) + ' scan</div>' +
              '<div class="dash-item-meta">' + formatDate(s.created_at) + (issueText ? " &middot; " + esc(issueText) : "") + '</div></div>' +
              '<span class="dash-item-status ' + esc(s.status) + '">' + esc(s.status) + '</span>' +
              '</div>';
          }).join("");
        }
      });
  }

  function esc(str) {
    if (!str) return "";
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  /* ---- Account modal ---- */
  function openAccountModal() {
    var el = document.getElementById("account-overlay");
    if (el) el.setAttribute("aria-hidden", "false");
  }

  function closeAccountModal() {
    var el = document.getElementById("account-overlay");
    if (el) el.setAttribute("aria-hidden", "true");
  }

  /* ---- Logout ---- */
  function doLogout() {
    if (sb) sb.auth.signOut().then(function () { window.location.href = HOME_URL; });
  }

  /* ---- Init ---- */
  function init() {
    redirectIfNoAuth();

    if (!sb) return;

    sb.auth.getSession().then(function (res) {
      var session = res.data.session;
      if (!session) return;
      var user = session.user;
      loadProfile(user);
      loadProjects(user.id);
      loadScans(user.id);
    });

    sb.auth.onAuthStateChange(function (event, session) {
      if (event === "SIGNED_OUT") window.location.href = HOME_URL;
      if (event === "SIGNED_IN" && session) {
        loadProfile(session.user);
        loadProjects(session.user.id);
        loadScans(session.user.id);
      }
    });

    var logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) logoutBtn.addEventListener("click", doLogout);

    var accountBtn = document.getElementById("btn-account");
    if (accountBtn) accountBtn.addEventListener("click", openAccountModal);

    var closeAccount = document.getElementById("close-account");
    if (closeAccount) closeAccount.addEventListener("click", closeAccountModal);

    var closeAccountBtn = document.getElementById("account-close-btn");
    if (closeAccountBtn) closeAccountBtn.addEventListener("click", closeAccountModal);

    var accountLogout = document.getElementById("account-logout");
    if (accountLogout) accountLogout.addEventListener("click", doLogout);

    var accountOverlay = document.getElementById("account-overlay");
    if (accountOverlay) {
      accountOverlay.addEventListener("click", function (e) {
        if (e.target === accountOverlay) closeAccountModal();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAccountModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
