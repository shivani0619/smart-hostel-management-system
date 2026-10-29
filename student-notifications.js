// ==========================================================
// STUDENT NOTIFICATIONS
// ==========================================================

if (!requireAuth("student")) {
    // redirected
}


// ==========================================================
// STUDENT PROFILE
// ==========================================================

const profile = Api.getProfile() || {};

const studentMiniName =
    document.getElementById("studentMiniName");

if (studentMiniName) {
    studentMiniName.textContent =
        profile.full_name || "Student";
}

const studentMiniId =
    document.getElementById("studentMiniId");

if (studentMiniId) {
    studentMiniId.textContent =
        `Student ID: ${profile.student_id || "—"}`;
}


// ==========================================================
// LOAD NOTIFICATIONS
// ==========================================================

async function loadStudentNotifications() {

    const box =
        document.getElementById(
            "studentNotificationsBox"
        );

    if (!box) return;


    // Loading

    box.innerHTML = `
        <div class="empty-notifications">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <h3>Loading notifications...</h3>

        </div>
    `;


    try {

        const r =
            await Api.get(
                "/notifications/me"
            );


        const items =
            r.success &&
            Array.isArray(r.data)
                ? r.data
                : [];


        // ==================================================
        // NO NOTIFICATIONS
        // ==================================================

        if (!items.length) {

            box.innerHTML = `
                <div class="empty-notifications">

                    <i class="fa-regular fa-bell"></i>

                    <h3>No Notifications</h3>

                    <p>
                        You don't have any notifications right now.
                    </p>

                </div>
            `;

            return;
        }


        // ==================================================
        // DISPLAY NOTIFICATIONS
        // ==================================================

        box.innerHTML =
            items.map((n) => {
const date =
    n.created_at
        ? new Date(
            n.created_at + "Z"
          ).toLocaleString(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
          )
        : "";
                return `
                    <div class="notification-card">

                        <div class="notification-icon">

                            <i class="fa-solid fa-bell"></i>

                        </div>


                        <div class="notification-content">

                            <h3>
                                ${n.title || "Notification"}
                            </h3>

                            <p>
                                ${n.message || ""}
                            </p>


                            ${
                                date
                                    ? `
                                        <div class="notification-time">

                                            <i class="fa-regular fa-clock"></i>

                                            ${date}

                                        </div>
                                      `
                                    : ""
                            }

                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Failed to load student notifications:",
            error
        );


        box.innerHTML = `
            <div class="empty-notifications">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>
                    Unable to Load Notifications
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>
        `;
    }
}


// ==========================================================
// SIDEBAR MENU
// ==========================================================

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

if (menuBtn && sidebar) {

    menuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "show"
            );

        }
    );
}


// ==========================================================
// LOGOUT
// ==========================================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            Api.clearAuth();

        }
    );
}


// ==========================================================
// INITIAL LOAD
// ==========================================================

loadStudentNotifications();