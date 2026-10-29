/* =====================================================
   SMART HOSTEL AI
   ATTENDANCE JAVASCRIPT
===================================================== */


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

if (menuBtn && sidebar) {

    menuBtn.addEventListener("click", function () {

        sidebar.classList.toggle("active");

    });

}


/* =====================================================
   CLOSE SIDEBAR WHEN NAV LINK CLICKED
===================================================== */

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {

    link.addEventListener("click", function () {

        if (window.innerWidth <= 900 && sidebar) {

            sidebar.classList.remove("active");

        }

    });

});


/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

const notificationBtn =
    document.getElementById("notificationBtn");

if (notificationBtn) {

    notificationBtn.addEventListener("click", function () {

        window.location.href = "notification.html";

    });

}


/* =====================================================
   CURRENT DATE
===================================================== */

const currentDateElement =
    document.getElementById("currentDate");

if (currentDateElement) {

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDateElement.textContent =
        today.toLocaleDateString("en-IN", options);

}
if (!requireAuth("student")) {
    // Redirect is handled by requireAuth.
}


// =====================================================
// STUDENT MINI PROFILE
// =====================================================

async function loadStudentMiniProfile() {

    try {

        const result =
            await Api.get("/students/me");

        if (
            !result ||
            !result.success ||
            !result.data
        ) {
            return;
        }

        const student =
            result.data;

        const studentName =
            student.full_name ||
            "Student";

        const studentId =
            student.student_id ||
            "";

        // Student Name
        const nameElement =
            document.getElementById(
                "studentMiniName"
            );

        if (nameElement) {

            nameElement.textContent =
                studentName;

        }

        // Student ID
        const idElement =
            document.getElementById(
                "studentMiniId"
            );

        if (idElement) {

            idElement.textContent =
                studentId
                    ? `Student ID: ${studentId}`
                    : "Student ID: —";

        }

        // Student Initials
        const avatar =
            document.getElementById(
                "profileAvatar"
            );

        if (avatar) {

            const parts =
                studentName
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);

            let initials = "ST";

            if (parts.length === 1) {

                initials =
                    parts[0]
                        .substring(0, 2)
                        .toUpperCase();

            } else {

                initials =
                    (
                        parts[0][0] +
                        parts[parts.length - 1][0]
                    ).toUpperCase();

            }

            const onlineDot =
                avatar.querySelector(
                    ".online-dot"
                );

            avatar.textContent =
                initials;

            if (onlineDot) {

                avatar.appendChild(
                    onlineDot
                );

            }

        }

    } catch (error) {

        console.error(
            "Student mini profile error:",
            error
        );

    }
}


// Load student mini profile
loadStudentMiniProfile();

const monthFilter = document.getElementById("monthFilter");
const statusFilter = document.getElementById("statusFilter");
const tableBody = document.getElementById("attendanceTableBody");

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return {
        date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        day: date.toLocaleDateString("en-IN", { weekday: "long" }),
    };
}

