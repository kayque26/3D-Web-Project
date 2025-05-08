document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav a");
    const hoverSound = new Audio("sounds/hoverbutton.mp3");
    const hoverSound2 = new Audio("sounds/hoverbutton2.mp3");

    navLinks.forEach(link => {
        link.addEventListener("mouseenter", () => {
            hoverSound.currentTime = 0; 
            hoverSound.play();
            link.classList.add("hover-glow");
        });

        link.addEventListener("mouseleave", () => {
            link.classList.remove("hover-glow");
        });
    });

    const imageButtons = document.querySelectorAll(".image-button button");
    const modelButtons = document.querySelectorAll("#button-panel button");
    const clickSound = new Audio("sounds/buttonclick.mp3");

    imageButtons.forEach(button => {
        button.addEventListener("click", () => {
            clickSound.currentTime = 0;
            clickSound.play();
        });
    });

    modelButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            clickSound.currentTime = 0;
            clickSound.play();
        });
    });

    imageButtons.forEach(button => {
        button.addEventListener("mouseenter", () => {
            hoverSound2.currentTime = 0;
            hoverSound2.play();
        });
    });

    modelButtons.forEach(function(button) {
    button.addEventListener("mouseenter", function() {
        hoverSound2.currentTime = 0;
        hoverSound2.play();
    });
});

});

