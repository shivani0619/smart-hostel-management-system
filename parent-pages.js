
if (!requireAuth("parent")) {}

const parentProfile = Api.getProfile() || {};

const parentNameEl =
  document.getElementById("parentName");

if (parentNameEl) {
  parentNameEl.textContent =
    parentProfile.full_name || "Parent";
}


// ==========================================
// COMMON
// ==========================================

function getFirstChild(data) {

  const children =
    data && Array.isArray(data.children)
      ? data.children
      : [];

  return children.length > 0
    ? children[0]
    : null;
}
// ==========================================
// STUDENT DETAILS
// ==========================================

async function loadParentStudentDetails() {

  const box =
    document.getElementById(
      "studentDetailsBox"
    );

  if (!box) return;


  const r =
    await Api.get(
      "/dashboard/parent"
    );


  if (!r.success) {

    box.textContent =
      r.message ||
      "Unable to load details.";

    return;
  }


  const child =
    getFirstChild(r.data);


  if (!child) {

    box.textContent =
      "No linked student found.";

    return;
  }


  const student =
    child.student || {};


  box.innerHTML = `

    <div
      style="
        display:grid;
        grid-template-columns:
        repeat(auto-fit,minmax(220px,1fr));
        gap:12px;
      "
    >

      ${
        Object.entries({

          FullName:
            student.full_name,

          StudentID:
            student.student_id,

          Email:
            student.email,

          Phone:
            student.phone,

          Department:
            student.department,

          Year:
            student.year,

          Guardian:
            student.guardian_name,

          Room:
            child.room?.room_number || "—",

          Status:
            student.status

        })

        .map(
          ([label, value]) => `

            <div
              style="
                padding:12px;
                border:1px solid #e2e8f0;
                border-radius:10px;
              "
            >

              <strong>
                ${label}
              </strong>


              <p
                style="
                  margin:6px 0 0;
                "
              >

                ${value || "—"}

              </p>

            </div>

          `
        )
        .join("")

      }

    </div>

  `;

}
// ==========================================
// ROOM
// ==========================================
async function loadParentRoom() {

  const box = document.getElementById("roomDetailsBox");

  if (!box) return;

  box.innerHTML = `
    <div class="room-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <span>Loading room details...</span>
    </div>
  `;

  try {

    const r = await Api.get("/dashboard/parent");

    console.log("ROOM API RESPONSE:", r);

    if (!r || !r.success) {

      box.innerHTML = `
        <div class="room-empty-state">
          <div class="room-empty-icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>

          <h3>Unable to load room data</h3>

          <p>
            ${r?.message || "Unable to load room details."}
          </p>
        </div>
      `;

      return;
    }

    const data = r.data || {};

    const children = Array.isArray(data.children)
      ? data.children
      : [];

    if (!children.length) {

      box.innerHTML = `
        <div class="room-empty-state">
          <div class="room-empty-icon">
            <i class="fa-solid fa-user-graduate"></i>
          </div>

          <h3>No Linked Student</h3>

          <p>
            No student is linked to this parent account.
          </p>
        </div>
      `;

      return;
    }

    const child = children[0];

    const student = child.student || {};

    const roomAllocation = child.room || null;

    if (!roomAllocation) {

      box.innerHTML = `
        <div class="room-empty-state">
          <div class="room-empty-icon">
            <i class="fa-solid fa-bed"></i>
          </div>

          <h3>No Room Allocation</h3>

          <p>
            No room has been allocated to your student yet.
          </p>
        </div>
      `;

      return;
    }

    // ------------------------------------------
    // ROOM OBJECT
    // ------------------------------------------

    const room = roomAllocation.room || {};

    // ------------------------------------------
    // BASIC DETAILS
    // ------------------------------------------

    const studentName =
      student.full_name || "—";

    const studentId =
      student.student_id || "—";

    const blockName =
      room.block_name || "—";

    const roomNumber =
      room.room_number || "—";

    const bedNumber =
      roomAllocation.bed_number ?? "—";

    const floor =
      room.floor ?? "—";

    const roomType =
      room.room_type || "—";

    const capacity =
      Number(room.capacity || 0);

    const occupied =
      Number(room.occupied || 0);

    const availableBeds =
      Number(room.available_beds ?? Math.max(capacity - occupied, 0));

    const status =
      room.status || "available";

    const monthlyRent =
      room.monthly_rent ?? "—";

    // ------------------------------------------
    // OCCUPANCY
    // ------------------------------------------

    const occupancyPercentage =
      capacity > 0
        ? Math.min(
            100,
            Math.round((occupied / capacity) * 100)
          )
        : 0;

    // ------------------------------------------
    // ROOMMATES
    // ------------------------------------------

    const members = Array.isArray(roomAllocation.members)
      ? roomAllocation.members
      : [];

    const roommates = members
      .filter(member =>
        member.student &&
        member.student.id !== student.id
      )
      .map(member =>
        member.student?.full_name
      )
      .filter(Boolean);

    // ------------------------------------------
    // STATUS
    // ------------------------------------------

    const statusText =
      String(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

    let statusClass = "available";

    if (String(status).toLowerCase() === "occupied") {
      statusClass = "occupied";
    }

    if (String(status).toLowerCase() === "maintenance") {
      statusClass = "maintenance";
    }

    if (String(status).toLowerCase() === "reserved") {
      statusClass = "reserved";
    }

    // ------------------------------------------
    // FINAL ROOM UI
    // ------------------------------------------

    box.innerHTML = `

      <!-- STUDENT INFORMATION -->

      <div class="room-section-card student-room-card">

        <div class="room-card-header">

          <div class="room-card-icon purple">
            <i class="fa-solid fa-user-graduate"></i>
          </div>

          <div>
            <h3>Student Information</h3>
            <p>Allocated student details</p>
          </div>

        </div>


        <div class="student-info-grid">

          <div class="info-item">
            <span class="info-label">Student</span>
            <strong>${studentName}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Student ID</span>
            <strong>${studentId}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Block</span>
            <strong>${blockName}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Floor</span>
            <strong>${floor}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Bed Number</span>
            <strong>${bedNumber}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Room Type</span>
            <strong>${roomType}</strong>
          </div>

        </div>

      </div>


      <!-- ROOM SUMMARY -->

      <div class="room-summary-grid">

        <div class="room-stat-card">

          <div class="room-stat-icon blue">
            <i class="fa-solid fa-door-open"></i>
          </div>

          <div class="room-stat-content">
            <span>Room Number</span>
            <strong>${roomNumber}</strong>
            <small>${blockName}</small>
          </div>

        </div>


        <div class="room-stat-card">

          <div class="room-stat-icon purple">
            <i class="fa-solid fa-users"></i>
          </div>

          <div class="room-stat-content">
            <span>Capacity</span>
            <strong>${capacity}</strong>
            <small>Total beds</small>
          </div>

        </div>


        <div class="room-stat-card">

          <div class="room-stat-icon green">
            <i class="fa-solid fa-circle-check"></i>
          </div>

          <div class="room-stat-content">

            <span>Status</span>

            <strong>
              <span class="room-status-badge ${statusClass}">
                ${statusText}
              </span>
            </strong>

            <small>Current room status</small>

          </div>

        </div>


        <div class="room-stat-card">

          <div class="room-stat-icon orange">
            <i class="fa-solid fa-indian-rupee-sign"></i>
          </div>

          <div class="room-stat-content">
            <span>Monthly Rent</span>
            <strong>₹${monthlyRent}</strong>
            <small>Room rent</small>
          </div>

        </div>

      </div>


      <!-- OCCUPANCY -->

      <div class="room-section-card occupancy-card">

        <div class="room-card-header">

          <div class="room-card-icon blue">
            <i class="fa-solid fa-bed"></i>
          </div>

          <div>
            <h3>Room Occupancy</h3>
            <p>Current bed allocation</p>
          </div>

        </div>


        <div class="occupancy-stats">

          <div class="occupancy-stat occupied">

            <div class="occupancy-icon">
              <i class="fa-solid fa-bed"></i>
            </div>

            <div>
              <span>Occupied Beds</span>
              <strong>${occupied}</strong>
            </div>

          </div>


          <div class="occupancy-stat available">

            <div class="occupancy-icon">
              <i class="fa-solid fa-bed"></i>
            </div>

            <div>
              <span>Available Beds</span>
              <strong>${availableBeds}</strong>
            </div>

          </div>


          <div class="occupancy-stat total">

            <div class="occupancy-icon">
              <i class="fa-solid fa-layer-group"></i>
            </div>

            <div>
              <span>Total Capacity</span>
              <strong>${capacity}</strong>
            </div>

          </div>

        </div>


        <div class="occupancy-progress-wrapper">

          <div class="occupancy-progress-label">

            <span>Room Occupancy</span>

            <strong>
              ${occupancyPercentage}%
            </strong>

          </div>


          <div class="occupancy-progress">

            <div
              class="occupancy-progress-fill"
              style="width:${occupancyPercentage}%">
            </div>

          </div>


          <p class="occupancy-helper">
            ${occupied} of ${capacity} beds currently occupied
          </p>

        </div>

      </div>


      <!-- ROOMMATES -->

      <div class="room-section-card roommates-card">

        <div class="room-card-header">

          <div class="room-card-icon orange">
            <i class="fa-solid fa-people-group"></i>
          </div>

          <div>
            <h3>Roommates</h3>
            <p>Students sharing this room</p>
          </div>

        </div>


        ${
          roommates.length > 0

            ? `
              <div class="roommates-list">

                ${roommates.map(name => `

                  <div class="roommate-item">

                    <div class="roommate-avatar">
                      ${name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>${name}</strong>
                      <span>Roommate</span>
                    </div>

                  </div>

                `).join("")}

              </div>
            `

            : `
              <div class="room-empty-inline">
                <i class="fa-solid fa-user"></i>
                <span>No other roommates</span>
              </div>
            `
        }

      </div>


      <!-- ALLOCATION DETAILS -->

      <div class="room-section-card">

        <div class="room-card-header">

          <div class="room-card-icon green">
            <i class="fa-solid fa-calendar-check"></i>
          </div>

          <div>
            <h3>Allocation Details</h3>
            <p>Current room allocation information</p>
          </div>

        </div>


        <div class="student-info-grid">

          <div class="info-item">
            <span class="info-label">Allocated From</span>
            <strong>${roomAllocation.allocated_from || "—"}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Allocation Status</span>
            <strong>${roomAllocation.status || "—"}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Room ID</span>
            <strong>${room.id || "—"}</strong>
          </div>

          <div class="info-item">
            <span class="info-label">Bed Number</span>
            <strong>${bedNumber}</strong>
          </div>

        </div>

      </div>

    `;

  } catch (error) {

    console.error("Parent room error:", error);

    box.innerHTML = `
      <div class="room-empty-state">

        <div class="room-empty-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h3>Unable to load room details</h3>

        <p>
          Something went wrong while loading the room information.
        </p>

      </div>
    `;
  }
}
// ==========================================
// ATTENDANCE
// ==========================================
async function loadParentAttendance() {
const box =
document.getElementById(
"attendanceBox"
);
if (!box) return;
const r =
await Api.get(
"/dashboard/parent"
);
if (!r.success) {
box.textContent =
  r.message ||
  "Unable to load attendance.";
return;
}
const child =
getFirstChild(r.data);
const attendance =
Array.isArray(child?.attendance)
? child.attendance
: [];
const stats =
child?.stats || {};
// ==========================================
// ATTENDANCE SUMMARY VALUES
// ==========================================
const attendancePercentage =
stats.attendance_percentage ?? 0;
const presentCount =
stats.present_count ?? 0;
const absentCount =
stats.absent_count ?? 0;
const totalDays =
attendance.length;
// ==========================================
// UPDATE SUMMARY CARDS
// ==========================================
const attendancePercentageEl =
document.getElementById(
"attendancePercentage"
);
const presentCountEl =
document.getElementById(
"presentCount"
);
const absentCountEl =
document.getElementById(
"absentCount"
);
const totalDaysEl =
document.getElementById(
"totalDays"
);
if (attendancePercentageEl) {
attendancePercentageEl.textContent =
`${attendancePercentage}%`;
}
if (presentCountEl) {
presentCountEl.textContent =
presentCount;
}
if (absentCountEl) {
absentCountEl.textContent =
absentCount;
}
if (totalDaysEl) {
totalDaysEl.textContent =
totalDays;
}
// ==========================================
// EXISTING ATTENDANCE LIST
// ==========================================
box.innerHTML =
attendance.length
  ? `
    ${
      attendance
        .slice(0, 15)
        .map(
          (a) => `
            <div
              style="
                padding:10px 0;
                border-bottom:1px solid #e2e8f0;
              "
            >
              <strong>
                ${a.attendance_date || "—"}
              </strong>
              •
              ${a.status || "—"}
            </div>
          `
        )
        .join("")
    }

  `
  : "No attendance records available.";
}
// ==========================================
// PARENT LEAVE
// ==========================================

let selectedLeaveId = null;


// ==========================================
// LOAD PARENT LEAVE REQUESTS
// ==========================================

async function loadParentLeave() {

  const box =
    document.getElementById("leaveBox");

  if (!box) return;

  box.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Loading leave requests...</p>
    </div>
  `;

  const r =
    await Api.get("/leaves/parent");

  if (!r.success) {

    box.innerHTML = `
      <div class="error-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p>
          ${r.message || "Unable to load leave requests."}
        </p>
      </div>
    `;

    return;
  }

  const leaves =
    Array.isArray(r.data)
      ? r.data
      : [];


  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const pendingCount =
    leaves.filter(
      leave =>
        leave.status === "pending"
    ).length;


  const parentApprovedCount =
    leaves.filter(
      leave =>
        leave.status === "parent_approved"
    ).length;


  const finalApprovedCount =
    leaves.filter(
      leave =>
        leave.status === "approved"
    ).length;


  const pendingEl =
    document.getElementById(
      "pendingCount"
    );

  const parentApprovedEl =
    document.getElementById(
      "parentApprovedCount"
    );

  const finalApprovedEl =
    document.getElementById(
      "finalApprovedCount"
    );


  if (pendingEl) {
    pendingEl.textContent =
      pendingCount;
  }


  if (parentApprovedEl) {
    parentApprovedEl.textContent =
      parentApprovedCount;
  }


  if (finalApprovedEl) {
    finalApprovedEl.textContent =
      finalApprovedCount;
  }


  // ==========================================
  // NO REQUESTS
  // ==========================================

  if (!leaves.length) {

    box.innerHTML = `
      <div class="empty-state">

        <i class="fa-solid fa-calendar-xmark"></i>

        <h3>No Leave Requests</h3>

        <p>
          There are no leave requests from your child.
        </p>

      </div>
    `;

    return;
  }


  // ==========================================
  // RENDER LEAVE REQUESTS
  // ==========================================

  box.innerHTML =
    `<div class="leave-list">` +

    leaves
      .map(
        leave => {

          const status =
            leave.status || "pending";


          const statusInfo =
            getParentLeaveStatus(status);


          const studentName =
            leave.student_name ||
            leave.student?.full_name ||
            "Student";


          const leaveType =
            formatLeaveType(
              leave.leave_type
            );


          const fromDate =
            formatLeaveDate(
              leave.from_date
            );


          const toDate =
            formatLeaveDate(
              leave.to_date
            );


          const submittedDate =
            formatLeaveDateTime(
              leave.created_at
            );


          const canReview =
            status === "pending";


          return `

            <div
              class="leave-card"
              data-leave-id="${leave.id}"
            >

              <div class="leave-card-top">

                <div>

                  <h3 class="student-name">
                    ${escapeLeaveHtml(studentName)}
                  </h3>

                  <span class="leave-type">
                    ${escapeLeaveHtml(leaveType)}
                  </span>

                </div>


                <span
                  class="
                    status-badge
                    ${statusInfo.className}
                  "
                >

                  <i
                    class="${statusInfo.icon}"
                  ></i>

                  ${statusInfo.label}

                </span>

              </div>


              <div class="leave-details">

                <div class="detail-item">

                  <span>From Date</span>

                  <strong>
                    ${fromDate}
                  </strong>

                </div>


                <div class="detail-item">

                  <span>To Date</span>

                  <strong>
                    ${toDate}
                  </strong>

                </div>


                <div class="detail-item">

                  <span>Destination</span>

                  <strong>
                    ${
                      escapeLeaveHtml(
                        leave.destination ||
                        "Not provided"
                      )
                    }
                  </strong>

                </div>


                <div class="detail-item">

                  <span>Parent Contact</span>

                  <strong>
                    ${
                      escapeLeaveHtml(
                        leave.parent_contact ||
                        "Not provided"
                      )
                    }
                  </strong>

                </div>

              </div>


              <div class="leave-reason">

                <strong>
                  Reason:
                </strong>

                ${
                  escapeLeaveHtml(
                    leave.reason ||
                    "No reason provided."
                  )
                }

              </div>


              <div
                style="
                  margin-top:10px;
                  font-size:12px;
                  color:#7c8494;
                "
              >

                Submitted:
                ${submittedDate}

              </div>


              ${
                leave.review_remark

                  ? `

                    <div
                      style="
                        margin-top:12px;
                        padding:10px 12px;
                        background:#fff7ed;
                        border-radius:9px;
                        font-size:12px;
                        color:#7c5a20;
                      "
                    >

                      <strong>
                        Review Remark:
                      </strong>

                      ${
                        escapeLeaveHtml(
                          leave.review_remark
                        )
                      }

                    </div>

                  `

                  : ""
              }


              ${
                canReview

                  ? `

                    <div class="leave-actions">

                      <button
                        type="button"
                        class="
                          leave-action-btn
                          approve-btn
                        "
                        data-leave-action="approve"
                        data-leave-id="${leave.id}"
                      >

                        <i
                          class="fa-solid fa-check"
                        ></i>

                        Approve Leave

                      </button>


                      <button
                        type="button"
                        class="
                          leave-action-btn
                          reject-btn
                        "
                        data-leave-action="reject"
                        data-leave-id="${leave.id}"
                      >

                        <i
                          class="fa-solid fa-xmark"
                        ></i>

                        Reject Leave

                      </button>

                    </div>

                  `

                  : ""

              }

            </div>

          `;

        }
      )
      .join("") +

    `</div>`;


  // ==========================================
  // APPROVE BUTTONS
  // ==========================================

  box
    .querySelectorAll(
      '[data-leave-action="approve"]'
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          async () => {

            const leaveId =
              button.dataset.leaveId;

            if (!leaveId) return;


            const confirmed =
              confirm(
                "Are you sure you want to approve this leave request?"
              );


            if (!confirmed) {
              return;
            }


            await submitParentLeaveReview(
              leaveId,
              "approve",
              ""
            );

          }
        );

      }
    );


  // ==========================================
  // REJECT BUTTONS
  // ==========================================

  box
    .querySelectorAll(
      '[data-leave-action="reject"]'
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const leaveId =
              button.dataset.leaveId;

            if (!leaveId) return;


            openRejectLeaveModal(
              leaveId
            );

          }
        );

      }
    );

}


// ==========================================
// STATUS HELPER
// ==========================================

function getParentLeaveStatus(
  status
) {

  const statuses = {

    pending: {
      label:
        "Pending Parent Approval",
      className:
        "status-pending",
      icon:
        "fa-solid fa-hourglass-half"
    },

    parent_approved: {
      label:
        "Parent Approved",
      className:
        "status-parent-approved",
      icon:
        "fa-solid fa-circle-check"
    },

    parent_rejected: {
      label:
        "Rejected by Parent",
      className:
        "status-parent-rejected",
      icon:
        "fa-solid fa-circle-xmark"
    },

    approved: {
      label:
        "Final Approved",
      className:
        "status-approved",
      icon:
        "fa-solid fa-check-double"
    },

    rejected: {
      label:
        "Rejected by Warden",
      className:
        "status-rejected",
      icon:
        "fa-solid fa-circle-xmark"
    },

    cancelled: {
      label:
        "Cancelled",
      className:
        "status-cancelled",
      icon:
        "fa-solid fa-ban"
    }

  };


  return (
    statuses[status] ||
    {
      label:
        "Unknown Status",
      className:
        "status-cancelled",
      icon:
        "fa-solid fa-circle-question"
    }
  );

}


// ==========================================
// FORMAT LEAVE TYPE
// ==========================================

function formatLeaveType(
  value
) {

  if (!value) {
    return "Leave";
  }


  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, letter =>
      letter.toUpperCase()
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatLeaveDate(
  value
) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (Number.isNaN(
    date.getTime()
  )) {
    return value;
  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


// ==========================================
// FORMAT DATE + TIME
// ==========================================

function formatLeaveDateTime(
  value
) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (Number.isNaN(
    date.getTime()
  )) {
    return value;
  }


  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeLeaveHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ==========================================
// APPROVE / REJECT API
// ==========================================

async function submitParentLeaveReview(
  leaveId,
  action,
  remark
) {

  const result =
    await Api.post(
      `/leaves/${leaveId}/parent-review`,
      {
        action:
          action,

        remark:
          remark || ""
      }
    );


  if (!result.success) {

    alert(
      result.message ||
      "Unable to update leave request."
    );

    return false;
  }


  if (action === "approve") {

    alert(
      "Leave request approved.\n\nThe request has been sent to the Warden for final review."
    );

  } else {

    alert(
      "Leave request rejected successfully."
    );

  }


  closeRejectLeaveModal();


  await loadParentLeave();

  return true;

}


// ==========================================
// OPEN REJECT MODAL
// ==========================================

function openRejectLeaveModal(
  leaveId
) {

  selectedLeaveId =
    Number(leaveId);


  const modal =
    document.getElementById(
      "rejectModal"
    );


  const info =
    document.getElementById(
      "rejectLeaveInfo"
    );


  const remark =
    document.getElementById(
      "rejectRemark"
    );


  if (info) {

    info.textContent =
      "Please provide a reason for rejecting this leave request.";

  }


  if (remark) {

    remark.value = "";

  }


  if (modal) {

    modal.classList.add(
      "show"
    );

  }

}


// ==========================================
// CLOSE REJECT MODAL
// ==========================================

function closeRejectLeaveModal() {

  selectedLeaveId =
    null;


  const modal =
    document.getElementById(
      "rejectModal"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }


  const remark =
    document.getElementById(
      "rejectRemark"
    );


  if (remark) {

    remark.value = "";

  }

}


// ==========================================
// REJECT CONFIRM
// ==========================================

async function confirmParentLeaveReject() {

  if (!selectedLeaveId) {

    alert(
      "Leave request not selected."
    );

    return;

  }


  const remark =
    document
      .getElementById(
        "rejectRemark"
      )
      ?.value
      ?.trim() || "";


  if (!remark) {

    alert(
      "Please enter a rejection reason."
    );

    return;

  }


  const button =
    document.getElementById(
      "confirmReject"
    );


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Rejecting...";

  }


  try {

    await submitParentLeaveReview(
      selectedLeaveId,
      "reject",
      remark
    );

  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Reject Leave";

    }

  }

}


// ==========================================
// REJECT MODAL EVENTS
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const closeButton =
      document.getElementById(
        "closeRejectModal"
      );


    const cancelButton =
      document.getElementById(
        "cancelReject"
      );


    const confirmButton =
      document.getElementById(
        "confirmReject"
      );


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeRejectLeaveModal
      );

    }


    if (cancelButton) {

      cancelButton.addEventListener(
        "click",
        closeRejectLeaveModal
      );

    }


    if (confirmButton) {

      confirmButton.addEventListener(
        "click",
        confirmParentLeaveReject
      );

    }


    const modal =
      document.getElementById(
        "rejectModal"
      );


    if (modal) {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            closeRejectLeaveModal();

          }

        }
      );

    }

  }
);
// ==========================================
// VISITORS
// ==========================================

function formatVisitorDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


function formatVisitorDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function formatVisitorStatus(status) {
  const statuses = {
    expected: "Expected",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    cancelled: "Rejected",
    pending: "Pending"
  };

  return statuses[status] || status || "—";
}


async function loadParentVisitors() {

  const box =
    document.getElementById("visitorBox");

  if (!box) return;


  box.innerHTML = `
    <div style="
      padding:20px;
      text-align:center;
      color:#64748b;
    ">
      Loading visitor records...
    </div>
  `;


  const r =
    await Api.get("/visitors/children");


  if (!r.success) {

    box.textContent =
      r.message ||
      "Unable to load visitor records.";

    return;
  }


  const visitors =
    Array.isArray(r.data)
      ? r.data
      : [];


  if (!visitors.length) {

    box.innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
        color:#64748b;
      ">
        <i
          class="fa-solid fa-users"
          style="
            font-size:28px;
            margin-bottom:10px;
          "
        ></i>

        <div>
          No visitor records found.
        </div>
      </div>
    `;

    return;
  }


  box.innerHTML =
    visitors
      .slice(0, 20)
      .map((visitor) => {

        // ==========================================
        // ENTRY / EXIT
        // ==========================================

        const entryTime =
          visitor.entry_time ||
          visitor.check_in_time ||
          null;


        const exitTime =
          visitor.exit_time ||
          visitor.check_out_time ||
          null;


        // ==========================================
        // VISIT DATE
        // ==========================================

        let visitDate = null;


        /*
         * If visitor has already entered,
         * use actual entry date.
         *
         * This prevents mismatched dates like:
         * Visit Date: 17 Jan 2027
         * Entry: 02 Oct 2026
         */

        if (
          visitor.status === "checked_in" ||
          visitor.status === "checked_out"
        ) {

          visitDate =
            entryTime ||
            visitor.visit_date ||
            null;

        } else {

          visitDate =
            visitor.visit_date ||
            entryTime ||
            null;

        }


        // ==========================================
        // STATUS
        // ==========================================

        const status =
          visitor.status || "—";


        const statusText =
          formatVisitorStatus(status);


        // ==========================================
        // ACTION
        // ==========================================

        let actionHtml = "";


        // Waiting for parent approval
        if (
          status === "expected" &&
          !visitor.approved_by
        ) {

          actionHtml = `
            <div
              style="
                margin-top:14px;
                display:flex;
                gap:8px;
                flex-wrap:wrap;
              "
            >

              <button
                class="btn btn-approve"
                data-visitor-action="approve"
                data-visitor-id="${visitor.id}"
              >
                <i class="fa-solid fa-check"></i>
                Approve
              </button>


              <button
                class="btn"
                data-visitor-action="reject"
                data-visitor-id="${visitor.id}"
              >
                <i class="fa-solid fa-xmark"></i>
                Reject
              </button>

            </div>
          `;

        }


        // Already approved
        else if (
          status === "expected" &&
          visitor.approved_by
        ) {

          actionHtml = `
            <div
              style="
                margin-top:12px;
                color:#16a34a;
                font-weight:600;
              "
            >
              <i class="fa-solid fa-circle-check"></i>
              Approved — Waiting for Warden Entry
            </div>
          `;

        }


        // Rejected
        else if (
          status === "cancelled"
        ) {

          actionHtml = `
            <div
              style="
                margin-top:12px;
                color:#dc2626;
                font-weight:600;
              "
            >
              <i class="fa-solid fa-circle-xmark"></i>
              Visitor Rejected
            </div>
          `;

        }


        // Visitor inside
        else if (
          status === "checked_in"
        ) {

          actionHtml = `
            <div
              style="
                margin-top:12px;
                color:#2563eb;
                font-weight:600;
              "
            >
              <i class="fa-solid fa-person-walking"></i>
              Visitor Inside Hostel
            </div>
          `;

        }


        // Visitor exited
        else if (
          status === "checked_out"
        ) {

          actionHtml = `
            <div
              style="
                margin-top:12px;
                color:#64748b;
                font-weight:600;
              "
            >
              <i class="fa-solid fa-door-open"></i>
              Visitor Exited
            </div>
          `;

        }


        // ==========================================
        // RETURN CARD
        // ==========================================

        return `

          <div
            style="
              padding:18px 0;
              border-bottom:1px solid #e2e8f0;
            "
          >

            <!-- VISITOR NAME -->

            <div
              style="
                font-size:17px;
                font-weight:700;
                color:#182235;
              "
            >
              ${visitor.visitor_name || "Visitor"}
            </div>


            <!-- RELATION -->

            <div
              style="
                margin-top:7px;
                font-size:14px;
                color:#475569;
              "
            >
              <strong>Relation:</strong>
              ${visitor.relation || visitor.purpose || "—"}
            </div>


            <!-- VISIT DATE -->

            <div
              style="
                margin-top:6px;
                font-size:14px;
                color:#475569;
              "
            >
              <strong>Visit Date:</strong>
              ${formatVisitorDate(visitDate)}
            </div>


            <!-- ENTRY -->

            <div
              style="
                margin-top:6px;
                font-size:14px;
                color:#475569;
              "
            >
              <strong>Entry:</strong>

              ${
                entryTime
                  ? formatVisitorDateTime(entryTime)
                  : "Not Entered"
              }

            </div>


            <!-- EXIT -->

            <div
              style="
                margin-top:6px;
                font-size:14px;
                color:#475569;
              "
            >
              <strong>Exit:</strong>

              ${
                exitTime
                  ? formatVisitorDateTime(exitTime)
                  : "Not Exited"
              }

            </div>


            <!-- STATUS -->

            <div
              style="
                margin-top:6px;
                font-size:14px;
                color:#475569;
              "
            >

              <strong>Status:</strong>

              <span
                style="
                  font-weight:700;
                "
              >
                ${statusText}
              </span>

            </div>


            ${actionHtml}

          </div>

        `;

      })
      .join("");


  // ==========================================
  // APPROVE / REJECT BUTTONS
  // ==========================================

  box
    .querySelectorAll(
      "[data-visitor-action]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          const visitorId =
            button.dataset.visitorId;

          const action =
            button.dataset.visitorAction;


          if (
            !visitorId ||
            !action
          ) {
            return;
          }


          const confirmMessage =
            action === "approve"
              ? "Approve this visitor?"
              : "Reject this visitor?";


          if (
            !confirm(confirmMessage)
          ) {
            return;
          }


          button.disabled = true;


          const result =
            await Api.put(
              `/visitors/${visitorId}/approval`,
              {
                action: action
              }
            );


          if (!result.success) {

            alert(
              result.message ||
              "Unable to update visitor."
            );

            button.disabled = false;

            return;
          }


          alert(
            action === "approve"
              ? "Visitor approved successfully."
              : "Visitor rejected successfully."
          );


          await loadParentVisitors();

        }
      );

    });

}
// ==========================================
// EMERGENCY
// ==========================================

