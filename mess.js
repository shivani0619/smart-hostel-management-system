/* =====================================================
   SMART HOSTEL AI
   MESS PAGE JAVASCRIPT
===================================================== */


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initMobileMenu();

    initNotifications();

    initMealPreference();

    initFoodRating();

    initContactMess();

    initSidebarLinks();

});



/* =====================================================
   MOBILE SIDEBAR
===================================================== */

function initMobileMenu() {

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.querySelector(".sidebar");

    if (!menuBtn || !sidebar) {
        return;
    }


    menuBtn.addEventListener("click", () => {

        sidebar.classList.toggle("show");

    });


    /* Close sidebar when clicking outside */

    document.addEventListener("click", (event) => {

        const clickedInsideSidebar =
            sidebar.contains(event.target);

        const clickedMenu =
            menuBtn.contains(event.target);


        if (
            !clickedInsideSidebar &&
            !clickedMenu &&
            sidebar.classList.contains("show")
        ) {

            sidebar.classList.remove("show");

        }

    });

}



/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

function initNotifications() {

    const notificationBtn =
        document.getElementById("notificationBtn");


    if (!notificationBtn) {
        return;
    }


    notificationBtn.addEventListener("click", () => {

        showToast(
            "Open notifications",
            "info"
        );

    });

}



/* =====================================================
   MEAL PREFERENCE
===================================================== */

function initMealPreference() {

    const preferenceButtons =
        document.querySelectorAll(".preference-btn");

    const message =
        document.getElementById("preferenceMessage");


    if (!preferenceButtons.length || !message) {
        return;
    }


    preferenceButtons.forEach(button => {

        button.addEventListener("click", () => {


            /* Remove active from all buttons */

            preferenceButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            /* Add active to selected button */

            button.classList.add("active");


            const choice =
                button.dataset.choice;


            if (choice === "yes") {

                message.innerHTML =
                    'Meal preference marked as <strong>Yes</strong>.';

                showToast(
                    "Your meal preference is marked as YES 🍽️",
                    "success"
                );

            }


            else if (choice === "no") {

                message.innerHTML =
                    'Meal preference marked as <strong>No</strong>.';

                showToast(
                    "Your meal preference is marked as NO",
                    "info"
                );

            }


        });

    });

}



/* =====================================================
   FOOD RATING
===================================================== */

function initFoodRating() {

    const ratingButtons =
        document.querySelectorAll(".rating-btn");

    const ratingText =
        document.getElementById("ratingText");


    if (!ratingButtons.length || !ratingText) {
        return;
    }


    const ratingMessages = {

        1: "Poor 😕",

        2: "Needs Improvement 😐",

        3: "Good 🙂",

        4: "Very Good 😊",

        5: "Excellent 🤩"

    };


    ratingButtons.forEach(button => {


        button.addEventListener("click", () => {


            const rating =
                Number(button.dataset.rating);


            /* Remove selected class */

            ratingButtons.forEach(btn => {

                btn.classList.remove("selected");

            });


            /* Select stars */

            ratingButtons.forEach(btn => {

                const btnRating =
                    Number(btn.dataset.rating);


                if (btnRating <= rating) {

                    btn.classList.add("selected");

                }

            });


            /* Update text */

            ratingText.textContent =
                ratingMessages[rating];


            showToast(
                `Thanks! You rated today's food ${rating}/5 ⭐`,
                "success"
            );


        });


    });

}



/* =====================================================
   CONTACT MESS
===================================================== */

function initContactMess() {

    const contactBtn =
        document.getElementById("contactMessBtn");


    if (!contactBtn) {
        return;
    }


    contactBtn.addEventListener("click", () => {

        showContactModal();

    });

}



/* =====================================================
   CONTACT MODAL
===================================================== */

