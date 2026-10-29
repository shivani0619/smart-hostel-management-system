document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth("student")) return;

  // ==========================================
  // COMMON ELEMENTS
  // ==========================================
  const form = document.getElementById("leaveRequestForm");
  const leaveHistory = document.getElementById("leaveHistory");
  const emptyHistory = document.getElementById("emptyHistory");
  const totalRequests = document.getElementById("totalRequests");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.querySelector(".sidebar");
  // ==========================================
// STUDENT MINI PROFILE
// ==========================================
async function loadStudentMiniProfile() {

  try {

    // Check API helper
    if (typeof Api === "undefined") {
      console.error("Api is not loaded. Check api.js script.");
      return;
    }

    const result =
      await Api.get("/students/me");

    if (
      !result ||
      !result.success ||
      !result.data
    ) {
      console.warn(
        "Unable to load student profile:",
        result
      );
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


    // ======================================
    // STUDENT NAME
    // ======================================

    const nameElement =
      document.getElementById(
        "studentMiniName"
      );

    if (nameElement) {
      nameElement.textContent =
        studentName;
    }


    // ======================================
    // STUDENT ID
    // ======================================

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


    // ======================================
    // STUDENT AVATAR
    // ======================================

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
  // ==========================================
  // SIDEBAR
  // ==========================================
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }

  // ==========================================
  // DATE SETTINGS
  // ==========================================
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");

  const today = new Date().toISOString().split("T")[0];

  if (fromDate) {
    fromDate.min = today;
  }

  if (toDate) {
    toDate.min = today;
  }

  if (fromDate && toDate) {
    fromDate.addEventListener("change", function () {
      toDate.min = fromDate.value;

      if (toDate.value && toDate.value < fromDate.value) {
        toDate.value = fromDate.value;
      }
    });
  }

  // ==========================================
  // LEAVE BALANCE
  // ==========================================
  async function loadLeaveBalance() {
    try {
      const result = await Api.get("/leaves/balance");

      if (!result.success || !result.data) return;

      const data = result.data;

      const total = data.total_available ?? 0;

      const circle = document.querySelector(".balance-circle strong");
      const note = document.querySelector(".balance-main p");

      if (circle) {
        circle.textContent = String(total);
      }

      if (note) {
        note.textContent =
          "Available leave days for this academic year.";
      }

      const items = data.items || {};

      const renderItem = (key, label) => {
        const item = items[key];

        if (!item) return;

        const wrappers =
          document.querySelectorAll(".balance-item");

        const match = Array.from(wrappers).find((el) =>
          (el.textContent || "")
            .toLowerCase()
            .includes(label.toLowerCase())
        );

        if (!match) return;

        const value = match.querySelector("strong");

        if (value) {
          value.textContent = String(item.available ?? 0);
        }

        const small = match.querySelector("small");

        if (small) {
          small.textContent =
            `${item.used ?? 0} of ${item.total ?? 0} days used`;
        }

        const progress = match.nextElementSibling;

        if (
          progress &&
          progress.classList.contains("progress")
        ) {
          const usedPercent = item.total
            ? Math.min(
                100,
                ((item.used || 0) / item.total) * 100
              )
            : 0;

          const span = progress.querySelector("span");

          if (span) {
            span.style.width = `${usedPercent}%`;
          }
        }
      };

      renderItem("personal", "Personal Leave");
      renderItem("medical", "Medical Leave");
      renderItem("emergency", "Emergency Leave");

    } catch (error) {
      console.error("Leave balance error:", error);
    }
  }

  // ==========================================
  // STATUS TEXT
  // ==========================================
  function getStatusText(status) {
    const statusMap = {
      pending: "Pending Parent Approval",
      parent_approved: "Parent Approved",
      parent_rejected: "Rejected by Parent",
      approved: "Approved",
      rejected: "Rejected",
      warden_rejected: "Rejected by Warden"
    };

    return statusMap[status] || status || "Pending";
  }

  // ==========================================
  // LOAD LEAVE HISTORY
  // ==========================================
  async function loadLeaves() {
    try {
      const result = await Api.get("/leaves/me");

      if (!result.success) return;

      const leaves = result.data || [];

      if (totalRequests) {
        totalRequests.textContent = leaves.length;
      }

      if (!leaveHistory) return;

      leaveHistory.innerHTML = "";

      if (leaves.length === 0) {
        if (emptyHistory) {
          emptyHistory.style.display = "block";
        }

        return;
      }

      if (emptyHistory) {
        emptyHistory.style.display = "none";
      }

      leaves.forEach((l) => {
        const tr = document.createElement("tr");

        const statusText = getStatusText(l.status);

        let remark = "";

        if (
          l.status === "rejected" ||
          l.status === "parent_rejected" ||
          l.status === "warden_rejected"
        ) {
          remark = `
            <br>
            <small>
              Reason:
              ${l.review_remark || "No rejection reason provided."}
            </small>
          `;
        }

        tr.innerHTML = `
          <td>${l.leave_type || ""}</td>

          <td>
            ${l.from_date || ""}
            →
            ${l.to_date || ""}
          </td>

          <td>
            ${l.destination || "—"}
          </td>

          <td>
            ${l.created_at
              ? l.created_at.slice(0, 10)
              : ""}
          </td>

          <td>
            <span class="status-pill status-${l.status || "pending"}">
              ${statusText}
            </span>
            ${remark}
          </td>
        `;

        leaveHistory.appendChild(tr);
      });

    } catch (error) {
      console.error("Leave history error:", error);
    }
  }

  // ==========================================
  // AI LEAVE ASSISTANT
  // ==========================================

  const aiMessages = document.getElementById("aiLeaveMessages");
  const aiInput = document.getElementById("aiLeaveInput");
  const aiSendBtn = document.getElementById("aiLeaveSend");
  const aiQuickOptions =
    document.getElementById("aiLeaveQuickOptions");

  let aiStep = 0;

  const aiData = {
    leave_type: "",
    from_date: "",
    to_date: "",
    destination: "",
    parent_contact: "",
    reason: ""
  };

  const aiQuestions = [
    {
      key: "leave_type",
      question:
        "What type of leave do you need?",
      options: [
        "Personal",
        "Medical",
        "Home",
        "Emergency",
        "Other"
      ]
    },
    {
      key: "from_date",
      question:
        "From which date do you need leave?",
      type: "date"
    },
    {
      key: "to_date",
      question:
        "Until which date do you need leave?",
      type: "date"
    },
    {
      key: "destination",
      question:
        "Where will you be going during your leave?",
      type: "text"
    },
    {
      key: "parent_contact",
      question:
        "Please enter your parent's 10-digit contact number.",
      type: "tel"
    },
    {
      key: "reason",
      question:
        "Finally, tell me the reason for your leave.",
      type: "text"
    }
  ];

  function addAIMessage(message, type = "bot") {
    if (!aiMessages) return;

    const div = document.createElement("div");

    div.className =
      type === "user"
        ? "ai-message user-message"
        : "ai-message bot-message";

    div.textContent = message;

    aiMessages.appendChild(div);

    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function clearQuickOptions() {
    if (aiQuickOptions) {
      aiQuickOptions.innerHTML = "";
    }
  }

  function showQuickOptions(options) {
    if (!aiQuickOptions) return;

    clearQuickOptions();

    options.forEach((option) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "ai-option-btn";
      button.textContent = option;

      button.addEventListener("click", () => {
        handleAIAnswer(option);
      });

      aiQuickOptions.appendChild(button);
    });
  }

  function showAIInput(type = "text") {
    if (!aiInput) return;

    aiInput.type = type;

    aiInput.value = "";

    if (type === "tel") {
      aiInput.placeholder = "Enter 10-digit number";
      aiInput.maxLength = 10;
    } else if (type === "date") {
      aiInput.placeholder = "";
    } else {
      aiInput.placeholder = "Type your answer...";
    }

    aiInput.style.display = "block";

    if (aiSendBtn) {
      aiSendBtn.style.display = "flex";
    }

    setTimeout(() => {
      aiInput.focus();
    }, 100);
  }

  function hideAIInput() {
    if (aiInput) {
      aiInput.style.display = "none";
    }

    if (aiSendBtn) {
      aiSendBtn.style.display = "none";
    }
  }

  function askAIStep() {
    if (aiStep >= aiQuestions.length) {
      showAISummary();
      return;
    }

    const current = aiQuestions[aiStep];

    addAIMessage(current.question, "bot");

    if (current.options) {
      hideAIInput();
      showQuickOptions(current.options);
    } else {
      clearQuickOptions();
      showAIInput(current.type || "text");
    }
  }
function handleAIAnswer(answer) {
  if (!answer) return;

  const current = aiQuestions[aiStep];

  if (!current) return;

  answer = String(answer).trim();

  // ==========================================
  // VALIDATE PHONE NUMBER
  // ==========================================
  if (current.key === "parent_contact") {
    if (!/^[0-9]{10}$/.test(answer)) {
      addAIMessage(
        "Please enter a valid 10-digit parent contact number."
      );
      return;
    }
  }

  // ==========================================
  // VALIDATE DATES
  // ==========================================
  if (
    current.key === "from_date" ||
    current.key === "to_date"
  ) {
    if (!answer) {
      addAIMessage("Please select a valid date.");
      return;
    }
  }

  // ==========================================
  // AI REASON CONVERSION
  // ==========================================
  if (current.key === "reason") {

    const originalReason = answer;

    const lowerReason =
      answer.toLowerCase().trim();

    let convertedReason = "";

    if (lowerReason.includes("fever")) {
      convertedReason =
        "I am suffering from fever.";
    }

    else if (lowerReason.includes("headache")) {
      convertedReason =
        "I am suffering from a headache.";
    }

    else if (lowerReason.includes("cold")) {
      convertedReason =
        "I am suffering from a cold.";
    }

    else if (lowerReason.includes("cough")) {
      convertedReason =
        "I am suffering from a cough.";
    }

    else if (
      lowerReason.includes("stomach pain") ||
      lowerReason.includes("stomachache")
    ) {
      convertedReason =
        "I am suffering from stomach pain.";
    }

    else if (
      lowerReason.includes("not feeling well") ||
      lowerReason.includes("unwell")
    ) {
      convertedReason =
        "I am not feeling well and need leave to rest.";
    }

    else if (
      lowerReason.includes("family function")
    ) {
      convertedReason =
        "I need leave to attend a family function.";
    }

    else if (
      lowerReason.includes("marriage") ||
      lowerReason.includes("wedding")
    ) {
      convertedReason =
        "I need leave to attend a marriage function.";
    }

    else if (lowerReason.includes("family")) {
      convertedReason =
        "I need leave due to a family-related matter.";
    }

    else if (
      lowerReason === "home" ||
      lowerReason.includes("going home") ||
      lowerReason.includes("go home")
    ) {
      convertedReason =
        "I need leave to go home.";
    }

    else if (lowerReason.includes("hospital")) {
      convertedReason =
        "I need leave to visit the hospital for medical treatment.";
    }

    else if (
      lowerReason.includes("doctor") ||
      lowerReason.includes("doctor appointment")
    ) {
      convertedReason =
        "I need leave to attend a doctor's appointment.";
    }

    else if (lowerReason.includes("emergency")) {
      convertedReason =
        "I need leave due to a personal emergency.";
    }

    else if (lowerReason.includes("college work")) {
      convertedReason =
        "I need leave to attend to some college-related work.";
    }

    else if (lowerReason.includes("temple")) {
      convertedReason =
        "I need leave to attend a family religious function.";
    }

    else if (
      lowerReason.length <= 40 &&
      !lowerReason.endsWith(".")
    ) {
      convertedReason =
        `I need leave because of ${lowerReason}.`;
    }

    else {
      convertedReason =
        originalReason.endsWith(".")
          ? originalReason
          : `${originalReason}.`;
    }

    aiData.reason = convertedReason;

    addAIMessage(
      originalReason,
      "user"
    );

    addAIMessage(
      `I've prepared the reason as: "${convertedReason}"`
    );

    clearQuickOptions();
    hideAIInput();

    aiStep++;

    setTimeout(() => {
      askAIStep();
    }, 700);

    return;
  }

  // ==========================================
  // NORMAL ANSWERS
  // ==========================================

  aiData[current.key] = answer;

  addAIMessage(
    answer,
    "user"
  );

  clearQuickOptions();
  hideAIInput();

  aiStep++;

  setTimeout(() => {
    askAIStep();
  }, 400);
}
  function showAISummary() {
    hideAIInput();
    clearQuickOptions();

    addAIMessage(
      "Great! I have collected all the details for your leave request."
    );

    const summary = `
Leave Type: ${aiData.leave_type}
From: ${aiData.from_date}
To: ${aiData.to_date}
Destination: ${aiData.destination}
Parent Contact: ${aiData.parent_contact}
Reason: ${aiData.reason}
`;

    addAIMessage(summary);

    if (aiQuickOptions) {
      const fillButton = document.createElement("button");

      fillButton.type = "button";
      fillButton.className = "ai-confirm-btn";
      fillButton.textContent = "✓ Fill Leave Form";

      fillButton.addEventListener("click", fillLeaveForm);

      aiQuickOptions.appendChild(fillButton);

      const restartButton = document.createElement("button");

      restartButton.type = "button";
      restartButton.className = "ai-option-btn";
      restartButton.textContent = "↻ Start Again";

      restartButton.addEventListener("click", restartAI);

      aiQuickOptions.appendChild(restartButton);
    }
  }

  function fillLeaveForm() {
    const leaveType =
      document.getElementById("leaveType");

    const from =
      document.getElementById("fromDate");

    const to =
      document.getElementById("toDate");

    const destination =
      document.getElementById("destination");

    const parentContact =
      document.getElementById("parentContact");

    const reason =
      document.getElementById("leaveReason");

    if (leaveType) {
      const typeMap = {
        Personal: "personal",
        Medical: "medical",
        Home: "home",
        Emergency: "emergency",
        Other: "other"
      };

      leaveType.value =
        typeMap[aiData.leave_type] ||
        aiData.leave_type.toLowerCase();
    }

    if (from) {
      from.value = aiData.from_date;
    }

    if (to) {
      to.value = aiData.to_date;
    }

    if (destination) {
      destination.value = aiData.destination;
    }

    if (parentContact) {
      parentContact.value = aiData.parent_contact;
    }

    if (reason) {
      reason.value = aiData.reason;
    }

    addAIMessage(
      "Done! I filled the leave form for you. Please review all the details before submitting."
    );

    // Scroll to form
    if (form) {
      form.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }

  function restartAI() {
    aiStep = 0;

    aiData.leave_type = "";
    aiData.from_date = "";
    aiData.to_date = "";
    aiData.destination = "";
    aiData.parent_contact = "";
    aiData.reason = "";

    if (aiMessages) {
      aiMessages.innerHTML = "";
    }

    hideAIInput();
    clearQuickOptions();

    startAI();
  }

  function startAI() {
    if (!aiMessages) return;

    if (aiMessages.children.length === 0) {
      addAIMessage(
        "Hi! 👋 I'm your AI Leave Assistant."
      );

      addAIMessage(
        "I can help you fill your leave request step by step. You can review everything before submitting."
      );

      setTimeout(() => {
        askAIStep();
      }, 500);
    }
  }

  if (aiSendBtn) {
    aiSendBtn.addEventListener("click", () => {
      const value =
        aiInput ? aiInput.value.trim() : "";

      if (!value) return;

      handleAIAnswer(value);
    });
  }

  if (aiInput) {
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (aiSendBtn) {
          aiSendBtn.click();
        }
      }
    });
  }

  // Start assistant
  startAI();

  // ==========================================
  // NORMAL FORM SUBMISSION
  // ==========================================
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const leaveType =
        document.getElementById("leaveType");

      const from =
        document.getElementById("fromDate");

      const to =
        document.getElementById("toDate");

      const destination =
        document.getElementById("destination");

      const parentContact =
        document.getElementById("parentContact");

      const reason =
        document.getElementById("leaveReason");

      const payload = {
        leave_type: leaveType
          ? leaveType.value
          : "",

        from_date: from
          ? from.value
          : "",

        to_date: to
          ? to.value
          : "",

        destination: destination
          ? destination.value
          : null,

        parent_contact: parentContact
          ? parentContact.value
          : null,

        reason: reason
          ? reason.value
          : ""
      };

      // Basic validation
      if (!payload.leave_type) {
        alert("Please select a leave type.");
        return;
      }

      if (!payload.from_date || !payload.to_date) {
        alert("Please select the leave dates.");
        return;
      }

      if (
        new Date(payload.to_date) <
        new Date(payload.from_date)
      ) {
        alert("To date cannot be before From date.");
        return;
      }

      if (
        payload.parent_contact &&
        !/^[0-9]{10}$/.test(payload.parent_contact)
      ) {
        alert(
          "Please enter a valid 10-digit parent contact number."
        );
        return;
      }

      const btn =
        document.getElementById("submitLeaveBtn") ||
        form.querySelector('button[type="submit"]');

      if (btn) {
        btn.disabled = true;
        btn.textContent = "Submitting...";
      }

      try {
        const result =
          await Api.post("/leaves", payload);

        if (result.success) {
          form.reset();

          await loadLeaves();
          await loadLeaveBalance();

          const modal =
            document.getElementById("successModal");

          if (modal) {
            modal.style.display = "flex";
          }

        } else {
          alert(
            result.message ||
            "Failed to submit leave request."
          );
        }

      } catch (error) {
        console.error(
          "Leave submission error:",
          error
        );

        alert(
          "Something went wrong while submitting your leave request."
        );

      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Submit Leave";
        }
      }
    });
  }

  // ==========================================
  // SUCCESS MODAL
  // ==========================================
  const closeModal =
    document.getElementById("closeSuccessModal");

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      const modal =
        document.getElementById("successModal");

      if (modal) {
        modal.style.display = "none";
      }
    });
  }
// ==========================================
// INITIAL LOAD
// ==========================================
loadLeaveBalance();
loadLeaves();
loadStudentMiniProfile();
});