async function loadParentEmergency() {

  const box =
    document.getElementById(
      "emergencyBox"
    );

  if (!box) return;


  const r =
    await Api.get(
      "/dashboard/parent"
    );


  if (!r.success) {

    box.innerHTML = `
      <div class="emergency-empty">
        <i class="fa-solid fa-circle-exclamation"></i>
        ${r.message || "Unable to load emergency alerts."}
      </div>
    `;

    return;
  }


  const child =
    getFirstChild(r.data);


  const emergencies =
    Array.isArray(child?.emergencies)
      ? child.emergencies
      : [];


  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalCount =
    emergencies.length;


  const pendingCount =
    emergencies.filter(
      (emergency) =>
        String(emergency.status || "").toLowerCase() ===
        "pending"
    ).length;


  const respondedCount =
    emergencies.filter(
      (emergency) =>
        String(emergency.status || "").toLowerCase() ===
        "responded"
    ).length;


  const totalEl =
    document.getElementById(
      "emergencyTotal"
    );

  const pendingEl =
    document.getElementById(
      "emergencyPending"
    );

  const respondedEl =
    document.getElementById(
      "emergencyResponded"
    );


  if (totalEl) {
    totalEl.textContent =
      totalCount;
  }


  if (pendingEl) {
    pendingEl.textContent =
      pendingCount;
  }


  if (respondedEl) {
    respondedEl.textContent =
      respondedCount;
  }


  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (!emergencies.length) {

    box.innerHTML = `
      <div class="emergency-empty">

        <i class="fa-solid fa-shield-heart"></i>

        No emergency alerts.

      </div>
    `;

    return;
  }


  // ==========================================
  // EMERGENCY CARDS
  // ==========================================

  box.innerHTML = `

    <div class="emergency-alert-list">

      ${
        emergencies
          .slice(0, 15)
          .map((emergency) => {

            const type =
              emergency.emergency_type ||
              "Emergency";


            const priority =
              emergency.priority ||
              "—";


            const status =
              String(
                emergency.status || "—"
              ).toLowerCase();


            // ----------------------------------
            // STATUS DISPLAY
            // ----------------------------------

            let statusText =
              status || "—";


            if (status === "pending") {
              statusText = "Pending";
            }
            else if (status === "responded") {
              statusText = "Responded";
            }
            else if (status === "acknowledged") {
              statusText = "Acknowledged";
            }


            const statusClass =
              status === "pending"
                ? "pending"
                : status === "responded"
                ? "responded"
                : status === "acknowledged"
                ? "acknowledged"
                : "other";


            const statusIcon =
              status === "responded"
                ? "fa-solid fa-circle-check"
                : status === "pending"
                ? "fa-solid fa-clock"
                : "fa-solid fa-circle-info";


            // ----------------------------------
            // RESPONSE
            // ----------------------------------

            const hasResponse =
              emergency.response &&
              String(
                emergency.response
              ).trim();


            return `

              <div class="emergency-alert-card">


                <!-- CARD HEADER -->

                <div class="emergency-card-header">

                  <div class="emergency-type-wrapper">

                    <div class="emergency-type-icon">

                      <i class="fa-solid fa-kit-medical"></i>

                    </div>


                    <div class="emergency-type">

                      <h3>
                        ${type}
                      </h3>

                      <p>
                        Emergency Alert
                      </p>

                    </div>

                  </div>


                  <span class="emergency-priority">

                    ${priority}

                  </span>

                </div>


                <!-- INFORMATION -->

                <div class="emergency-info">

                  <div class="emergency-info-row">

                    <i class="fa-solid fa-circle-info"></i>

                    <span>
                      Status:
                      <strong>
                        ${statusText}
                      </strong>
                    </span>

                  </div>


                  ${
                    emergency.created_at
                      ? `

                        <div class="emergency-info-row">

                          <i class="fa-solid fa-calendar-days"></i>

                          <span>
                            Alert Time:
                            <strong>
                              ${formatEmergencyDateTime(
                                emergency.created_at
                              )}
                            </strong>
                          </span>

                        </div>

                      `
                      : ""
                  }

                </div>


                <!-- STATUS -->

                <div class="emergency-status">

                  <span
                    class="
                      emergency-status-badge
                      ${statusClass}
                    "
                  >

                    <i class="${statusIcon}"></i>

                    ${statusText}

                  </span>


                  ${
                    hasResponse
                      ? `

                        <div class="emergency-response">

                          <div class="emergency-response-title">

                            <i class="fa-solid fa-message"></i>

                            Response

                          </div>


                          <p class="emergency-response-text">

                            ${hasResponse}

                          </p>


                          ${
                            emergency.response_time
                              ? `

                                <p class="emergency-response-time">

                                  <i class="fa-solid fa-clock"></i>

                                  Response Time:
                                  ${formatEmergencyDateTime(
                                    emergency.response_time
                                  )}

                                </p>

                              `
                              : ""
                          }

                        </div>

                      `
                      : status === "pending"
                      ? `

                        <p class="visitor-status-text">

                          <i class="fa-solid fa-hourglass-half"></i>

                          Awaiting response from hostel staff.

                        </p>

                      `
                      : ""
                  }

                </div>

              </div>

            `;

          })
          .join("")
      }

    </div>

  `;

}
// ==========================================
// EMERGENCY DATE & TIME - IST FIX
// Backend timestamp is UTC without timezone
// Convert UTC → India Standard Time (+5:30)
// ==========================================

