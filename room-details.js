/* =========================================================
   SMART HOSTEL AI — ROOM DETAILS JS
========================================================= */

if (!requireAuth("student")) {
    // Redirect is handled by requireAuth.
}


/* =========================================================
   SIDEBAR TOGGLE
========================================================= */

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}


/* Close sidebar when clicking outside */

document.addEventListener("click", (event) => {
    if (
        window.innerWidth <= 900 &&
        sidebar &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        menuToggle &&
        !menuToggle.contains(event.target)
    ) {
        sidebar.classList.remove("open");
    }
});


/* =========================================================
   STUDENT PROFILE
   Loads the real logged-in student from API
========================================================= */

async function loadStudentProfile() {

    let profile = Api.getProfile() || {};

    /*
     * First show localStorage profile immediately.
     * Then refresh from backend.
     */
    updateStudentHeader(profile);

    try {

        const result = await Api.get("/students/me");

        if (result && result.success && result.data) {

            profile = result.data;

            updateStudentHeader(profile);

            /*
             * Save latest profile locally if Api.setProfile exists.
             * This is optional and does not affect authentication.
             */
            if (typeof Api.setProfile === "function") {
                try {
                    Api.setProfile(profile);
                } catch (error) {
                    console.warn("Unable to save refreshed profile:", error);
                }
            }

        }

    } catch (error) {

        console.warn("Student profile refresh failed:", error);

        /*
         * Local profile remains visible as fallback.
         */
        updateStudentHeader(profile);
    }

    return profile;
}
/* =========================================================
   UPDATE ALL STUDENT HEADER NODES
========================================================= */

function updateStudentHeader(profile = {}) {

    const studentName =
        profile.full_name ||
        profile.name ||
        "Student";

    const studentId =
        profile.student_id ||
        profile.id ||
        "";


    /* =====================================================
       SIDEBAR STUDENT NAME
    ===================================================== */

    document
        .querySelectorAll(".student-mini-info h4")
        .forEach((element) => {

            element.textContent =
                studentName;
        });


    /* =====================================================
       SIDEBAR STUDENT ID
    ===================================================== */

    document
        .querySelectorAll(".student-mini-info p")
        .forEach((element) => {

            element.textContent =
                studentId
                    ? `Student ID: ${studentId}`
                    : "Student ID: —";
        });


    /* =====================================================
       MINI PROFILE — NAME
    ===================================================== */

    const miniName =
        document.getElementById(
            "studentMiniName"
        );

    if (miniName) {

        miniName.textContent =
            studentName;
    }


    /* =====================================================
       MINI PROFILE — STUDENT ID
    ===================================================== */

    const miniId =
        document.getElementById(
            "studentMiniId"
        );

    if (miniId) {

        miniId.textContent =
            studentId
                ? `Student ID: ${studentId}`
                : "Student ID: —";
    }


    /* =====================================================
       MINI PROFILE — INITIALS
    ===================================================== */

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );

    if (profileAvatar) {

        const nameParts =
            studentName
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        let initials = "ST";


        if (nameParts.length === 1) {

            initials =
                nameParts[0]
                    .substring(0, 2)
                    .toUpperCase();

        } else {

            initials =
                (
                    nameParts[0][0] +
                    nameParts[nameParts.length - 1][0]
                ).toUpperCase();
        }


        const onlineDot =
            profileAvatar.querySelector(
                ".online-dot"
            );


        profileAvatar.textContent =
            initials;


        if (onlineDot) {

            profileAvatar.appendChild(
                onlineDot
            );
        }
    }


    /* =====================================================
       TOP BAR NAME
    ===================================================== */

    document
        .querySelectorAll(".mini-info strong")
        .forEach((element) => {

            element.textContent =
                studentName;
        });


    /* =====================================================
       TOP BAR STUDENT ID
    ===================================================== */

    document
        .querySelectorAll(".mini-info span")
        .forEach((element) => {

            element.textContent =
                studentId
                    ? `Student ID: ${studentId}`
                    : "Student ID: —";
        });
}
/* =========================================================
   HELPER — SET TEXT
========================================================= */

