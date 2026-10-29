(() => {
  const sidebar = document.getElementById("sidebar");
  const menu = document.getElementById("menuBtn");
  if (!sidebar || !menu) return;

  const backdrop = document.createElement("div");
  backdrop.className = "portal-backdrop";
  document.body.appendChild(backdrop);

  const close = () => {
    sidebar.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
  };

  menu.addEventListener("click", () => {
    sidebar.classList.toggle("is-open");
    backdrop.classList.toggle("is-visible");
  });

  backdrop.addEventListener("click", close);
  sidebar.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", close));
})();

if (!window.__portalAuthBound) {
  window.__portalAuthBound = true;
  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof Api !== "undefined") {
        Api.clearAuth();
      }
      window.location.href = "roleselection.html";
    });
  });
}
