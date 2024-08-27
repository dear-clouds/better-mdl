/* -------------------------------------------------------------------------- */
/*                       Back to Top button on all pages                      */
/* -------------------------------------------------------------------------- */

const backToTop = document.createElement("div");
backToTop.innerHTML = "&#8593;"; // up arrow icon
backToTop.setAttribute("id", "backToTop");
backToTop.setAttribute("title", "Return to top");
backToTop.style.display = "none"; // hide by default
backToTop.style.position = "fixed";
backToTop.style.right = "20px";
backToTop.style.bottom = "100px";
backToTop.style.borderRadius = "10px";
backToTop.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.3)";
backToTop.style.fontSize = "20px";
backToTop.style.cursor = "pointer";
backToTop.style.zIndex = "999";

document.body.appendChild(backToTop);

// add event listener to scroll event
window.addEventListener("scroll", function () {
    // show the button when the user has scrolled down
    if (window.pageYOffset > 200) {
        backToTop.style.display = "block";
    } else {
        backToTop.style.display = "none";
    }
});
backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});