const form = document.getElementById(
    "studentForgotPasswordForm"
);


if (form) {

    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const studentId =
                document
                    .getElementById("studentId")
                    ?.value
                    .trim()
                    .toUpperCase() || "";


            const fullName =
                document
                    .getElementById("studentName")
                    ?.value
                    .replace(/\s+/g, " ")
                    .trim() || "";


            const email =
                document
                    .getElementById("studentEmail")
                    ?.value
                    .trim()
                    .toLowerCase() || "";


            const phone =
                document
                    .getElementById("studentPhone")
                    ?.value
                    .trim() || "";


            const newPassword =
                document
                    .getElementById("newPassword")
                    ?.value || "";


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    ?.value || "";


            // ==========================
            // VALIDATION
            // ==========================

            if (
                !studentId ||
                !fullName ||
                !email ||
                !phone ||
                !newPassword ||
                !confirmPassword
            ) {

                alert(
                    "Please fill in all the details."
                );

                return;
            }


            if (!/^\d{10}$/.test(phone)) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            if (newPassword.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "New password and confirm password do not match."
                );

                return;
            }


            // ==========================
            // DISABLE BUTTON
            // ==========================

            const button =
                form.querySelector(
                    ".reset-button"
                );


            const originalButton =
                button
                    ? button.innerHTML
                    : "";


            if (button) {

                button.disabled = true;

                button.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Resetting...</span>
                `;

            }


            // ==========================
            // API REQUEST
            // ==========================

            try {

                const result =
                    await Api.post(
                        "/auth/student-forgot-password",
                        {
                            student_id: studentId,
                            full_name: fullName,
                            email: email,
                            phone: phone,
                            new_password: newPassword
                        },
                        false
                    );


                // ==========================
                // SUCCESS
                // ==========================

                if (result.success) {

                    alert(
                        result.message ||
                        "Password reset successfully. Please login with your new password."
                    );


                    window.location.href =
                        "studentlogin.html";

                }

                // ==========================
                // FAILED
                // ==========================

                else {

                    alert(
                        result.message ||
                        "Password reset failed."
                    );

                }

            }

            // ==========================
            // ERROR
            // ==========================

            catch (error) {

                console.error(
                    "Student password reset error:",
                    error
                );


                alert(
                    "Unable to reset password. Please try again."
                );

            }

            // ==========================
            // RESTORE BUTTON
            // ==========================

            finally {

                if (button) {

                    button.disabled = false;

                    button.innerHTML =
                        originalButton;

                }

            }

        }
    );

}