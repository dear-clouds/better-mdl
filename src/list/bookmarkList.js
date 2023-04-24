
var bookmarkButton = document.createElement("a");
bookmarkButton.className = "m-r bar-item bookmark-link";
bookmarkButton.innerHTML = '<i class="icon far fa-bookmark m-r-xs"></i> Bookmark';

var reportLink = document.querySelector(".report-link");
reportLink.parentNode.insertBefore(bookmarkButton, reportLink);

// Check if the list has already been bookmarked
var listUrl = window.location.href;
var savedLists = JSON.parse(localStorage.getItem("betterMDLbookmarkLists")) || [];
if (savedLists.includes(listUrl)) {
  bookmarkButton.classList.add("bookmarked");
  bookmarkButton.innerHTML = '<i class="icon fas fa-bookmark m-r-xs"></i> Bookmarked';
}

bookmarkButton.addEventListener("click", function () {
  if (bookmarkButton.classList.contains("bookmarked")) {
    // Remove the list URL from the saved lists array
    var listIndex = savedLists.indexOf(listUrl);
    if (listIndex !== -1) {
      savedLists.splice(listIndex, 1);
    }
    localStorage.setItem("betterMDLbookmarkLists", JSON.stringify(savedLists));

    // Update the button state and alert the user that the list has been unbookmarked
    bookmarkButton.classList.remove("bookmarked");
    bookmarkButton.innerHTML = '<i class="icon far fa-bookmark m-r-xs"></i> Bookmark';
    alert("List unbookmarked!");

    // Update the savedLists in localStorage
    localStorage.setItem("betterMDLbookmarkLists", JSON.stringify(savedLists));
  } else {
    // Add the list URL to the saved lists array
    savedLists.push(listUrl);
    localStorage.setItem("betterMDLbookmarkLists", JSON.stringify(savedLists));

    // Get the list title and author
    var listTitle = document.querySelector(".box-header h1").textContent.trim();
    var listAuthor = document.querySelector(".list-by a").textContent.trim();

    // Save the list details to local storage
    var savedDetails = JSON.parse(localStorage.getItem("betterMDLbookmarkDetails")) || {};
    savedDetails[listUrl] = {
      title: listTitle,
      author: listAuthor,
    };
    localStorage.setItem("betterMDLbookmarkDetails", JSON.stringify(savedDetails));

    // Update the button state and alert the user that the list has been bookmarked
    bookmarkButton.classList.add("bookmarked");
    bookmarkButton.innerHTML = '<i class="icon fas fa-bookmark m-r-xs"></i> Bookmarked';
    alert("List bookmarked!");

    // Update the savedLists in localStorage
    localStorage.setItem("betterMDLbookmarkLists", JSON.stringify(savedLists));
  }
});
