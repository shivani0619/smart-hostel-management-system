
if (!requireAuth("warden")) {}

const profile = Api.getProfile() || {};
const nameEl = document.getElementById("wardenName");
if (nameEl) nameEl.textContent = profile.full_name || "Warden";

document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  Api.clearAuth();
  window.location.href = "roleselection.html";
});

// Store recommendations for the Smart Match buttons
const wardenRoomSuggestions = {};

// =========================================================
// WARDEN DASHBOARD SUMMARY
// =========================================================
async function loadWardenDashboardSummary() {
  try {
    const r = await Api.get("/dashboard/warden");
    if (!r.success) return;

    const d = r.data || {};
    const s = d.stats || {};

    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value ?? 0;
    };

    setVal("sStudents", s.total_students);
    setVal("sRooms", s.total_rooms);
    setVal("sOccupied", s.occupied_rooms);
    setVal("sAvailable", s.available_rooms);
    setVal("sLeaves", s.pending_leaves);
    setVal("sVisitors", s.todays_visitors);
    setVal("sComplaints", s.pending_complaints ?? s.open_complaints);
    setVal("sEmergencies", s.active_emergencies);
    setVal("sPresent", s.present_today);

    const activity = document.getElementById("wardenRecentActivity");
    if (activity) {
      const rows = [
        ...(d.recent_leaves || []).map(item =>
          `Leave: ${item.student_name || "Student"} (${item.status || "—"})`
        ),
        ...(d.recent_visitors || []).map(item =>
          `Visitor: ${item.visitor_name || "Visitor"} for ${item.student_name || "Student"}`
        ),
        ...(d.recent_complaints || []).map(item =>
          `Complaint: ${item.subject || "Complaint"} (${item.status || "—"})`
        ),
        ...(d.emergency_alerts || []).map(item =>
          `Emergency: ${item.student_name || "Student"} (${item.priority || "—"})`
        ),
        ...(d.announcements || []).map(item =>
          `Announcement: ${item.title || "Announcement"}`
        ),
      ].slice(0, 12);

      activity.innerHTML = rows.length
        ? rows.map(row => `<p style="margin:6px 0">${row}</p>`).join("")
        : "<p>No recent activity.</p>";
    }
  } catch (error) {
    console.error("Warden summary error:", error);
  }
}

// =========================================================
// SMART ROOM MATCHING
// =========================================================
function findBestRoom(request, rooms) {
  const currentRoomId =
    request.current_room_id ?? request.room_id ?? null;

  const currentRoomNumber =
    request.current_room_number ||
    request.room_number ||
    "";

  const requestedRoomType =
    request.requested_room_type ||
    null;

  const suitableRooms = rooms.filter(room => {
    if (Number(room.available_beds || 0) <= 0) return false;

    const status = String(room.status || "").toLowerCase();
    if (status === "maintenance" || status === "reserved") return false;

    if (
      currentRoomId !== null &&
      Number(room.id) === Number(currentRoomId)
    ) return false;

    if (
      currentRoomNumber &&
      String(room.room_number).toLowerCase() ===
      String(currentRoomNumber).toLowerCase()
    ) return false;

    return true;
  });

  if (!suitableRooms.length) return null;

  const scoredRooms = suitableRooms.map(room => {
    let score = 0;

    if (
      requestedRoomType &&
      String(room.room_type).toLowerCase() ===
      String(requestedRoomType).toLowerCase()
    ) {
      score += 50;
    }

    score += Number(room.available_beds || 0) * 10;

    if (String(room.status).toLowerCase() === "available") {
      score += 20;
    }

    return { room, score };
  });

  scoredRooms.sort((a, b) => b.score - a.score);
  return scoredRooms[0]?.room || null;
}

