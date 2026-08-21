(function () {
  var toggle = document.querySelector(".theme-toggle");
  var icon = document.querySelector(".theme-icon");
  var logo = document.querySelector("#theme-logo");

  if (!toggle) return;

  function applyTheme(isLight) {
    document.body.classList.toggle("light-mode", isLight);

    if (icon) icon.textContent = isLight ? "\u263E" : "\u2609";

    toggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    toggle.setAttribute("aria-pressed", String(isLight));

    if (logo) {
      var base = logo.getAttribute("data-base-path") || "";
      logo.src = base + (isLight ? "assets/images/logo-light.png" : "assets/images/logo-dark.png");
    }

    localStorage.setItem("aegis-theme", isLight ? "light" : "dark");
  }

  applyTheme(localStorage.getItem("aegis-theme") === "light");

  toggle.addEventListener("click", function () {
    applyTheme(!document.body.classList.contains("light-mode"));
  });
})();
