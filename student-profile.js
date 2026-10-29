/**
 * Student Profile page
 *
 * Load:  GET /api/students/me
 * Save:  PUT /api/students/me
 * Room:  GET /api/students/me/room
 *
 * No hardcoded student identity.
 */

document.addEventListener("DOMContentLoaded", function () {

  // =========================================================
  // CHECK API
  // =========================================================

  if (typeof Api === "undefined") {

    console.error("api.js not loaded");

    alert(
      "API helper missing. Ensure api.js is included before student-profile.js"
    );

    return;
  }


  // =========================================================
  // CHECK STUDENT LOGIN
  // =========================================================

  if (
    typeof requireAuth === "function" &&
    !requireAuth("student")
  ) {
    return;
  }


  // =========================================================
  // UI REFERENCES
  // =========================================================

  const menuBtn =
    document.getElementById("menuBtn");

  const sidebar =
    document.getElementById("sidebar") ||
    document.querySelector(".sidebar");


  // =========================================================
  // MOBILE SIDEBAR
  // =========================================================

  if (menuBtn && sidebar) {

    menuBtn.addEventListener("click", function () {

      sidebar.classList.toggle("show");

    });
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  const logoutBtn =
    document.getElementById("logoutBtn");

  if (logoutBtn) {

    logoutBtn.addEventListener("click", function (e) {

      e.preventDefault();

      Api.clearAuth();

      window.location.href =
        "roleselection.html";

    });
  }


  // =========================================================
  // EDIT / SAVE / CANCEL BUTTONS
  // =========================================================

  const editBtn =
    document.getElementById("editBtn");

  const saveBtn =
    document.getElementById("saveBtn");

  const cancelBtn =
    document.getElementById("cancelBtn");


  // =========================================================
  // EDITABLE FIELDS
  // =========================================================

  const EDITABLE_IDS = [

    "fullName",
    "dob",
    "gender",
    "phone",
    "address",
    "bloodGroup",
    "emergencyContact",
    "department",
    "year"

  ];


  // =========================================================
  // READ ONLY FIELDS
  // =========================================================

  const READONLY_IDS = [

    "studentId",
    "email"

  ];


  // =========================================================
  // VARIABLES
  // =========================================================

  let editing = false;

  let snapshot = null;

  let currentProfile = null;


  // =========================================================
  // HELPERS
  // =========================================================

  function display(val) {

    if (
      val === null ||
      val === undefined ||
      String(val).trim() === ""
    ) {
      return "Not provided";
    }

    return String(val);
  }


  // =========================================================
  // SET TEXT
  // =========================================================

  function setText(id, val) {

    const el =
      document.getElementById(id);

    if (el) {

      el.textContent =
        display(val);

    }
  }


  // =========================================================
  // SET INPUT VALUE
  // =========================================================

  function setInput(id, val) {

    const el =
      document.getElementById(id);

    if (!el) {
      return;
    }


    // SELECT
    if (el.tagName === "SELECT") {

      const v =
        val == null || val === ""
          ? ""
          : String(val).toLowerCase();


      el.value = v;


      if (v && el.value !== v) {

        el.value = "";

      }

      return;
    }


    // DATE INPUT
    if (el.type === "date") {

      el.value =
        val
          ? String(val).slice(0, 10)
          : "";

      return;
    }


    // NORMAL INPUT
    el.value =
      val == null || val === ""
        ? ""
        : String(val);
  }


  // =========================================================
  // GET INITIALS
  // =========================================================

  function initials(name) {

    if (
      !name ||
      !String(name).trim()
    ) {

      return "ST";
    }


    const parts =
      String(name)
        .trim()
        .split(/\s+/);


    // Single name
    if (parts.length === 1) {

      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }


    // First + Last name
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }


  // =========================================================
  // YEAR LABEL
  // =========================================================

  function yearLabel(y) {

    if (
      y === null ||
      y === undefined ||
      y === ""
    ) {

      return "Not provided";
    }


    const n =
      Number(y);


    if (!n) {

      return String(y);
    }


    const map = {

      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
      5: "5th Year"

    };


    return (
      map[n] ||
      "Year " + n
    );
  }


  // =========================================================
  // ENABLE / DISABLE FIELD
  // =========================================================

  function enableField(el, on) {

    if (!el) {
      return;
    }


    if (on) {

      el.removeAttribute("disabled");

      el.removeAttribute("readonly");

      el.disabled = false;

      el.readOnly = false;

    } else {

      el.setAttribute(
        "disabled",
        "disabled"
      );

      el.disabled = true;
    }
  }


  // =========================================================
  // SET EDIT MODE
  // =========================================================

  function setEditMode(on) {

    editing = !!on;


    // Editable fields
    EDITABLE_IDS.forEach(function (id) {

      enableField(
        document.getElementById(id),
        on
      );

    });


    // Read-only fields
    READONLY_IDS.forEach(function (id) {

      enableField(
        document.getElementById(id),
        false
      );

    });


    // Edit button
    if (editBtn) {

      editBtn.style.display =
        on ? "none" : "";
    }


    // Save button
    if (saveBtn) {

      saveBtn.style.display =
        on ? "" : "none";
    }


    // Cancel button
    if (cancelBtn) {

      cancelBtn.style.display =
        on ? "" : "none";
    }


    document.body.classList.toggle(
      "profile-editing",
      on
    );
  }


  // =========================================================
  // SET AVATAR TEXT
  // =========================================================

  function setAvatarText(
    container,
    text
  ) {

    if (!container) {
      return;
    }


    const elements = [];


    container.childNodes.forEach(
      function (node) {

        if (
          node.nodeType ===
          Node.ELEMENT_NODE
        ) {

          elements.push(node);

        }
      }
    );


    container.textContent = "";


    container.appendChild(
      document.createTextNode(
        text || "ST"
      )
    );


    elements.forEach(
      function (element) {

        container.appendChild(
          element
        );

      }
    );
  }


  // =========================================================
  // FILL PROFILE
  // =========================================================

  function fillProfile(s) {

    currentProfile =
      s || {};


    snapshot =
      Object.assign(
        {},
        currentProfile
      );


    // =======================================================
    // BASIC PROFILE DATA
    // =======================================================

    const name =
      currentProfile.full_name || "";


    const sid =
      currentProfile.student_id || "";


    const ini =
      initials(name);


    // =======================================================
    // SIDEBAR NAME
    // =======================================================

    setText(
      "sideName",
      name || "—"
    );


    // =======================================================
    // SIDEBAR STUDENT ID
    // =======================================================

    const sideId =
      document.getElementById(
        "sideId"
      );


    if (sideId) {

      sideId.textContent =
        sid
          ? "Student ID: " + sid
          : "Student ID: —";
    }


    // =======================================================
    // MINI PROFILE
    // =======================================================
    //
    // This updates:
    //
    // Student Name
    // Student ID
    // Avatar initials
    //
    // Example:
    // LS
    // Lathika
    // Student ID: STD001
    //
    // =======================================================

    setText(
      "studentMiniName",
      name || "Student"
    );


    const studentMiniId =
      document.getElementById(
        "studentMiniId"
      );


    if (studentMiniId) {

      studentMiniId.textContent =
        sid
          ? "Student ID: " + sid
          : "Student ID: —";
    }


    const miniAvatar =
      document.getElementById(
        "profileAvatar"
      );


    if (miniAvatar) {

      const onlineDot =
        miniAvatar.querySelector(
          ".online-dot"
        );


      miniAvatar.textContent =
        ini;


      if (onlineDot) {

        miniAvatar.appendChild(
          onlineDot
        );
      }
    }


    // =======================================================
    // TOP NAME
    // =======================================================

    setText(
      "topName",
      name || "—"
    );


    // =======================================================
    // HERO NAME
    // =======================================================

    setText(
      "heroName",
      name || "—"
    );


    // =======================================================
    // HERO META
    // =======================================================

    const metaParts = [];


    if (
      currentProfile.department
    ) {

      metaParts.push(
        currentProfile.department
      );
    }


    const yl =
      yearLabel(
        currentProfile.year
      );


    if (yl !== "Not provided") {

      metaParts.push(yl);
    }


    setText(
      "heroMeta",
      metaParts.length
        ? metaParts.join(" • ")
        : "—"
    );


    // =======================================================
    // HERO STUDENT ID
    // =======================================================

    const heroSid =
      document.getElementById(
        "heroStudentId"
      );


    if (heroSid) {

      heroSid.textContent =
        sid
          ? "Student ID: " + sid
          : "Student ID: —";
    }


    // =======================================================
    // LARGE AVATAR
    // =======================================================

    setAvatarText(
      document.getElementById(
        "largeAvatar"
      ),
      ini
    );


    // =======================================================
    // SIDEBAR AVATAR
    // =======================================================

    setAvatarText(
      document.getElementById(
        "sideAvatar"
      ),
      ini
    );


    // =======================================================
    // TOP AVATAR
    // =======================================================

    const topAvatar =
      document.getElementById(
        "topAvatar"
      );


    if (topAvatar) {

      topAvatar.textContent =
        ini;
    }


    // =======================================================
    // FORM FIELDS
    // =======================================================

    setInput(
      "fullName",
      currentProfile.full_name
    );


    setInput(
      "studentId",
      currentProfile.student_id
    );


    setInput(
      "dob",
      currentProfile.date_of_birth || ""
    );


    setInput(
      "gender",
      currentProfile.gender || ""
    );


    setInput(
      "phone",
      currentProfile.phone
    );


    setInput(
      "email",
      currentProfile.email
    );


    setInput(
      "address",
      currentProfile.address
    );


    setInput(
      "bloodGroup",
      currentProfile.blood_group
    );


    setInput(
      "emergencyContact",
      currentProfile.emergency_contact
    );


    setInput(
      "department",
      currentProfile.department
    );


    setInput(
      "year",
      currentProfile.year
    );


    // =======================================================
    // DISPLAY INFORMATION
    // =======================================================

    setText(
      "dispCourse",
      currentProfile.department
    );


    setText(
      "dispDepartment",
      currentProfile.department
    );


    setText(
      "dispYear",
      yearLabel(
        currentProfile.year
      )
    );


    setText(
      "dispStatus",
      currentProfile.status
    );


    setText(
      "dispBloodGroup",
      currentProfile.blood_group
    );


    setText(
      "dispEmergencyContact",
      currentProfile.emergency_contact
    );
// =======================================================
// PARENT / GUARDIAN INFORMATION
// =======================================================

const parent = currentProfile.parent || {};


// Parent Name
setText(
  "parentName",
  parent.full_name || null
);


// Parent Relationship
const parentRelationship =
  parent.relationship
    ? String(parent.relationship)
        .replace("_", " ")
        .replace(/\b\w/g, char => char.toUpperCase())
    : "Primary Contact";

setText(
  "parentRelationship",
  parentRelationship
);


// Parent Phone
const parentPhone =
  document.getElementById("parentPhone");

if (parentPhone) {

  parentPhone.textContent =
    parent.phone
      ? "📞 " + parent.phone
      : "📞 Not provided";

}


// Parent Email
const parentEmail =
  document.getElementById("parentEmail");

if (parentEmail) {

  parentEmail.textContent =
    parent.email
      ? "✉ " + parent.email
      : "✉ Not provided";

}


// Parent Avatar
const parentAvatar =
  document.getElementById("parentAvatar");

if (parentAvatar) {

  const parentName =
    parent.full_name || "Parent";

  const parts =
    parentName
      .trim()
      .split(/\s+/);

  let initials = "";

  if (parts.length >= 2) {

    initials =
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0);

  } else {

    initials =
      parts[0].substring(0, 2);

  }

  parentAvatar.textContent =
    initials.toUpperCase();

}


// Emergency Contact Parent Name
setText(
  "emergencyParentName",
  parent.full_name || null
);

    // =======================================================
    // VIEW MODE
    // =======================================================

    setEditMode(false);
  }


  // =========================================================
  // TOAST MESSAGE
  // =========================================================

  function showToast(
    title,
    message
  ) {

    const toast =
      document.getElementById(
        "toast"
      );


    const tTitle =
      document.getElementById(
        "toastTitle"
      );


    const tMsg =
      document.getElementById(
        "toastMessage"
      );


    if (tTitle) {

      tTitle.textContent =
        title || "Success";
    }


    if (tMsg) {

      tMsg.textContent =
        message || "";
    }


    if (toast) {

      toast.classList.add(
        "show"
      );


      setTimeout(
        function () {

          toast.classList.remove(
            "show"
          );

        },
        3000
      );

    } else {

      alert(
        (title
          ? title + ": "
          : "") +
        (message || "")
      );
    }
  }


  // =========================================================
  // LOAD ROOM
  // =========================================================

  async function loadRoom() {

    try {

      const r =
        await Api.get(
          "/students/me/room"
        );


      // No room
      if (
        !r.success ||
        !r.data
      ) {

        setText(
          "dispBlock",
          null
        );


        setText(
          "dispRoomNumber",
          null
        );


        setText(
          "dispFloor",
          null
        );


        setText(
          "dispBed",
          null
        );


        setText(
          "dispRoomType",
          null
        );


        setText(
          "dispJoinDate",
          null
        );


        return;
      }


      const a =
        r.data;


      const room =
        a.room || {};


      // Block
      setText(
        "dispBlock",
        room.block_name
      );


      // Room number
      setText(
        "dispRoomNumber",
        room.room_number
      );


      // Floor
      setText(
        "dispFloor",
        room.floor != null
          ? String(room.floor)
          : null
      );


      // Bed
      setText(
        "dispBed",
        a.bed_number != null
          ? String(a.bed_number)
          : null
      );


      // Room type
      setText(
        "dispRoomType",
        room.room_type
      );


      // Join date
      setText(
        "dispJoinDate",
        a.allocated_from
      );


    } catch (e) {

      console.warn(
        "Room load failed",
        e
      );
    }
  }


  // =========================================================
  // LOAD PROFILE
  // =========================================================

  async function loadProfile() {

    try {

      const result =
        await Api.get(
          "/students/me"
        );


      if (!result.success) {

        alert(
          result.message ||
          "Could not load profile. Please login again."
        );

        return;
      }


      // Fill student profile
      fillProfile(
        result.data || {}
      );


      // Load room information
      await loadRoom();


    } catch (error) {

      console.error(
        "Profile load error:",
        error
      );


      alert(
        "Unable to load student profile."
      );
    }
  }


  // =========================================================
  // COLLECT FORM DATA
  // =========================================================

  function collectPayload() {

    const yearElement =
      document.getElementById(
        "year"
      );


    const yearRaw =
      yearElement
        ? yearElement.value
        : "";


    let yearVal = null;


    if (
      yearRaw !== undefined &&
      yearRaw !== null &&
      String(yearRaw).trim() !== ""
    ) {

      yearVal =
        parseInt(
          yearRaw,
          10
        );


      if (
        Number.isNaN(yearVal)
      ) {

        yearVal = null;
      }
    }


    // Gender
    const genderEl =
      document.getElementById(
        "gender"
      );


    const genderVal =
      genderEl
        ? genderEl.value
        : "";


    // Build payload
    const payload = {

      full_name:
        (
          document.getElementById(
            "fullName"
          ) || {}
        ).value,


      phone:
        (
          document.getElementById(
            "phone"
          ) || {}
        ).value,


      department:
        (
          document.getElementById(
            "department"
          ) || {}
        ).value,


      year:
        yearVal,


      gender:
        genderVal || null,


      address:
        (
          document.getElementById(
            "address"
          ) || {}
        ).value,


      blood_group:
        (
          document.getElementById(
            "bloodGroup"
          ) || {}
        ).value,


      emergency_contact:
        (
          document.getElementById(
            "emergencyContact"
          ) || {}
        ).value,


      date_of_birth:
        (
          document.getElementById(
            "dob"
          ) || {}
        ).value || null
    };


    // =======================================================
    // NORMALIZE EMPTY VALUES
    // =======================================================

    [
      "full_name",
      "phone",
      "department",
      "address",
      "blood_group",
      "emergency_contact"

    ].forEach(function (key) {

      if (
        typeof payload[key] ===
        "string"
      ) {

        payload[key] =
          payload[key].trim();


        if (
          payload[key] === ""
        ) {

          payload[key] = null;
        }
      }
    });


    if (
      !payload.date_of_birth
    ) {

      payload.date_of_birth =
        null;
    }


    if (
      !payload.gender
    ) {

      payload.gender =
        null;
    }


    return payload;
  }


  // =========================================================
  // VALIDATE PROFILE
  // =========================================================

  function validatePayload(
    payload
  ) {

    // Full name
    if (
      payload.full_name &&
      payload.full_name.length < 2
    ) {

      return (
        "Full name must be at least 2 characters."
      );
    }


    // Phone
    if (
      payload.phone &&
      !/^[0-9+\-\s]{7,15}$/.test(
        payload.phone
      )
    ) {

      return (
        "Please enter a valid phone number."
      );
    }


    // Year
    if (
      payload.year != null &&
      (
        payload.year < 1 ||
        payload.year > 6
      )
    ) {

      return (
        "Year must be between 1 and 6."
      );
    }


    // Date of birth
    if (
      payload.date_of_birth &&
      !/^\d{4}-\d{2}-\d{2}$/.test(
        payload.date_of_birth
      )
    ) {

      return (
        "Date of birth must be a valid date."
      );
    }


    // Gender
    if (
      payload.gender &&
      [
        "male",
        "female",
        "other"
      ].indexOf(
        payload.gender
      ) === -1
    ) {

      return (
        "Invalid gender value."
      );
    }


    return null;
  }


  // =========================================================
  // SAVE PROFILE
  // =========================================================

  async function saveProfile() {

    const payload =
      collectPayload();


    const err =
      validatePayload(
        payload
      );


    if (err) {

      alert(err);

      return;
    }


    // Disable button
    if (saveBtn) {

      saveBtn.disabled = true;

      saveBtn.textContent =
        "Saving...";
    }


    try {

      const res =
        await Api.put(
          "/students/me",
          payload
        );


      if (res.success) {


        // ===================================================
        // UPDATE WITH RESPONSE DATA
        // ===================================================

        if (res.data) {

          fillProfile(
            res.data
          );

        } else {

          await loadProfile();
        }


        showToast(
          "Success",
          res.message ||
          "Profile updated successfully."
        );


      } else {

        alert(
          res.message ||
          "Failed to update profile"
        );
      }


    } catch (e) {

      console.error(e);


      alert(
        "Failed to update profile: " +
        (e.message || e)
      );


    } finally {

      if (saveBtn) {

        saveBtn.disabled =
          false;

        saveBtn.textContent =
          "Save Profile";
      }
    }
  }


  // =========================================================
  // EDIT BUTTON
  // =========================================================

  if (editBtn) {

    editBtn.addEventListener(
      "click",
      function (e) {

        e.preventDefault();

        e.stopPropagation();


        setEditMode(true);


        const first =
          document.getElementById(
            "fullName"
          );


        if (first) {

          first.focus();
        }
      }
    );

  } else {

    console.error(
      "editBtn not found in DOM"
    );
  }


  // =========================================================
  // SAVE BUTTON
  // =========================================================

  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      function (e) {

        e.preventDefault();

        e.stopPropagation();


        saveProfile();
      }
    );
  }


  // =========================================================
  // CANCEL BUTTON
  // =========================================================

  if (cancelBtn) {

    cancelBtn.addEventListener(
      "click",
      function (e) {

        e.preventDefault();

        e.stopPropagation();


        if (snapshot) {

          fillProfile(
            snapshot
          );

        } else {

          setEditMode(false);
        }
      }
    );
  }


  // =========================================================
  // INITIAL PAGE LOAD
  // =========================================================

  setEditMode(false);


  loadProfile();

});