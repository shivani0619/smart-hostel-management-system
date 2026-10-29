
/**
 * AI Emergency Assistant – Student page
 */

if (!requireAuth("student")) {
  // redirected
}

// ==========================================
// PROFILE
// ==========================================

const profile = Api.getProfile() || {};

const sideName =
  document.getElementById("sideName");

const sideId =
  document.getElementById("sideId");

if (sideName) {
  sideName.textContent =
    profile.full_name || "Student";
}

if (sideId) {
  sideId.textContent =
    "Student ID: " +
    (profile.student_id || "");
}


// ==========================================
// STUDENT MINI PROFILE
// ==========================================

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

    const student = result.data;

    const studentName =
      student.full_name || "Student";

    const studentId =
      student.student_id || "";

    const nameElement =
      document.getElementById(
        "studentMiniName"
      );

    if (nameElement) {
      nameElement.textContent =
        studentName;
    }

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

loadStudentMiniProfile();


// ==========================================
// LOGOUT
// ==========================================

document
  .getElementById("logoutBtn")
  ?.addEventListener(
    "click",
    (e) => {

      e.preventDefault();

      Api.clearAuth();

      window.location.href =
        "roleselection.html";
    }
  );


// ==========================================
// MOBILE SIDEBAR
// ==========================================

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


// ==========================================
// SOS ELEMENTS
// ==========================================

const descEl =
  document.getElementById(
    "sosDescription"
  );

const charCount =
  document.getElementById(
    "charCount"
  );

const classifyBtn =
  document.getElementById(
    "classifyBtn"
  );

const sendSosBtn =
  document.getElementById(
    "sendSosBtn"
  );

const classifyResult =
  document.getElementById(
    "classifyResult"
  );

const sosResult =
  document.getElementById(
    "sosResult"
  );

let lastClassification = null;


// ==========================================
// TYPE LABELS
// ==========================================

const TYPE_LABELS = {

  medical:
    "Medical Emergency",

  fire:
    "Fire Emergency",

  security:
    "Security Emergency",

  accident:
    "Accident",

  general:
    "General Assistance",

  other:
    "Other",

};


// ==========================================
// CHARACTER COUNT
// ==========================================

descEl?.addEventListener(
  "input",
  () => {

    if (charCount) {

      charCount.textContent =
        descEl.value.length;

    }

  }
);


// ==========================================
// CLASSIFICATION
// ==========================================

function renderClassification(c) {

  if (!classifyResult || !c) {
    return;
  }

  classifyResult.classList.remove(
    "hidden"
  );

  const label =
    c.label ||
    TYPE_LABELS[c.emergency_type] ||
    c.emergency_type;

  classifyResult.innerHTML = `

    <strong>Detected:</strong>

    <span class="type-badge">
      ${label}
    </span>

    <span class="priority-badge priority-${c.priority}">
      ${c.priority}
    </span>

    <span style="margin-left:8px;opacity:.8">
      Confidence:
      ${Math.round(
        (c.confidence || 0) * 100
      )}%
    </span>

    <p style="
      margin:8px 0 0;
      font-size:0.8rem
    ">
      ${c.safety_note || ""}
    </p>

  `;
}


// ==========================================
// ANALYZE BUTTON
// ==========================================

classifyBtn?.addEventListener(
  "click",
  async () => {

    const description =
      (descEl?.value || "").trim();

    if (description.length < 5) {

      alert(
        "Please describe the emergency (at least a few words)."
      );

      return;
    }

    classifyBtn.disabled = true;

    classifyBtn.textContent =
      "Analyzing...";

    const r =
      await Api.post(
        "/emergencies/classify",
        {
          description
        }
      );

    classifyBtn.disabled = false;

    classifyBtn.textContent =
      "Analyze";

    if (r.success) {

      lastClassification =
        r.data;

      renderClassification(
        r.data
      );

    } else {

      alert(
        r.message ||
        "Classification failed"
      );

    }

  }
);


// ==========================================
// SEND SOS
// ==========================================

sendSosBtn?.addEventListener(
  "click",
  async () => {

    const description =
      (descEl?.value || "").trim();

    if (description.length < 5) {

      alert(
        "Please describe the emergency before sending SOS."
      );

      return;
    }

    sosResult?.classList.add(
      "hidden"
    );

    sendSosBtn.disabled = true;

    sendSosBtn.textContent =
      "Sending...";


    // Classify first if needed

    if (!lastClassification) {

      const cr =
        await Api.post(
          "/emergencies/classify",
          {
            description
          }
        );

      if (cr.success) {

        lastClassification =
          cr.data;

        renderClassification(
          cr.data
        );

      }

    }


    const payload = {

      description,

      emergency_type:
        lastClassification?.emergency_type,

      priority:
        lastClassification?.priority,

      confidence:
        lastClassification?.confidence,

    };


    let r =
      await Api.post(
        "/emergencies",
        payload
      );


    // Duplicate active SOS

    if (
      !r.success &&
      r.message &&
      r.message.includes(
        "active high-priority"
      )
    ) {

      const force =
        confirm(
          r.message +
          "\n\nIs this a genuinely NEW emergency? Click OK to send anyway."
        );

      if (force) {

        payload.force = true;

        r =
          await Api.post(
            "/emergencies",
            payload
          );

      }

    }


    sendSosBtn.disabled = false;

    sendSosBtn.textContent =
      "🚨 SEND SOS";


    if (!sosResult) {
      return;
    }


    if (r.success) {

      const d =
        r.data || {};


      // Show success message

      showSOSNotification(d);


      // Clear input

      if (descEl) {
        descEl.value = "";
      }

      if (charCount) {
        charCount.textContent =
          "0";
      }

      lastClassification =
        null;


      // Reload history immediately

      await loadHistory();

    } else {

      sosResult.className =
        "sos-result error";

      sosResult.classList.remove(
        "hidden"
      );

      sosResult.textContent =
        r.message ||
        "Failed to send SOS";

    }

  }
);


