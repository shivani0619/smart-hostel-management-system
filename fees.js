function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hasValidRole() {
  const user = Api.getUser();
  const token = Api.getToken();

  if (!token || !user || !["student", "parent"].includes(user.role)) {
    window.location.href = "roleselection.html";
    return false;
  }

  return true;
}


// ==========================================
// GET PAYMENT STATUS
// ==========================================

function getPaymentStatus(fee) {
  const amountDue = Number(fee.amount_due || 0);
  const amountPaid = Number(fee.amount_paid || 0);

  if (amountPaid >= amountDue && amountDue > 0) {
    return "Paid";
  }

  if (amountPaid > 0 && amountPaid < amountDue) {
    return "Partially Paid";
  }

  return "Not Paid";
}


// ==========================================
// LOAD FEES
// ==========================================

async function loadFees() {
  if (!hasValidRole()) return;

  const state = document.getElementById("feeState");
  const table = document.getElementById("feeTable");
  const body = document.getElementById("feeBody");

  const user = Api.getUser();

  const result = await Api.get("/fees/me");

  if (!result.success) {
    state.textContent =
      result.message || "Unable to load fees. Please try again.";
    return;
  }

  const fees = Array.isArray(result.data) ? result.data : [];

  if (!fees.length) {
    state.textContent = "No fee records found.";
    return;
  }


  // ==========================================
  // CALCULATE TOTALS
  // ==========================================

  let totalFees = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;

  fees.forEach((fee) => {
    const amountDue = Number(fee.amount_due || 0);
    const amountPaid = Number(fee.amount_paid || 0);

    const balance = Math.max(amountDue - amountPaid, 0);

    totalFees += amountDue;
    totalPaid += amountPaid;
    totalOutstanding += balance;
  });


  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const totalDueElement = document.getElementById("totalDue");
  const totalPaidElement = document.getElementById("totalPaid");
  const totalBalanceElement = document.getElementById("totalBalance");

  if (totalDueElement) {
    totalDueElement.textContent = formatMoney(totalFees);
  }

  if (totalPaidElement) {
    totalPaidElement.textContent = formatMoney(totalPaid);
  }

  if (totalBalanceElement) {
    totalBalanceElement.textContent = formatMoney(totalOutstanding);
  }


  // ==========================================
  // FEE TABLE
  // ==========================================

  body.innerHTML = fees
    .map((fee) => {
      const amountDue = Number(fee.amount_due || 0);
      const amountPaid = Number(fee.amount_paid || 0);

      const balance = Math.max(amountDue - amountPaid, 0);

      const paymentStatus = getPaymentStatus(fee);

      return `
        <tr>

          <td>
            ${escapeHtml(
              user.role === "parent"
                ? fee.student_name || "Linked student"
                : "My account"
            )}
          </td>

          <td>
            ${escapeHtml(fee.fee_name || "Fee")}
          </td>

          <td>
            ${escapeHtml(fee.due_date || "Not set")}
          </td>

          <td>
            ${formatMoney(amountDue)}
          </td>

          <td>
            ${formatMoney(amountPaid)}
          </td>

          <td>
            ${formatMoney(balance)}
          </td>

          <td class="fee-status">
            ${escapeHtml(paymentStatus)}
          </td>

        </tr>
      `;
    })
    .join("");


  // ==========================================
  // SHOW TABLE
  // ==========================================

  state.hidden = true;
  table.hidden = false;
}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", loadFees);
// ==========================================
// LOAD STUDENT MINI PROFILE
// ==========================================

async function loadStudentMiniProfile() {
  try {
    const result = await Api.get("/students/me");

    if (!result || !result.success || !result.data) {
      console.warn("Unable to load student profile:", result);
      return;
    }

    const student = result.data;

    const studentName = student.full_name || "Student";
    const studentId = student.student_id || "—";

    // Student Name
    const nameElement = document.getElementById("studentMiniName");

    if (nameElement) {
      nameElement.textContent = studentName;
    }

    // Student ID
    const idElement = document.getElementById("studentMiniId");

    if (idElement) {
      idElement.textContent = `Student ID: ${studentId}`;
    }

    // Avatar initials
    const avatar = document.getElementById("profileAvatar");

    if (avatar) {
      const parts = studentName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      let initials = "ST";

      if (parts.length === 1) {
        initials = parts[0]
          .substring(0, 2)
          .toUpperCase();
      } else {
        initials = (
          parts[0][0] +
          parts[parts.length - 1][0]
        ).toUpperCase();
      }

      const onlineDot = avatar.querySelector(".online-dot");

      avatar.textContent = initials;

      if (onlineDot) {
        avatar.appendChild(onlineDot);
      }
    }

  } catch (error) {
    console.error("Student mini profile error:", error);
  }
}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  await loadStudentMiniProfile();
  await loadFees();
});