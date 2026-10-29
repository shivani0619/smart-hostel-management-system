/* SmartHostel AI – Student Dashboard (API-driven) */
if (!requireAuth("student")) {
  // redirected
}
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const logoutBtn = document.getElementById("logoutBtn");
if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => sidebar.classList.toggle("show"));
}
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    Api.clearAuth();
    window.location.href = "roleselection.html";
  });
}
async function loadDashboard() {
  const result = await Api.get("/dashboard/student");
  if (!result.success) {
    console.error(result.message);
    return;
  }
  const d = result.data;
  const student = d.student || {};
  const stats = d.stats || {};
  const fees = Array.isArray(d.fees) ? d.fees : [];
  const room = d.room || {};
  const roomInfo = room.room || {};
document.querySelectorAll(
    ".student-mini-info h4, .profile-name, .top-profile-info h4"
).forEach((el) => {

    el.textContent =
        student.full_name || "Student";

});


document.querySelectorAll(
    ".student-mini-info p, #sideId, .top-profile-info span"
).forEach((el) => {

    el.textContent =
        student.student_id
            ? "Student ID: " + student.student_id
            : "Student ID: —";

});


document.querySelectorAll(
    ".profile-avatar, .top-avatar, .mini-avatar"
).forEach((el) => {

    const name =
        (student.full_name || "Student")
            .trim();

    const parts =
        name
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
        el.querySelector(".online-dot");

    el.textContent =
        initials;

    if (onlineDot) {
        el.appendChild(onlineDot);
    }

});

  const activityList = document.getElementById("activityList");
  if (activityList) {
    const activity = d.recent_activity || [];
    activityList.innerHTML = activity.length ? activity.map((item) => `<div class="activity-item"><div class="activity-details"><h4>${item.title || "Activity"}</h4><p>${item.detail || ""}</p></div><span class="activity-time">${item.time ? item.time.slice(0, 16).replace("T", " ") : ""}</span></div>`).join("") : "No recent activity records.";
  }

  const setSummaryText = (index, value) => {
    const cards = document.querySelectorAll(".stat-card .stat-info h2");
    if (cards[index]) cards[index].textContent = value;
  };
  const setStatusText = (index, value) => {
    const statuses = document.querySelectorAll(".stat-card .stat-status");
    if (statuses[index]) statuses[index].textContent = value;
  };

  if (stats.attendance_percentage !== undefined) {
    setSummaryText(0, `${stats.attendance_percentage}%`);
    setStatusText(0, stats.attendance_percentage >= 75 ? "+" + Math.max(stats.attendance_percentage - 70, 1) + "%" : "Review");
  } else {
    setSummaryText(0, stats.attendance_today || "—");
  }

  if (roomInfo.room_number || roomInfo.block_name) {
    setSummaryText(1, roomInfo.room_number || "—");
  } else {
    setSummaryText(1, "—");
  }
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };
  setText("#pendingLeaves, .stat-pending-leaves", stats.pending_leaves ?? "0");
  setText("#openComplaints, .stat-open-complaints", stats.open_complaints ?? "0");
  setText("#attendanceToday, .stat-attendance", stats.attendance_today || "—");
  setText("#pendingFees, .stat-fees", stats.pending_fees ?? "0");
  if (roomInfo.room_number) {
    setText("#roomNumber, .room-number", roomInfo.room_number);
    setText("#roomMeta", `${roomInfo.block_name || "—"}${room.bed_number ? ` • Bed ${room.bed_number}` : ""}`);
    setStatusText(1, room.status || "—");
  }
  if (roomInfo.block_name) {
    setText("#blockName, .block-name", roomInfo.block_name);
  }
  const cards = document.querySelectorAll(".stat-card");
  if (cards[2]) {
    const leaveCount = cards[2].querySelector(".stat-info h2");
    if (leaveCount) leaveCount.textContent = String(stats.pending_leaves ?? 0);
    const leaveFooter = cards[2].querySelector(".stat-footer span");
    if (leaveFooter) leaveFooter.textContent = stats.pending_leaves ? "Pending review" : "No pending requests";
  }
  if (cards[3]) {
    const feeStatus = cards[3].querySelector(".stat-status");
    if (feeStatus) feeStatus.textContent = stats.pending_fees ? "Pending" : "No records";
    const feeValue = cards[3].querySelector(".stat-info h2");
    const feeFooter = cards[3].querySelector(".stat-footer span");
    const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount_due || 0), 0);
    const paidFees = fees.reduce((sum, fee) => sum + Number(fee.amount_paid || 0), 0);
    if (feeValue) feeValue.textContent = fees.length ? `₹${totalFees.toFixed(2)}` : "—";
    if (feeFooter) feeFooter.textContent = fees.length ? `Paid ₹${paidFees.toFixed(2)} • Pending ₹${(totalFees - paidFees).toFixed(2)}` : "No fee details available";
  }
  const dateEl = document.getElementById("currentDate");
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  document.querySelectorAll(".stat-card").forEach((card, idx) => {
    const value = card.querySelector(".stat-info h2");
    if (value && value.textContent.trim() === "—") {
      value.textContent = idx === 0 ? `${stats.attendance_percentage ?? 0}%` : idx === 1 ? (roomInfo.room_number || "—") : "0";
    }
  });
}

document.addEventListener("DOMContentLoaded", loadDashboard);