function formatEmergencyDateTime(value) {

  if (!value) return "—";

  let raw = String(value).trim();

  // Backend sends:
  // 2026-10-06T12:58:05
  //
  // Treat this value as UTC because the backend
  // timestamp is currently 5 hours 30 minutes behind IST.

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(raw)
  ) {
    raw += "Z";
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
}
// ==========================================
// PARENT FEES
// ==========================================

let selectedParentFeeId = null;

let selectedParentFeeAmount = 0;


// ==========================================
// LOAD PARENT FEES
// ==========================================
// ==========================================
// PARENT FEES
// ==========================================

async function loadParentFees() {

  const box =
    document.getElementById("feesBox");

  if (!box) return;

  box.innerHTML =
    "Loading fee records...";


  // ==========================================
  // GET FEE RECORDS
  // ==========================================

  const r =
    await Api.get("/fees/me");


  if (!r.success) {

    box.textContent =
      r.message ||
      "Unable to load fee records.";

    return;
  }


  const fees =
    Array.isArray(r.data)
      ? r.data
      : [];


  if (!fees.length) {

    box.textContent =
      "No fee records available.";

    return;
  }


  // ==========================================
  // SUMMARY
  // ==========================================

  const total =
    fees.reduce(
      (sum, item) =>
        sum +
        Number(item.amount_due || 0),
      0
    );


  const paid =
    fees.reduce(
      (sum, item) =>
        sum +
        Number(item.amount_paid || 0),
      0
    );


  const balance =
    Math.max(
      total - paid,
      0
    );


  // ==========================================
  // DISPLAY FEES
  // ==========================================

  box.innerHTML = `

    <!-- SUMMARY CARDS -->

    <div
      style="
        display:grid;
        grid-template-columns:
        repeat(auto-fit,minmax(160px,1fr));
        gap:15px;
        margin-bottom:20px;
      "
    >

      <div
        style="
          padding:18px;
          border:1px solid #e2e8f0;
          border-radius:14px;
          background:#fff;
        "
      >

        <div
          style="
            font-size:13px;
            color:#64748b;
          "
        >
          Total Fees
        </div>

        <strong
          style="
            display:block;
            margin-top:6px;
            font-size:20px;
          "
        >
          ₹${total.toFixed(2)}
        </strong>

      </div>


      <div
        style="
          padding:18px;
          border:1px solid #e2e8f0;
          border-radius:14px;
          background:#fff;
        "
      >

        <div
          style="
            font-size:13px;
            color:#64748b;
          "
        >
          Paid
        </div>

        <strong
          style="
            display:block;
            margin-top:6px;
            font-size:20px;
          "
        >
          ₹${paid.toFixed(2)}
        </strong>

      </div>


      <div
        style="
          padding:18px;
          border:1px solid #e2e8f0;
          border-radius:14px;
          background:#fff;
        "
      >

        <div
          style="
            font-size:13px;
            color:#64748b;
          "
        >
          Balance
        </div>

        <strong
          style="
            display:block;
            margin-top:6px;
            font-size:20px;
          "
        >
          ₹${balance.toFixed(2)}
        </strong>

      </div>

    </div>


    <!-- FEE RECORDS -->

    <div>

      ${
        fees
          .map((item) => {

            const amountDue =
              Number(
                item.amount_due || 0
              );


            const amountPaid =
              Number(
                item.amount_paid || 0
              );


            const itemBalance =
              Math.max(
                amountDue - amountPaid,
                0
              );


            // ==========================================
            // CURRENT STATUS
            // ==========================================

            const isPaid =
              String(item.status || "")
                .toLowerCase() === "paid";


            return `

              <div
                style="
                  padding:18px;
                  margin-bottom:15px;
                  border:1px solid #e2e8f0;
                  border-radius:14px;
                  background:#fff;
                "
              >

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:20px;
                    flex-wrap:wrap;
                  "
                >

                  <!-- FEE DETAILS -->

                  <div>

                    <h3
                      style="
                        margin:0 0 10px;
                      "
                    >
                      ${item.fee_name || "Hostel Fee"}
                    </h3>


                    ${
                      item.student_name
                        ? `

                          <div
                            style="
                              font-size:13px;
                              color:#64748b;
                              margin-bottom:8px;
                            "
                          >

                            Student:

                            <strong>
                              ${item.student_name}
                            </strong>

                          </div>

                        `
                        : ""
                    }


                    <div
                      style="
                        font-size:14px;
                        color:#64748b;
                        line-height:1.9;
                      "
                    >

                      Amount:

                      <strong>
                        ₹${amountDue.toFixed(2)}
                      </strong>


                      <br>


                      Paid:

                      ₹${amountPaid.toFixed(2)}


                      <br>


                      Balance:

                      ₹${itemBalance.toFixed(2)}


                      <br>


                      Due Date:

                      ${item.due_date || "—"}

                    </div>

                  </div>


                  <!-- STATUS BUTTONS -->

                  <div
                    style="
                      display:flex;
                      gap:10px;
                      align-items:center;
                      flex-wrap:wrap;
                    "
                  >

                    <!-- PAID BUTTON -->

                    <button
                      type="button"
                      class="parent-fee-status-btn"
                      data-fee-id="${item.id}"
                      data-status="paid"
                      style="
                        padding:10px 18px;
                        border:1px solid #16a34a;
                        border-radius:9px;
                        cursor:pointer;
                        font-weight:600;
                        background:${
                          isPaid
                            ? "#16a34a"
                            : "#fff"
                        };
                        color:${
                          isPaid
                            ? "#fff"
                            : "#166534"
                        };
                      "
                    >

                      <i class="fa-solid fa-check"></i>

                      Paid

                    </button>


                    <!-- NOT PAID BUTTON -->

                    <button
                      type="button"
                      class="parent-fee-status-btn"
                      data-fee-id="${item.id}"
                      data-status="pending"
                      style="
                        padding:10px 18px;
                        border:1px solid #d97706;
                        border-radius:9px;
                        cursor:pointer;
                        font-weight:600;
                        background:${
                          !isPaid
                            ? "#d97706"
                            : "#fff"
                        };
                        color:${
                          !isPaid
                            ? "#fff"
                            : "#b45309"
                        };
                      "
                    >

                      <i class="fa-solid fa-xmark"></i>

                      Not Paid

                    </button>

                  </div>

                </div>

              </div>

            `;

          })
          .join("")
      }

    </div>

  `;


  // ==========================================
  // PAID / NOT PAID BUTTON EVENTS
  // ==========================================

  box
    .querySelectorAll(
      ".parent-fee-status-btn"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          const feeId =
            button.dataset.feeId;

          const status =
            button.dataset.status;


          if (!feeId || !status) {
            return;
          }


          const statusText =
            status === "paid"
              ? "Paid"
              : "Not Paid";


          const confirmed =
            confirm(
              `Are you sure you want to mark this fee as "${statusText}"?`
            );


          if (!confirmed) {
            return;
          }


          // Disable both buttons
          const card =
            button.closest(
              "div[style*='padding:18px']"
            );


          if (card) {

            card
              .querySelectorAll(
                ".parent-fee-status-btn"
              )
              .forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = "0.6";
                btn.style.cursor = "not-allowed";
              });

          }


          // ==========================================
          // SAVE STATUS
          // ==========================================

          const result =
            await Api.post(
              "/fees/parent-response",
              {
                fee_id:
                  Number(feeId),

                status:
                  status
              }
            );


          if (!result.success) {

            alert(
              result.message ||
              "Unable to update fee status."
            );


            if (card) {

              card
                .querySelectorAll(
                  ".parent-fee-status-btn"
                )
                .forEach(btn => {
                  btn.disabled = false;
                  btn.style.opacity = "1";
                  btn.style.cursor = "pointer";
                });

            }

            return;
          }


          alert(
            `Fee marked as "${statusText}".`
          );


          // Reload latest data
          await loadParentFees();

        }
      );

    });

}
// ==========================================
// PARENT FEE RESPONSE
// ==========================================