// ==========================================
// SHOW SOS NOTIFICATION
// ==========================================

function showSOSNotification(d) {

  if (!sosResult) {
    return;
  }

  const type =
    TYPE_LABELS[d.emergency_type] ||
    d.emergency_type ||
    "General Assistance";

  const priority =
    d.priority ||
    "normal";

  const status =
    d.status ||
    "pending";


  sosResult.className =
    "sos-result success";

  sosResult.classList.remove(
    "hidden"
  );


  sosResult.innerHTML = `

    <strong>
      ✅ SOS Request Sent
    </strong>

    <br>

    Type:
    ${type}

    <br>

    Priority:

    <span class="priority-badge priority-${priority}">
      ${priority}
    </span>

    <br>

    Status:

    <span class="status-badge status-${status}">
      ${status}
    </span>

    <br>

    <small>
      Warden and linked parent have been notified.
    </small>

    ${
      d.safety_note
        ? `
          <p style="
            margin-top:8px;
            font-size:0.8rem
          ">
            ${d.safety_note}
          </p>
        `
        : ""
    }

  `;
}


// ==========================================
// LOAD SOS HISTORY
// ==========================================

async function loadHistory() {

  try {

    console.log(
      "🔄 Loading SOS history..."
    );


    const r =
      await Api.get(
        "/emergencies/my"
      );


    console.log(
      "🚨 Emergency API:",
      r
    );


    const empty =
      document.getElementById(
        "historyEmpty"
      );

    const table =
      document.getElementById(
        "historyTable"
      );

    const body =
      document.getElementById(
        "historyBody"
      );


    if (!body) {

      console.error(
        "❌ historyBody not found"
      );

      return;
    }


    if (
      !r ||
      !r.success
    ) {

      console.error(
        "❌ Emergency API failed:",
        r
      );

      return;
    }


    const emergencies =
      Array.isArray(r.data)
        ? r.data
        : [];


    // No records

    if (
      emergencies.length === 0
    ) {

      body.innerHTML = "";

      if (table) {
        table.classList.add(
          "hidden"
        );
      }

      if (empty) {

        empty.textContent =
          "No emergency requests yet.";

        empty.classList.remove(
          "hidden"
        );

      }

      return;
    }


    // Records available

    if (empty) {

      empty.classList.add(
        "hidden"
      );

    }


    if (table) {

      table.classList.remove(
        "hidden"
      );

    }


    // Clear table

    body.innerHTML = "";


    // Render ALL records

    emergencies.forEach(
      (e) => {

        const tr =
          document.createElement(
            "tr"
          );
const createdAt = e.created_at
  ? new Date(e.created_at + "Z").toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    })
  : "—";
        const type =
          TYPE_LABELS[
            e.emergency_type
          ] ||
          e.emergency_type ||
          "General Assistance";


        const priority =
          e.priority ||
          "normal";


        const status =
          e.status ||
          "pending";


        const description =
          e.description ||
          "No description";


        tr.innerHTML = `

          <td>
            ${createdAt}
          </td>

          <td>
            ${type}
          </td>

          <td>
            <span
              class="
                priority-badge
                priority-${priority}
              "
            >
              ${priority}
            </span>
          </td>

          <td>
            <span
              class="
                status-badge
                status-${status}
              "
            >
              ${status}
            </span>
          </td>

          <td>
            ${description.slice(
              0,
              80
            )}
            ${
              description.length > 80
                ? "…"
                : ""
            }
          </td>

        `;


        body.appendChild(
          tr
        );

      }
    );


    console.log(
      `✅ ${emergencies.length} SOS records displayed`
    );


    // Restore latest notification

    showSOSNotification(
      emergencies[0]
    );


  } catch (error) {

    console.error(
      "❌ loadHistory error:",
      error
    );

  }

}


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "🚀 Emergency page loaded"
    );

    // Load ALL old SOS records
    await loadHistory();

  }
);


// ==========================================
// REAL-TIME REFRESH
// ==========================================

setInterval(
  async () => {

    await loadHistory();

  },
  5000
);
