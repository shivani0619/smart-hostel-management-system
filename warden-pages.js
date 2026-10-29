
if (!requireAuth("warden")) {}

const profile = Api.getProfile() || {};
const nameEl = document.getElementById("wardenName");

if (nameEl) {
  nameEl.textContent = profile.full_name || "Warden";
}


// ==========================================================
// DASHBOARD STATS
// ==========================================================

async function loadStats() {
  const r = await Api.get("/dashboard/warden");

  if (!r.success) return;

  const d = r.data || {};
  const s = d.stats || {};

  const statsEls = {
    sStudents: document.getElementById("sStudents"),
    sRooms: document.getElementById("sRooms"),
    sOccupied: document.getElementById("sOccupied"),
    sAvailable: document.getElementById("sAvailable"),
    sLeaves: document.getElementById("sLeaves"),
    sVisitors: document.getElementById("sVisitors"),
    sComplaints: document.getElementById("sComplaints"),
    sEmergencies: document.getElementById("sEmergencies"),
    sPresent: document.getElementById("sPresent"),
  };

  for (const [key, el] of Object.entries(statsEls)) {
    if (!el) continue;

    const value = {
      sStudents: s.total_students,
      sRooms: s.total_rooms,
      sOccupied: s.occupied_rooms,
      sAvailable: s.available_rooms,
      sLeaves: s.pending_leaves,
      sVisitors: s.todays_visitors,
      sComplaints: s.pending_complaints ?? s.open_complaints,
      sEmergencies: s.active_emergencies,
      sPresent: s.present_today,
    }[key];

    el.textContent = value ?? 0;
  }

  const activity = document.getElementById("wardenRecentActivity");

  if (activity) {
    const rows = [
      ...(d.recent_leaves || []).map(
        (item) =>
          `Leave: ${item.student_name || "Student"} (${item.status})`
      ),

      ...(d.recent_visitors || []).map(
        (item) =>
          `Visitor: ${item.visitor_name || "Visitor"} for ${item.student_name || "Student"}`
      ),

      ...(d.recent_complaints || []).map(
        (item) =>
          `Complaint: ${item.subject || "Complaint"} (${item.status})`
      ),

      ...(d.emergency_alerts || []).map(
        (item) =>
          `Emergency: ${item.student_name || "Student"} (${item.priority})`
      ),

      ...(d.announcements || []).map(
        (item) =>
          `Announcement: ${item.title || "Announcement"}`
      ),
    ].slice(0, 12);

    activity.innerHTML = rows.length
      ? rows.map(
          (row) =>
            `<p style="margin:6px 0">${row}</p>`
        ).join("")
      : "<p>No recent activity.</p>";
  }
}


// ==========================================================
// STUDENTS
// ==========================================================

async function loadStudents() {
  const tbody = document.getElementById("studentsTable");

  if (!tbody) return;

  const r = await Api.get("/students");

  const items =
    r.success && Array.isArray(r.data)
      ? r.data
      : (
          r.data &&
          Array.isArray(r.data.items)
            ? r.data.items
            : []
        );

  tbody.innerHTML = items.length
    ? items.map(
        (s) => `
          <tr>
            <td>${s.full_name || "—"}</td>
            <td>${s.student_id || "—"}</td>
            <td>${s.department || "—"}</td>
            <td>${s.year || "—"}</td>
            <td>${s.room || "Not Allocated"}</td>
            <td>${s.block || "—"}</td>
            <td>${s.bed || "—"}</td>
            <td>${s.phone || "—"}</td>
            <td>${s.status || "—"}</td>
          </tr>
        `
      ).join("")
    : "<tr><td colspan='9'>No students found</td></tr>";
}


// ==========================================================
// ROOMS
// ==========================================================

async function loadRooms() {
  const tbody = document.getElementById("roomsTable");

  if (!tbody) return;

  const r = await Api.get("/rooms");

  const items =
    r.success && Array.isArray(r.data)
      ? r.data
      : [];

  tbody.innerHTML = items.length
    ? items.map(
        (rm) => `
          <tr>
            <td>${rm.room_number || "—"}</td>
            <td>${rm.block_name || "—"}</td>
            <td>${rm.capacity ?? 0}</td>
            <td>${rm.occupied ?? 0}</td>
            <td>${rm.available_beds ?? 0}</td>
            <td>${rm.occupied ?? 0} / ${rm.capacity ?? 0}</td>
            <td>${rm.status || "—"}</td>
          </tr>
        `
      ).join("")
    : "<tr><td colspan='7'>No rooms found</td></tr>";

  const roomSelect =
    document.getElementById("allocRoomId");

  if (roomSelect) {
    roomSelect.innerHTML = `
      <option value="">Select available room</option>

      ${
        items
          .filter(
            (room) =>
              Number(room.available_beds || 0) > 0
          )
          .map(
            (room) => `
              <option value="${room.id}">
                ${room.block_name || ""}
                ${room.room_number}
                (${room.available_beds} beds)
              </option>
            `
          )
          .join("")
      }
    `;
  }
}


// ==========================================================
// ROOM ALLOCATION STUDENTS
// ==========================================================

async function loadAllocationStudents() {
  const select =
    document.getElementById("allocStudentId");

  if (!select) return;

  const result = await Api.get("/students");

  const items =
    result.success
      ? (
          Array.isArray(result.data)
            ? result.data
            : (result.data?.items || [])
        )
      : [];

  select.innerHTML = `
    <option value="">Select student</option>

    ${
      items.map(
        (student) => `
          <option value="${student.id}">
            ${student.full_name}
            (${student.student_id})
          </option>
        `
      ).join("")
    }
  `;
}


// ==========================================================
// ROOM ALLOCATION
// ==========================================================

document
  .getElementById("allocBtn")
  ?.addEventListener(
    "click",
    async () => {

      const student_id =
        document.getElementById(
          "allocStudentId"
        )?.value;

      const room_id =
        document.getElementById(
          "allocRoomId"
        )?.value;

      const r = await Api.post(
        "/rooms/allocate",
        {
          student_id: Number(student_id),
          room_id: Number(room_id),
          bed_number:
            document.getElementById(
              "allocBedNumber"
            )?.value
              ? Number(
                  document.getElementById(
                    "allocBedNumber"
                  ).value
                )
              : null,
        }
      );

      alert(
        r.message ||
        (r.success ? "Allocated" : "Failed")
      );

      if (r.success) {
        loadRooms();
      }
    }
  );
// ==========================================================
// ATTENDANCE
// ==========================================================