async function respondToParentFee(feeId) {

  if (!feeId) {

    alert(
      "Fee record not found."
    );

    return;
  }


  const confirmed =
    confirm(
      "Do you want to confirm that you have reviewed this fee?"
    );


  if (!confirmed) {

    return;
  }


  const result =
    await Api.post(
      "/fees/parent-response",
      {
        fee_id: feeId
      }
    );


  if (!result.success) {

    alert(
      result.message ||
      "Unable to record your response."
    );

    return;
  }


  alert(
    "Fee response recorded successfully."
  );


  await loadParentFees();

}
// ==========================================
// OPEN PAYMENT MODAL
// ==========================================

function openParentPaymentModal(
  feeId,
  amount
) {

  selectedParentFeeId =
    Number(feeId);


  selectedParentFeeAmount =
    Number(amount || 0);


  const modal =
    document.getElementById(
      "parentPaymentModal"
    );


  const amountEl =
    document.getElementById(
      "parentPaymentAmount"
    );


  if (amountEl) {
amountEl.textContent =
  `₹${Number(selectedParentFeeAmount || 0).toFixed(2)}`;

  }


  if (modal) {

    modal.style.display =
      "flex";

  }

}


// ==========================================
// CLOSE PAYMENT MODAL
// ==========================================

function closeParentPaymentModal() {

  const modal =
    document.getElementById(
      "parentPaymentModal"
    );


  if (modal) {

    modal.style.display =
      "none";

  }


  selectedParentFeeId =
    null;


  selectedParentFeeAmount =
    0;

}


