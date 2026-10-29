    /* =========================================
   SMART HOST AI
   JavaScript File
========================================= */


/* =========================================
   MOBILE NAVBAR MENU
========================================= */


const menuToggle = document.querySelector(".menu-toggle");

const navLinks = document.querySelector(".nav-links");


if(menuToggle){

    menuToggle.addEventListener("click",()=>{

        navLinks.classList.toggle("active");

        menuToggle.classList.toggle("open");

    });

}



/* Close menu after clicking link */


const navItems = document.querySelectorAll(".nav-links a");


navItems.forEach(item=>{


    item.addEventListener("click",()=>{


        navLinks.classList.remove("active");


    });


});
/* =========================================
   NAVBAR GLASS EFFECT ON SCROLL
========================================= */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll",()=>{
    if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
    }
});


/* =========================================
   ANIMATED COUNTERS
========================================= */


const counters =
document.querySelectorAll(".counter");


let counterStarted = false;



function startCounter(){


    if(counterStarted) return;


    counters.forEach(counter=>{


        const target =
        Number(counter.dataset.target);


        let count = 0;


        const speed = target / 100;



        const updateCounter = ()=>{


            if(count < target){


                count += speed;


                counter.innerText =
                Math.ceil(count);


                setTimeout(updateCounter,20);


            }


            else{


                counter.innerText = target;


            }


        };


        updateCounter();


    });



    counterStarted=true;


}



window.addEventListener("scroll",()=>{


    const stats =
    document.querySelector(".stats");


    if(stats){


        const position =
        stats.getBoundingClientRect().top;


        if(position <
        window.innerHeight - 100){


            startCounter();


        }


    }


});



/* =========================================
   SCROLL REVEAL ANIMATION
========================================= */


const revealElements =
document.querySelectorAll(
".card, .ai-card, .module-card, .testimonial-card, .stat-card, .emergency-box"
);



const revealOnScroll = ()=>{


    revealElements.forEach(element=>{


        const elementTop =
        element.getBoundingClientRect().top;



        if(elementTop <
        window.innerHeight - 80){


            element.style.opacity="1";


            element.style.transform=
            "translateY(0)";


        }


    });


};



window.addEventListener(
"scroll",
revealOnScroll
);



/* Initial animation style */


revealElements.forEach(element=>{


    element.style.opacity="0";


    element.style.transform=
    "translateY(40px)";


    element.style.transition=
    "all .8s ease";


});



/* =========================================
   SMOOTH SCROLLING
========================================= */


document.querySelectorAll(
'a[href^="#"]'
)
.forEach(anchor=>{


    anchor.addEventListener(
    "click",
    function(e){


        const target =
        document.querySelector(
        this.getAttribute("href")
        );



        if(target){


            e.preventDefault();


            target.scrollIntoView({

                behavior:"smooth"

            });


        }


    });


});



/* =========================================
   HERO BUTTON EFFECT
========================================= */


const buttons =
document.querySelectorAll(
".primary-btn, .secondary-btn"
);



buttons.forEach(button=>{


    button.addEventListener(
    "mouseenter",
    ()=>{


        button.style.transform =
        "translateY(-5px) scale(1.05)";


    });



    button.addEventListener(
    "mouseleave",
    ()=>{


        button.style.transform =
        "translateY(0) scale(1)";


    });


});



/* =========================================
   PAGE LOAD ANIMATION
========================================= */


window.addEventListener(
"load",
()=>{


    document.body.style.opacity="1";


});