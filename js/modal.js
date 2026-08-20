(function () {
  function getBasePath() {
    var logo = document.getElementById("theme-logo");
    return logo ? logo.getAttribute("data-base-path") || "" : "";
  }

  function syncLogo(img) {
    if (!img) return;
    var isLight = document.body.classList.contains("light-mode");
    img.src = getBasePath() + (isLight ? "assets/images/logo-light.png" : "assets/images/logo-dark.png");
  }

  function openModal(overlay) {
    syncLogo(overlay.querySelector(".login-logo"));
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var firstInput = overlay.querySelector("input");
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 350);
  }

  function closeModal(overlay) {
    overlay.setAttribute("aria-hidden", "true");
    var anyOpen = document.querySelector('.login-overlay[aria-hidden="false"]');
    if (!anyOpen) document.body.style.overflow = "";
  }

  function setupModal(openId, overlayId, closeId, formId) {
    var openBtn = document.getElementById(openId);
    var overlay = document.getElementById(overlayId);
    var closeBtn = document.getElementById(closeId);
    var form = document.getElementById(formId);
    if (!openBtn || !overlay) return;

    openBtn.addEventListener("click", function () { openModal(overlay); });
    if (closeBtn) closeBtn.addEventListener("click", function () { closeModal(overlay); });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay);
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        closeModal(overlay);
      });
    }
  }

  setupModal("open-signup", "signup-overlay", "close-signup", "signup-form");
  setupModal("open-login", "login-overlay", "close-login", "login-form");

  var switchToLogin = document.getElementById("switch-to-login");
  if (switchToLogin) {
    switchToLogin.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal(document.getElementById("signup-overlay"));
      setTimeout(function () { openModal(document.getElementById("login-overlay")); }, 300);
    });
  }

  var switchToSignup = document.getElementById("switch-to-signup");
  if (switchToSignup) {
    switchToSignup.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal(document.getElementById("login-overlay"));
      setTimeout(function () { openModal(document.getElementById("signup-overlay")); }, 300);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = document.querySelector('.login-overlay[aria-hidden="false"]');
      if (open) closeModal(open);
    }
  });

  var observer = new MutationObserver(function () {
    document.querySelectorAll(".login-logo").forEach(syncLogo);
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
