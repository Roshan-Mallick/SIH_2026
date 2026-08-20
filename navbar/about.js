const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeLogo = document.querySelector("#theme-logo");

function applyTheme(isLightMode) {
	document.body.classList.toggle("light-mode", isLightMode);

	if (isLightMode) {
		themeToggle.setAttribute("aria-label", "Switch to dark mode");
		themeToggle.setAttribute("aria-pressed", "true");
		themeIcon.textContent = "☾";
		themeLogo.src = "../assets/logo2.png";
	} else {
		themeToggle.setAttribute("aria-label", "Switch to light mode");
		themeToggle.setAttribute("aria-pressed", "false");
		themeIcon.textContent = "☼";
		themeLogo.src = "../assets/logo.png";
	}
}

applyTheme(localStorage.getItem("aegis-theme") === "light");

themeToggle.addEventListener("click", () => {
	const isLightMode = !document.body.classList.contains("light-mode");
	localStorage.setItem("aegis-theme", isLightMode ? "light" : "dark");
	applyTheme(isLightMode);
});
