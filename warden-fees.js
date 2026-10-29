if (!requireAuth("warden")) {}


// ===============================
// FORMAT MONEY
// ===============================
function formatMoney(value) {
    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });
}


// ===============================
// LOAD STUDENTS
// ===============================
async function loadFeeStudents() {

    const select =
        document.getElementById("feeStudent");

    if (!select) return;

    const result =
        await Api.get("/students");

    const students =
        result.success
            ? (
                Array.isArray(result.data)
                    ? result.data
                    : (result.data?.items || [])
            )
            : [];

    if (!students.length) {

        select.innerHTML =
            `<option value="">No students found</option>`;

        return;
    }

    select.innerHTML = `
        <option value="">Select student</option>

        ${students.map(student => `

            <option value="${student.id}">

                ${student.full_name || "Student"}

                (${student.student_id || "—"})

            </option>

        `).join("")}
    `;
}


// ===============================
// LOAD FEE STRUCTURES
// ===============================
async function loadFeeStructures() {

    const select =
        document.getElementById("feeStructure");

    if (!select) return;

    const result =
        await Api.get("/fees/structures");

    const fees =
        result.success &&
        Array.isArray(result.data)
            ? result.data
            : [];

    if (!fees.length) {

        select.innerHTML = `
            <option value="">
                No fee structures found
            </option>
        `;

        return;
    }

    select.innerHTML = `
        <option value="">Select fee</option>

        ${fees.map(fee => `

            <option value="${fee.id}">

                ${fee.name}
                -
                ${formatMoney(fee.amount)}

            </option>

        `).join("")}
    `;
}


// ===============================
// ASSIGN FEE
// ===============================
async function assignFee() {

    const studentId =
        document.getElementById("feeStudent").value;

    const feeStructureId =
        document.getElementById("feeStructure").value;

    const message =
        document.getElementById("assignMessage");

    if (!studentId) {

        message.textContent =
            "Please select a student.";

        return;
    }

    if (!feeStructureId) {

        message.textContent =
            "Please select a fee.";

        return;
    }

    message.textContent =
        "Assigning fee...";

    const result =
        await Api.post(
            "/fees/assign",
            {
                student_id: Number(studentId),
                fee_structure_id: Number(feeStructureId)
            }
        );

    if (!result.success) {

        message.textContent =
            result.message ||
            "Unable to assign fee.";

        return;
    }

    message.textContent =
        "Fee assigned successfully.";

    document.getElementById("feeStudent").value = "";

    document.getElementById("feeStructure").value = "";

    await loadAssignedFees();
}


// ===============================
// PARENT RESPONSE DISPLAY
// ===============================
function getParentResponseHTML(response) {

    const value =
        String(response || "not_responded").toLowerCase();

    if (value === "paid") {

        return `
            <span
                class="status paid"
                style="
                    background:#dcfce7;
                    color:#166534;
                "
            >
                <i class="fa-solid fa-circle-check"></i>
                Paid
            </span>
        `;
    }

    if (value === "not_paid") {

        return `
            <span
                class="status pending"
                style="
                    background:#fff3cd;
                    color:#946c00;
                "
            >
                <i class="fa-solid fa-circle-xmark"></i>
                Not Paid
            </span>
        `;
    }

    return `
        <span
            class="status"
            style="
                background:#f1f5f9;
                color:#64748b;
            "
        >
            <i class="fa-solid fa-clock"></i>
            No Response
        </span>
    `;
}


// ===============================
// LOAD ASSIGNED FEES
// ===============================
async function loadAssignedFees() {

    const loading =
        document.getElementById("feeLoading");

    const table =
        document.getElementById("feeTable");

    const body =
        document.getElementById("feeTableBody");

    if (!loading || !table || !body) {
        return;
    }

    loading.textContent =
        "Loading fee records...";

    table.hidden = true;

    const result =
        await Api.get("/fees/warden");

    if (!result.success) {

        loading.textContent =
            result.message ||
            "Unable to load fee records.";

        return;
    }

    const fees =
        Array.isArray(result.data)
            ? result.data
            : [];

    if (!fees.length) {

        loading.textContent =
            "No fee records found.";

        return;
    }


    // ===============================
    // DISPLAY TABLE
    // ===============================

    body.innerHTML = fees.map(fee => {

        return `
            <tr>

                <td>
                    ${fee.student_id_code || "—"}
                </td>

                <td>
                    ${fee.student_name || "—"}
                </td>

                <td>
                    ${fee.fee_name || "—"}
                </td>

                <td>
                    ${formatMoney(fee.amount_due)}
                </td>

                <td>
                    ${formatMoney(fee.amount_paid)}
                </td>

                <td>
                    ${formatMoney(fee.balance)}
                </td>

                <td>
                    ${fee.due_date || "—"}
                </td>

                <td>

                    <span class="status ${fee.status || "pending"}">

                        ${fee.status || "pending"}

                    </span>

                </td>

                <td>
                    ${getParentResponseHTML(
                        fee.parent_response
                    )}
                </td>

            </tr>
        `;

    }).join("");


    // ===============================
    // SHOW TABLE
    // ===============================

    loading.hidden = true;

    table.hidden = false;


    // ===============================
    // TOTAL FEES
    // ===============================

    const total =
        fees.reduce(
            (sum, fee) =>
                sum +
                Number(fee.amount_due || 0),
            0
        );


    // ===============================
    // ACTUAL COLLECTED AMOUNT
    // ===============================

    const collected =
        fees.reduce(
            (sum, fee) =>
                sum +
                Number(fee.amount_paid || 0),
            0
        );


    // ===============================
    // PENDING AMOUNT
    // ===============================

    const pending =
        fees.reduce(
            (sum, fee) =>
                sum +
                Number(fee.balance || 0),
            0
        );


    // ===============================
    // UPDATE SUMMARY CARDS
    // ===============================

    const totalFees =
        document.getElementById("totalFees");

    const collectedFees =
        document.getElementById("collectedFees");

    const pendingFees =
        document.getElementById("pendingFees");


    if (totalFees) {

        totalFees.textContent =
            formatMoney(total);

    }


    if (collectedFees) {

        collectedFees.textContent =
            formatMoney(collected);

    }


    if (pendingFees) {

        pendingFees.textContent =
            formatMoney(pending);

    }
}


// ===============================
// ASSIGN BUTTON
// ===============================

document
    .getElementById("assignFeeBtn")
    ?.addEventListener(
        "click",
        assignFee
    );


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadFeeStudents();

        loadFeeStructures();

        loadAssignedFees();

    }
);