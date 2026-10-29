const passwordInput = document.getElementById("wardenPassword") || document.querySelector('input[type="password"]');
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      if (eyeIcon) { eyeIcon.classList.remove("fa-eye"); eyeIcon.classList.add("fa-eye-slash"); }
    } else {
      passwordInput.type = "password";
      if (eyeIcon) { eyeIcon.classList.remove("fa-eye-slash"); eyeIcon.classList.add("fa-eye"); }
    }
  });
}
const form = document.querySelector("form");
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const emailEl = document.getElementById("wardenEmail") || document.querySelector('input[type="email"]');
    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    if (!email || !password) { alert("Please enter email and password"); return; }
    const result = await Api.post("/auth/login", { email, password, role: "warden" }, false);
    if (result.success) {
      Api.setAuth(result.data);
      window.location.href = "warden-dashboard.html";
    } else {
      alert(result.message || "Login failed");
    }
  });
}
