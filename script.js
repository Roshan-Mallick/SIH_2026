document.addEventListener("DOMContentLoaded", () => {
  // Show / hide password
  document.querySelectorAll(".show-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      button.textContent = isPassword ? "HIDE" : "SHOW";
    });
  });

  // Demo social buttons
  document.getElementById("googleBtn")?.addEventListener("click", () => {
    alert("Google authentication would start here.");
  });

  document.getElementById("githubBtn")?.addEventListener("click", () => {
    alert("GitHub authentication would start here.");
  });

  // Theme switch
  document.getElementById("themeBtn")?.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });

  // Create account form
  const signupForm = document.getElementById("signupForm");
  signupForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!username || !email || !password) {
      message.textContent = "Please fill in all fields.";
      return;
    }

    if (username.length < 3) {
      message.textContent = "Username must contain at least 3 characters.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = "Please enter a valid work email.";
      return;
    }

    if (password.length < 8) {
      message.textContent = "Password must contain at least 8 characters.";
      return;
    }

    message.style.color = "#7ee787";
    message.textContent = "Account details look good — ready to create!";
  });

  // Sign-in form
  const signinForm = document.getElementById("signinForm");
  signinForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("signinUsername").value.trim();
    const password = document.getElementById("signinPassword").value;
    const message = document.getElementById("signinMessage");

    if (!username || !password) {
      message.textContent = "Please enter your username and password.";
      return;
    }

    message.style.color = "#7ee787";
    message.textContent = "Login details submitted successfully.";
  });
});
