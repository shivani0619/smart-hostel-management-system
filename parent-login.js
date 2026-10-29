// ==============================
// PARENT LOGIN JS
// ==============================

const passwordInput = document.getElementById("parentPassword");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");


// ==============================
// PASSWORD SHOW / HIDE
// ==============================

if (togglePassword && passwordInput) {

    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            if (eyeIcon) {
                eyeIcon.classList.remove("fa-eye");
                eyeIcon.classList.add("fa-eye-slash");
            }

        } else {

            passwordInput.type = "password";

            if (eyeIcon) {
                eyeIcon.classList.remove("fa-eye-slash");
                eyeIcon.classList.add("fa-eye");
            }

        }

    });

}


// ==============================
// PARENT LOGIN FORM
// ==============================

const form = document.getElementById("parentLoginForm");
if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();
        const studentId =
            document.getElementById("studentId").value.trim();

        const email =
            document.getElementById("parentEmail").value.trim();

        const password =
            document.getElementById("parentPassword").value;


        // ==============================
        // VALIDATION
        // ==============================

        if (!studentId || !email || !password) {

            alert(
                "Please enter email, password, and linked Student ID"
            );

            return;
        }
        // ==============================
        // LOGIN API
        // ==============================

        const result = await Api.post(
            "/auth/login",
            {
                email: email,
                password: password,
                student_id: studentId,
                role: "parent"
            },
            false
        );


        console.log("PARENT LOGIN RESULT:", result);


        // ==============================
        // LOGIN SUCCESS
        // ==============================

        if (result.success) {
            Api.setAuth(result.data);
            window.location.href = "parent-room.html";

            return;
        }


        // ==============================
        // LOGIN FAILED
        // ==============================

        alert(
            result.message || "Login failed"
        );

    });

}