// =========================================================
// SMART ROOM SUGGESTION CARD
// =========================================================
function smartRoomSuggestion(room) {
  if (!room) {
    return `
      <div style="
        margin-top:12px;
        padding:12px;
        border-radius:12px;
        background:#fff4f4;
        border:1px solid #ffd6d6;
        color:#b42318;">
        <strong>Smart Room Matching</strong>
        <div style="margin-top:5px;">
          No suitable available room found.
        </div>
      </div>`;
  }

  return `
    <div style="
      margin-top:12px;
      padding:14px;
      border-radius:14px;
      background:linear-gradient(135deg,#f3f1ff,#eef6ff);
      border:1px solid #ddd8ff;">

      <div style="font-weight:700;color:#5b5ce2;margin-bottom:8px;">
        ✨ Smart AI Room Match
      </div>

      <div style="font-size:15px;font-weight:600;color:#182235;">
        Recommended Room: ${room.room_number || "—"}
      </div>

      <div style="margin-top:5px;color:#667085;font-size:13px;">
        ${room.block_name || "Hostel Block"}
        • Floor ${room.floor ?? "—"}
        • ${room.room_type || "—"}
      </div>

      <div style="margin-top:5px;color:#667085;font-size:13px;">
        Available Beds: ${room.available_beds ?? 0} / ${room.capacity ?? 0}
      </div>

      <div style="margin-top:5px;color:#667085;font-size:13px;">
        Monthly Rent: ₹${room.monthly_rent ?? 0}
      </div>
    </div>`;
}