function setRoomText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent =
            value !== undefined &&
            value !== null &&
            value !== ""
                ? value
                : "—";
    }
}


/* =========================================================
   RESET ROOM UI
   Used when API fails or student has no room allocation.
========================================================= */

function resetRoomUI(message = "No room allocated yet.") {

    /*
     * Hero
     */
    const currentRoomText =
        document.querySelector(".hero-left h2, .room-hero h2");

    if (currentRoomText) {
        currentRoomText.textContent = "Room —";
    }

    const blockText =
        document.querySelector(".hero-left p");

    if (blockText) {
        blockText.innerHTML =
            `<i class="fa-solid fa-building"></i> No room allocation`;
    }


    /*
     * Summary cards / information
     */
    setRoomText("roomOccupancy", "—");
    setRoomText("roomAvailableBeds", "—");
    setRoomText("roomType", "—");

    setRoomText("roomInfoType", "—");
    setRoomText("roomCondition", "—");
    setRoomText("roomInfoNumber", "—");
    setRoomText("roomInfoBlock", "—");
    setRoomText("roomInfoFloor", "—");
    setRoomText("roomInfoId", "—");
    setRoomText("roomInfoAllocationDate", "—");


    /*
     * If old HTML uses info-item order,
     * clear those too.
     */
    const infoItems =
        document.querySelectorAll(".info-item strong");

    infoItems.forEach((element) => {
        element.textContent = "—";
    });


    /*
     * Facilities
     */
    const facilities =
        document.getElementById("facilitiesList");

    if (facilities) {
        facilities.textContent =
            "No room facility records available.";
    }


    /*
     * Room members
     */
    const membersBody =
        document.getElementById("roomMembersBody");

    if (membersBody) {
        membersBody.innerHTML =
            `<tr>
                <td colspan="5">${message}</td>
            </tr>`;
    }


    /*
     * Bed status
     */
    const bedList =
        document.getElementById("bedStatusList");

    if (bedList) {
        bedList.textContent =
            "No bed allocation data available.";
    }


    /*
     * Global room object
     */
    window.currentRoomDetails = {
        allocation: null,
        room: null
    };
}


/* =========================================================
   LOAD STUDENT ROOM DETAILS
========================================================= */