function showContactModal() {

    const existingModal =
        document.querySelector(".mess-contact-modal");


    if (existingModal) {
        return;
    }


    const modal =
        document.createElement("div");


    modal.className =
        "mess-contact-modal";


    modal.innerHTML = `

        <div class="mess-modal-overlay"></div>

        <div class="mess-modal">

            <button
                class="close-modal"
                id="closeMessModal">

                <i class="fa-solid fa-xmark"></i>

            </button>


            <div class="modal-icon">

                <i class="fa-solid fa-utensils"></i>

            </div>


            <span class="modal-label">
                MESS SUPPORT
            </span>


            <h3>
                Contact Mess Manager
            </h3>


            <p>
                For food quality, meal timing,
                hygiene or mess-related issues,
                contact the mess manager.
            </p>


            <div class="contact-details">


                <div class="contact-detail">

                    <div>
                        <i class="fa-solid fa-user"></i>
                    </div>

                    <span>
                        Mr. Arun Kumar
                    </span>

                </div>


                <div class="contact-detail">

                    <div>
                        <i class="fa-solid fa-phone"></i>
                    </div>

                    <span>
                        +91 XXXXX XXXXX
                    </span>

                </div>


                <div class="contact-detail">

                    <div>
                        <i class="fa-solid fa-envelope"></i>
                    </div>

                    <span>
                        mess@smarthostel.com
                    </span>

                </div>


            </div>


            <button
                class="modal-close-btn"
                id="modalDoneBtn">

                Done

            </button>

        </div>

    `;


    document.body.appendChild(modal);


    /* Add modal styles dynamically */

    addModalStyles();


    /* Close button */

    const closeBtn =
        document.getElementById("closeMessModal");

    const doneBtn =
        document.getElementById("modalDoneBtn");

    const overlay =
        modal.querySelector(".mess-modal-overlay");


    closeBtn.addEventListener(
        "click",
        () => closeModal(modal)
    );


    doneBtn.addEventListener(
        "click",
        () => closeModal(modal)
    );


    overlay.addEventListener(
        "click",
        () => closeModal(modal)
    );


}



/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal(modal) {

    modal.classList.add("closing");


    setTimeout(() => {

        modal.remove();

    }, 200);

}



/* =====================================================
   MODAL STYLES
===================================================== */

