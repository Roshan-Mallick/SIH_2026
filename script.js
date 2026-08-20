const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");

themeToggle.addEventListener("click", () => {
	const isLightMode = document.body.classList.toggle("light-mode");

	if (isLightMode) {
		themeToggle.setAttribute("aria-label", "Switch to dark mode");
		themeToggle.setAttribute("aria-pressed", "true");
		themeIcon.textContent = "☾";
	} else {
		themeToggle.setAttribute("aria-label", "Switch to light mode");
		themeToggle.setAttribute("aria-pressed", "false");
		themeIcon.textContent = "☼";
	}
});