// ==========================================
// CONFIRM DEMO PAYMENT
// ==========================================

async function confirmParentPayment() {

  if (!selectedParentFeeId) {

    alert(
      "Please select a fee."
    );

    return;
  }


  const method =
    document.getElementById(
      "parentPaymentMethod"
    )?.value || "UPI";


  // ==========================================
  // GET CURRENT PARENT FEES
  // ==========================================

  const feesResult =
    await Api.get(
      "/fees/me"
    );


  if (!feesResult.success) {

    alert(
      feesResult.message ||
      "Unable to load fee details."
    );

    return;
  }


  const fees =
    Array.isArray(feesResult.data)
      ? feesResult.data
      : [];


  const selectedFee =
    fees.find(
      (fee) =>
        Number(fee.id) ===
        Number(selectedParentFeeId)
    );


  if (!selectedFee) {

    alert(
      "Selected fee was not found."
    );

    return;
  }


  const amount =
    Math.max(
      Number(
        selectedFee.amount_due || 0
      ) -
      Number(
        selectedFee.amount_paid || 0
      ),
      0
    );


  if (amount <= 0) {

    alert(
      "This fee is already paid."
    );

    closeParentPaymentModal();

    await loadParentFees();

    return;
  }


  // ==========================================
  // DEMO PAYMENT
  // ==========================================

  const result =
    await Api.post(
      "/fees/payment",
      {
        fee_id:
          selectedParentFeeId,

        amount:
          amount,

        payment_method:
          method
      }
    );


  if (!result.success) {

    alert(
      result.message ||
      "Payment failed."
    );

    return;
  }


  // ==========================================
  // SUCCESS
  // ==========================================

const payment =
  result && result.data
    ? result.data
    : {};

alert(
  "Demo payment successful using " +
  method +
  "!\n\n" +
  "Amount: ₹" +
  Number(amount || 0).toFixed(2) +
  "\n" +
  "Transaction ID: " +
  (
    payment.transaction_id ||
    "Generated"
  )
);


  closeParentPaymentModal();


  await loadParentFees();

}
// ==========================================
// NOTIFICATIONS
// ==========================================

