// ==========================================================
// STUDENT ANNOUNCEMENTS
// ==========================================================

if (!requireAuth("student")) {
  // redirected
}


// ==========================================================
// STUDENT PROFILE NAME
// ==========================================================

const profile = Api.getProfile() || {};

const studentNameEl =
  document.getElementById("studentName");

if (studentNameEl) {
  studentNameEl.textContent =
    profile.full_name || "Student";
}


// ==========================================================
// LOAD ANNOUNCEMENTS
// ==========================================================

async function loadStudentAnnouncements() {

  const box =
    document.getElementById(
      "studentAnnouncementsBox"
    );

  if (!box) return;


  // Loading
  box.innerHTML = `
    <div style="
      padding:40px 20px;
      text-align:center;
      color:#7c8494;
    ">
      <i
        class="fa-solid fa-spinner fa-spin"
        style="
          font-size:28px;
          margin-bottom:10px;
        "
      ></i>

      <p>Loading announcements...</p>
    </div>
  `;


  try {

    const r =
      await Api.get(
        "/announcements"
      );


    const items =
      r.success &&
      Array.isArray(r.data)
        ? r.data
        : [];


    // No announcements
    if (!items.length) {

      box.innerHTML = `
        <div style="
          padding:50px 20px;
          text-align:center;
          color:#7c8494;
        ">

          <i
            class="fa-solid fa-bullhorn"
            style="
              font-size:40px;
              margin-bottom:15px;
            "
          ></i>

          <h3 style="
            margin:0 0 8px;
            color:#182235;
          ">
            No Announcements
          </h3>

          <p style="
            margin:0;
            font-size:14px;
          ">
            There are no hostel announcements at the moment.
          </p>

        </div>
      `;

      return;
    }


    // Display announcements
    box.innerHTML =
      items.map((a) => {
const date =
  a.created_at
    ? new Date(a.created_at + "Z")
        .toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
    : "";
        return `
          <div style="
            background:#ffffff;
            border:1px solid #e8eaf0;
            border-radius:16px;
            padding:18px;
            margin-bottom:14px;
            box-shadow:0 4px 12px rgba(0,0,0,0.04);
          ">

            <div style="
              display:flex;
              align-items:flex-start;
              gap:12px;
            ">

              <div style="
                width:42px;
                height:42px;
                min-width:42px;
                border-radius:12px;
                background:#eef0ff;
                color:#5b5ce2;
                display:flex;
                align-items:center;
                justify-content:center;
              ">
                <i class="fa-solid fa-bullhorn"></i>
              </div>


              <div style="flex:1;">

                <h3 style="
                  margin:0 0 6px;
                  color:#182235;
                  font-size:17px;
                  font-weight:600;
                ">
                  ${a.title || "Announcement"}
                </h3>


                <p style="
                  margin:0 0 10px;
                  color:#5f6878;
                  font-size:14px;
                  line-height:1.6;
                  white-space:pre-wrap;
                ">
                  ${a.content || ""}
                </p>


                ${
                  date
                    ? `
                      <small style="
                        color:#9aa1ad;
                        font-size:12px;
                      ">
                        <i class="fa-regular fa-clock"></i>
                        ${date}
                      </small>
                    `
                    : ""
                }

              </div>

            </div>

          </div>
        `;

      }).join("");


  } catch (error) {

    console.error(
      "Failed to load announcements:",
      error
    );


    box.innerHTML = `
      <div style="
        padding:40px 20px;
        text-align:center;
        color:#dc3545;
      ">

        <i
          class="fa-solid fa-circle-exclamation"
          style="
            font-size:36px;
            margin-bottom:12px;
          "
        ></i>

        <h3 style="
          margin:0 0 8px;
        ">
          Unable to Load Announcements
        </h3>

        <p style="
          margin:0;
          color:#7c8494;
          font-size:14px;
        ">
          Please try again later.
        </p>

      </div>
    `;
  }
}


// ==========================================================
// REFRESH BUTTON
// ==========================================================

document
  .getElementById("refreshAnnouncements")
  ?.addEventListener(
    "click",
    loadStudentAnnouncements
  );


// ==========================================================
// INITIAL LOAD
// ==========================================================

loadStudentAnnouncements();