/* Complaints – API driven */
document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth("student")) return;

  const form = document.getElementById("complaintForm");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.querySelector(".sidebar");
  if (menuBtn && sidebar) menuBtn.addEventListener("click", () => sidebar.classList.toggle("show"));

  async function loadComplaints() {
    const result = await Api.get("/complaints/me");
    if (!result.success) return;
    const list = result.data || [];
    const tbody = document.querySelector("#complaintsTable tbody, .complaints-list, #complaintHistory");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (list.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No complaints yet</td></tr>";
      return;
    }
    list.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.subject}</td>
        <td>${c.category}</td>
        <td>${c.priority}</td>
        <td><span class="status-${c.status}">${c.status}</span></td>
        <td>${c.created_at ? c.created_at.slice(0, 10) : ""}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const priorityEl = form.querySelector('input[name="priority"]:checked');
      const payload = {
        category: document.getElementById("complaintCategory").value,
        priority: priorityEl ? priorityEl.value : "medium",
        subject: document.getElementById("complaintSubject").value.trim(),
        description: document.getElementById("complaintDescription").value.trim(),
      };
      const result = await Api.post("/complaints", payload);
      if (result.success) {
        alert(result.message || "Complaint submitted");
        form.reset();
        loadComplaints();
      } else {
        alert(result.message || "Failed");
      }
    });
  }

  loadComplaints();
});
