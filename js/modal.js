(function () {
  var openBtn = document.getElementById("open-login");
  var overlay = document.getElementById("login-overlay");
  var closeBtn = document.getElementById("close-login");
  var form = document.getElementById("login-form");
  var modalLogo = document.getElementById("modal-logo");

  if (!openBtn || !overlay) return;

  function getBasePath() {
    var logo = document.getElementById("theme-logo");
    return logo ? logo.getAttribute("data-base-path") || "" : "";
  }

  function syncModalLogo() {
    if (!modalLogo) return;
    var isLight = document.body.classList.contains("light-mode");
    modalLogo.src = getBasePath() + (isLight ? "assets/images/logo-light.png" : "assets/images/logo-dark.png");
  }

  function openModal() {
    syncModalLogo();
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var firstInput = overlay.querySelector("input");
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 350);
  }

  function closeModal() {
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", openModal);

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      closeModal();
    });
  }

  var observer = new MutationObserver(syncModalLogo);
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