async function loadParentNotifications() {

  const box =
    document.getElementById(
      "notificationsBox"
    );

  if (!box) return;


  const r =
    await Api.get(
      "/dashboard/parent"
    );


  if (!r.success) {

    box.innerHTML = `
      <div class="notification-empty">

        <i class="fa-solid fa-circle-exclamation"></i>

        ${
          r.message ||
          "Unable to load notifications."
        }

      </div>
    `;

    return;
  }


  const items =
    Array.isArray(
      r.data.notifications
    )
      ? r.data.notifications
      : [];


  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (!items.length) {

    box.innerHTML = `
      <div class="notification-empty">

        <i class="fa-regular fa-bell-slash"></i>

        No notifications.

      </div>
    `;

    return;
  }


  // ==========================================
  // NOTIFICATION CARDS
  // ==========================================

  box.innerHTML = `

    <div class="notification-list">

      ${
        items
          .slice(0, 15)
          .map((n) => {

            const title =
              n && n.title
                ? n.title
                : "Notification";


            const message =
              n && n.message
                ? n.message
                : "";


            const lowerTitle =
              title.toLowerCase();


            // ==================================
            // DETERMINE NOTIFICATION TYPE
            // ==================================

            let icon =
              "fa-solid fa-bell";

            let iconClass =
              "default";

            let cardClass =
              "";


            // Leave Approved

            if (
              lowerTitle.includes(
                "leave approved"
              )
            ) {

              icon =
                "fa-solid fa-circle-check";

              iconClass =
                "leave-approved";

            }


            // New Leave Request

            else if (
              lowerTitle.includes(
                "leave request"
              )
            ) {

              icon =
                "fa-solid fa-calendar-plus";

              iconClass =
                "leave-request";

            }


            // Visitor notifications

            else if (
              lowerTitle.includes(
                "visitor"
              )
            ) {

              icon =
                "fa-solid fa-id-card";

              iconClass =
                "visitor";

            }


            // Emergency notifications

            else if (
              lowerTitle.includes(
                "emergency"
              ) ||
              message
                .toLowerCase()
                .includes(
                  "emergency alert"
                )
            ) {

              icon =
                "fa-solid fa-triangle-exclamation";

              iconClass =
                "emergency";

              cardClass =
                "emergency-alert";

            }
// ==================================
// DATE / TIME - IST FIX
// Backend sends UTC timestamp without Z
// Convert UTC → India Standard Time
// ==================================

const notificationDate =
  n.created_at ||
  n.date ||
  n.createdAt ||
  null;

let timeText = "";

if (notificationDate) {

  let rawDate =
    String(notificationDate).trim();

  // Example backend value:
  // 2026-10-06T12:58:05
  //
  // Treat timezone-less ISO timestamp as UTC
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(
      rawDate
    )
  ) {
    rawDate += "Z";
  }

  const date =
    new Date(rawDate);

  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {

    timeText =
      date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata"
        }
      );
  }
}

            return `

              <div
                class="
                  notification-card
                  ${cardClass}
                "
              >


                <!-- ICON -->

                <div
                  class="
                    notification-icon
                    ${iconClass}
                  "
                >

                  <i
                    class="${icon}"
                  ></i>

                </div>


                <!-- CONTENT -->

                <div
                  class="notification-content"
                >


                  <div
                    class="notification-header"
                  >

                    <h3
                      class="notification-title"
                    >

                      ${title}

                    </h3>


                    ${
                      timeText
                        ? `

                          <span
                            class="notification-time"
                          >

                            ${timeText}

                          </span>

                        `
                        : ""
                    }

                  </div>


                  <p
                    class="notification-message"
                  >

                    ${message}

                  </p>


                </div>

              </div>

            `;

          })
          .join("")
      }

    </div>

  `;

}
// ==========================================
// ANNOUNCEMENTS
// ==========================================

