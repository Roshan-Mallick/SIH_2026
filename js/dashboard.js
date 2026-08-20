(function () {
  var sb = null;
  if (typeof supabase !== "undefined" && supabase.createClient && window.__aegis) {
    sb = supabase.createClient(
      window.__aegis.supabaseUrl,
      window.__aegis.supabaseAnonKey
    );
  }

  var HOME_URL = "https://aegis-preflight.vercel.app/index.html";
  var currentUser = null;

  /* ---- Helpers ---- */
  function esc(str) {
    if (!str) return "";
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function getInitial(name) {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return "\u2014";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  function formatTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  }

  function hashChain(str) {
    var hash = 0;
    for (var i = 0; i < (str || "").length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    var hex = Math.abs(hash).toString(16).padStart(8, "0");
    return hex + hex.split("").reverse().join("") + hex.slice(0, 8);
  }

  /* ---- Auth gate ---- */
  function redirectIfNoAuth() {
    if (!sb) { window.location.href = HOME_URL; return; }
    sb.auth.getSession().then(function (res) {
      if (!res.data.session) window.location.href = HOME_URL;
    });
  }

  /* ---- Profile ---- */
  function loadProfile(user) {
    currentUser = user;
    var meta = user.user_metadata || {};
    var name = meta.full_name || meta.name || user.email || "User";
    var firstName = name.split(" ")[0];
    var email = user.email || "\u2014";
    var avatar = meta.avatar_url || "";
    var provider = (user.app_metadata && user.app_metadata.provider) || "email";
    var joined = user.created_at;

    var onboardName = document.getElementById("onboard-name");
    var topbarAvatar = document.getElementById("topbar-avatar");
    var acctName = document.getElementById("acct-name");
    var acctEmail = document.getElementById("acct-email");
    var acctProvider = document.getElementById("acct-provider");
    var acctJoined = document.getElementById("acct-joined");
    var acctAvatar = document.getElementById("account-avatar");

    if (onboardName) onboardName.textContent = firstName;

    var avatarHTML = avatar
      ? '<img src="' + esc(avatar) + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />'
      : getInitial(name);

    if (topbarAvatar) topbarAvatar.innerHTML = avatarHTML;
    if (acctAvatar) acctAvatar.innerHTML = avatarHTML;
    if (acctName) acctName.textContent = name;
    if (acctEmail) acctEmail.textContent = email;
    if (acctProvider) acctProvider.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
    if (acctJoined) acctJoined.textContent = formatDate(joined);

    var githubEl = document.getElementById("acct-github");
    var googleEl = document.getElementById("acct-google");
    if (githubEl) githubEl.textContent = provider === "github" ? "Connected" : "Not connected";
    if (googleEl) googleEl.textContent = provider === "google" ? "Connected" : "Not connected";
  }

  /* ---- Sessions / scans ---- */
  var activeSession = null;

  function loadSessions(userId) {
    if (!sb) return;
    sb.from("scans").select("id, status, scan_type, findings, summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(function (res) {
        if (res.error || !res.data || res.data.length === 0) {
          showOnboard();
          return;
        }
        activeSession = res.data[0];
        showSession();
        loadFindings(userId);
        loadAuditLog(userId);
      });
  }

  function showOnboard() {
    var onboard = document.getElementById("dash-onboard");
    var session = document.getElementById("dash-session");
    if (onboard) onboard.style.display = "flex";
    if (session) session.style.display = "none";
  }

  function showSession() {
    var onboard = document.getElementById("dash-onboard");
    var session = document.getElementById("dash-session");
    if (onboard) onboard.style.display = "none";
    if (session) session.style.display = "block";
    updateStats();
    updatePipeline();
  }

  function updateStats() {
    if (!activeSession) return;
    var summary = activeSession.summary || {};
    var verdictEl = document.getElementById("stat-verdict");
    var loopEl = document.getElementById("stat-loop");
    var findingsEl = document.getElementById("stat-findings");
    var auditEl = document.getElementById("stat-audit");

    if (verdictEl) {
      var v = summary.verdict || "PASS";
      verdictEl.textContent = v;
      verdictEl.className = "dash-stat-value";
      if (v === "BLOCK") verdictEl.classList.add("dash-stat-danger");
      else if (v === "WARNING") verdictEl.classList.add("dash-stat-warn");
      else verdictEl.classList.add("dash-stat-ok");
    }
    if (loopEl) loopEl.textContent = summary.loop_iteration || "1";
    if (findingsEl) findingsEl.textContent = summary.total_issues || "0";
    if (auditEl) auditEl.textContent = summary.audit_verified ? "VERIFIED" : "PENDING";
  }

  function updatePipeline() {
    var stage = (activeSession && activeSession.summary && activeSession.summary.pipeline_stage) || "sandbox";
    var stages = ["agent", "sandbox", "scan", "validate"];
    var idx = stages.indexOf(stage);
    if (idx < 0) idx = 1;

    document.querySelectorAll(".dash-pipeline-stage").forEach(function (el, i) {
      el.classList.remove("active", "completed");
      if (i < idx) el.classList.add("completed");
      else if (i === idx) el.classList.add("active");
    });

    document.querySelectorAll(".dash-pipeline-connector").forEach(function (el, i) {
      el.classList.remove("completed");
      if (i < idx) el.classList.add("completed");
    });
  }

  /* ---- Findings ---- */
  function loadFindings(userId) {
    if (!sb || !activeSession) return;
    sb.from("scan_results")
      .select("id, severity, title, file_path, line_number, description, remediation, llm_explanation, created_at")
      .eq("scan_id", activeSession.id)
      .order("created_at", { ascending: false })
      .then(function (res) {
        var el = document.getElementById("findings-list");
        var countEl = document.getElementById("findings-count");
        if (res.error || !res.data || res.data.length === 0) {
          if (el) el.innerHTML = '<div class="dash-empty"><p>No findings detected. Your code looks clean.</p></div>';
          if (countEl) countEl.textContent = "0 issues";
          return;
        }
        var findings = res.data;
        if (countEl) countEl.textContent = findings.length + " issue" + (findings.length !== 1 ? "s" : "");

        if (el) {
          el.innerHTML = findings.map(function (f) {
            var sev = (f.severity || "low").toLowerCase();
            var detail = "";
            if (f.description) {
              detail += '<div class="dash-finding-detail-section"><span class="dash-finding-detail-label">Description</span><div class="dash-finding-detail-text">' + esc(f.description) + '</div></div>';
            }
            if (f.file_path) {
              detail += '<div class="dash-finding-detail-section"><span class="dash-finding-detail-label">Location</span><div class="dash-finding-detail-text"><code>' + esc(f.file_path) + (f.line_number ? ':' + f.line_number : '') + '</code></div></div>';
            }
            if (f.remediation) {
              detail += '<div class="dash-finding-detail-section"><span class="dash-finding-detail-label">Remediation</span><div class="dash-finding-detail-text">' + esc(f.remediation) + '</div></div>';
            }
            var llmBlock = "";
            if (f.llm_explanation) {
              llmBlock = '<div class="dash-llm-explain">' +
                '<button class="dash-llm-explain-toggle" type="button">&#9654; Local LLM Explanation</button>' +
                '<div class="dash-llm-explain-body">' + esc(f.llm_explanation) + '</div>' +
                '</div>';
            }

            return '<div class="dash-finding" data-id="' + esc(f.id) + '">' +
              '<div class="dash-finding-row">' +
              '<div class="dash-finding-sev ' + sev + '"></div>' +
              '<div class="dash-finding-body">' +
              '<div class="dash-finding-title">' + esc(f.title) + '</div>' +
              '<div class="dash-finding-meta">' +
              (f.file_path ? '<code>' + esc(f.file_path) + (f.line_number ? ':' + f.line_number : '') + '</code>' : '') +
              '</div>' +
              '</div>' +
              '<span class="dash-finding-badge ' + sev + '">' + sev + '</span>' +
              '<span class="dash-finding-chevron">&#9654;</span>' +
              '</div>' +
              '<div class="dash-finding-detail">' + detail + llmBlock + '</div>' +
              '</div>';
          }).join("");
        }
      });
  }

  /* ---- Audit log ---- */
  function loadAuditLog(userId) {
    if (!sb || !activeSession) return;
    sb.from("audit_log")
      .select("id, event_type, description, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(function (res) {
        var el = document.getElementById("audit-list");
        if (res.error || !res.data || res.data.length === 0) {
          if (el) el.innerHTML = '<div class="dash-empty"><p>No audit events yet.</p></div>';
          return;
        }
        if (el) {
          el.innerHTML = res.data.map(function (e) {
            var dotClass = "";
            if (e.event_type === "scan_complete" || e.event_type === "sandbox_ready") dotClass = "orange";
            else if (e.event_type === "verdict_pass" || e.event_type === "system_init") dotClass = "green";

            var hash = hashChain(e.id + e.created_at + (e.description || ""));

            return '<div class="dash-audit-event">' +
              '<div class="dash-audit-dot ' + dotClass + '"></div>' +
              '<div class="dash-audit-body">' +
              '<div class="dash-audit-text"><strong>' + esc(e.event_type || "event") + '</strong> \u2014 ' + esc(e.description) + '</div>' +
              '<div class="dash-audit-hash">' + hash + '</div>' +
              '<div class="dash-audit-time">' + formatTime(e.created_at) + ' \u00b7 ' + formatDate(e.created_at) + '</div>' +
              '</div>' +
              '</div>';
          }).join("");
        }
      });
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

  /* ---- Finding expand/collapse ---- */
  function wireFindings() {
    document.addEventListener("click", function (e) {
      var row = e.target.closest(".dash-finding-row");
      if (row) {
        var finding = row.parentElement;
        finding.classList.toggle("open");
        return;
      }
      var toggle = e.target.closest(".dash-llm-explain-toggle");
      if (toggle) {
        var body = toggle.nextElementSibling;
        if (body) body.classList.toggle("open");
        toggle.textContent = body && body.classList.contains("open")
          ? "\u25BC Local LLM Explanation"
          : "\u25B6 Local LLM Explanation";
      }
    });
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
      loadSessions(user.id);
    });

    sb.auth.onAuthStateChange(function (event, session) {
      if (event === "SIGNED_OUT") window.location.href = HOME_URL;
      if (event === "SIGNED_IN" && session) {
        loadProfile(session.user);
        loadSessions(session.user.id);
      }
    });

    var avatarBtn = document.getElementById("avatar-btn");
    if (avatarBtn) avatarBtn.addEventListener("click", openAccountModal);

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

    wireFindings();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
