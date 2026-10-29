const form = document.getElementById("parentRegisterForm");
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const password = document.getElementById("parentPassword");
    const confirm = document.getElementById("confirmParentPassword");
    if (password && confirm && password.value !== confirm.value) {
      alert("Passwords do not match!");
      return;
    }
    const payload = {
      full_name: document.getElementById("parentName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone") ? document.getElementById("phone").value.trim() : null,
      relationship: document.getElementById("relationship") ? document.getElementById("relationship").value : "father",
      student_id: document.getElementById("studentId").value.trim(),
      password: password ? password.value : "",
    };
    const result = await Api.post("/auth/register/parent", payload, false);
    if (result.success) {
      alert(result.message || "Registration successful! Please login.");
      window.location.href = "parent-login.html";
    } else {
      alert(result.message || "Registration failed");
    }
  });
}
