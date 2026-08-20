(function () {
  var sb = null;
  if (typeof supabase !== "undefined" && supabase.createClient && window.__aegis) {
    sb = supabase.createClient(
      window.__aegis.supabaseUrl,
      window.__aegis.supabaseAnonKey
    );
  }

  var HOME_URL = "https://aegis-preflight.vercel.app/index.html";
  var DASH_URL = "https://aegis-preflight.vercel.app/pages/dashboard.html";
  var API_BASE = "https://aegis-preflight.vercel.app/api";
  var currentUser = null;
  var currentLicense = null;

  /* ---- Helpers ---- */
  function esc(s) { if (!s) return ""; var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function formatDate(iso) {
    if (!iso) return "\u2014";
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function getInitial(name) { return name ? name.charAt(0).toUpperCase() : "A"; }

  function maskKey(key) {
    if (!key || key.length < 16) return key || "---";
    return key.slice(0, 8) + "-\u2022\u2022\u2022\u2022-\u2022\u2022\u2022\u2022-" + key.slice(-4);
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
    var email = user.email || "\u2014";
    var avatar = meta.avatar_url || "";
    var provider = (user.app_metadata && user.app_metadata.provider) || "email";

    var avatarEl = document.getElementById("acct-avatar");
    var emailEl = document.getElementById("acct-email");
    var topbarAvatar = document.getElementById("topbar-avatar");

    var avatarHTML = avatar
      ? '<img src="' + esc(avatar) + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />'
      : getInitial(name);

    if (avatarEl) avatarEl.innerHTML = avatarHTML;
    if (topbarAvatar) topbarAvatar.innerHTML = avatarHTML;
    if (emailEl) emailEl.textContent = email;

    setupAuthSection(provider);
  }

  /* ---- Subscription ---- */
  function loadSubscription(userId) {
    if (!sb) return;
    sb.from("subscriptions").select("plan, status, current_period_end, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(function (res) {
        if (res.error || !res.data || res.data.length === 0) {
          setFreePlan();
          return;
        }
        var sub = res.data[0];
        var planName = sub.plan || "free";
        var status = sub.status || "active";

        document.getElementById("sub-plan").textContent = planName.charAt(0).toUpperCase() + planName.slice(1);

        var badge = document.getElementById("sub-status");
        badge.textContent = status.replace("_", " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        badge.className = "acct-plan-badge " + status;

        var renewal = document.getElementById("sub-renewal");
        if (sub.current_period_end) {
          renewal.textContent = "Renews " + formatDate(sub.current_period_end);
        } else {
          renewal.textContent = "";
        }

        if (planName === "free") {
          document.getElementById("btn-upgrade").style.display = "inline-flex";
          document.getElementById("btn-manage-billing").disabled = true;
        } else {
          document.getElementById("btn-upgrade").style.display = "none";
          document.getElementById("btn-manage-billing").disabled = false;
        }

        loadInvoices(sub.plan);
      });
  }

  function setFreePlan() {
    document.getElementById("sub-plan").textContent = "Free";
    document.getElementById("sub-status").textContent = "Active";
    document.getElementById("sub-status").className = "acct-plan-badge active";
    document.getElementById("sub-renewal").textContent = "";
    document.getElementById("btn-upgrade").style.display = "inline-flex";
    document.getElementById("btn-manage-billing").disabled = true;
    document.getElementById("invoice-list").innerHTML = '<p class="acct-empty">No payment history.</p>';
  }

  function loadInvoices(plan) {
    if (plan === "free") {
      document.getElementById("invoice-list").innerHTML = '<p class="acct-empty">No payment history.</p>';
      return;
    }
    /* Backend required: GET /api/invoices
       Returns last 5 invoices from Stripe API.
       Placeholder until backend is deployed. */
    document.getElementById("invoice-list").innerHTML = '<p class="acct-empty">Invoice history available after backend deployment.</p>';
  }

  /* ---- License ---- */
  function loadLicense(userId) {
    if (!sb) return;
    sb.from("licenses").select("id, license_key, device_fingerprint, device_label, activated_at, last_seen_at, revoked")
      .eq("user_id", userId)
      .eq("revoked", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(function (res) {
        if (res.error || !res.data || res.data.length === 0) {
          document.getElementById("license-key").textContent = "No license key";
          document.getElementById("license-status").textContent = "No License";
          document.getElementById("license-status").className = "acct-license-badge none";
          document.getElementById("license-activated").textContent = "\u2014";
          document.getElementById("license-last-seen").textContent = "\u2014";
          document.getElementById("btn-regenerate-license").disabled = true;
          return;
        }
        currentLicense = res.data[0];
        var lic = currentLicense;

        document.getElementById("license-key").textContent = maskKey(lic.license_key);
        document.getElementById("license-key").dataset.full = lic.license_key;
        document.getElementById("license-key").dataset.masked = maskKey(lic.license_key);
        document.getElementById("license-key").revealed = false;

        var badge = document.getElementById("license-status");
        badge.textContent = "Active";
        badge.className = "acct-license-badge active";

        document.getElementById("license-activated").textContent = formatDate(lic.activated_at);
        document.getElementById("license-last-seen").textContent = formatDate(lic.last_seen_at);
        document.getElementById("btn-regenerate-license").disabled = false;

        loadDevices(userId);
      });
  }

  /* ---- Devices ---- */
  function loadDevices(userId) {
    if (!sb || !currentLicense) return;
    var el = document.getElementById("device-list");
    if (!currentLicense.device_fingerprint) {
      el.innerHTML = '<p class="acct-empty">No devices registered. Activate a license from the desktop app.</p>';
      return;
    }
    el.innerHTML =
      '<div class="acct-device">' +
        '<div class="acct-device-info">' +
          '<span class="acct-device-name">' + esc(currentLicense.device_label || "Registered Device") + '</span>' +
          '<span class="acct-device-dates">Activated ' + formatDate(currentLicense.activated_at) +
          ' \u00b7 Last seen ' + formatDate(currentLicense.last_seen_at) + '</span>' +
        '</div>' +
        '<div class="acct-device-actions">' +
          '<button class="button danger" data-action="revoke-device">Revoke</button>' +
        '</div>' +
      '</div>';
  }

  /* ---- Auth section ---- */
  function setupAuthSection(provider) {
    var form = document.getElementById("password-form");
    var badge = document.getElementById("auth-oauth-badge");

    if (provider === "google" || provider === "github") {
      if (form) form.style.display = "none";
      if (badge) {
        badge.style.display = "flex";
        document.getElementById("oauth-badge-icon").textContent = provider === "google" ? "\uD83D\uDD35" : "\u2B24";
        document.getElementById("oauth-badge-text").textContent =
          "Signed in with " + provider.charAt(0).toUpperCase() + provider.slice(1);
      }
    } else {
      if (form) form.style.display = "flex";
      if (badge) badge.style.display = "none";
    }
  }

  /* ---- Password change ---- */
  function changePassword(e) {
    e.preventDefault();
    var newPw = document.getElementById("new-password").value;
    var confirmPw = document.getElementById("confirm-password").value;
    var errEl = document.getElementById("password-error");
    var okEl = document.getElementById("password-success");

    if (errEl) errEl.style.display = "none";
    if (okEl) okEl.style.display = "none";

    if (newPw.length < 6) {
      showFormMsg(errEl, "Password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      showFormMsg(errEl, "Passwords do not match.");
      return;
    }

    sb.auth.updateUser({ password: newPw }).then(function (res) {
      if (res.error) {
        showFormMsg(errEl, res.error.message);
        return;
      }
      showFormMsg(okEl, "Password updated successfully.");
      document.getElementById("password-form").reset();
    });
  }

  function showFormMsg(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  /* ---- Billing / Upgrade ---- */
  function openBillingPortal() {
    /* Backend required: POST /api/billing/portal
       Creates a Stripe Customer Portal session and returns { url }.
       Placeholder until backend is deployed. */
    alert("Billing portal requires backend deployment (Stripe integration).");
  }

  function openUpgrade() {
    /* Backend required: POST /api/billing/checkout
       Creates a Stripe Checkout session for plan upgrade and returns { url }.
       Placeholder until backend is deployed. */
    alert("Upgrade requires backend deployment (Stripe integration).");
  }

  /* ---- License regenerate ---- */
  function showRegenConfirm() {
    var el = document.getElementById("regen-overlay");
    if (el) el.setAttribute("aria-hidden", "false");
  }

  function hideRegenConfirm() {
    var el = document.getElementById("regen-overlay");
    if (el) el.setAttribute("aria-hidden", "true");
  }

  function regenerateLicense() {
    /* Backend required: POST /api/license/regenerate
       Uses service role to revoke old key, generate new one, unbind devices.
       Placeholder until backend is deployed. */
    hideRegenConfirm();
    alert("License regeneration requires backend deployment.");
  }

  /* ---- Revoke device ---- */
  function revokeDevice() {
    /* Backend required: POST /api/license/revoke-device
       Uses service role to clear device_fingerprint on the license.
       Placeholder until backend is deployed. */
    alert("Device revocation requires backend deployment.");
  }

  /* ---- License reveal/copy ---- */
  function toggleRevealLicense() {
    var el = document.getElementById("license-key");
    if (!el || !el.dataset.full) return;
    el.revealed = !el.revealed;
    el.textContent = el.revealed ? el.dataset.full : el.dataset.masked;
  }

  function copyLicense() {
    var el = document.getElementById("license-key");
    if (!el || !el.dataset.full) return;
    navigator.clipboard.writeText(el.dataset.full).then(function () {
      var btn = document.getElementById("btn-copy-license");
      if (btn) { btn.textContent = "\u2713"; setTimeout(function () { btn.textContent = "\uD83D\uDCCB"; }, 1500); }
    });
  }

  /* ---- Init ---- */
  function init() {
    redirectIfNoAuth();
    if (!sb) return;

    sb.auth.getSession().then(function (res) {
      var session = res.data.session;
      if (!session) return;
      loadProfile(session.user);
      loadSubscription(session.user.id);
      loadLicense(session.user.id);
    });

    sb.auth.onAuthStateChange(function (event, session) {
      if (event === "SIGNED_OUT") window.location.href = HOME_URL;
    });

    /* Button wiring */
    var pwForm = document.getElementById("password-form");
    if (pwForm) pwForm.addEventListener("submit", changePassword);

    var billingBtn = document.getElementById("btn-manage-billing");
    if (billingBtn) billingBtn.addEventListener("click", openBillingPortal);

    var upgradeBtn = document.getElementById("btn-upgrade");
    if (upgradeBtn) upgradeBtn.addEventListener("click", openUpgrade);

    var regenBtn = document.getElementById("btn-regenerate-license");
    if (regenBtn) regenBtn.addEventListener("click", showRegenConfirm);

    var regenCancel = document.getElementById("regen-cancel");
    if (regenCancel) regenCancel.addEventListener("click", hideRegenConfirm);

    var regenConfirm = document.getElementById("regen-confirm");
    if (regenConfirm) regenConfirm.addEventListener("click", regenerateLicense);

    var regenOverlay = document.getElementById("regen-overlay");
    if (regenOverlay) regenOverlay.addEventListener("click", function (e) {
      if (e.target === regenOverlay) hideRegenConfirm();
    });

    var revealBtn = document.getElementById("btn-reveal-license");
    if (revealBtn) revealBtn.addEventListener("click", toggleRevealLicense);

    var copyBtn = document.getElementById("btn-copy-license");
    if (copyBtn) copyBtn.addEventListener("click", copyLicense);

    /* Device revoke delegation */
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action='revoke-device']");
      if (btn) revokeDevice();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hideRegenConfirm();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