async function loadStudentRoomDetails() {

    /*
     * Load profile first.
     */
    const profile =
        await loadStudentProfile();


    /*
     * Get current room allocation.
     */
    let roomResult;

    try {

        roomResult =
            await Api.get("/students/me/room");

    } catch (error) {

        console.error(
            "Room API request failed:",
            error
        );

        resetRoomUI(
            "Unable to load room allocation."
        );

        return;
    }


    /*
     * Check API response.
     */
    if (
        !roomResult ||
        !roomResult.success ||
        !roomResult.data
    ) {

        resetRoomUI(
            "No room allocated yet."
        );

        return;
    }


    /*
     * Existing backend response:
     *
     * {
     *   allocation...
     *   room: {
     *      id,
     *      room_number,
     *      block_name,
     *      floor,
     *      capacity,
     *      occupied,
     *      available_beds,
     *      room_type,
     *      status,
     *      amenities
     *   },
     *   members: [...]
     *   allocated_from
     * }
     */

    const currentRoom =
        roomResult.data;

    const room =
        currentRoom.room ||
        currentRoom;


    /*
     * No actual room object
     */
    if (!room) {

        resetRoomUI(
            "No room allocated yet."
        );

        return;
    }


    /*
     * Save globally for AI assistant.
     */
    window.currentRoomDetails = {
        allocation: currentRoom,
        room: room
    };


    /* =====================================================
       HERO
    ===================================================== */

    const currentRoomText =
        document.querySelector(
            ".hero-left h2, .room-hero h2"
        );

    if (currentRoomText) {

        currentRoomText.textContent =
            room.room_number
                ? `Room ${room.room_number}`
                : "Room —";
    }


    const blockText =
        document.querySelector(
            ".hero-left p"
        );

    if (blockText) {

        blockText.innerHTML =
            `<i class="fa-solid fa-building"></i>
             ${room.block_name || "Block —"}
             <span class="separator">•</span>
             Floor ${room.floor ?? "—"}`;
    }


    /* =====================================================
       ROOM INFORMATION
    ===================================================== */

    /*
     * Existing info-item layout
     */
    const infoItems =
        document.querySelectorAll(
            ".info-item strong"
        );

    if (infoItems.length >= 6) {

        /*
         * Room number
         */
        infoItems[0].textContent =
            room.room_number || "—";

        /*
         * Block
         */
        infoItems[1].textContent =
            room.block_name || "—";

        /*
         * Floor
         */
        infoItems[2].textContent =
            room.floor !== undefined &&
            room.floor !== null
                ? `${room.floor} Floor`
                : "—";

        /*
         * Room type
         */
        infoItems[3].textContent =
            room.room_type || "—";

        /*
         * Room ID
         */
        infoItems[4].textContent =
            room.id !== undefined &&
            room.id !== null
                ? `RM-${room.id}`
                : "—";

        /*
         * Allocation date
         */
        infoItems[5].textContent =
            currentRoom.allocated_from || "—";
    }


    /* =====================================================
       SUMMARY / DETAILS
    ===================================================== */

    /*
     * IMPORTANT:
     * UI expects occupied count ONLY.
     *
     * Example:
     * 2
     *
     * NOT:
     * 2 / 4
     */
    setRoomText(
        "roomOccupancy",
        room.occupied ?? 0
    );


    /*
     * Available beds
     */
    setRoomText(
        "roomAvailableBeds",
        room.available_beds ?? 0
    );


    /*
     * Room type
     */
    setRoomText(
        "roomType",
        room.room_type || "—"
    );

    setRoomText(
        "roomInfoType",
        room.room_type || "—"
    );


    /*
     * Room condition/status
     */
    setRoomText(
        "roomCondition",
        room.status || "—"
    );


    /*
     * Room number
     */
    setRoomText(
        "roomInfoNumber",
        room.room_number || "—"
    );


    /*
     * Block
     */
    setRoomText(
        "roomInfoBlock",
        room.block_name || "—"
    );


    /*
     * Floor
     */
    setRoomText(
        "roomInfoFloor",
        room.floor !== undefined &&
        room.floor !== null
            ? `Floor ${room.floor}`
            : "—"
    );


    /*
     * Room ID
     *
     * Requires:
     * <strong id="roomInfoId">
     */
    setRoomText(
        "roomInfoId",
        room.id !== undefined &&
        room.id !== null
            ? `RM-${room.id}`
            : "—"
    );


    /*
     * Allocation date
     */
    setRoomText(
        "roomInfoAllocationDate",
        currentRoom.allocated_from || "—"
    );


    /* =====================================================
       FACILITIES / AMENITIES
    ===================================================== */

    const facilities =
        document.getElementById(
            "facilitiesList"
        );

    if (facilities) {

        const amenities =
            Array.isArray(room.amenities)
                ? room.amenities
                : [];

        if (amenities.length) {

            facilities.innerHTML =
                amenities
                    .map((amenity) => {

                        return `
                            <div class="facility">
                                <i class="fa-solid fa-check"></i>

                                <span>
                                    ${amenity}
                                </span>

                                <i class="fa-solid fa-check facility-check"></i>
                            </div>
                        `;

                    })
                    .join("");

        } else {

            facilities.textContent =
                "No room facility records available.";
        }
    }


    /* =====================================================
       ROOM MEMBERS
    ===================================================== */

    const members =
        Array.isArray(currentRoom.members)
            ? currentRoom.members
            : [];

    const membersBody =
        document.getElementById(
            "roomMembersBody"
        );

    if (membersBody) {

        if (members.length) {

            membersBody.innerHTML =
                members
                    .map((member) => {

                        const student =
                            member.student || {};

                        const fullName =
                            student.full_name ||
                            "—";


                        /*
                         * Generate initials
                         */
                        const initials =
                            fullName
                                .split(/\s+/)
                                .filter(Boolean)
                                .map(
                                    (part) =>
                                        part.charAt(0)
                                )
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();


                        /*
                         * Check primary resident
                         */
                        const isCurrentStudent =
                            (
                                student.id !== undefined &&
                                profile.id !== undefined &&
                                String(student.id) ===
                                String(profile.id)
                            ) ||
                            (
                                student.student_id &&
                                profile.student_id &&
                                String(student.student_id) ===
                                String(profile.student_id)
                            );


                        return `
                            <tr>

                                <td>
                                    <div class="student-cell">

                                        <div class="student-avatar">
                                            ${initials || "?"}
                                        </div>

                                        <div>

                                            <strong>
                                                ${fullName}
                                            </strong>

                                            <span>
                                                ${
                                                    isCurrentStudent
                                                        ? "Primary Resident"
                                                        : "Roommate"
                                                }
                                            </span>

                                        </div>

                                    </div>
                                </td>


                                <td>
                                    ${student.student_id || "—"}
                                </td>


                                <td>
                                    ${
                                        member.bed_number
                                            ? `Bed ${member.bed_number}`
                                            : "—"
                                    }
                                </td>


                                <td>
                                    ${student.department || "—"}
                                </td>


                                <td>

                                    <span class="member-status active">
                                        ${member.status || "active"}
                                    </span>

                                </td>

                            </tr>
                        `;

                    })
                    .join("");

        } else {

            membersBody.innerHTML =
                `<tr>
                    <td colspan="5">
                        No active room members found.
                    </td>
                </tr>`;
        }
    }


    /* =====================================================
       BED STATUS
    ===================================================== */

    const bedList =
        document.getElementById(
            "bedStatusList"
        );

    if (bedList) {

        const byBed =
            new Map(
                members
                    .filter(
                        (member) =>
                            member.bed_number !== undefined &&
                            member.bed_number !== null
                    )
                    .map(
                        (member) => [
                            Number(member.bed_number),
                            member
                        ]
                    )
            );


        const capacity =
            Number(room.capacity || 0);


        if (capacity > 0) {

            bedList.innerHTML =
                Array
                    .from(
                        {
                            length: capacity
                        },
                        (_, index) => {

                            const number =
                                index + 1;

                            const member =
                                byBed.get(number);

                            const student =
                                member?.student || {};

                            const occupied =
                                Boolean(member);


                            return `
                                <div class="bed-item ${
                                    occupied
                                        ? "occupied"
                                        : "available"
                                }">

                                    <div class="bed-number">
                                        ${String(number).padStart(2, "0")}
                                    </div>

                                    <div class="bed-details">

                                        <strong>
                                            Bed ${String(number).padStart(2, "0")}
                                        </strong>

                                        <span>
                                            ${
                                                occupied
                                                    ? (
                                                        student.full_name ||
                                                        "Occupied"
                                                    )
                                                    : "Available"
                                            }
                                        </span>

                                    </div>

                                    <span class="bed-status">
                                        ${
                                            occupied
                                                ? "Occupied"
                                                : "Available"
                                        }
                                    </span>

                                </div>
                            `;

                        }
                    )
                    .join("");

        } else {

            bedList.textContent =
                "No bed allocation data available.";
        }
    }
}


