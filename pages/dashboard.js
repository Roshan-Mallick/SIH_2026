document.addEventListener("DOMContentLoaded", async () => {
  var LOGIN_URL = "login.html";
  var userDisplay = document.getElementById("userDisplay");
  var currentUser = null;

  var sb = window.AegisAuth ? AegisAuth.getClient() : null;

  if (!sb) {
    if (userDisplay) userDisplay.textContent = "Guest";
    return;
  }

  // OAuth providers may return with ?error=...&error_description=...
  // (e.g. sign-up blocked server-side). Show it instead of silently bouncing.
  if (AegisAuth.getOAuthError()) {
    var msg = AegisAuth.getOAuthError();
    AegisAuth.clearOAuthParams();
    window.location.replace(AegisAuth.getLoginUrl() + "?error=" + encodeURIComponent(msg));
    return;
  }

  // INITIAL_SESSION fires only after supabase-js finished initializing —
  // i.e. after restoring localStorage AND consuming any OAuth session from
  // the redirect URL (#access_token=...). Deciding navigation on anything
  // earlier is a race and caused login <-> dashboard ping-pong.
  AegisAuth.onSession((session) => {
    if (!session) {
      window.location.replace(LOGIN_URL);
      return;
    }
    const user = session.user;
    currentUser = user;
    const name = user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split("@")[0]
      || "User";
    if (userDisplay) userDisplay.textContent = name;
    const displayNameInput = document.getElementById("displayNameInput");
    const settingsProfileEmail = document.getElementById("settingsProfileEmail");
    const settingsEmail = document.getElementById("settingsEmail");
    if (displayNameInput) displayNameInput.value = name;
    if (settingsProfileEmail) settingsProfileEmail.textContent = user.email || "Workspace member";
    if (settingsEmail) settingsEmail.textContent = user.email || "Unavailable";
  });

  // ── Sign out ──
  async function signOut() {
    await sb.auth.signOut();
    window.location.replace(AegisAuth.getLoginUrl());
  }
  document.getElementById("signoutBtn")?.addEventListener("click", signOut);
  document.getElementById("profileSignoutBtn")?.addEventListener("click", signOut);

  // ── Theme toggle ──
  const themeBtn  = document.getElementById("themeBtn");
  const themeIcon = document.getElementById("themeIcon");

  function applyTheme(isLight) {
    document.body.classList.toggle("light", isLight);
    if (themeIcon) {
      themeIcon.className = isLight ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
    const logo = document.getElementById("sidebar-logo");
    if (logo) logo.src = isLight ? "../assets/images/logo-light.png" : "../assets/images/logo-dark.png";
  }

  const saved = localStorage.getItem("aegis-theme");
  applyTheme(saved === "light");

  themeBtn?.addEventListener("click", () => {
    const next = !document.body.classList.contains("light");
    localStorage.setItem("aegis-theme", next ? "light" : "dark");
    applyTheme(next);
  });

  // Settings dialog
  const settingsNav = document.getElementById("settingsNav");
  const settingsModal = document.getElementById("settingsModal");
  const settingsClose = document.getElementById("settingsClose");
  const settingsDone = document.getElementById("settingsDone");
  const settingsUser = document.getElementById("settingsUser");
  const dashboardNav = document.querySelector('.nav-item.active');
  const settingsTabs = document.querySelectorAll(".settings-tab");
  const settingsPages = document.querySelectorAll(".settings-page");
  const settingsProfileUser = document.getElementById("settingsProfileUser");
  const profileForm = document.getElementById("profileForm");
  const displayNameInput = document.getElementById("displayNameInput");
  const saveDisplayNameBtn = document.getElementById("saveDisplayNameBtn");
  const profileFormMessage = document.getElementById("profileFormMessage");

  function showSettingsPage(pageName) {
    settingsTabs.forEach((tab) => {
      const isActive = tab.dataset.settingsPage === pageName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    settingsPages.forEach((page) => {
      const isActive = page.dataset.settingsContent === pageName;
      page.classList.toggle("is-active", isActive);
      page.hidden = !isActive;
    });
  }

  function setSettingsOpen(isOpen) {
    if (!settingsModal) return;
    settingsModal.classList.toggle("is-open", isOpen);
    settingsModal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("settings-open", isOpen);
    settingsNav?.classList.toggle("active", isOpen);
    dashboardNav?.classList.toggle("active", !isOpen);
    if (isOpen) {
      if (settingsUser && userDisplay) settingsUser.textContent = userDisplay.textContent;
      if (settingsProfileUser && userDisplay) settingsProfileUser.textContent = userDisplay.textContent;
      showSettingsPage("profile");
      settingsClose?.focus();
    }
  }

  settingsNav?.addEventListener("click", (event) => {
    event.preventDefault();
    setSettingsOpen(true);
  });
  settingsClose?.addEventListener("click", () => setSettingsOpen(false));
  settingsDone?.addEventListener("click", () => setSettingsOpen(false));
  settingsTabs.forEach((tab) => {
    tab.addEventListener("click", () => showSettingsPage(tab.dataset.settingsPage));
  });
  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const displayName = displayNameInput?.value.trim();
    if (!currentUser || !displayName) return;

    saveDisplayNameBtn.disabled = true;
    profileFormMessage.textContent = "Saving...";
    const { data, error } = await sb.auth.updateUser({ data: { full_name: displayName } });
    saveDisplayNameBtn.disabled = false;

    if (error) {
      profileFormMessage.textContent = error.message;
      profileFormMessage.classList.add("is-error");
      return;
    }

    currentUser = data.user;
    userDisplay.textContent = displayName;
    settingsUser.textContent = displayName;
    settingsProfileUser.textContent = displayName;
    profileFormMessage.textContent = "Display name updated.";
    profileFormMessage.classList.remove("is-error");
  });
  settingsModal?.addEventListener("click", (event) => {
    if (event.target === settingsModal) setSettingsOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSettingsOpen(false);
  });
});

// ── Aegis Desktop — fetch latest GitHub release (.deb) ──
// Independent listener so the download section works regardless of auth state.
document.addEventListener("DOMContentLoaded", () => {
  const RELEASE_API_URL = "https://api.github.com/repos/Roshan-Mallick/aegis-preflight/releases/latest";
  const releaseInfo = document.getElementById("downloadReleaseInfo");
  const downloadBtn = document.getElementById("downloadAegisDesktop");
  if (!releaseInfo || !downloadBtn) return;

  function setUnavailable() {
    releaseInfo.textContent = "Download temporarily unavailable";
    downloadBtn.removeAttribute("href");
    downloadBtn.setAttribute("aria-disabled", "true");
    downloadBtn.classList.add("dash-btn-disabled");
    downloadBtn.classList.remove("dash-btn-primary");
  }

  fetch(RELEASE_API_URL, { headers: { Accept: "application/vnd.github+json" } })
    .then((response) => {
      if (!response.ok) throw new Error("GitHub API responded with " + response.status);
      return response.json();
    })
    .then((release) => {
      const debAsset = (release.assets || []).find(
        (asset) => typeof asset.name === "string" && asset.name.toLowerCase().endsWith(".deb")
      );
      if (!debAsset || !debAsset.browser_download_url) throw new Error("No .deb asset in latest release");

      const tag = release.tag_name || "";
      releaseInfo.textContent = tag ? tag + " • Linux" : "Latest • Linux";
      downloadBtn.href = debAsset.browser_download_url;
      downloadBtn.setAttribute("title", debAsset.name);
      downloadBtn.setAttribute("aria-disabled", "false");
      downloadBtn.classList.remove("dash-btn-disabled");
      downloadBtn.classList.add("dash-btn-primary");
    })
    .catch(() => setUnavailable());
});
