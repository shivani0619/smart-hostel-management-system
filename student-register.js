const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const eyeIcon = document.getElementById("eyeIcon");
const confirmEyeIcon = document.getElementById("confirmEyeIcon");

if (togglePassword && password) {
  togglePassword.addEventListener("click", function () {
    if (password.type === "password") {
      password.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    } else {
      password.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  });
}

if (toggleConfirmPassword && confirmPassword) {
  toggleConfirmPassword.addEventListener("click", function () {
    if (confirmPassword.type === "password") {
      confirmPassword.type = "text";
      confirmEyeIcon.classList.remove("fa-eye");
      confirmEyeIcon.classList.add("fa-eye-slash");
    } else {
      confirmPassword.type = "password";
      confirmEyeIcon.classList.remove("fa-eye-slash");
      confirmEyeIcon.classList.add("fa-eye");
    }
  });
}

const form = document.getElementById("studentRegisterForm");
if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (password.value !== confirmPassword.value) {
      alert("Passwords do not match!");
      return;
    }

    const payload = {
      full_name: document.getElementById("fullName").value.replace(/\s+/g, " ").trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone") ? document.getElementById("phone").value.trim() : null,
      department: document.getElementById("department") ? document.getElementById("department").value : null,
      year: document.getElementById("year") ? document.getElementById("year").value : null,
      password: password.value,
    };

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Registering...";
    }

    const result = await Api.post("/auth/register/student", payload, false);

    if (btn) {
      btn.disabled = false;
      btn.textContent = "Register";
    }

    if (result.success) {
      alert(result.message || "Registration successful! Please login.");
      window.location.href = "studentlogin.html";
    } else {
      alert(result.message || "Registration failed");
    }
  });
}