/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );

if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "notification.html";

        }
    );
}


/* =========================================================
   LOGOUT
========================================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            Api.clearAuth();

            window.location.href =
                "roleselection.html";
        }
    );
}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * Load room/profile
         */
        await loadStudentRoomDetails();


        /* =================================================
           REQUEST HISTORY
        ================================================= */

        const loadRequests = async () => {

            const formatDate = (iso) => {

                if (!iso) {
                    return null;
                }

                try {

                    const d =
                        new Date(iso);

                    if (
                        Number.isNaN(
                            d.getTime()
                        )
                    ) {
                        return iso;
                    }

                    return d.toLocaleDateString(
                        undefined,
                        {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        }
                    );

                } catch (_) {

                    return iso;
                }
            };


            const historyList =
                document.getElementById(
                    "requestHistoryList"
                );

            if (!historyList) {
                return;
            }


            let maintenance;
            let changes;

            try {

                [
                    maintenance,
                    changes
                ] = await Promise.all([
                    Api.get("/rooms/maintenance"),
                    Api.get("/rooms/change-request")
                ]);

            } catch (error) {

                console.warn(
                    "Unable to load room request history:",
                    error
                );

                historyList.innerHTML =
                    "Unable to load request history.";

                return;
            }


            const dates = [];


            if (
                maintenance &&
                maintenance.success
            ) {

                (
                    maintenance.data || []
                ).forEach((item) => {

                    const d =
                        formatDate(
                            item.created_at
                        );

                    if (d) {
                        dates.push(d);
                    }
                });
            }


            if (
                changes &&
                changes.success
            ) {

                (
                    changes.data || []
                ).forEach((item) => {

                    const d =
                        formatDate(
                            item.created_at
                        );

                    if (d) {
                        dates.push(d);
                    }
                });
            }


            historyList.innerHTML =
                dates.length
                    ? dates
                        .map(
                            (d) =>
                                `<p>Date: ${d}</p>`
                        )
                        .join("")
                    : "No requests.";
        };


        /* =================================================
           MAINTENANCE FORM
        ================================================= */

        document
            .getElementById(
                "maintenanceForm"
            )
            ?.addEventListener(
                "submit",
                async (event) => {

                    event.preventDefault();


                    const result =
                        await Api.post(
                            "/rooms/maintenance",
                            {
                                issue_title:
                                    document.getElementById(
                                        "maintenanceIssue"
                                    ).value,

                                description:
                                    document.getElementById(
                                        "maintenanceDescription"
                                    ).value,

                                priority:
                                    document.getElementById(
                                        "maintenancePriority"
                                    ).value
                            }
                        );


                    alert(
                        result.message ||
                        (
                            result.success
                                ? "Submitted"
                                : "Unable to submit request"
                        )
                    );


                    if (result.success) {

                        event.target.reset();

                        loadRequests();
                    }
                }
            );


        /* =================================================
           ROOM CHANGE FORM
        ================================================= */

        document
            .getElementById(
                "roomChangeForm"
            )
            ?.addEventListener(
                "submit",
                async (event) => {

                    event.preventDefault();


                    const result =
                        await Api.post(
                            "/rooms/change-request",
                            {
                                requested_room_type:
                                    document.getElementById(
                                        "requestedRoomType"
                                    ).value,

                                reason:
                                    document.getElementById(
                                        "roomChangeReason"
                                    ).value
                            }
                        );


                    alert(
                        result.message ||
                        (
                            result.success
                                ? "Submitted"
                                : "Unable to submit request"
                        )
                    );


                    if (result.success) {

                        event.target.reset();

                        loadRequests();
                    }
                }
            );


        /*
         * Load request history
         */
        loadRequests();


        /* =================================================
           MAINTENANCE BUTTON
        ================================================= */

        const maintenanceBtn =
            document.getElementById(
                "maintenanceBtn"
            );


        if (maintenanceBtn) {

            maintenanceBtn.addEventListener(
                "click",
                async () => {

                    const issue =
                        prompt(
                            "Please describe the room maintenance issue:"
                        );


                    if (
                        !issue ||
                        issue.trim() === ""
                    ) {
                        return;
                    }


                    const payload = {

                        issue_title:
                            "Room maintenance",

                        description:
                            issue.trim(),

                        priority:
                            "medium"
                    };


                    const result =
                        await Api.post(
                            "/rooms/maintenance",
                            payload
                        );


                    alert(
                        result.success
                            ? "Maintenance request submitted successfully!"
                            : (
                                result.message ||
                                "Failed to submit maintenance request."
                            )
                    );
                }
            );
        }


        /* =================================================
           CHANGE ROOM BUTTON
        ================================================= */

        const changeRoomBtn =
            document.getElementById(
                "changeRoomBtn"
            );


        if (changeRoomBtn) {

            changeRoomBtn.addEventListener(
                "click",
                async () => {

                    const reason =
                        prompt(
                            "Why do you want to request a room change?"
                        );


                    if (
                        !reason ||
                        reason.trim() === ""
                    ) {
                        return;
                    }


                    const result =
                        await Api.post(
                            "/rooms/change-request",
                            {
                                reason:
                                    reason.trim(),

                                requested_room_type:
                                    "standard"
                            }
                        );


                    alert(
                        result.success
                            ? "Room change request submitted successfully!"
                            : (
                                result.message ||
                                "Failed to submit room change request."
                            )
                    );
                }
            );
        }
    }
);


