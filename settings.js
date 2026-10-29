/* =========================================================
   SMART HOSTEL AI — SETTINGS JAVASCRIPT
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");

const settingsTabs =
    document.querySelectorAll(".settings-tab");

const settingsSections =
    document.querySelectorAll(".settings-section");

const themeOptions =
    document.querySelectorAll(".theme-option");

const switches =
    document.querySelectorAll(".switch input");

const toast =
    document.getElementById("settingsToast");

const toastMessage =
    document.getElementById("toastMessage");

const changePhotoBtn =
    document.getElementById("changePhotoBtn");


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

if (menuBtn && sidebar) {

    menuBtn.addEventListener("click", function () {

        sidebar.classList.toggle("show");

        const icon =
            menuBtn.querySelector("i");

        if (sidebar.classList.contains("show")) {

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });

}


/* =========================================================
   CLOSE SIDEBAR WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener("click", function (event) {

    if (!sidebar || !menuBtn) return;

    const clickedInsideSidebar =
        sidebar.contains(event.target);

    const clickedMenu =
        menuBtn.contains(event.target);

    if (
        window.innerWidth <= 900 &&
        !clickedInsideSidebar &&
        !clickedMenu &&
        sidebar.classList.contains("show")
    ) {

        sidebar.classList.remove("show");

        const icon =
            menuBtn.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    }

});


/* =========================================================
   SETTINGS TAB SWITCHING
========================================================= */

