/* =========================================================
   SMART HOSTEL AI — LANDING PAGE JAVASCRIPT
========================================================= */


/* =========================================================
   MOBILE MENU
========================================================= */

const menuBtn = document.getElementById("menuBtn");
const navContainer = document.querySelector(".nav-container");

if (menuBtn && navContainer) {

    menuBtn.addEventListener("click", () => {

        navContainer.classList.toggle("mobile-open");

        if (navContainer.classList.contains("mobile-open")) {
            menuBtn.innerHTML = "✕";
        } else {
            menuBtn.innerHTML = "☰";
        }

    });

}


/* =========================================================
   CLOSE MOBILE MENU AFTER CLICKING LINK
========================================================= */

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navContainer.classList.remove("mobile-open");

        if (menuBtn) {
            menuBtn.innerHTML = "☰";
        }

    });

});


/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute("id");
        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        const href = link.getAttribute("href");

        if (href === "#" + currentSection) {
            link.classList.add("active");
        }

    });

});


/* =========================================================
   CHATBOT ELEMENTS
========================================================= */

const chatbotButton = document.getElementById("chatbotButton");
const chatbotBox = document.getElementById("chatbotBox");
const closeChatbot = document.getElementById("closeChatbot");

const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");

const chatbotBody = document.querySelector(".chatbot-body");


/* =========================================================
   OPEN CHATBOT
========================================================= */

if (chatbotButton && chatbotBox) {

    chatbotButton.addEventListener("click", () => {

        chatbotBox.classList.toggle("show");

        if (chatbotBox.classList.contains("show")) {

            setTimeout(() => {

                if (chatInput) {
                    chatInput.focus();
                }

            }, 200);

        }

    });

}


/* =========================================================
   CLOSE CHATBOT
========================================================= */

if (closeChatbot) {

    closeChatbot.addEventListener("click", () => {

        chatbotBox.classList.remove("show");

    });

}


/* =========================================================
   BASIC FAQ RESPONSES
========================================================= */

function getFAQResponse(question) {

    const text = question.toLowerCase();


    if (
        text.includes("login") ||
        text.includes("sign in")
    ) {

        return "You can login by clicking the Get Started or Login button and selecting Student, Warden or Parent.";

    }


    if (
        text.includes("student") &&
        text.includes("login")
    ) {

        return "Students can use the Student Login portal to access their hostel dashboard.";

    }


    if (
        text.includes("warden")
    ) {

        return "Wardens can login through the Warden portal to manage students, rooms, visitors, complaints and hostel activities.";

    }


    if (
        text.includes("parent")
    ) {

        return "Parents can login through the Parent portal to stay connected with their student's hostel updates.";

    }


    if (
        text.includes("emergency") ||
        text.includes("sos")
    ) {

        return "For emergencies, students can use the Emergency Assistant to quickly report the situation and request assistance.";

    }


    if (
        text.includes("visitor")
    ) {

        return "The AI Visitor Risk Detection feature helps wardens identify unusual visitor activity based on visitor patterns.";

    }


    if (
        text.includes("faq") ||
        text.includes("question") ||
        text.includes("help")
    ) {

        return "I can help with common hostel questions about login, emergency assistance, visitors, hostel procedures and portal access.";

    }


    if (
        text.includes("room")
    ) {

        return "Room information and allocation details can be viewed through the Student Hostel Portal.";

    }


    if (
        text.includes("leave")
    ) {

        return "Students can submit and track their leave applications through the Leave Management section.";

    }


    if (
        text.includes("attendance")
    ) {

        return "Students can check their attendance from the Attendance section of the hostel dashboard.";

    }


    return "I'm here to help with hostel-related questions. You can ask about login, emergency support, visitors, rooms, leave or attendance.";

}


/* =========================================================
   ADD MESSAGE TO CHAT
========================================================= */

function addMessage(message, type) {

    if (!chatbotBody) {
        return;
    }

    const messageDiv = document.createElement("div");

    messageDiv.className =
        type === "user"
            ? "user-message"
            : "bot-message";

    messageDiv.textContent = message;

    chatbotBody.appendChild(messageDiv);


    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}


/* =========================================================
   SEND CHAT MESSAGE
========================================================= */

function sendChatMessage() {

    if (!chatInput) {
        return;
    }

    const question = chatInput.value.trim();


    if (question === "") {
        return;
    }


    /* User message */

    addMessage(question, "user");


    /* Clear input */

    chatInput.value = "";


    /* Bot response */

    setTimeout(() => {

        const response = getFAQResponse(question);

        addMessage(response, "bot");

    }, 500);

}


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendChat) {

    sendChat.addEventListener("click", sendChatMessage);

}


/* =========================================================
   ENTER KEY
========================================================= */

if (chatInput) {

    chatInput.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendChatMessage();

        }

    });

}


/* =========================================================
   CLOSE CHATBOT WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener("click", (event) => {

    if (!chatbotBox || !chatbotButton) {
        return;
    }


    const clickedInsideChatbot =
        chatbotBox.contains(event.target);

    const clickedButton =
        chatbotButton.contains(event.target);


    if (
        chatbotBox.classList.contains("show") &&
        !clickedInsideChatbot &&
        !clickedButton
    ) {

        chatbotBox.classList.remove("show");

    }

});


/* =========================================================
   SCROLL REVEAL ANIMATION
========================================================= */

const revealElements = document.querySelectorAll(
    ".role-card, .feature-card, .ai-card, .step, .safety-wrapper, .about-content"
);


const revealObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("reveal-visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);


revealElements.forEach(element => {

    element.classList.add("reveal-element");

    revealObserver.observe(element);

});


/* =========================================================
   ADD REVEAL STYLES DYNAMICALLY
========================================================= */

const revealStyle = document.createElement("style");

revealStyle.innerHTML = `

    .reveal-element {
        opacity: 0;
        transform: translateY(25px);
        transition:
            opacity 0.7s ease,
            transform 0.7s ease;
    }

    .reveal-element.reveal-visible {
        opacity: 1;
        transform: translateY(0);
    }

`;

document.head.appendChild(revealStyle);


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener("load", () => {

    document.body.classList.add("page-loaded");

});