function addModalStyles() {

    if (
        document.getElementById(
            "mess-modal-dynamic-style"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "mess-modal-dynamic-style";


    style.innerHTML = `

        .mess-contact-modal {

            position: fixed;

            inset: 0;

            z-index: 9999;

            display: flex;

            align-items: center;

            justify-content: center;

            animation:
                modalFadeIn .25s ease;

        }


        .mess-modal-overlay {

            position: absolute;

            inset: 0;

            background:
                rgba(25, 29, 50, .45);

            backdrop-filter:
                blur(5px);

        }


        .mess-modal {

            width: min(390px, calc(100% - 30px));

            background: white;

            border-radius: 20px;

            padding: 28px;

            position: relative;

            z-index: 2;

            text-align: center;

            box-shadow:
                0 25px 70px
                rgba(20, 25, 50, .2);

            animation:
                modalSlideUp .3s ease;

        }


        .mess-contact-modal.closing {

            animation:
                modalFadeOut .2s ease
                forwards;

        }


        .mess-contact-modal.closing
        .mess-modal {

            animation:
                modalSlideDown .2s ease
                forwards;

        }


        .close-modal {

            position: absolute;

            top: 14px;

            right: 14px;

            width: 28px;

            height: 28px;

            border-radius: 8px;

            border: 0;

            background: #f5f5fa;

            color: #888d9c;

            display: flex;

            align-items: center;

            justify-content: center;

        }


        .close-modal:hover {

            background: #eeeeF7;

            color: #6364d2;

        }


        .modal-icon {

            width: 52px;

            height: 52px;

            margin: 0 auto 12px;

            border-radius: 15px;

            background: #eeeeff;

            color: #6667d5;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 19px;

        }


        .modal-label {

            font-size: 6px;

            color: #9da1af;

            letter-spacing: 1.2px;

            font-weight: 600;

        }


        .mess-modal h3 {

            margin-top: 5px;

            font-size: 15px;

            color: #3d4355;

        }


        .mess-modal > p {

            margin-top: 7px;

            color: #959aa8;

            font-size: 6.5px;

            line-height: 1.7;

        }


        .contact-details {

            margin-top: 18px;

            display: flex;

            flex-direction: column;

            gap: 8px;

            text-align: left;

        }


        .contact-detail {

            display: flex;

            align-items: center;

            gap: 9px;

            padding: 10px;

            background: #f8f8fc;

            border-radius: 9px;

        }


        .contact-detail > div {

            width: 27px;

            height: 27px;

            border-radius: 7px;

            background: #eeeeff;

            color: #6566d3;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 9px;

        }


        .contact-detail span {

            font-size: 6.5px;

            color: #656a7a;

        }


        .modal-close-btn {

            width: 100%;

            height: 36px;

            border: 0;

            border-radius: 9px;

            margin-top: 17px;

            background:
                linear-gradient(
                    135deg,
                    #6667d5,
                    #8b7edc
                );

            color: white;

            font-size: 7px;

            font-weight: 600;

            box-shadow:
                0 8px 20px
                rgba(102,103,213,.18);

        }


        .modal-close-btn:hover {

            transform: translateY(-1px);

        }


        @keyframes modalFadeIn {

            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }

        }


        @keyframes modalFadeOut {

            from {
                opacity: 1;
            }

            to {
                opacity: 0;
            }

        }


        @keyframes modalSlideUp {

            from {

                opacity: 0;

                transform:
                    translateY(20px)
                    scale(.97);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0)
                    scale(1);

            }

        }


        @keyframes modalSlideDown {

            from {

                opacity: 1;

                transform:
                    translateY(0)
                    scale(1);

            }

            to {

                opacity: 0;

                transform:
                    translateY(15px)
                    scale(.97);

            }

        }


        @media(max-width:500px) {

            .mess-modal {

                padding: 22px;

            }

        }

    `;


    document.head.appendChild(style);

}



/* =====================================================
   SIDEBAR LINKS
===================================================== */

function initSidebarLinks() {

    const links =
        document.querySelectorAll(
            ".sidebar-nav .nav-link"
        );


    links.forEach(link => {

        link.addEventListener("click", () => {


            links.forEach(item => {

                item.classList.remove("active");

            });


            link.classList.add("active");


        });

    });

}



/* =====================================================
   TOAST NOTIFICATION
===================================================== */

function showToast(message, type = "info") {

    const existingToast =
        document.querySelector(".mess-toast");


    if (existingToast) {

        existingToast.remove();

    }


    const toast =
        document.createElement("div");


    toast.className =
        `mess-toast ${type}`;


    let icon = "fa-circle-info";


    if (type === "success") {

        icon = "fa-circle-check";

    }


    if (type === "error") {

        icon = "fa-circle-exclamation";

    }


    toast.innerHTML = `

        <div class="toast-icon">

            <i class="fa-solid ${icon}"></i>

        </div>

        <span>
            ${message}
        </span>

    `;


    document.body.appendChild(toast);


    addToastStyles();


    setTimeout(() => {

        toast.classList.add("hide");

        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 2800);

}



/* =====================================================
   TOAST STYLES
===================================================== */

function addToastStyles() {

    if (
        document.getElementById(
            "mess-toast-style"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "mess-toast-style";


    style.innerHTML = `

        .mess-toast {

            position: fixed;

            right: 25px;

            bottom: 25px;

            z-index: 10000;

            min-width: 230px;

            max-width: 330px;

            padding: 11px 14px;

            border-radius: 11px;

            background: white;

            border: 1px solid #e9e9f0;

            box-shadow:
                0 15px 40px
                rgba(30,35,65,.13);

            display: flex;

            align-items: center;

            gap: 9px;

            color: #5c6272;

            font-size: 6px;

            animation:
                toastIn .3s ease;

        }


        .mess-toast.hide {

            animation:
                toastOut .25s ease
                forwards;

        }


        .toast-icon {

            width: 27px;

            height: 27px;

            border-radius: 8px;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #eeeeff;

            color: #6667d4;

            font-size: 10px;

            flex-shrink: 0;

        }


        .mess-toast.success
        .toast-icon {

            background: #eaf8f1;

            color: #46a677;

        }


        .mess-toast.error
        .toast-icon {

            background: #fff0f1;

            color: #d76973;

        }


        @keyframes toastIn {

            from {

                opacity: 0;

                transform:
                    translateY(15px);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0);

            }

        }


        @keyframes toastOut {

            from {

                opacity: 1;

                transform:
                    translateY(0);

            }

            to {

                opacity: 0;

                transform:
                    translateY(10px);

            }

        }


        @media(max-width:600px) {

            .mess-toast {

                left: 15px;

                right: 15px;

                bottom: 15px;

                min-width: auto;

            }

        }

    `;


    document.head.appendChild(style);

}