settingsTabs.forEach(function (tab) {

    tab.addEventListener("click", function () {

        const target =
            tab.getAttribute("data-target");


        /* Remove active from all tabs */

        settingsTabs.forEach(function (item) {

            item.classList.remove("active");

        });


        /* Remove active from all sections */

        settingsSections.forEach(function (section) {

            section.classList.remove("active");

        });


        /* Activate selected tab */

        tab.classList.add("active");


        /* Activate selected section */

        const selectedSection =
            document.getElementById(target);

        if (selectedSection) {

            selectedSection.classList.add("active");

        }


        /* Scroll smoothly on mobile */

        if (window.innerWidth <= 900) {

            setTimeout(function () {

                selectedSection?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);

        }

    });

});


/* =========================================================
   THEME SELECTION
========================================================= */

themeOptions.forEach(function (option) {

    option.addEventListener("click", function () {

        /* Remove active */

        themeOptions.forEach(function (item) {

            item.classList.remove("active");

        });


        /* Add active */

        option.classList.add("active");


        /* Get selected theme */

        const selectedTheme =
            option.getAttribute("data-theme");


        /* Save theme */

        localStorage.setItem(
            "smartHostelTheme",
            selectedTheme
        );


        /* Apply theme */

        applyTheme(selectedTheme);


        /* Toast */

        showToast(
            selectedTheme.charAt(0).toUpperCase() +
            selectedTheme.slice(1) +
            " theme selected"
        );

    });

});


/* =========================================================
   APPLY SAVED THEME
========================================================= */

function applyTheme(theme) {

    document.body.classList.remove(
        "theme-light",
        "theme-soft",
        "theme-dark"
    );


    if (theme === "dark") {

        document.body.classList.add(
            "theme-dark"
        );

    }

    else if (theme === "soft") {

        document.body.classList.add(
            "theme-soft"
        );

    }

    else {

        document.body.classList.add(
            "theme-light"
        );

    }

}


/* =========================================================
   LOAD SAVED THEME
========================================================= */

const savedTheme =
    localStorage.getItem("smartHostelTheme");


if (savedTheme) {

    applyTheme(savedTheme);


    themeOptions.forEach(function (option) {

        option.classList.remove("active");


        if (
            option.getAttribute("data-theme") ===
            savedTheme
        ) {

            option.classList.add("active");

        }

    });

}


/* =========================================================
   TOGGLE SWITCHES
========================================================= */

switches.forEach(function (toggle, index) {

    toggle.addEventListener("change", function () {

        const status =
            toggle.checked
                ? "enabled"
                : "disabled";


        showToast(
            "Setting " +
            status +
            " successfully"
        );


        /* Save toggle state */

        localStorage.setItem(
            "setting_" + index,
            toggle.checked
        );

    });

});


/* =========================================================
   LOAD SAVED TOGGLES
========================================================= */

switches.forEach(function (toggle, index) {

    const savedValue =
        localStorage.getItem(
            "setting_" + index
        );


    if (savedValue !== null) {

        toggle.checked =
            savedValue === "true";

    }

});


/* =========================================================
   SAVE PROFILE
========================================================= */

const saveButton =
    document.querySelector(".save-btn");


if (saveButton) {

    saveButton.addEventListener(
        "click",
        function () {

            const name =
                document.getElementById(
                    "fullName"
                )?.value;

            const email =
                document.getElementById(
                    "email"
                )?.value;

            const phone =
                document.getElementById(
                    "phone"
                )?.value;


            /* Basic validation */

            if (!name || !email || !phone) {

                showToast(
                    "Please fill all required fields"
                );

                return;

            }


            /* Save profile */

            localStorage.setItem(
                "studentName",
                name
            );

            localStorage.setItem(
                "studentEmail",
                email
            );

            localStorage.setItem(
                "studentPhone",
                phone
            );


            /* Update displayed names */

            document.querySelectorAll(
                ".student-info h4, .top-profile-info strong"
            ).forEach(function (element) {

                element.textContent = name;

            });


            showToast(
                "Profile updated successfully"
            );

        }
    );

}


/* =========================================================
   LOAD PROFILE DATA
========================================================= */

const savedName =
    localStorage.getItem("studentName");

const savedEmail =
    localStorage.getItem("studentEmail");

const savedPhone =
    localStorage.getItem("studentPhone");


if (savedName) {

    const nameInput =
        document.getElementById("fullName");

    if (nameInput) {

        nameInput.value = savedName;

    }


    document.querySelectorAll(
        ".student-info h4, .top-profile-info strong"
    ).forEach(function (element) {

        element.textContent = savedName;

    });

}


/* Email */

if (savedEmail) {

    const emailInput =
        document.getElementById("email");

    if (emailInput) {

        emailInput.value = savedEmail;

    }

}


/* Phone */

if (savedPhone) {

    const phoneInput =
        document.getElementById("phone");

    if (phoneInput) {

        phoneInput.value = savedPhone;

    }

}


/* =========================================================
   CHANGE PROFILE PHOTO
========================================================= */

if (changePhotoBtn) {

    changePhotoBtn.addEventListener(
        "click",
        function () {

            const fileInput =
                document.createElement("input");

            fileInput.type = "file";

            fileInput.accept =
                "image/png,image/jpeg,image/jpg";


            fileInput.click();


            fileInput.addEventListener(
                "change",
                function () {

                    const file =
                        fileInput.files[0];


                    if (!file) return;


                    /* Check image */

                    if (!file.type.startsWith("image/")) {

                        showToast(
                            "Please select an image"
                        );

                        return;

                    }


                    /* Create preview */

                    const reader =
                        new FileReader();


                    reader.onload =
                        function (event) {

                            const imageURL =
                                event.target.result;


                            /* Update avatars */

                            document.querySelectorAll(
                                ".large-avatar, .profile-avatar, .top-avatar"
                            ).forEach(function (avatar) {

                                avatar.innerHTML = "";

                                const img =
                                    document.createElement("img");

                                img.src =
                                    imageURL;

                                img.alt =
                                    "Profile";

                                img.style.width =
                                    "100%";

                                img.style.height =
                                    "100%";

                                img.style.objectFit =
                                    "cover";

                                img.style.borderRadius =
                                    "inherit";

                                avatar.appendChild(img);

                            });


                            /* Save image */

                            localStorage.setItem(
                                "studentProfileImage",
                                imageURL
                            );


                            showToast(
                                "Profile photo updated"
                            );

                        };


                    reader.readAsDataURL(file);

                }
            );

        }
    );

}


/* =========================================================
   LOAD PROFILE PHOTO
========================================================= */

const savedPhoto =
    localStorage.getItem(
        "studentProfileImage"
    );


if (savedPhoto) {

    document.querySelectorAll(
        ".large-avatar, .profile-avatar, .top-avatar"
    ).forEach(function (avatar) {

        avatar.innerHTML = "";

        const img =
            document.createElement("img");

        img.src =
            savedPhoto;

        img.alt =
            "Profile";

        img.style.width =
            "100%";

        img.style.height =
            "100%";

        img.style.objectFit =
            "cover";

        img.style.borderRadius =
            "inherit";

        avatar.appendChild(img);

    });

}


/* =========================================================
   TOAST FUNCTION
========================================================= */

function showToast(message) {

    if (!toast || !toastMessage) return;


    toastMessage.textContent =
        message;


    toast.style.display =
        "flex";


    toast.style.animation =
        "none";


    /* Re-trigger animation */

    void toast.offsetWidth;


    toast.style.animation =
        "toastIn .3s ease";


    clearTimeout(
        window.toastTimeout
    );


    window.toastTimeout =
        setTimeout(function () {

            toast.style.display =
                "none";

        }, 2500);

}


/* =========================================================
   CONTACT ADMIN
========================================================= */

const contactAdminBtn =
    document.querySelector(
        ".contact-admin-btn"
    );


if (contactAdminBtn) {

    contactAdminBtn.addEventListener(
        "click",
        function () {

            showToast(
                "Admin contact request sent"
            );

        }
    );

}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

const passwordButton =
    document.querySelector(
        ".secondary-btn"
    );


/* =========================================================
   INPUT FOCUS EFFECT
========================================================= */

const inputs =
    document.querySelectorAll(
        ".form-group input:not(:disabled)"
    );


inputs.forEach(function (input) {

    input.addEventListener(
        "focus",
        function () {

            input.parentElement.classList.add(
                "focused"
            );

        }
    );


    input.addEventListener(
        "blur",
        function () {

            input.parentElement.classList.remove(
                "focused"
            );

        }
    );

});


/* =========================================================
   PREVENT EMPTY FORM
========================================================= */

inputs.forEach(function (input) {

    input.addEventListener(
        "input",
        function () {

            if (input.value.trim() !== "") {

                input.classList.remove(
                    "input-error"
                );

            }

        }
    );

});


/* =========================================================
   ESC KEY — CLOSE SIDEBAR
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            sidebar?.classList.contains("show")
        ) {

            sidebar.classList.remove("show");

            const icon =
                menuBtn?.querySelector("i");

            if (icon) {

                icon.classList.remove(
                    "fa-xmark"
                );

                icon.classList.add(
                    "fa-bars"
                );

            }

        }

    }
);


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "SmartHost AI Settings loaded successfully"
        );

    }
);