/* =========================================================
   AI ASSISTANT
========================================================= */

const aiButton =
    document.getElementById(
        "aiButton"
    );

const aiPopup =
    document.getElementById(
        "aiPopup"
    );

const closeAi =
    document.getElementById(
        "closeAi"
    );


if (aiButton) {

    aiButton.addEventListener(
        "click",
        () => {

            if (aiPopup) {
                aiPopup.classList.toggle("show");
            }

        }
    );
}


if (closeAi) {

    closeAi.addEventListener(
        "click",
        () => {

            if (aiPopup) {
                aiPopup.classList.remove("show");
            }

        }
    );
}


/* =========================================================
   AI RESPONSES
========================================================= */

const aiInput =
    document.getElementById(
        "aiInput"
    );

const sendAi =
    document.getElementById(
        "sendAi"
    );

const aiMessages =
    document.querySelector(
        ".ai-messages"
    );


function addUserMessage(message) {

    if (!aiMessages) {
        return;
    }


    const userMessage =
        document.createElement(
            "div"
        );


    userMessage.className =
        "ai-message";


    userMessage.style.marginLeft =
        "auto";


    userMessage.style.background =
        "rgba(139,92,246,0.12)";


    userMessage.textContent =
        message;


    aiMessages.appendChild(
        userMessage
    );
}