// =========================================================
// LOAD MAINTENANCE + ROOM CHANGE REQUESTS
// =========================================================
async function loadRequestQueues() {
  const maintenanceBox = document.getElementById("maintenanceRequests");
  const roomChangeBox = document.getElementById("roomChangeRequests");

  let rooms = [];

  try {
    const roomResult = await Api.get("/rooms");
    if (roomResult.success && Array.isArray(roomResult.data)) {
      rooms = roomResult.data;
    }
  } catch (error) {
    console.error("Room loading error:", error);
  }

  // ---------------- MAINTENANCE REQUESTS ----------------
  if (maintenanceBox) {
    try {
      const result = await Api.get("/rooms/maintenance");
      const items =
        result.success && Array.isArray(result.data)
          ? result.data
          : [];

      if (!items.length) {
        maintenanceBox.innerHTML =
          `<div class="empty-state">No maintenance requests.</div>`;
      } else {
        maintenanceBox.innerHTML = items.map(item => {
          const suggestedRoom = findBestRoom(item, rooms);
          const requestId = Number(item.id);

          return `
            <div class="request-card" style="padding:14px;margin-bottom:12px;">
              <div class="request-header">
                <div>
                  <h4>${item.issue_title || "Maintenance Request"}</h4>
                  <p>Student: ${item.student_name || "Student"}</p>
                  <p>Room: ${item.room_number || "Not Allocated"}</p>
                  <p>Priority: ${item.priority || "Normal"}</p>
                </div>
                <span class="status-badge">${item.status || "pending"}</span>
              </div>

              ${smartRoomSuggestion(suggestedRoom)}

              <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                <button class="btn"
                  data-maintenance-id="${requestId}"
                  data-status="in_progress">
                  In Progress
                </button>

                <button class="btn btn-approve"
                  data-maintenance-id="${requestId}"
                  data-status="resolved">
                  Resolved
                </button>
              </div>
            </div>`;
        }).join("");

        maintenanceBox.querySelectorAll("[data-maintenance-id]").forEach(button => {
          button.addEventListener("click", async () => {
            const id = button.dataset.maintenanceId;
            const status = button.dataset.status;

            button.disabled = true;

            try {
              const response = await Api.put(
                `/rooms/maintenance/${id}`,
                { status }
              );

              if (!response.success) {
                alert(response.message || "Unable to update maintenance request.");
                button.disabled = false;
                return;
              }

              alert(
                status === "resolved"
                  ? "Maintenance request resolved."
                  : "Maintenance request moved to In Progress."
              );

              await loadRequestQueues();
            } catch (error) {
              console.error("Maintenance update error:", error);
              alert("Something went wrong while updating the request.");
              button.disabled = false;
            }
          });
        });
      }
    } catch (error) {
      console.error("Maintenance loading error:", error);
      maintenanceBox.innerHTML =
        `<div class="empty-state">Unable to load maintenance requests.</div>`;
    }
  }

  // ---------------- ROOM CHANGE REQUESTS ----------------
  if (roomChangeBox) {
    try {
      const result = await Api.get("/rooms/change-request");
      const items =
        result.success && Array.isArray(result.data)
          ? result.data
          : [];

      if (!items.length) {
        roomChangeBox.innerHTML =
          `<div class="empty-state">No room change requests.</div>`;
      } else {
        // Keep recommendation mapped by request ID for Smart Match action
        Object.keys(wardenRoomSuggestions).forEach(key => {
          delete wardenRoomSuggestions[key];
        });

        items.forEach(item => {
          wardenRoomSuggestions[String(item.id)] =
            findBestRoom(item, rooms);
        });

        roomChangeBox.innerHTML = items.map(item => {
          const suggestedRoom =
            wardenRoomSuggestions[String(item.id)];
          const requestId = Number(item.id);

          return `
            <div class="request-card" style="padding:14px;margin-bottom:12px;">
              <div class="request-header">
                <div>
                  <h4>Room Change Request</h4>
                  <p>Student: ${item.student_name || "Student"}</p>
                  <p>Student ID: ${item.student_code || "—"}</p>
                  <p>Current Room: ${item.current_room_number || "Not Allocated"}</p>
                  <p>Requested Type: ${item.requested_room_type || "Any"}</p>
                </div>
                <span class="status-badge">${item.status || "pending"}</span>
              </div>

              ${smartRoomSuggestion(suggestedRoom)}

              <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                <button class="btn"
                  data-smart-match-id="${requestId}">
                  ✨ Smart Match
                </button>

                <button class="btn btn-approve"
                  data-change-id="${requestId}"
                  data-status="approved">
                  Approve
                </button>

                <button class="btn"
                  data-change-id="${requestId}"
                  data-status="rejected">
                  Reject
                </button>
              </div>
            </div>`;
        }).join("");

        roomChangeBox.querySelectorAll("[data-smart-match-id]").forEach(button => {
          button.addEventListener("click", () => {
            const id = button.dataset.smartMatchId;
            const room = wardenRoomSuggestions[String(id)];

            if (!room) {
              alert("No suitable available room found.");
              return;
            }

            const request = items.find(
              item => String(item.id) === String(id)
            );

            alert(
              `✨ Smart Room Matching\n\n` +
              `Student: ${request?.student_name || "Student"}\n` +
              `Current Room: ${request?.current_room_number || "Not Allocated"}\n\n` +
              `Recommended Room: ${room.block_name || "Block"} ${room.room_number}\n` +
              `Room Type: ${room.room_type || "—"}\n` +
              `Available Beds: ${room.available_beds ?? 0}\n` +
              `Monthly Rent: ₹${room.monthly_rent ?? 0}\n\n` +
              `This is a recommendation. Review it before approving.`
            );
          });
        });

        roomChangeBox.querySelectorAll("[data-change-id]").forEach(button => {
          button.addEventListener("click", async () => {
            const id = button.dataset.changeId;
            const status = button.dataset.status;

            if (
              status === "approved" &&
              !confirm("Approve this room change request?")
            ) return;

            if (
              status === "rejected" &&
              !confirm("Reject this room change request?")
            ) return;

            button.disabled = true;

            try {
              const response = await Api.put(
                `/rooms/change-request/${id}`,
                { status }
              );

              if (!response.success) {
                alert(response.message || "Unable to update room change request.");
                button.disabled = false;
                return;
              }

              alert(
                status === "approved"
                  ? "Room change request approved."
                  : "Room change request rejected."
              );

              await loadRequestQueues();
            } catch (error) {
              console.error("Room change update error:", error);
              alert("Something went wrong while updating the request.");
              button.disabled = false;
            }
          });
        });
      }
    } catch (error) {
      console.error("Room change loading error:", error);
      roomChangeBox.innerHTML =
        `<div class="empty-state">Unable to load room change requests.</div>`;
    }
  }
}

// =========================================================
// INITIAL LOAD
// =========================================================
loadWardenDashboardSummary();
loadRequestQueues();