function formatTime(value) {
    if (!value) return "-";
    const [hours, minutes] = value.split(":");
    const date = new Date(2000, 0, 1, Number(hours), Number(minutes));
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function renderRows(records) {
    if (!records.length) {
        tableBody.innerHTML = '<tr><td colspan="5">No attendance records found.</td></tr>';
        return;
    }

    tableBody.innerHTML = records.map(record => {
        const formatted = formatDate(record.attendance_date);
        const status = record.status || "unknown";
        const label = status.charAt(0).toUpperCase() + status.slice(1);
        const icon = status === "present" ? "fa-circle-check" : status === "absent" ? "fa-circle-xmark" : "fa-file";
        return `<tr data-status="${status}" data-date="${record.attendance_date}">
            <td>${formatted.date}</td>
            <td>${formatted.day}</td>
            <td>${formatTime(record.check_in_time)}</td>
            <td>${formatTime(record.check_out_time)}</td>
            <td><span class="status ${status}-status"><i class="fa-solid ${icon}"></i> ${label}</span></td>
        </tr>`;
    }).join("");
}
function renderSummary(records) {

    // PRESENT + LATE = ATTENDED
    const present = records.filter(
        record =>
            record.status === "present" ||
            record.status === "late"
    ).length;

    const absent = records.filter(
        record => record.status === "absent"
    ).length;

    const leave = records.filter(
        record => record.status === "leave"
    ).length;

    const total = records.length;

    const percentage =
        total
            ? Math.round((present / total) * 100)
            : 0;

    const setText = (id, value) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    };

    const setWidth = (id, value) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.style.width = `${value}%`;
        }

    };


    // =====================================================
    // OVERALL ATTENDANCE
    // =====================================================

    [
        "attendancePercentage",
        "overviewPercentage",
        "progressPercentage"
    ].forEach(id => {

        setText(
            id,
            `${percentage}%`
        );

    });


    // =====================================================
    // ATTENDANCE COUNTS
    // =====================================================

    setText(
        "presentDays",
        present
    );

    setText(
        "absentDays",
        absent
    );

    setText(
        "totalDays",
        total
    );


    // =====================================================
    // MONTHLY BREAKDOWN
    // =====================================================

    setText(
        "monthlyPresent",
        `${present} Days`
    );

    setText(
        "monthlyAbsent",
        `${absent} Days`
    );

    setText(
        "monthlyLeave",
        `${leave} Days`
    );


    // =====================================================
    // PROGRESS BARS
    // =====================================================

    setWidth(
        "attendanceProgress",
        percentage
    );

    setWidth(
        "presentProgress",
        total
            ? (present / total) * 100
            : 0
    );

    setWidth(
        "absentProgress",
        total
            ? (absent / total) * 100
            : 0
    );

    setWidth(
        "leaveProgress",
        total
            ? (leave / total) * 100
            : 0
    );
}
async function loadAttendance() {

    tableBody.innerHTML =
        '<tr><td colspan="5">Loading attendance...</td></tr>';

    const selectedMonth =
        monthFilter
            ? monthFilter.value
            : "all";

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    // =====================================================
    // BUILD API URL
    // =====================================================

    const params =
        new URLSearchParams();


    // -----------------------------------------------------
    // MONTH FILTER
    // -----------------------------------------------------
    // "all" means:
    // Do NOT send month parameter.
    // Backend will return ALL attendance records.
    // -----------------------------------------------------

    if (
        selectedMonth &&
        selectedMonth !== "all"
    ) {

        params.set(
            "month",
            selectedMonth
        );

    }


    // -----------------------------------------------------
    // STATUS FILTER
    // -----------------------------------------------------

    if (
        selectedStatus &&
        selectedStatus !== "all"
    ) {

        params.set(
            "status",
            selectedStatus
        );

    }


    // =====================================================
    // API URL
    // =====================================================

    const queryString =
        params.toString();


    const url =
        queryString
            ? `/attendance/me?${queryString}`
            : "/attendance/me";


    try {

        const result =
            await Api.get(url);


        if (!result.success) {

            tableBody.innerHTML =
                '<tr>' +
                '<td colspan="5">' +
                'Unable to load attendance. Please try again.' +
                '</td>' +
                '</tr>';

            return;
        }


        // =================================================
        // GET RECORDS
        // =================================================

        const records =
            Array.isArray(result.data)
                ? result.data
                : [];


        // =================================================
        // DISPLAY
        // =================================================

        renderRows(records);

        renderSummary(records);


    } catch (error) {

        console.error(
            "Attendance load error:",
            error
        );

        tableBody.innerHTML =
            '<tr>' +
            '<td colspan="5">' +
            'Unable to load attendance. Please try again.' +
            '</td>' +
            '</tr>';
    }
}

if (monthFilter) monthFilter.addEventListener("change", loadAttendance);
if (statusFilter) statusFilter.addEventListener("change", loadAttendance);

const dashboardBtn = document.getElementById("dashboardBtn");
if (dashboardBtn) dashboardBtn.addEventListener("click", () => {
    window.location.href = "student-dashboard.html";
});

document.querySelectorAll(".logout").forEach(button => {
    button.addEventListener("click", event => {
        event.preventDefault();
        Api.clearAuth();
        window.location.href = "roleselection.html";
    });
});

document.addEventListener("DOMContentLoaded", loadAttendance);