async function loadAttendance() {

  const tbody =
    document.getElementById("attendanceTable");

  if (!tbody) return;

  const r =
    await Api.get("/dashboard/warden");

  if (
    !r.success ||
    !Array.isArray(r.data?.attendance)
  ) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="attendance-empty">
          No attendance records available
        </td>
      </tr>
    `;

    updateAttendanceStats([]);
    return;
  }

  const rows =
    r.data.attendance || [];

  updateAttendanceStats(rows);

  if (!rows.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="attendance-empty">
          No attendance records available
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    rows.map(
      (item, index) => {

        const studentName =
          item.student?.full_name || "Student";

        const studentId =
          item.student?.student_id || "—";

        const percentage =
          Number(item.percentage ?? 0);

        const present =
          Number(item.present ?? 0);

        const absent =
          Number(item.absent ?? 0);

        const records =
          Array.isArray(item.records)
            ? item.records
            : [];

        const initials =
          studentName
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();


        let statusText = "Good";
        let statusClass = "good";

        if (percentage < 75) {

          statusText = "Low";
          statusClass = "low";

        } else if (percentage < 85) {

          statusText = "Needs Attention";
          statusClass = "warning";

        }


        const recordRows =
          records.length
            ? records.map(
                (record) => {

                  const status =
                    String(
                      record.status || ""
                    ).toLowerCase();

                  let statusClass =
                    "record-present";

                  if (status === "absent") {
                    statusClass =
                      "record-absent";
                  }

                  if (status === "late") {
                    statusClass =
                      "record-late";
                  }

                  return `
                    <div class="attendance-record-item">

                      <span class="record-date">
                        ${record.attendance_date || "—"}
                      </span>

                      <span class="
                        attendance-record-status
                        ${statusClass}
                      ">
                        ${status || "—"}
                      </span>

                    </div>
                  `;
                }
              ).join("")
            : `
              <div class="no-records">
                No attendance records available.
              </div>
            `;


        return `

          <!-- MAIN ROW -->

          <tr class="attendance-main-row">

            <!-- STUDENT -->

            <td>

              <div class="attendance-student">

                <div class="attendance-avatar">
                  ${initials}
                </div>

                <div class="attendance-student-info">

                  <strong>
                    ${studentName}
                  </strong>

                  <span>
                    ${studentId}
                  </span>

                </div>

              </div>

            </td>


            <!-- ATTENDANCE -->

            <td>

              <div class="attendance-percentage">

                <div class="percentage-top">

                  <strong>
                    ${percentage}%
                  </strong>

                  <span>
                    Attendance
                  </span>

                </div>

                <div class="attendance-progress">

                  <div
                    class="
                      attendance-progress-bar
                      ${
                        percentage < 75
                          ? "progress-low"
                          : percentage < 85
                          ? "progress-warning"
                          : ""
                      }
                    "
                    style="width:${Math.min(
                      percentage,
                      100
                    )}%">
                  </div>

                </div>

              </div>

            </td>


            <!-- PRESENT -->

            <td>

              <div class="attendance-count present-count">

                <span>
                  ${present}
                </span>

                <small>
                  Present
                </small>

              </div>

            </td>


            <!-- ABSENT -->

            <td>

              <div class="attendance-count absent-count">

                <span>
                  ${absent}
                </span>

                <small>
                  Absent
                </small>

              </div>

            </td>


            <!-- STATUS -->

            <td>

              <span class="
                attendance-status
                ${statusClass}
              ">

                <span class="status-dot"></span>

                ${statusText}

              </span>

            </td>


            <!-- RECORDS -->

            <td>

              <button
                type="button"
                class="view-attendance-btn"
                data-attendance-index="${index}"
              >

                <i class="fa-solid fa-calendar-days"></i>

                View Records

              </button>

            </td>

          </tr>


          <!-- EXPANDED RECORDS -->

          <tr
            class="attendance-record-row"
            id="attendance-record-${index}"
            style="display:none;"
          >

            <td colspan="6">

              <div class="attendance-record-panel">

                <div class="record-panel-header">

                  <div>

                    <h4>
                      Attendance Records
                    </h4>

                    <p>
                      ${studentName} • ${studentId}
                    </p>

                  </div>

                  <span class="record-count">
                    ${records.length} Records
                  </span>

                </div>


                <div class="attendance-record-list">

                  ${recordRows}

                </div>

              </div>

            </td>

          </tr>

        `;
      }
    ).join("");


  // ========================================================
  // VIEW RECORDS BUTTON
  // ========================================================

  tbody
    .querySelectorAll(
      ".view-attendance-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              button.dataset.attendanceIndex;

            const row =
              document.getElementById(
                `attendance-record-${index}`
              );

            if (!row) return;


            const isHidden =
              row.style.display === "none";


            // Close all other records

            tbody
              .querySelectorAll(
                ".attendance-record-row"
              )
              .forEach(
                (item) => {

                  item.style.display =
                    "none";

                }
              );


            tbody
              .querySelectorAll(
                ".view-attendance-btn"
              )
              .forEach(
                (btn) => {

                  btn.innerHTML = `
                    <i class="fa-solid fa-calendar-days"></i>
                    View Records
                  `;

                }
              );


            if (isHidden) {

              row.style.display =
                "table-row";

              button.innerHTML = `
                <i class="fa-solid fa-chevron-up"></i>
                Hide Records
              `;

            }

          }
        );

      }
    );
}


// ==========================================================
// ATTENDANCE SUMMARY STATS
// ==========================================================

function updateAttendanceStats(rows) {

  const totalStudents =
    rows.length;


  let presentToday = 0;
  let absentToday = 0;
  let lowAttendance = 0;


  rows.forEach(
    (item) => {

      const records =
        Array.isArray(item.records)
          ? item.records
          : [];


      // Latest attendance record

      const latestRecord =
        records.length
          ? records[0]
          : null;


      if (latestRecord) {

        const status =
          String(
            latestRecord.status || ""
          ).toLowerCase();


        if (status === "present") {
          presentToday++;
        }

        else if (status === "absent") {
          absentToday++;
        }

      }


      if (
        Number(item.percentage ?? 0) < 75
      ) {

        lowAttendance++;

      }

    }
  );


  const setValue =
    (id, value) => {

      const element =
        document.getElementById(id);

      if (element) {
        element.textContent = value;
      }

    };


  setValue(
    "attendanceTotalStudents",
    totalStudents
  );

  setValue(
    "attendancePresent",
    presentToday
  );

  setValue(
    "attendanceAbsent",
    absentToday
  );

  setValue(
    "attendanceLow",
    lowAttendance
  );

}
// ==========================================================
// LEAVES
// ==========================================================

async function loadLeaves() {

  const tbody =
    document.getElementById("leaveTable");

  if (!tbody) return;


  // --------------------------------------------------------
  // Get active tab
  // --------------------------------------------------------

  const activeTab =
    document.querySelector(
      "#leaveTabs .tab.active"
    );

  const status =
    activeTab?.dataset.status || "pending";


  // --------------------------------------------------------
  // WARDEN SHOULD REVIEW PARENT-APPROVED LEAVES
  // --------------------------------------------------------

  const requestStatus =
    status === "pending"
      ? "parent_approved"
      : status;


  const r =
    await Api.get(
      `/leaves?status=${encodeURIComponent(requestStatus)}`
    );


  if (!r.success) {

    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          ${r.message || "Unable to load leave requests"}
        </td>
      </tr>
    `;

    return;
  }


  const items =
    Array.isArray(r.data)
      ? r.data
      : [];


  // --------------------------------------------------------
  // EMPTY
  // --------------------------------------------------------

  if (!items.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          No leave requests found
        </td>
      </tr>
    `;

    return;
  }


  // --------------------------------------------------------
  // DISPLAY LEAVES
  // --------------------------------------------------------

  tbody.innerHTML =
    items.map(
      (l) => {

        const statusText = {

          pending:
            "Pending",

          parent_approved:
            "Parent Approved",

          parent_rejected:
            "Rejected by Parent",

          approved:
            "Approved",

          rejected:
            "Rejected by Warden",

          cancelled:
            "Cancelled"

        }[l.status] || l.status || "—";


        const actionHtml =
          l.status === "parent_approved"
            ? `
              <button
                class="btn btn-approve"
                data-id="${l.id}"
                data-a="approve">
                Approve
              </button>

              <button
                class="btn btn-reject"
                data-id="${l.id}"
                data-a="reject">
                Reject
              </button>
            `
            : `
              <button
                class="btn"
                data-id="${l.id}"
                data-a="view">
                View Details
              </button>
            `;


        return `
          <tr>

            <td>
              ${l.student_name || "—"}
            </td>

            <td>
              ${l.student_code || "—"}
            </td>

            <td>
              ${l.leave_type || "—"}
            </td>

            <td>
              ${l.from_date || "—"}
            </td>

            <td>
              ${l.to_date || "—"}
            </td>

            <td>
              ${l.reason || "—"}
            </td>

            <td>
              <strong>
                ${statusText}
              </strong>
            </td>

            <td>
              ${actionHtml}
            </td>

          </tr>
        `;
      }
    ).join("");


  // --------------------------------------------------------
  // BUTTON ACTIONS
  // --------------------------------------------------------

  tbody
    .querySelectorAll("button[data-a]")
    .forEach(
      (btn) => {

        btn.addEventListener(
          "click",
          async () => {

            const action =
              btn.dataset.a;

            const leaveId =
              btn.dataset.id;


            // ----------------------------------------------
            // VIEW
            // ----------------------------------------------

            if (action === "view") {

              const row =
                btn.closest("tr");

              alert(
                row
                  ? row.textContent.trim()
                  : "Leave details unavailable"
              );

              return;
            }


            // ----------------------------------------------
            // REJECT REMARK
            // ----------------------------------------------

            const remark =
              action === "reject"
                ? prompt(
                    "Rejection reason (required):"
                  )
                : "";


            if (
              action === "reject" &&
              !remark?.trim()
            ) {

              alert(
                "Please enter a rejection reason."
              );

              return;
            }


            // ----------------------------------------------
            // APPROVE / REJECT
            // ----------------------------------------------

            btn.disabled = true;


            const result =
              await Api.post(
                `/leaves/${leaveId}/review`,
                {
                  action,
                  remark:
                    remark?.trim() || ""
                }
              );


            if (!result.success) {

              alert(
                result.message ||
                "Unable to update leave request."
              );

              btn.disabled = false;

              return;
            }


            alert(
              action === "approve"
                ? "Leave approved successfully."
                : "Leave rejected successfully."
            );


            // Reload current tab

            await loadLeaves();

          }
        );

      }
    );
}
// ==========================================================
// WARDEN VISITOR STUDENT DROPDOWN
// ==========================================================

async function loadWardenVisitorStudents() {

  const select =
    document.getElementById(
      "visitorStudent"
    );

  if (!select) return;

  const r =
    await Api.get("/students");

  if (!r.success) {

    select.innerHTML =
      `<option value="">Unable to load students</option>`;

    return;
  }

  const items =
    Array.isArray(r.data)
      ? r.data
      : (r.data?.items || []);

  select.innerHTML = `
    <option value="">
      Select student
    </option>

    ${
      items.map(
        (student) => `
          <option value="${student.id}">
            ${student.full_name || "Student"}
            (${student.student_id || "—"})
          </option>
        `
      ).join("")
    }
  `;
}


// ==========================================================
// WARDEN REGISTER VISITOR
// ==========================================================

document
  .getElementById(
    "wardenVisitorForm"
  )
  ?.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const studentId =
        document.getElementById(
          "visitorStudent"
        )?.value;

      const visitorName =
        document.getElementById(
          "visitorName"
        )?.value.trim();

      const relation =
        document.getElementById(
          "visitorRelation"
        )?.value.trim();

      const phone =
        document.getElementById(
          "visitorPhone"
        )?.value.trim();

      const visitDate =
        document.getElementById(
          "visitorDate"
        )?.value;

      const expectedTime =
        document.getElementById(
          "visitorTime"
        )?.value;

      const purpose =
        document.getElementById(
          "visitorPurpose"
        )?.value.trim();


      if (!studentId) {

        alert(
          "Please select a student."
        );

        return;
      }


      if (!visitorName) {

        alert(
          "Please enter visitor name."
        );

        return;
      }


      if (!visitDate) {

        alert(
          "Please select visit date."
        );

        return;
      }


      const result =
        await Api.post(
          "/visitors",
          {
            student_id:
              Number(studentId),

            visitor_name:
              visitorName,

            relation:
              relation || null,

            phone:
              phone || null,

            visit_date:
              visitDate,

            expected_time:
              expectedTime || null,

            purpose:
              purpose || null,
          }
        );


      if (!result.success) {

        alert(
          result.message ||
          "Unable to register visitor."
        );

        return;
      }


      alert(
        "Visitor registered successfully. Parent approval is now required."
      );


      document
        .getElementById(
          "wardenVisitorForm"
        )
        ?.reset();


      loadVisitors();
    }
  );


// ==========================================================
// VISITORS
// ==========================================================

async function loadVisitors() {

  const box =
    document.getElementById(
      "visitorRecords"
    );

  if (!box) return;


  const r =
    await Api.get("/visitors");


  if (!r.success) {

    box.textContent =
      r.message ||
      "Unable to load visitors.";

    return;
  }


  const visitors =
    Array.isArray(r.data)
      ? r.data
      : [];


  if (!visitors.length) {

    box.textContent =
      "No visitor records found.";

    return;
  }


  const rows =
    visitors.map(
      (visitor) => {

        const entryTime =
          visitor.entry_time ||
          visitor.check_in_time ||
          "—";


        const exitTime =
          visitor.exit_time ||
          visitor.check_out_time ||
          "Not Exited";


        let actionHtml =
          "—";


        // ========================================
        // PARENT APPROVED
        // ========================================

        if (
          visitor.status === "expected" &&
          visitor.approved_by
        ) {

          actionHtml = `
            <button
              class="btn btn-approve"
              data-entry-id="${visitor.id}">

              Record Entry

            </button>
          `;
        }


        // ========================================
        // WAITING FOR PARENT
        // ========================================

        else if (
          visitor.status === "expected" &&
          !visitor.approved_by
        ) {

          actionHtml = `
            <span style="
              color:#f59e0b;
              font-weight:600;
            ">

              Waiting for Parent Approval

            </span>
          `;
        }


        // ========================================
        // VISITOR INSIDE
        // ========================================

        else if (
          visitor.status === "checked_in"
        ) {

          actionHtml = `
            <button
              class="btn"
              data-exit-id="${visitor.id}">

              Record Exit

            </button>
          `;
        }


        // ========================================
        // VISITOR EXITED
        // ========================================

        else if (
          visitor.status === "checked_out"
        ) {

          actionHtml = "—";
        }


        // ========================================
        // REJECTED
        // ========================================

        else if (
          visitor.status === "cancelled"
        ) {

          actionHtml = `
            <span style="
              color:#dc2626;
              font-weight:600;
            ">

              Rejected

            </span>
          `;
        }


        return `
          <tr>

            <td>
              ${visitor.visitor_name || "Visitor"}
            </td>

            <td>
              ${visitor.student_name || "Student"}

              ${
                visitor.student_code
                  ? ` (${visitor.student_code})`
                  : ""
              }
            </td>

            <td>
              ${visitor.visit_date || "—"}
            </td>

            <td>
              ${entryTime}
            </td>

            <td>
              ${exitTime}
            </td>

            <td>
              ${visitor.status || "—"}
            </td>

            <td>
              ${actionHtml}
            </td>

          </tr>
        `;
      }
    ).join("");


  box.innerHTML = `

    <table class="data-table">

      <thead>

        <tr>

          <th>
            Visitor Name
          </th>

          <th>
            Student
          </th>

          <th>
            Visit Date
          </th>

          <th>
            Entry Time
          </th>

          <th>
            Exit Time
          </th>

          <th>
            Status
          </th>

          <th>
            Action
          </th>

        </tr>

      </thead>


      <tbody>

        ${rows}

      </tbody>

    </table>

  `;


  // ==========================================
  // RECORD ENTRY
  // ==========================================

  box
    .querySelectorAll(
      "[data-entry-id]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {

            const visitorId =
              button.dataset.entryId;


            if (
              !confirm(
                "Record visitor entry?"
              )
            ) {
              return;
            }


            button.disabled = true;


            const result =
              await Api.put(
                `/visitors/${visitorId}/entry`,
                {}
              );


            if (!result.success) {

              alert(
                result.message ||
                "Unable to record entry."
              );

              button.disabled = false;

              return;
            }


            alert(
              "Visitor entry recorded successfully."
            );


            loadVisitors();
          }
        );
      }
    );


  // ==========================================
  // RECORD EXIT
  // ==========================================

  box
    .querySelectorAll(
      "[data-exit-id]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {

            const visitorId =
              button.dataset.exitId;


            if (
              !confirm(
                "Record visitor exit?"
              )
            ) {
              return;
            }


            button.disabled = true;


            const result =
              await Api.put(
                `/visitors/${visitorId}/exit`,
                {}
              );


            if (!result.success) {

              alert(
                result.message ||
                "Unable to record exit."
              );

              button.disabled = false;

              return;
            }


            alert(
              "Visitor exit recorded successfully."
            );


            loadVisitors();
          }
        );
      }
    );
}


// ==========================================================
// EMERGENCY
// ==========================================================
async function loadEmergencies() {

  const status =
    document.getElementById(
      "erFilterStatus"
    )?.value || "";

  const priority =
    document.getElementById(
      "erFilterPriority"
    )?.value || "";

  const type =
    document.getElementById(
      "erFilterType"
    )?.value || "";

  const search =
    document.getElementById(
      "erSearch"
    )?.value || "";


  const params =
    new URLSearchParams();


  if (status)
    params.set(
      "status",
      status
    );


  if (priority)
    params.set(
      "priority",
      priority
    );


  if (type)
    params.set(
      "type",
      type
    );


  if (search)
    params.set(
      "search",
      search
    );


  const tbody =
    document.getElementById(
      "erTable"
    );

  if (!tbody) return;


  const r =
    await Api.get(
      `/emergencies/warden?${params.toString()}`
    );


  if (!r.success) {

    tbody.innerHTML =
      "<tr><td colspan='8'>Unable to load emergency alerts</td></tr>";

    return;
  }


  const stats =
    r.data.stats || {};


  const set =
    (id, value) => {

      const el =
        document.getElementById(id);

      if (el) {
        el.textContent =
          value ?? 0;
      }

    };


  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  set(
    "erTotal",
    stats.total
  );

  set(
    "erPending",
    stats.pending
  );

  set(
    "erCritical",
    stats.critical
  );

  set(
    "erResponded",
    stats.responded
  );

  set(
    "erResolved",
    stats.resolved
  );


  const items =
    Array.isArray(r.data.items)
      ? r.data.items
      : [];


  // ==========================================
  // TABLE
  // ==========================================

  tbody.innerHTML =
    items.length

      ? items.map(
          (e) => {

            const room =
              [
                e.block_name,
                e.room_number
              ]
                .filter(Boolean)
                .join(" ") ||
              "—";


            // ==================================
            // ACTIONS
            // ==================================

            const actions = [

              `
              <button
                class="btn"
                data-id="${e.id}"
                data-a="view"
              >
                View Details
              </button>
              `

            ];


            if (
              e.status === "pending" ||
              e.status === "acknowledged"
            ) {

              actions.push(
                `
                <button
                  class="btn-er btn-er-respond"
                  data-id="${e.id}"
                  data-a="respond"
                >
                  Responded
                </button>
                `
              );

            }


            if (
              e.status === "responded"
            ) {

              actions.push(
                `
                <button
                  class="btn-er btn-er-resolve"
                  data-id="${e.id}"
                  data-a="resolve"
                >
                  Resolved
                </button>
                `
              );

            }


            // ==================================
            // TIME
            // ==================================

            const createdTime =
              e.created_at
                ? formatWardenEmergencyDateTime(
                    e.created_at
                  )
                : "—";


            // ==================================
            // ROW
            // ==================================

            return `

              <tr
                class="${
                  e.priority === "critical"
                    ? "er-critical-row"
                    : e.priority === "high"
                    ? "er-high-row"
                    : ""
                }"
              >

                <td>
                  ${createdTime}
                </td>


                <td>
                  ${e.student_name || "—"}
                </td>


                <td>
                  ${room}
                </td>


                <td>
                  ${e.emergency_type || "—"}
                </td>


                <td>

                  <span
                    class="
                      priority-badge
                      priority-${e.priority}
                    "
                  >
                    ${e.priority || "—"}
                  </span>

                </td>


                <td>

                  <span
                    class="
                      status-badge
                      status-${e.status}
                    "
                  >
                    ${e.status || "—"}
                  </span>

                </td>


                <td>

                  ${
                    (e.description || "")
                      .slice(0, 50)
                  }

                  ${
                    (e.description || "")
                      .length > 50
                      ? "…"
                      : ""
                  }

                </td>


                <td>
                  ${actions.join(" ")}
                </td>

              </tr>

            `;

          }
        ).join("")

      : `
        <tr>
          <td colspan="8">
            No emergency alerts
          </td>
        </tr>
      `;


  // ==========================================
  // BUTTON ACTIONS
  // ==========================================

  tbody
    .querySelectorAll(
      "button[data-a]"
    )
    .forEach(
      (btn) => {

        btn.addEventListener(
          "click",
          async () => {

            const id =
              btn.dataset.id;

            const a =
              btn.dataset.a;


            if (!id || !a) {
              return;
            }


            // ==================================
            // VIEW DETAILS
            // ==================================

            if (
              a === "view"
            ) {

              alert(
                btn.closest("tr")
                  ?.textContent
                  ?.trim() ||
                "Emergency details unavailable"
              );

              return;
            }


            let path =
              `/emergencies/${id}/`;

            let body = {};


            // ==================================
            // RESPOND
            // ==================================

            if (
              a === "respond"
            ) {

              const response =
                prompt(
                  "How did you respond to this emergency? (required)"
                );


              if (
                !response?.trim()
              ) {
                return;
              }


              path +=
                "respond";


              body = {

                response,

                notes:
                  prompt(
                    "Optional notes:"
                  ) || "",

              };

            }


            // ==================================
            // RESOLVE
            // ==================================

            else if (
              a === "resolve"
            ) {

              path +=
                "resolve";


              body = {

                resolution_notes:
                  prompt(
                    "Resolution notes (optional):"
                  ) || "",

              };

            }


            const res =
              await Api.put(
                path,
                body
              );


            if (!res.success) {

              alert(
                res.message ||
                "Failed"
              );

              return;
            }


            loadEmergencies();

          }
        );

      }
    );

}
// ==========================================
// WARDEN EMERGENCY DATE + TIME
// UTC → IST
// ==========================================

function formatWardenEmergencyDateTime(
  value
) {

  if (!value) {
    return "—";
  }


  let raw =
    String(value).trim();


  // Backend example:
  // 2026-10-06T12:58:05
  //
  // Treat timezone-less timestamp as UTC

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(
      raw
    )
  ) {

    raw += "Z";

  }


  const date =
    new Date(raw);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleString(
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
// ==========================================================
// MAINTENANCE + SMART ROOM CHANGE REQUESTS
// ==========================================================

async function loadRequestQueues() {

  const maintenanceBox =
    document.getElementById("maintenanceRequests");

  const roomChangeBox =
    document.getElementById("roomChangeRequests");


  // ========================================================
  // LOAD ROOMS
  // ========================================================

  let allRooms = [];

  try {

    const roomsResult =
      await Api.get("/rooms");

    if (
      roomsResult.success &&
      Array.isArray(roomsResult.data)
    ) {

      allRooms = roomsResult.data;

    }

  } catch (error) {

    console.error(
      "Unable to load rooms:",
      error
    );

  }


  // ========================================================
  // LOAD STUDENTS
  // ========================================================

  let students = [];

  try {

    const studentsResult =
      await Api.get("/students");

    if (
      studentsResult.success &&
      Array.isArray(studentsResult.data)
    ) {

      students = studentsResult.data;

    } else if (
      studentsResult.success &&
      Array.isArray(studentsResult.data?.items)
    ) {

      students = studentsResult.data.items;

    }

  } catch (error) {

    console.error(
      "Unable to load students:",
      error
    );

  }


  // ========================================================
  // BUILD STUDENT ROOM MAP
  // ========================================================

  /*
    We already know the database has:

    STD001 -> B101
    STD012 -> A101
    STD006 -> A102
    etc.

    If /students response contains room information,
    use it directly.

    This also supports multiple possible API field names.
  */

  const studentRoomMap = {};


  students.forEach((student) => {

    const studentCode =
      String(
        student.student_id ||
        student.student_code ||
        student.code ||
        ""
      )
        .trim()
        .toUpperCase();


    const roomNumber =
      student.room_number ||
      student.current_room_number ||
      student.room?.room_number ||
      student.current_room?.room_number ||
      "";


    if (
      studentCode &&
      roomNumber
    ) {

      studentRoomMap[studentCode] =
        roomNumber;

    }

  });


  // ========================================================
  // ALSO BUILD ROOM MAP FROM ROOM DATA
  // ========================================================

  const roomMap = {};


  allRooms.forEach((room) => {

    const roomNumber =
      String(
        room.room_number || ""
      )
        .trim()
        .toUpperCase();


    if (roomNumber) {

      roomMap[roomNumber] = room;

    }

  });


  // ========================================================
  // SMART ROOM MATCHING
  // ========================================================

  function getSmartRoomRecommendation(request) {

    if (!allRooms.length) {
      return null;
    }


    const requestedType =
      String(
        request.requested_room_type || ""
      )
        .trim()
        .toLowerCase();


    const currentRoom =
      String(
        request.current_room_number || ""
      )
        .trim()
        .toLowerCase();


    /*
      Important:

      requested_room_type = "standard"
      is NOT necessarily the same as:
      single / double / triple / quad.

      Therefore we do NOT force "standard"
      to match room_type.

      We mainly consider:
      1. available beds
      2. available/usable room
      3. current room excluded
      4. requested type only when it is
         an actual room type
      5. more available beds
    */

    const validRoomTypes = [
      "single",
      "double",
      "triple",
      "quad"
    ];


    const isActualRoomType =
      validRoomTypes.includes(
        requestedType
      );


    const candidateRooms =
      allRooms.filter(
        (room) => {

          const availableBeds =
            Number(
              room.available_beds || 0
            );


          if (
            availableBeds <= 0
          ) {

            return false;

          }


          const roomNumber =
            String(
              room.room_number || ""
            )
              .trim()
              .toLowerCase();


          // Never recommend current room
          if (
            currentRoom &&
            roomNumber === currentRoom
          ) {

            return false;

          }


          /*
            Allow rooms with available beds even if
            backend status is "occupied".

            This is important because a partially
            occupied room can still have free beds.
          */

          const roomStatus =
            String(
              room.status || ""
            )
              .trim()
              .toLowerCase();


          if (
            roomStatus === "maintenance" ||
            roomStatus === "reserved"
          ) {

            return false;

          }


          return true;

        }
      );


    if (!candidateRooms.length) {
      return null;
    }


    // ======================================================
    // SCORE ROOMS
    // ======================================================

    const scoredRooms =
      candidateRooms.map(
        (room) => {

          let score = 0;


          const roomType =
            String(
              room.room_type || ""
            )
              .trim()
              .toLowerCase();


          // Actual room type match
          if (
            isActualRoomType &&
            roomType === requestedType
          ) {

            score += 100;

          }


          // Available beds
          score +=
            Number(
              room.available_beds || 0
            ) * 10;


          // Fully available room gets small bonus
          if (
            room.status === "available"
          ) {

            score += 20;

          }


          return {
            room,
            score
          };

        }
      );


    scoredRooms.sort(
      (a, b) =>
        b.score - a.score
    );


    return (
      scoredRooms[0]?.room ||
      null
    );

  }


  // ========================================================
  // AI MAINTENANCE SUGGESTION
  // ========================================================

  function getMaintenanceSuggestion(item) {

    const issue =
      String(
        item.issue_title || ""
      ).toLowerCase();


    const description =
      String(
        item.description || ""
      ).toLowerCase();


    const text =
      `${issue} ${description}`;


    if (
      text.includes("fan") ||
      text.includes("air")
    ) {

      return {
        title:
          "Check electrical connection and fan motor",

        reason:
          "The issue appears related to fan or airflow equipment.",

        priority:
          "Medium"
      };

    }


    if (
      text.includes("light") ||
      text.includes("bulb") ||
      text.includes("electric")
    ) {

      return {
        title:
          "Inspect electrical connection and replace faulty component",

        reason:
          "The issue appears related to electrical equipment.",

        priority:
          "Medium"
      };

    }


    if (
      text.includes("water") ||
      text.includes("tap") ||
      text.includes("leak") ||
      text.includes("pipe")
    ) {

      return {
        title:
          "Inspect water connection and possible leakage",

        reason:
          "The issue appears related to plumbing or water supply.",

        priority:
          "High"
      };

    }


    if (
      text.includes("door") ||
      text.includes("lock")
    ) {

      return {
        title:
          "Inspect door, lock and security mechanism",

        reason:
          "The issue appears related to room access or security.",

        priority:
          "High"
      };

    }


    if (
      text.includes("bed") ||
      text.includes("chair") ||
      text.includes("table") ||
      text.includes("furniture")
    ) {

      return {
        title:
          "Inspect furniture and arrange repair or replacement",

        reason:
          "The issue appears related to hostel furniture.",

        priority:
          "Medium"
      };

    }


    return {

      title:
        "Inspect the reported room issue and assign maintenance staff",

      reason:
        "The system could not identify a specific equipment category.",

      priority:
        item.priority || "Medium"

    };

  }


  // ========================================================
  // FIND STUDENT ROOM
  // ========================================================

  function getStudentRoom(item) {

    const studentCode =
      String(
        item.student_code ||
        item.student_id ||
        item.student?.student_id ||
        ""
      )
        .trim()
        .toUpperCase();


    // First try direct API value
    if (
      item.room_number
    ) {

      return item.room_number;

    }


    // Then try student map
    if (
      studentCode &&
      studentRoomMap[studentCode]
    ) {

      return studentRoomMap[studentCode];

    }


    // Try current room field
    if (
      item.current_room_number
    ) {

      return item.current_room_number;

    }


    return "Not Allocated";

  }


  // ========================================================
  // MAINTENANCE REQUESTS
  // ========================================================

  if (maintenanceBox) {

    try {

      const maintenance =
        await Api.get(
          "/rooms/maintenance"
        );


      const items =
        maintenance.success &&
        Array.isArray(maintenance.data)
          ? maintenance.data
          : [];


      if (!items.length) {

        maintenanceBox.innerHTML = `
          <div style="
            padding:24px;
            text-align:center;
            color:#7c8494;
          ">
            No maintenance requests found.
          </div>
        `;

      } else {

        maintenanceBox.innerHTML =
          items.map(
            (item) => {

              const suggestion =
                getMaintenanceSuggestion(
                  item
                );


              const status =
                String(
                  item.status || "pending"
                ).toLowerCase();


              const priority =
                String(
                  item.priority || "medium"
                ).toLowerCase();


              const studentRoom =
                getStudentRoom(item);


              return `

                <div style="
                  border:1px solid #e5e7eb;
                  border-radius:16px;
                  padding:20px;
                  margin-bottom:16px;
                  background:#ffffff;
                  box-shadow:0 4px 14px rgba(15,23,42,0.05);
                ">

                  <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:15px;
                    margin-bottom:15px;
                  ">

                    <div>

                      <h3 style="
                        margin:0 0 6px;
                        color:#182235;
                        font-size:17px;
                      ">
                        Maintenance Request #${item.id}
                      </h3>

                      <p style="
                        margin:0;
                        color:#64748b;
                        font-size:14px;
                      ">

                        ${item.student_name || "Student"}

                        ${
                          item.student_code
                            ? `(${item.student_code})`
                            : ""
                        }

                      </p>

                    </div>


                    <span style="
                      display:inline-block;
                      padding:6px 12px;
                      border-radius:20px;
                      background:${
                        status === "resolved"
                          ? "#dcfce7"
                          : status === "in_progress"
                          ? "#dbeafe"
                          : "#fef3c7"
                      };
                      color:${
                        status === "resolved"
                          ? "#166534"
                          : status === "in_progress"
                          ? "#1d4ed8"
                          : "#92400e"
                      };
                      font-size:12px;
                      font-weight:700;
                      text-transform:capitalize;
                    ">

                      ${status.replace("_", " ")}

                    </span>

                  </div>


                  <div style="
                    display:grid;
                    grid-template-columns:
                      repeat(auto-fit,minmax(150px,1fr));
                    gap:10px;
                    margin-bottom:16px;
                  ">

                    <div style="
                      background:#f8fafc;
                      padding:12px;
                      border-radius:10px;
                    ">

                      <small style="
                        color:#7c8494;
                      ">
                        Room
                      </small>

                      <div style="
                        font-weight:600;
                        margin-top:3px;
                      ">

                        ${studentRoom}

                      </div>

                    </div>


                    <div style="
                      background:#f8fafc;
                      padding:12px;
                      border-radius:10px;
                    ">

                      <small style="
                        color:#7c8494;
                      ">
                        Issue
                      </small>

                      <div style="
                        font-weight:600;
                        margin-top:3px;
                      ">

                        ${
                          item.issue_title ||
                          "Maintenance Issue"
                        }

                      </div>

                    </div>


                    <div style="
                      background:#f8fafc;
                      padding:12px;
                      border-radius:10px;
                    ">

                      <small style="
                        color:#7c8494;
                      ">
                        Priority
                      </small>

                      <div style="
                        font-weight:600;
                        margin-top:3px;
                        text-transform:capitalize;
                      ">

                        ${priority}

                      </div>

                    </div>

                  </div>


                  ${
                    item.description
                      ? `
                        <div style="
                          margin-bottom:16px;
                          color:#475569;
                          font-size:14px;
                        ">

                          <strong>Description:</strong>

                          ${item.description}

                        </div>
                      `
                      : ""
                  }


                  <div style="
                    background:linear-gradient(
                      135deg,
                      #eef2ff,
                      #f5f3ff
                    );
                    border:1px solid #c7d2fe;
                    border-radius:14px;
                    padding:16px;
                    margin-bottom:16px;
                  ">

                    <div style="
                      display:flex;
                      align-items:center;
                      gap:8px;
                      margin-bottom:8px;
                    ">

                      <span style="
                        width:30px;
                        height:30px;
                        border-radius:50%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#5b5ce2;
                        color:white;
                        font-size:14px;
                      ">
                        AI
                      </span>

                      <strong style="
                        color:#3730a3;
                      ">
                        Smart AI Maintenance Assistance
                      </strong>

                    </div>


                    <div style="
                      font-size:14px;
                      color:#334155;
                    ">

                      <strong>
                        Suggested Action:
                      </strong>

                      ${suggestion.title}

                    </div>


                    <div style="
                      font-size:13px;
                      color:#64748b;
                      margin-top:5px;
                    ">

                      ${suggestion.reason}

                    </div>

                  </div>


                  <div style="
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                  ">

                    ${
                      status !== "in_progress" &&
                      status !== "resolved"
                        ? `
                          <button
                            class="btn"
                            data-maintenance-id="${item.id}"
                            data-status="in_progress">

                            Mark In Progress

                          </button>
                        `
                        : ""
                    }


                    ${
                      status !== "resolved"
                        ? `
                          <button
                            class="btn btn-approve"
                            data-maintenance-id="${item.id}"
                            data-status="resolved">

                            Mark Resolved

                          </button>
                        `
                        : ""
                    }

                  </div>

                </div>

              `;

            }
          ).join("");


        // ====================================================
        // MAINTENANCE ACTIONS
        // ====================================================

        maintenanceBox
          .querySelectorAll(
            "[data-maintenance-id]"
          )
          .forEach(
            (button) => {

              button.addEventListener(
                "click",
                async () => {

                  const id =
                    button.dataset.maintenanceId;

                  const status =
                    button.dataset.status;


                  button.disabled = true;


                  const result =
                    await Api.put(
                      `/rooms/maintenance/${id}`,
                      {
                        status
                      }
                    );


                  if (!result.success) {

                    alert(
                      result.message ||
                      "Unable to update maintenance request."
                    );

                    button.disabled = false;

                    return;

                  }


                  await loadRequestQueues();

                }
              );

            }
          );

      }

    } catch (error) {

      console.error(
        "Maintenance loading error:",
        error
      );


      maintenanceBox.innerHTML = `
        <div style="
          padding:20px;
          color:#dc2626;
        ">
          Unable to load maintenance requests.
        </div>
      `;

    }

  }


  // ========================================================
  // ROOM CHANGE REQUESTS
  // ========================================================

  if (roomChangeBox) {

    try {

      const changes =
        await Api.get(
          "/rooms/change-request"
        );


      const items =
        changes.success &&
        Array.isArray(changes.data)
          ? changes.data
          : [];


      if (!items.length) {

        roomChangeBox.innerHTML = `
          <div style="
            padding:24px;
            text-align:center;
            color:#7c8494;
          ">
            No room-change requests found.
          </div>
        `;

      } else {

        roomChangeBox.innerHTML =
          items.map(
            (item) => {

              const recommendedRoom =
                getSmartRoomRecommendation(
                  item
                );


              const status =
                String(
                  item.status || "pending"
                ).toLowerCase();


              const requestedType =
                item.requested_room_type ||
                "Preference not specified";


              const currentRoom =
                item.current_room_number ||
                "Not Allocated";


              let recommendationReason =
                "It has available beds and is currently available.";


              if (
                recommendedRoom
              ) {

                const recommendedType =
                  String(
                    recommendedRoom.room_type || ""
                  )
                    .trim()
                    .toLowerCase();


                const requestedTypeLower =
                  String(
                    requestedType
                  )
                    .trim()
                    .toLowerCase();


                if (
                  [
                    "single",
                    "double",
                    "triple",
                    "quad"
                  ].includes(
                    requestedTypeLower
                  ) &&
                  recommendedType ===
                    requestedTypeLower
                ) {

                  recommendationReason =
                    "It matches the requested room type and has available beds.";

                } else {

                  recommendationReason =
                    "The requested preference is treated as a general room preference. This room has available beds and is different from the current room.";

                }

              }


              return `

                <div style="
                  border:1px solid #e5e7eb;
                  border-radius:16px;
                  padding:20px;
                  margin-bottom:16px;
                  background:#ffffff;
                  box-shadow:0 4px 14px rgba(15,23,42,0.05);
                ">


                  <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:15px;
                    margin-bottom:16px;
                  ">

                    <div>

                      <h3 style="
                        margin:0 0 6px;
                        color:#182235;
                        font-size:17px;
                      ">

                        Room Change Request #${item.id}

                      </h3>

                      <p style="
                        margin:0;
                        color:#64748b;
                        font-size:14px;
                      ">

                        ${item.student_name || "Student"}

                        ${
                          item.student_code
                            ? `(${item.student_code})`
                            : ""
                        }

                      </p>

                    </div>


                    <span style="
                      display:inline-block;
                      padding:6px 12px;
                      border-radius:20px;
                      background:${
                        status === "approved"
                          ? "#dcfce7"
                          : status === "rejected"
                          ? "#fee2e2"
                          : "#fef3c7"
                      };
                      color:${
                        status === "approved"
                          ? "#166534"
                          : status === "rejected"
                          ? "#991b1b"
                          : "#92400e"
                      };
                      font-size:12px;
                      font-weight:700;
                      text-transform:capitalize;
                    ">

                      ${status}

                    </span>

                  </div>


                  <div style="
                    display:grid;
                    grid-template-columns:
                      repeat(auto-fit,minmax(170px,1fr));
                    gap:10px;
                    margin-bottom:16px;
                  ">


                    <div style="
                      background:#f8fafc;
                      padding:13px;
                      border-radius:10px;
                    ">

                      <small style="
                        color:#7c8494;
                      ">
                        Current Room
                      </small>

                      <div style="
                        font-weight:600;
                        margin-top:4px;
                      ">

                        ${currentRoom}

                      </div>

                    </div>


                    <div style="
                      background:#f8fafc;
                      padding:13px;
                      border-radius:10px;
                    ">

                      <small style="
                        color:#7c8494;
                      ">
                        Requested Type
                      </small>

                      <div style="
                        font-weight:600;
                        margin-top:4px;
                        text-transform:capitalize;
                      ">

                        ${requestedType}

                      </div>

                    </div>

                  </div>


                  <div style="
                    background:linear-gradient(
                      135deg,
                      #eef2ff,
                      #f5f3ff
                    );
                    border:1px solid #c7d2fe;
                    border-radius:14px;
                    padding:18px;
                    margin-bottom:16px;
                  ">


                    <div style="
                      display:flex;
                      align-items:center;
                      gap:9px;
                      margin-bottom:12px;
                    ">

                      <span style="
                        width:34px;
                        height:34px;
                        border-radius:10px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#5b5ce2;
                        color:#fff;
                        font-weight:700;
                        font-size:13px;
                      ">

                        AI

                      </span>


                      <div>

                        <strong style="
                          color:#3730a3;
                          font-size:15px;
                        ">

                          Smart AI Room Matching

                        </strong>

                        <div style="
                          font-size:12px;
                          color:#64748b;
                          margin-top:2px;
                        ">

                          Available-room based recommendation

                        </div>

                      </div>

                    </div>


                    ${
                      recommendedRoom
                        ? `

                          <div style="
                            background:#ffffff;
                            border-radius:12px;
                            padding:15px;
                            border:1px solid #ddd6fe;
                          ">


                            <div style="
                              display:flex;
                              justify-content:space-between;
                              align-items:center;
                              gap:10px;
                              margin-bottom:12px;
                            ">

                              <div>

                                <div style="
                                  font-size:17px;
                                  font-weight:700;
                                  color:#182235;
                                ">

                                  ${
                                    recommendedRoom.room_number ||
                                    "Room"
                                  }

                                </div>

                                <div style="
                                  font-size:13px;
                                  color:#64748b;
                                  margin-top:3px;
                                ">

                                  ${
                                    recommendedRoom.block_name ||
                                    recommendedRoom.block ||
                                    recommendedRoom.hostel_block?.name ||
                                    "Block"
                                  }

                                </div>

                              </div>


                              <span style="
                                padding:5px 10px;
                                border-radius:20px;
                                background:#dcfce7;
                                color:#166534;
                                font-size:11px;
                                font-weight:700;
                              ">

                                RECOMMENDED

                              </span>

                            </div>


                            <div style="
                              display:grid;
                              grid-template-columns:
                                repeat(auto-fit,minmax(120px,1fr));
                              gap:8px;
                            ">


                              <div>

                                <small style="
                                  color:#7c8494;
                                ">
                                  Room Type
                                </small>

                                <div style="
                                  font-weight:600;
                                  text-transform:capitalize;
                                ">

                                  ${
                                    recommendedRoom.room_type ||
                                    "—"
                                  }

                                </div>

                              </div>


                              <div>

                                <small style="
                                  color:#7c8494;
                                ">
                                  Available Beds
                                </small>

                                <div style="
                                  font-weight:600;
                                ">

                                  ${
                                    recommendedRoom.available_beds ??
                                    0
                                  }

                                </div>

                              </div>


                              <div>

                                <small style="
                                  color:#7c8494;
                                ">
                                  Capacity
                                </small>

                                <div style="
                                  font-weight:600;
                                ">

                                  ${
                                    recommendedRoom.capacity ??
                                    0
                                  }

                                </div>

                              </div>


                              <div>

                                <small style="
                                  color:#7c8494;
                                ">
                                  Monthly Rent
                                </small>

                                <div style="
                                  font-weight:600;
                                ">

                                  ₹${
                                    Number(
                                      recommendedRoom.monthly_rent ||
                                      0
                                    ).toLocaleString("en-IN")
                                  }

                                </div>

                              </div>

                            </div>


                            <div style="
                              margin-top:12px;
                              padding-top:10px;
                              border-top:1px solid #e5e7eb;
                              color:#64748b;
                              font-size:13px;
                            ">

                              <strong>
                                Why this room?
                              </strong>

                              ${recommendationReason}

                            </div>

                          </div>

                        `
                        : `

                          <div style="
                            padding:14px;
                            background:#fff7ed;
                            border:1px solid #fed7aa;
                            border-radius:10px;
                            color:#9a3412;
                            font-size:13px;
                          ">

                            No suitable available room was found
                            for this request.

                          </div>

                        `
                    }

                  </div>


                  ${
                    status === "pending"
                      ? `

                        <div style="
                          display:flex;
                          gap:10px;
                          flex-wrap:wrap;
                        ">

                          <button
                            class="btn btn-approve"
                            data-change-id="${item.id}"
                            data-status="approved">

                            Approve Request

                          </button>


                          <button
                            class="btn"
                            data-change-id="${item.id}"
                            data-status="rejected">

                            Reject

                          </button>

                        </div>

                      `
                      : ""
                  }

                </div>

              `;

            }
          ).join("");


        // ====================================================
        // ROOM CHANGE ACTIONS
        // ====================================================

        roomChangeBox
          .querySelectorAll(
            "[data-change-id]"
          )
          .forEach(
            (button) => {

              button.addEventListener(
                "click",
                async () => {

                  const id =
                    button.dataset.changeId;

                  const status =
                    button.dataset.status;


                  const confirmed =
                    confirm(
                      status === "approved"
                        ? "Approve this room-change request?"
                        : "Reject this room-change request?"
                    );


                  if (!confirmed) {
                    return;
                  }


                  button.disabled = true;


                  const result =
                    await Api.put(
                      `/rooms/change-request/${id}`,
                      {
                        status
                      }
                    );


                  if (!result.success) {

                    alert(
                      result.message ||
                      "Unable to update room-change request."
                    );

                    button.disabled = false;

                    return;

                  }


                  alert(
                    status === "approved"
                      ? "Room-change request approved."
                      : "Room-change request rejected."
                  );


                  await loadRequestQueues();

                }
              );

            }
          );

      }

    } catch (error) {

      console.error(
        "Room-change loading error:",
        error
      );


      roomChangeBox.innerHTML = `
        <div style="
          padding:20px;
          color:#dc2626;
        ">
          Unable to load room-change requests.
        </div>
      `;

    }

  }

}
// ==========================================================
// NOTIFICATIONS
// ==========================================================
// ==========================================================
// NOTIFICATIONS
// ==========================================================

function formatWardenNotificationDateTime(value) {

  if (!value) {
    return "—";
  }

  let raw = String(value).trim();

  // Backend timestamp is UTC without timezone
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(raw)
  ) {
    raw += "Z";
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(
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


async function loadNotifications() {

  const box =
    document.getElementById(
      "wardenNotifications"
    );

  if (!box) return;


  // Get latest real notifications from backend
  const r =
    await Api.get(
      "/notifications/me"
    );


  if (!r.success) {

    box.innerHTML = `
      <p>
        ${r.message || "Unable to load notifications."}
      </p>
    `;

    return;
  }


  const items =
    Array.isArray(r.data)
      ? r.data
      : [];


  if (!items.length) {

    box.innerHTML =
      "<p>No notifications.</p>";

    return;
  }


  box.innerHTML =
    items.map(
      (item) => {

        const notificationTime =
          formatWardenNotificationDateTime(
            item.created_at
          );


        return `
          <div style="
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          ">

            <strong>
              ${item.title || "Notification"}
            </strong>

            <p style="
              margin: 4px 0;
              white-space: pre-wrap;
            ">
              ${item.message || ""}
            </p>

            <small>
              ${notificationTime}
            </small>

          </div>
        `;
      }
    ).join("");
}
// ==========================================================
// ANNOUNCEMENTS
// ==========================================================

async function loadAnnouncements() {

  const box =
    document.getElementById(
      "annList"
    );

  if (!box) return;


  const r =
    await Api.get(
      "/announcements"
    );


  const items =
    r.success &&
    Array.isArray(r.data)
      ? r.data
      : [];


  box.innerHTML =
    items.length
      ? items.map(
          (a) => `
            <div style="
              padding:10px;
              border-bottom:1px solid #e2e8f0
            ">

              <strong>
                ${a.title}
              </strong>

              <p style="
                margin:4px 0;
                font-size:13px
              ">
                ${a.content}
              </p>

            </div>
          `
        ).join("")
      : "<p>No announcements.</p>";
}


// ==========================================================
// ANNOUNCEMENT BUTTON
// ==========================================================

document
  .getElementById(
    "annBtn"
  )
  ?.addEventListener(
    "click",
    async () => {

      const r =
        await Api.post(
          "/announcements",
          {
            title:
              document.getElementById(
                "annTitle"
              )?.value,

            content:
              document.getElementById(
                "annContent"
              )?.value,
          }
        );


      alert(
        r.message ||
        (
          r.success
            ? "Published"
            : "Failed"
        )
      );


      if (r.success) {
        loadAnnouncements();
      }
    }
  );


// ==========================================================
// LEAVE TABS
// ==========================================================

document
  .querySelectorAll(
    "#leaveTabs .tab"
  )
  .forEach(
    (tab) => {

      tab.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              "#leaveTabs .tab"
            )
            .forEach(
              (item) =>
                item.classList.remove(
                  "active"
                )
            );


          tab.classList.add(
            "active"
          );


          loadLeaves();
        }
      );
    }
  );


// ==========================================================
// EMERGENCY FILTERS
// ==========================================================

if (
  document.getElementById(
    "erFilterStatus"
  )
) {

  [
    "erFilterStatus",
    "erFilterPriority",
    "erFilterType",
  ].forEach(
    (id) => {

      document
        .getElementById(id)
        ?.addEventListener(
          "change",
          loadEmergencies
        );
    }
  );


  document
    .getElementById(
      "erSearch"
    )
    ?.addEventListener(
      "keydown",
      (e) => {

        if (
          e.key === "Enter"
        ) {
          loadEmergencies();
        }
      }
    );


  document
    .getElementById(
      "erRefreshBtn"
    )
    ?.addEventListener(
      "click",
      loadEmergencies
    );
}


// ==========================================================
// INITIAL LOAD
// ==========================================================

loadStats();
loadStudents();
loadRooms();
loadAllocationStudents();
loadAttendance();
loadLeaves();

loadVisitors();
loadWardenVisitorStudents();

loadEmergencies();
loadRequestQueues();
loadNotifications();
loadAnnouncements();