function addAIMessage(message) {

    if (!aiMessages) {
        return;
    }


    const aiMessage =
        document.createElement(
            "div"
        );


    aiMessage.className =
        "ai-message";


    aiMessage.style.marginTop =
        "8px";


    aiMessage.innerHTML =
        message;


    aiMessages.appendChild(
        aiMessage
    );
}


function processAIQuestion(question) {

    const text =
        question.toLowerCase();


    let response = "";


    /* =====================================================
       ROOM NUMBER
    ===================================================== */

    if (
        text.includes("room number") ||
        text.includes("which room") ||
        text.includes("room")
    ) {

        const roomData =
            window.currentRoomDetails?.room || {};


        response =
            roomData.room_number

                ? `Your current room is <strong>Room ${roomData.room_number}</strong>, ${roomData.block_name || "your allocated block"}, Floor ${roomData.floor ?? "—"}.`

                : "No room allocation is available in your account.";
    }


    /* =====================================================
       ROOMMATE
    ===================================================== */

    else if (
        text.includes("roommate") ||
        text.includes("members")
    ) {

        const members =
            window.currentRoomDetails?.allocation?.members || [];


        if (members.length) {

            const names =
                members
                    .map(
                        (member) =>
                            member.student?.full_name
                    )
                    .filter(Boolean);


            response =
                names.length
                    ? `Your room members are <strong>${names.join(", ")}</strong>.`
                    : "Roommate names are not available.";

        } else {

            response =
                "No active room members are available.";
        }
    }


    /* =====================================================
       FACILITIES
    ===================================================== */

    else if (
        text.includes("facility") ||
        text.includes("facilities")
    ) {

        const amenities =
            window.currentRoomDetails
                ?.room
                ?.amenities || [];


        response =
            amenities.length

                ? `Your room facilities are <strong>${amenities.join(", ")}</strong>.`

                : "No room facility records are available.";
    }


    /* =====================================================
       BED
    ===================================================== */

    else if (
        text.includes("bed")
    ) {

        const allocation =
            window.currentRoomDetails
                ?.allocation || {};


        const roomData =
            window.currentRoomDetails
                ?.room || {};


        response =
            allocation.bed_number

                ? `Your allocated bed is <strong>Bed ${allocation.bed_number}</strong>. Available beds: ${roomData.available_beds ?? "—"}.`

                : "No bed allocation is available in your account.";
    }


    /* =====================================================
       BLOCK
    ===================================================== */

    else if (
        text.includes("block")
    ) {

        response =
            `You are staying in <strong>${
                window.currentRoomDetails
                    ?.room
                    ?.block_name ||
                "an unassigned block"
            }</strong>.`;
    }


    /* =====================================================
       FLOOR
    ===================================================== */

    else if (
        text.includes("floor")
    ) {

        response =
            `Your room is located on <strong>Floor ${
                window.currentRoomDetails
                    ?.room
                    ?.floor ??
                "—"
            }</strong>.`;
    }


    /* =====================================================
       DEFAULT
    ===================================================== */

    else {

        response =
            "I can help you with your room number, roommates, bed allocation, facilities and room information.";
    }


    setTimeout(
        () => {

            addAIMessage(
                response
            );


            if (aiMessages) {

                aiMessages.scrollTop =
                    aiMessages.scrollHeight;
            }

        },
        500
    );
}


