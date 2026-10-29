/* =====================================================
   SMART HOSTEL AI
   NOTIFICATION PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       ELEMENTS
    ================================================= */

    const notificationList =
        document.getElementById("notificationList");

    const emptyState =
        document.getElementById("emptyState");

    const unreadCount =
        document.getElementById("unreadCount");

    const markAllBtn =
        document.getElementById("markAllBtn");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.getElementById("sidebar");

    const notificationCards =
        document.querySelectorAll(".notification-card");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const categoryTabs =
        document.querySelectorAll(".category-tab");


    /* =================================================
       STATE
    ================================================= */

    let currentFilter = "all";
    let currentCategory = "all";

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function notificationCategory(type) {
        const categories = {
            leave: "leave",
            complaint: "maintenance",
            emergency: "security",
            announcement: "hostel",
            fee: "hostel",
        };
        return categories[type] || "hostel";
    }

    function renderNotifications(items) {
        if (!notificationList) return;
        if (!items.length) {
            notificationList.innerHTML = "";
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        notificationList.innerHTML = items.map(item => {
            const category = notificationCategory(item.type);
            const isRead = Boolean(item.is_read);
            const created = item.created_at ? new Date(item.created_at).toLocaleString() : "";
            return `<article class="notification-card${isRead ? "" : " unread"}" data-id="${item.id}" data-category="${category}" data-read="${isRead}">
                <div class="notification-icon ${category}"><i class="fa-solid fa-bell"></i></div>
                <div class="notification-content">
                    <div class="notification-top"><div><h3>${escapeHtml(item.title)}</h3><span class="notification-category">${escapeHtml(item.type || "Notification")}</span></div><span class="notification-time">${escapeHtml(created)}</span></div>
                    <p>${escapeHtml(item.message)}</p>
                    <div class="notification-footer"><span class="${isRead ? "read-label" : "unread-label"}">${isRead ? '<i class="fa-solid fa-check"></i> Read' : "<span></span> Unread"}</span><button class="read-btn">${isRead ? "Mark as read" : "Mark as read"}</button></div>
                </div>
                <button class="delete-notification" title="Dismiss notification"><i class="fa-solid fa-xmark"></i></button>
            </article>`;
        }).join("");
    }

    async function loadNotifications() {
        if (notificationList) notificationList.innerHTML = '<p class="loading-state">Loading notifications...</p>';
        const result = await Api.get("/notifications/me");
        if (!result.success) {
            if (notificationList) notificationList.innerHTML = '<p class="error-state">Unable to load notifications. Please try again.</p>';
            return;
        }
        renderNotifications(Array.isArray(result.data) ? result.data : []);
        updateUnreadCount();
        applyFilters();
    }


    /* =================================================
       INITIALIZE
    ================================================= */

    loadNotifications();


    /* =================================================
       UPDATE UNREAD COUNT
    ================================================= */

    function updateUnreadCount() {

        const unreadNotifications =
            document.querySelectorAll(
                '.notification-card[data-read="false"]'
            );

        const count = unreadNotifications.length;

        if (unreadCount) {
            unreadCount.textContent = count;
        }

        /*
           Update sidebar notification badge
        */

        const sidebarBadge =
            document.querySelector(".notification-badge");

        if (sidebarBadge) {

            sidebarBadge.textContent = count;

            if (count === 0) {
                sidebarBadge.style.display = "none";
            } else {
                sidebarBadge.style.display = "flex";
            }
        }


        /*
           Update top notification badge
        */

        const topBadge =
            document.querySelector(".top-notification");

        if (topBadge) {

            topBadge.textContent = count;

            if (count === 0) {
                topBadge.style.display = "none";
            } else {
                topBadge.style.display = "flex";
            }
        }

    }


    /* =================================================
       MARK SINGLE NOTIFICATION AS READ / UNREAD
    ================================================= */

    function toggleRead(card) {

        const isRead =
            card.getAttribute("data-read") === "true";

        const readButton =
            card.querySelector(".read-btn");

        const footer =
            card.querySelector(".notification-footer");


        if (isRead) {

            /*
               Mark as UNREAD
            */

            card.setAttribute("data-read", "false");

            card.classList.add("unread");

            if (readButton) {
                readButton.textContent = "Mark as read";
            }

            updateFooterStatus(
                footer,
                false
            );

        } else {

            const notificationId = card.dataset.id;
            if (notificationId) {
                Api.post(`/notifications/${notificationId}/read`, {}).catch(() => {});
            }

            /*
               Mark as READ
            */

            card.setAttribute("data-read", "true");

            card.classList.remove("unread");

            if (readButton) {
                readButton.textContent = "Mark as unread";
            }

            updateFooterStatus(
                footer,
                true
            );

        }


        updateUnreadCount();

        applyFilters();

    }


    /* =================================================
       UPDATE FOOTER STATUS
    ================================================= */

    function updateFooterStatus(footer, isRead) {

        if (!footer) return;

        const status =
            footer.querySelector(
                ".unread-label, .read-label"
            );

        if (!status) return;


        if (isRead) {

            status.className = "read-label";

            status.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Read
            `;

        } else {

            status.className = "unread-label";

            status.innerHTML = `
                <span></span>
                Unread
            `;

        }

    }


    /* =================================================
       READ BUTTON CLICK
    ================================================= */

    document.addEventListener("click", (event) => {

        const readButton =
            event.target.closest(".read-btn");

        if (!readButton) return;

        const card =
            readButton.closest(".notification-card");

        if (!card) return;

        toggleRead(card);

    });


    /* =================================================
       DELETE NOTIFICATION
    ================================================= */

    document.addEventListener("click", (event) => {

        const deleteButton =
            event.target.closest(
                ".delete-notification"
            );

        if (!deleteButton) return;

        const card =
            deleteButton.closest(".notification-card");

        if (!card) return;


        /*
           Small delete animation
        */

        card.style.opacity = "0";
        card.style.transform = "translateX(25px)";


        setTimeout(() => {

            card.remove();

            updateUnreadCount();

            applyFilters();

        }, 250);

    });


    /* =================================================
       MARK ALL AS READ
    ================================================= */

    if (markAllBtn) {

        markAllBtn.addEventListener("click", () => {

            const unreadNotifications =
                document.querySelectorAll(
                    '.notification-card[data-read="false"]'
                );


            if (unreadNotifications.length === 0) {

                showToast(
                    "All notifications are already read."
                );

                return;
            }

            Api.post("/notifications/read-all", {}).catch(() => {
                showToast("Unable to update notifications. Please try again.");
            });


            unreadNotifications.forEach(card => {

                card.setAttribute(
                    "data-read",
                    "true"
                );

                card.classList.remove(
                    "unread"
                );


                const readButton =
                    card.querySelector(".read-btn");

                if (readButton) {
                    readButton.textContent =
                        "Mark as unread";
                }


                const footer =
                    card.querySelector(
                        ".notification-footer"
                    );

                updateFooterStatus(
                    footer,
                    true
                );

            });


            updateUnreadCount();

            applyFilters();


            showToast(
                "All notifications marked as read."
            );

        });

    }


    /* =================================================
       ALL / UNREAD FILTER
    ================================================= */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.getAttribute("data-filter");

            applyFilters();

        });

    });


    /* =================================================
       CATEGORY FILTER
    ================================================= */

    categoryTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            categoryTabs.forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            currentCategory =
                tab.getAttribute(
                    "data-category"
                );

            applyFilters();

        });

    });


    /* =================================================
       APPLY FILTERS
    ================================================= */

    function applyFilters() {

        const cards =
            document.querySelectorAll(
                ".notification-card"
            );

        let visibleCount = 0;


        cards.forEach(card => {

            const category =
                card.getAttribute(
                    "data-category"
                );

            const isRead =
                card.getAttribute(
                    "data-read"
                ) === "true";


            /*
               Check read / unread
            */

            let filterMatch = true;

            if (currentFilter === "unread") {

                filterMatch = !isRead;

            }


            /*
               Check category
            */

            let categoryMatch = true;

            if (currentCategory !== "all") {

                categoryMatch =
                    category === currentCategory;

            }


            /*
               Final visibility
            */

            if (
                filterMatch &&
                categoryMatch
            ) {

                card.style.display = "flex";

                visibleCount++;

            } else {

                card.style.display = "none";

            }

        });


        /*
           Empty state
        */

        if (emptyState) {

            if (visibleCount === 0) {

                emptyState.style.display =
                    "block";

            } else {

                emptyState.style.display =
                    "none";

            }

        }

    }


    /* =================================================
       TOP NOTIFICATION BUTTON
    ================================================= */

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                /*
                   Scroll to notification section
                */

                const heading =
                    document.querySelector(
                        ".notification-heading"
                    );

                if (heading) {

                    heading.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }


    /* =================================================
       MOBILE SIDEBAR
    ================================================= */

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


    /* =================================================
       CLOSE SIDEBAR WHEN CLICKING OUTSIDE
    ================================================= */

    document.addEventListener(
        "click",
        (event) => {

            if (!sidebar || !menuBtn) return;

            const isMobile =
                window.innerWidth <= 1000;

            if (!isMobile) return;

            const clickedInsideSidebar =
                sidebar.contains(event.target);

            const clickedMenu =
                menuBtn.contains(event.target);

            if (
                !clickedInsideSidebar &&
                !clickedMenu
            ) {

                sidebar.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =================================================
       SIDEBAR LINK - CLOSE ON MOBILE
    ================================================= */

    document
        .querySelectorAll(".sidebar .nav-link")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 1000
                    ) {

                        sidebar.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });


    /* =================================================
       TOAST MESSAGE
    ================================================= */

    function showToast(message) {

        /*
           Remove old toast
        */

        const oldToast =
            document.querySelector(
                ".notification-toast"
            );

        if (oldToast) {
            oldToast.remove();
        }


        /*
           Create toast
        */

        const toast =
            document.createElement("div");

        toast.className =
            "notification-toast";


        toast.innerHTML = `

            <div class="toast-icon">

                <i class="fa-solid fa-circle-check"></i>

            </div>

            <span>${message}</span>

        `;


        /*
           Toast styles
        */

        Object.assign(
            toast.style,
            {
                position: "fixed",
                right: "25px",
                bottom: "25px",
                zIndex: "9999",

                display: "flex",
                alignItems: "center",
                gap: "9px",

                padding: "11px 15px",

                background: "#ffffff",

                border: "1px solid #e6e6ef",

                borderRadius: "10px",

                boxShadow:
                    "0 15px 35px rgba(30,35,70,.13)",

                color: "#555a6d",

                fontSize: "11px",

                opacity: "0",

                transform:
                    "translateY(15px)",

                transition:
                    "all .3s ease"
            }
        );


        document.body.appendChild(toast);


        /*
           Animate in
        */

        requestAnimationFrame(() => {

            toast.style.opacity = "1";

            toast.style.transform =
                "translateY(0)";

        });


        /*
           Remove after 2.5 seconds
        */

        setTimeout(() => {

            toast.style.opacity = "0";

            toast.style.transform =
                "translateY(15px)";


            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 2500);

    }


    /* =================================================
       NOTIFICATION CARD CLICK
    ================================================= */

    document.addEventListener(
        "click",
        (event) => {

            const card =
                event.target.closest(
                    ".notification-card"
                );

            if (!card) return;


            /*
               Don't trigger when clicking
               buttons
            */

            if (
                event.target.closest(
                    "button"
                )
            ) {
                return;
            }


            /*
               Automatically mark unread
               notification as read
            */

            const isRead =
                card.getAttribute(
                    "data-read"
                ) === "true";


            if (!isRead) {

                toggleRead(card);

            }

        }
    );


    /* =================================================
       WINDOW RESIZE
    ================================================= */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 1000 &&
                sidebar
            ) {

                sidebar.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =================================================
       ESC KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                sidebar
            ) {

                sidebar.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =================================================
       CONSOLE MESSAGE
    ================================================= */

    console.log(
        "SmartHostel AI Notification System Loaded Successfully."
    );

});