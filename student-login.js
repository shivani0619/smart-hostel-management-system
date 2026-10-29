const passwordInput = document.getElementById("studentPassword");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

const modalStyle = document.createElement("style");
modalStyle.textContent = `
  .student-login-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(24, 34, 53, .58);
  }
  .student-login-modal {
    width: min(100%, 410px);
    padding: 32px 28px 28px;
    border: 1px solid rgba(31, 111, 120, .14);
    border-radius: 18px;
    background: #fff;
    color: #1c2535;
    box-shadow: 0 24px 70px rgba(24, 34, 53, .24);
    text-align: center;
    font-family: 'Poppins', sans-serif;
  }
  .student-login-success-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: #e5f6f1;
    color: #218b70;
    font-size: 24px;
  }
  .student-login-modal h2 { margin: 0; font-size: 24px; }
  .student-login-welcome { margin: 8px 0 24px; color: #667085; }
  .student-login-id-label { margin: 0 0 8px; color: #667085; font-size: 13px; }
  .student-login-id { margin: 0; color: #1f6f78; font-size: 30px; font-weight: 700; letter-spacing: .04em; }
  .student-login-note { margin: 12px 0 24px; color: #667085; font-size: 12px; }
  .student-login-continue { width: 100%; padding: 12px 18px; border: 0; border-radius: 9px; background: #1f6f78; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
  .student-login-continue:hover { background: #185b63; }
`;
document.head.appendChild(modalStyle);

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  });
}

const form = document.getElementById("studentLoginForm");
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const full_name = document.getElementById("studentName").value.replace(/\s+/g, " ").trim();
    const email = document.getElementById("studentEmail").value.trim();
    const password = document.getElementById("studentPassword").value;

    if (!full_name || !email || !password) {
      alert("Please enter name, email and password");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "<span>Logging in...</span>";
    }

    const result = await Api.post(
      "/auth/login",
      { full_name, email, password, role: "student" },
      false
    );

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>LOGIN</span><i class="fa-solid fa-arrow-right"></i>';
    }

    if (result.success) {
      const profile = result.data?.profile;
      const studentId = profile?.student_id;
      if (!profile?.full_name || !studentId) {
        alert("Login succeeded, but the authenticated Student ID was not returned. Please contact the administrator.");
        return;
      }

      Api.setAuth(result.data);
      const modal = document.createElement("div");
      modal.className = "student-login-modal-backdrop";
      modal.innerHTML = `
        <div class="student-login-modal" role="dialog" aria-modal="true" aria-labelledby="studentLoginSuccessTitle">
          <div class="student-login-success-icon" aria-hidden="true"><i class="fa-solid fa-check"></i></div>
          <h2 id="studentLoginSuccessTitle">Login Successful!</h2>
          <p class="student-login-welcome"></p>
          <p class="student-login-id-label">Your Student ID</p>
          <p class="student-login-id"></p>
          <p class="student-login-note">Please remember your Student ID for future use.</p>
          <button type="button" class="student-login-continue" id="continueLogin">Continue to Dashboard</button>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector(".student-login-welcome").textContent = `Welcome, ${profile.full_name}!`;
      modal.querySelector(".student-login-id").textContent = studentId;
      modal.querySelector("#continueLogin").addEventListener("click", () => {
        modal.remove();
        window.location.href = "student-dashboard.html";
      });
    } else {
      alert(result.message || "Login failed");
    }
  });
}