/* =========================================================
   SEND AI MESSAGE
========================================================= */

function sendQuestion() {

    if (!aiInput) {
        return;
    }


    const question =
        aiInput.value.trim();


    if (question === "") {
        return;
    }


    addUserMessage(
        question
    );


    aiInput.value = "";


    if (aiMessages) {

        aiMessages.scrollTop =
            aiMessages.scrollHeight;
    }


    processAIQuestion(
        question
    );
}


if (sendAi) {

    sendAi.addEventListener(
        "click",
        sendQuestion
    );
}


if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                sendQuestion();
            }
        }
    );
}


/* =========================================================
   AI QUICK QUESTIONS
========================================================= */

const suggestionButtons =
    document.querySelectorAll(
        ".ai-suggestions button"
    );


suggestionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.dataset.question;


                if (!question) {
                    return;
                }


                addUserMessage(
                    question
                );


                processAIQuestion(
                    question
                );
            }
        );
    }
);


/* =========================================================
   CLOSE AI WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    (event) => {

        if (
            aiPopup &&
            aiButton &&
            aiPopup.classList.contains("show") &&
            !aiPopup.contains(event.target) &&
            !aiButton.contains(event.target)
        ) {

            aiPopup.classList.remove(
                "show"
            );
        }
    }
);


/* =========================================================
   PAGE LOAD ANIMATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const cards =
            document.querySelectorAll(
                ".summary-card, .glass-card, .room-hero"
            );


        cards.forEach(
            (card, index) => {

                card.style.opacity =
                    "0";


                card.style.transform =
                    "translateY(12px)";


                setTimeout(
                    () => {

                        card.style.transition =
                            "all 0.45s ease";


                        card.style.opacity =
                            "1";


                        card.style.transform =
                            "translateY(0)";

                    },
                    index * 70
                );
            }
        );
    }
);