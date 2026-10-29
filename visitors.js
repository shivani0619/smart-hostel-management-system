
// ==========================================================
// STUDENT VISITORS
// View visitor details only
// Visitor registration is done by Warden
// ==========================================================


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==========================================================
// CHECK STUDENT LOGIN
// ==========================================================

function requireStudent() {
  const user = Api.getUser();

  if (!Api.getToken() || !user || user.role !== "student") {
    window.location.href = "roleselection.html";
    return false;
  }

  return true;
}


// ==========================================================
// STATUS DISPLAY
// ==========================================================

function getStatusLabel(status) {

  switch (status) {

    case "expected":
      return "Waiting / Approved";

    case "checked_in":
      return "Entry Allowed";

    case "checked_out":
      return "Visitor Exited";

    case "cancelled":
      return "Rejected";

    default:
      return "Unknown";
  }
}


// ==========================================================
// LOAD MY VISITORS
// ==========================================================

async function loadVisitors() {

  if (!requireStudent()) return;

  const state = document.getElementById("visitorState");
  const table = document.getElementById("visitorTable");
  const body = document.getElementById("visitorBody");

  if (!state || !table || !body) {
    console.error("Visitor page elements not found.");
    return;
  }

  state.hidden = false;
  table.hidden = true;
  state.textContent = "Loading visitors...";


  try {

    const result = await Api.get("/visitors/me");

    console.log("Student visitors response:", result);


    if (!result.success) {

      state.textContent =
        result.message ||
        "Unable to load visitors. Please try again.";

      return;
    }


    const visitors =
      Array.isArray(result.data)
        ? result.data
        : [];


    // ======================================================
    // NO VISITORS
    // ======================================================

    if (!visitors.length) {

      state.textContent =
        "No visitor records found.";

      return;
    }


    // ======================================================
    // DISPLAY VISITORS
    // ======================================================

    body.innerHTML = visitors.map(visitor => {

      return `
        <tr>

          <td>
            ${escapeHtml(visitor.visitor_name)}
          </td>

          <td>
            ${escapeHtml(
              visitor.relation || "Not provided"
            )}
          </td>

          <td>
            ${escapeHtml(
              visitor.phone || "Not provided"
            )}
          </td>

          <td>
            ${escapeHtml(
              visitor.purpose || "Not provided"
            )}
          </td>

          <td>
            ${escapeHtml(
              visitor.visit_date || "Not provided"
            )}
          </td>

          <td>
            ${escapeHtml(
              getStatusLabel(visitor.status)
            )}
          </td>

        </tr>
      `;

    }).join("");


    state.hidden = true;
    table.hidden = false;

  } catch (error) {

    console.error(
      "Visitor loading error:",
      error
    );

    state.textContent =
      "Unable to load visitors. Please try again.";
  }
}


// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadVisitors();

  }
);

