/* =====================================================
   SMART HOSTEL AI
   FACE RECOGNITION JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {


    /* =================================================
       ELEMENTS
    ================================================= */

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.querySelector(".sidebar");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const startScanBtn =
        document.getElementById("startScanBtn");

    const stopScanBtn =
        document.getElementById("stopScanBtn");

    const cameraPlaceholder =
        document.getElementById("cameraPlaceholder");

    const faceFrame =
        document.getElementById("faceFrame");

    const scanStatus =
        document.getElementById("scanStatus");

    const verificationStatus =
        document.getElementById("verificationStatus");

    const accuracyValue =
        document.getElementById("accuracyValue");

    const lastVerified =
        document.getElementById("lastVerified");

    const resultCard =
        document.getElementById("resultCard");

    const resultTime =
        document.getElementById("resultTime");


    /* =================================================
       VARIABLES
    ================================================= */

    let scanning = false;
    let scanTimer = null;
    let scanStep = 0;


    /* =================================================
       MOBILE SIDEBAR
    ================================================= */

    if (menuBtn) {

        menuBtn.addEventListener("click", () => {

            sidebar.classList.toggle("show");

        });

    }


    /* Close sidebar when clicking outside */

    document.addEventListener("click", (event) => {

        if (
            window.innerWidth <= 900 &&
            sidebar.classList.contains("show") &&
            !sidebar.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {

            sidebar.classList.remove("show");

        }

    });


    /* =================================================
       NOTIFICATION BUTTON
    ================================================= */

    if (notificationBtn) {

        notificationBtn.addEventListener("click", () => {

            showToast(
                "Open notifications",
                "info"
            );

        });

    }


    /* =================================================
       START FACE SCAN
    ================================================= */

    if (startScanBtn) {

        startScanBtn.addEventListener("click", startFaceScan);

    }


    function startFaceScan() {


        /* Prevent multiple scans */

        if (scanning) {

            return;

        }


        scanning = true;
        scanStep = 0;


        /* Hide placeholder */

        if (cameraPlaceholder) {

            cameraPlaceholder.style.opacity = "0";

        }


        /* Activate face frame */

        if (faceFrame) {

            faceFrame.classList.add("active");
            faceFrame.classList.add("scanning");

        }


        /* Update status */

        setScanStatus(
            "Scanning your face...",
            "scanning"
        );


        /* Update button */

        startScanBtn.disabled = true;

        startScanBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Scanning...
        `;


        /* Update verification card */

        resetVerification();


        /* Simulated AI scanning steps */

        scanTimer = setInterval(() => {

            scanStep++;

            runScanStep(scanStep);

        }, 1000);

    }


    /* =================================================
       SCAN STEPS
    ================================================= */

    function runScanStep(step) {


        switch (step) {


            case 1:

                setScanStatus(
                    "Detecting face...",
                    "scanning"
                );

                break;


            case 2:

                setScanStatus(
                    "Analyzing facial features...",
                    "scanning"
                );

                break;


            case 3:

                setScanStatus(
                    "Matching student profile...",
                    "scanning"
                );

                break;


            case 4:

                setScanStatus(
                    "Checking identity...",
                    "scanning"
                );

                break;


            case 5:

                completeVerification();

                break;

        }

    }


    /* =================================================
       COMPLETE VERIFICATION
    ================================================= */

    function completeVerification() {


        clearInterval(scanTimer);

        scanning = false;


        /* Stop scanning animation */

        if (faceFrame) {

            faceFrame.classList.remove("scanning");

        }


        /* Success status */

        setScanStatus(
            "Face Verified Successfully",
            "success"
        );


        /* Random realistic accuracy */

        const accuracy =
            (96 + Math.random() * 3).toFixed(1);


        if (accuracyValue) {

            accuracyValue.textContent =
                accuracy + "%";

        }


        /* Current time */

        const now = new Date();

        const formattedTime =
            now.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        if (lastVerified) {

            lastVerified.textContent =
                formattedTime;

        }


        if (resultTime) {

            resultTime.textContent =
                formattedTime;

        }


        /* Update verification status */

        if (verificationStatus) {

            verificationStatus.classList.add(
                "verified"
            );


            verificationStatus.innerHTML = `

                <div class="status-icon">

                    <i class="fa-solid fa-circle-check"></i>

                </div>

                <div>

                    <span>STATUS</span>

                    <h4>
                        Identity Verified
                    </h4>

                </div>

            `;

        }


        /* Show result */

        if (resultCard) {

            resultCard.classList.add("show");

        }


        /* Reset button */

        if (startScanBtn) {

            startScanBtn.disabled = false;

            startScanBtn.innerHTML = `

                <i class="fa-solid fa-rotate-right"></i>

                Scan Again

            `;

        }


        /* Show success toast */

        showToast(
            "Face verified successfully!",
            "success"
        );


    }


    /* =================================================
       STOP SCAN
    ================================================= */

    if (stopScanBtn) {

        stopScanBtn.addEventListener(
            "click",
            stopFaceScan
        );

    }


    function stopFaceScan() {


        if (!scanning) {

            resetCamera();

            return;

        }


        clearInterval(scanTimer);

        scanning = false;


        if (faceFrame) {

            faceFrame.classList.remove(
                "active",
                "scanning"
            );

        }


        if (cameraPlaceholder) {

            cameraPlaceholder.style.opacity = "1";

        }


        setScanStatus(
            "Scan stopped",
            "error"
        );


        if (startScanBtn) {

            startScanBtn.disabled = false;

            startScanBtn.innerHTML = `

                <i class="fa-solid fa-camera"></i>

                Start Face Scan

            `;

        }


        showToast(
            "Face scan stopped",
            "info"
        );

    }


    /* =================================================
       RESET CAMERA
    ================================================= */

    function resetCamera() {


        clearInterval(scanTimer);

        scanning = false;


        if (faceFrame) {

            faceFrame.classList.remove(
                "active",
                "scanning"
            );

        }


        if (cameraPlaceholder) {

            cameraPlaceholder.style.opacity = "1";

        }


        setScanStatus(
            "Ready to Scan",
            ""
        );


        if (startScanBtn) {

            startScanBtn.disabled = false;

            startScanBtn.innerHTML = `

                <i class="fa-solid fa-camera"></i>

                Start Face Scan

            `;

        }

    }


    /* =================================================
       RESET VERIFICATION
    ================================================= */

    function resetVerification() {


        if (resultCard) {

            resultCard.classList.remove("show");

        }


        if (verificationStatus) {

            verificationStatus.classList.remove(
                "verified"
            );


            verificationStatus.innerHTML = `

                <div class="status-icon">

                    <i class="fa-solid fa-shield-halved"></i>

                </div>

                <div>

                    <span>STATUS</span>

                    <h4>
                        Verifying...
                    </h4>

                </div>

            `;

        }


        if (accuracyValue) {

            accuracyValue.textContent = "--";

        }


        if (lastVerified) {

            lastVerified.textContent = "Not yet";

        }

    }


    /* =================================================
       UPDATE SCAN STATUS
    ================================================= */

    function setScanStatus(message, type) {


        if (!scanStatus) {

            return;

        }


        scanStatus.textContent = message;


        scanStatus.classList.remove(
            "scanning",
            "success",
            "error"
        );


        if (type) {

            scanStatus.classList.add(type);

        }

    }


    /* =================================================
       TOAST NOTIFICATION
    ================================================= */

    function showToast(message, type = "info") {


        /* Remove existing toast */

        const oldToast =
            document.querySelector(".face-toast");

        if (oldToast) {

            oldToast.remove();

        }


        /* Create toast */

        const toast =
            document.createElement("div");

        toast.className =
            `face-toast ${type}`;


        let icon =
            "fa-circle-info";


        if (type === "success") {

            icon = "fa-circle-check";

        }


        if (type === "error") {

            icon = "fa-circle-xmark";

        }


        toast.innerHTML = `

            <i class="fa-solid ${icon}"></i>

            <span>
                ${message}
            </span>

        `;


        document.body.appendChild(toast);


        /* Show */

        setTimeout(() => {

            toast.classList.add("show");

        }, 50);


        /* Remove */

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 3000);

    }


    /* =================================================
       ADD TOAST STYLES
    ================================================= */

    const toastStyle =
        document.createElement("style");


    toastStyle.innerHTML = `

        .face-toast {

            position: fixed;

            right: 25px;

            bottom: 25px;

            display: flex;

            align-items: center;

            gap: 9px;

            padding: 11px 15px;

            background: #ffffff;

            border: 1px solid #e9e9f0;

            border-radius: 10px;

            box-shadow:
                0 15px 35px rgba(30,35,65,.12);

            color: #555b6d;

            font-size: 7px;

            font-weight: 500;

            transform:
                translateY(20px);

            opacity: 0;

            transition: .3s ease;

            z-index: 9999;

        }


        .face-toast.show {

            transform:
                translateY(0);

            opacity: 1;

        }


        .face-toast i {

            font-size: 12px;

        }


        .face-toast.success i {

            color: #45a576;

        }


        .face-toast.error i {

            color: #d86672;

        }


        .face-toast.info i {

            color: #6869d8;

        }


        @media(max-width:600px) {

            .face-toast {

                right: 12px;

                left: 12px;

                bottom: 15px;

                justify-content: center;

            }

        }

    `;


    document.head.appendChild(toastStyle);


    /* =================================================
       ESC KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                if (scanning) {

                    stopFaceScan();

                }

            }

        }
    );


    /* =================================================
       INITIAL STATE
    ================================================= */

    resetCamera();


});