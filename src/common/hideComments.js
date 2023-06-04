import { logPrefix, logStyle } from "../index.js";

const currentUrl = window.location.href;

/* -------------------------------------------------------------------------- */
/*                      Hide Comments With Defined Words                      */
/* -------------------------------------------------------------------------- */

function hideComments() {
    // Get the list of words to hide from local storage
    const hideWords = localStorage.getItem("betterMDLHideWords");
    if (hideWords !== null) {
        const trimmedHideWords = hideWords.trim();
        if (trimmedHideWords !== "") {
            const wordsArray = trimmedHideWords.split(",");

            // Loop through all comments and check if they contain any of the words to hide
            $('div#cmtsapp li.post.comment').each(function () {
                const commentText = $(this).find(".post-message").text().toLowerCase();
                for (const word of wordsArray) {
                    if (commentText.includes(word.trim().toLowerCase())) {
                        $(this).hide();
                        console.log(logPrefix, logStyle,
                            `Comment hidden by "${word.trim().toLowerCase()}":`,
                            commentText
                        );
                        break;
                    }
                }
            });
        }
    }
}

// Check if the current URL matches the patterns we want to run the code on
if (
    currentUrl.match(/https:\/\/mydramalist\.com\/\d+\-.+/) ||
    currentUrl.match(/https:\/\/mydramalist\.com\/people\/\d+/) ||
    currentUrl.match(/https:\/\/mydramalist\.com\/list\/\w+/)
) {
    const hideWords = localStorage.getItem("betterMDLHideWords");
    if (hideWords !== null) {
        const trimmedHideWords = hideWords.trim();
        console.log(logPrefix, logStyle, "List of hidden words:", trimmedHideWords ? trimmedHideWords.split(",") : []);
    }
    // Hide comments on initial page load
    hideComments();

    // Watch for changes to the list of words to hide and update the list and hide comments
    $('input[name="hide_words"]').on("input", function () {
        localStorage.setItem("betterMDLHideWords", $(this).val());
        hideComments();
    });

    // Use a MutationObserver to watch for changes to the comments section and hide comments based on the list of words
    const commentsSection = document.querySelector("div#cmtsapp");
    if (commentsSection) {
        const observer = new MutationObserver(hideComments);
        observer.observe(commentsSection, { childList: true, subtree: true });
    }
}
