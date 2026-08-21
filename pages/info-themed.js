(function () {
  var toggle = document.querySelector(".theme-button");
  var logo = document.querySelector("#theme-logo");
  var root = document.body;

  function applyTheme(isLight) {
    root.classList.toggle("light-mode", isLight);
    toggle.textContent = isLight ? "\u263E" : "\u2609";
    toggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    toggle.setAttribute("aria-pressed", String(isLight));

    if (logo) {
      var base = logo.getAttribute("data-base-path") || "";
      logo.src = base + (isLight ? "assets/images/logo-light.png" : "assets/images/logo-dark.png");
    }

    localStorage.setItem("aegis-theme", isLight ? "light" : "dark");
  }

  if (toggle) {
    applyTheme(localStorage.getItem("aegis-theme") === "light");
    toggle.addEventListener("click", function () {
      applyTheme(!root.classList.contains("light-mode"));
    });
  }

  var revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealTargets.length) {
    revealTargets.forEach(function (el) {
      el.classList.add("reveal-hidden");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }
})();