async function loadParentAnnouncements() {

  const box =
    document.getElementById(
      "announcementsBox"
    );

  if (!box) return;


  const r =
    await Api.get(
      "/dashboard/parent"
    );


  if (!r.success) {

    box.textContent =
      r.message ||
      "Unable to load announcements.";

    return;
  }


  const items =
    Array.isArray(
      r.data.announcements
    )
      ? r.data.announcements
      : [];


  box.innerHTML =
    items.length

      ? items
          .slice(0, 15)
          .map(
            (n) => `

              <div
                style="
                  padding:10px 0;
                  border-bottom:1px solid #e2e8f0;
                "
              >

                <strong>
                  ${
                    n && n.title
                      ? n.title
                      : "Announcement"
                  }
                </strong>


                <div
                  style="
                    font-size:12px;
                    color:#64748b;
                    margin-top:4px;
                  "
                >
                  ${
                    n && n.content
                      ? n.content
                      : ""
                  }
                </div>

              </div>

            `
          )
          .join("")

      : "No announcements.";

}


// ==========================================
// PAGE LOAD
// ==========================================
// ==========================================
// PAGE LOAD
// ==========================================

const page =
  window.location.pathname
    .split("/")
    .pop() || "";

if (
  page ===
  "parent-student.html"
) {

  loadParentStudent();

}

else if (
  page ===
  "parent-student-details.html"
) {

  loadParentStudentDetails();

}

else if (
  page ===
  "parent-room.html"
) {

  loadParentRoom();

}

else if (
  page ===
  "parent-attendance.html"
) {

  loadParentAttendance();

}

else if (
  page ===
  "parent-leave.html"
) {

  loadParentLeave();

}

else if (
  page ===
  "parent-visitors.html"
) {

  loadParentVisitors();

}

else if (
  page ===
  "parent-emergency.html"
) {

  loadParentEmergency();

}

else if (
  page ===
  "parent-fees.html"
) {

  loadParentFees();

}

else if (
  page ===
  "parent-notifications.html"
) {

  loadParentNotifications();

}

else if (
  page ===
  "parent-announcements.html"
) {

  loadParentAnnouncements();

}