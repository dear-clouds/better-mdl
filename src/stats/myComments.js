import { username, token, getAllComments, colours, logPrefix, logStyle } from '../index.js';

// Create the Comment button
const commentButton = document.createElement('button');
commentButton.className = 'btn btn-primary';
commentButton.innerHTML = '<i class="fas fa-comments"></i> My Comments';
commentButton.style.marginLeft = '30px';
const column = document.querySelector('.col-lg-8.col-md-8');
const boxBody = column.querySelector('.box-body.m-b-2');
boxBody.parentNode.insertBefore(commentButton, boxBody);

// Function to fetch and display stored comments
function loadStoredComments() {
    const storedComments = localStorage.getItem('betterMDLComments');
    let allComments = [];
    if (storedComments) {
        const commentsObj = JSON.parse(storedComments);
        for (const url in commentsObj) {
            let comments = commentsObj[url].map(comment => ({ ...comment, url }));
            allComments = allComments.concat(comments);
        }
        // Sort all the comments by date
        allComments.sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime());
    }
    return allComments;
}

// Function to handle the Comment button click event
function handleCommentButtonClick() {
    if (commentButton.innerText === ' My Comments') {
        // Clear the content of box-body and the first box-body below it
        const boxBodies = column.querySelectorAll('.box-body');
        boxBodies.forEach((box) => {
            box.innerHTML = '';
        });

        const allComments = loadStoredComments();

        // Display all comments
        allComments.forEach((comment) => {
            const titleId = getTitleIdFromURL(comment.url);
            displayUserComments([comment], titleId, comment.url);
        });

        // Create the Import Comments button
        const importCommentsButton = document.createElement('button');
        importCommentsButton.className = 'btn btn-primary';
        importCommentsButton.innerHTML = '<i class="fas fa-download"></i> Import Comments';
        importCommentsButton.style.float = 'right';
        importCommentsButton.style.marginRight = '30px';
        boxBody.parentNode.insertBefore(importCommentsButton, boxBody);

        // Open the modal when the Import Comments button is clicked
        importCommentsButton.onclick = function () {
            $('#importCommentsModal').modal('show');
        };

        // Change the button text to "Stats"
        commentButton.innerHTML = '<i class="fas fa-chart-bar"></i> Stats';
    } else {
        window.location.reload();
    }
}

// Add event listener to the Comment button
commentButton.addEventListener('click', handleCommentButtonClick);

// Create a container element for the comments
const commentsContainer = document.createElement('div');
commentsContainer.className = 'bettermdl-comments';

// Insert the comments container after the box-body element
boxBody.parentNode.insertBefore(commentsContainer, boxBody.nextSibling);

// Function to display the user comments
function displayUserComments(comments) {
    const storedPosters = localStorage.getItem('betterMDLPosters');
    let postersObj = {};
    if (storedPosters) {
        postersObj = JSON.parse(storedPosters);
    }

    // Iterate over the comments and create a comment element for each
    comments.forEach((comment) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment card bg-light mb-3';
        commentElement.style.margin = '10px';
        commentElement.style.transition = 'transform 0.2s ease-in-out';

        // Add hover effect to the card
        commentElement.addEventListener('mouseenter', () => {
            commentElement.style.transform = 'scale(1.02)';
        });

        commentElement.addEventListener('mouseleave', () => {
            commentElement.style.transform = 'scale(1)';
        });

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header font-weight-bold';
        cardHeader.style.background = 'var(--mdl-box-background-2)';
        cardHeader.style.display = 'flex';
        cardHeader.style.justifyContent = 'space-between';
        commentElement.appendChild(cardHeader);

        // console.log(logPrefix, logStyle, 'Processing comment with type:', comment.type);

        const typeColours = {
            'drama': colours[1],
            'actor': colours[2],
            'list': colours[3],
        };

        // Create an icon element based on the type
        let typeIcon;
        if (comment.type === 'drama') {
            typeIcon = document.createElement('i');
            typeIcon.className = 'fas fa-film';
            typeIcon.style.backgroundColor = typeColours['drama'];
        } else if (comment.type === 'actor') {
            typeIcon = document.createElement('i');
            typeIcon.className = 'fas fa-user';
            typeIcon.style.backgroundColor = typeColours['actor'];
        } else if (comment.type === 'list') {
            typeIcon = document.createElement('i');
            typeIcon.className = 'fas fa-list';
            typeIcon.style.backgroundColor = typeColours['list'];
        }

        if (typeIcon) {
            typeIcon.style.color = 'var(--mdl-background)';
            typeIcon.style.padding = '2px 5px 2px 5px';
            typeIcon.style.borderRadius = '10px';
        }

        // console.log(logPrefix, logStyle, 'Created type icon:', typeIcon);

        // Create the title element
        const titleElement = document.createElement('a');
        titleElement.href = comment.url;
        titleElement.target = '_blank';

        // Add the icon to the title element
        if (typeIcon) {
            titleElement.appendChild(typeIcon);
        }

        // Then add the title text
        const titleText = document.createTextNode(` ${comment.title || ''}`);
        titleElement.appendChild(titleText);

        cardHeader.appendChild(titleElement);

        // Create the delete comment icon
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash-alt';
        deleteIcon.style.cursor = 'pointer';
        deleteIcon.title = 'Delete Comment';
        deleteIcon.style.marginLeft = 'auto';

        // Handle delete comment click event
        deleteIcon.addEventListener('click', () => {
            deleteComment(comment);
        });

        cardHeader.appendChild(deleteIcon);

        // Create the card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        cardBody.style.display = 'flex';
        cardBody.style.justifyContent = 'space-between';
        cardBody.style.padding = '10px';
        commentElement.appendChild(cardBody);

        // Create the comment text element inside card body
        const commentTextContainer = document.createElement('div');
        commentTextContainer.className = 'comment-text-container';
        const commentText = document.createElement('p');

        // Check if the comment is a reply and prepend the reply indicator to the comment text
        if (comment.parent_id > 0) {
            const replyIndicator = '<span style="margin-right: 10px;"><i class="fas fa-reply"></i></span>';
            commentText.innerHTML = replyIndicator + comment.message.replace(/\n/g, '<br>');
        } else {
            commentText.innerHTML = comment.message.replace(/\n/g, '<br>');
        }


        commentTextContainer.appendChild(commentText);
        cardBody.appendChild(commentTextContainer);

        // If a poster exists for the movie, add it to the card body
        let url = comment.url;
        url = url.replace('https://mydramalist.com', '') || url;

        if (postersObj[url]) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'film-cover';
            const img = document.createElement('img');
            img.src = postersObj[url];
            img.style.width = '70px';
            img.style.height = 'auto';
            imgContainer.appendChild(img);
            cardBody.appendChild(imgContainer);
        }

        // Create the card footer
        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer d-flex justify-content-between align-items-center small';
        cardFooter.style.background = 'var(--mdl-box-background-2)';
        commentElement.appendChild(cardFooter);

        // Create a container for the date
        const dateContainer = document.createElement('div');
        dateContainer.className = 'pull-left';
        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        dateContainer.innerHTML = '<i class="fas fa-calendar-alt"></i> ' + new Date(comment.date_added).toLocaleString('en-US', options);
        cardFooter.appendChild(dateContainer);

        // Create the comment permalink element
        const commentLink = document.createElement('a');
        commentLink.href = `${url}#comment-${comment.id}`;
        commentLink.className = 'card-link pull-right';
        commentLink.innerHTML = '<i class="fas fa-link"></i> Permalink';
        cardFooter.appendChild(commentLink);

        commentsContainer.appendChild(commentElement);
    });
}


// Function to delete a comment
function deleteComment(comment) {
    const storedComments = localStorage.getItem('betterMDLComments');
    if (storedComments) {
        const commentsObj = JSON.parse(storedComments);
        const url = comment.url;
        if (commentsObj[url]) {
            const existingComments = commentsObj[url];
            const updatedComments = existingComments.filter((c) => c.id !== comment.id);
            commentsObj[url] = updatedComments;
            localStorage.setItem('betterMDLComments', JSON.stringify(commentsObj));

            const commentElement = document.getElementById(`comment-${comment.id}`);
            if (commentElement) {
                commentElement.remove();
            }

            alert('Comment deleted successfully.');
            window.location.reload();
        }
    }
}

// Function to extract the title ID from the URL
function getTitleIdFromURL(url) {
    const dramaRegex = /\/(\d+)-/;
    const actorRegex = /\/people\/(\d+)/;
    const listRegex = /\/list\/([^/]+)/;

    let type = null;
    let id = null;

    if (actorRegex.test(url)) {
        const matches = url.match(actorRegex);
        type = 'actor';
        id = matches[1];
    } else if (listRegex.test(url)) {
        const matches = url.match(listRegex);
        type = 'list';
        id = matches[1];
    } else if (dramaRegex.test(url)) {
        const matches = url.match(dramaRegex);
        type = 'drama';
        id = matches[1];
    }

    return { type, id };
}

// Function to fetch the title from the API
async function fetchTitleFromAPI(url) {
    // console.log('Fetching title from API...');
    // console.log('URL:', url);

    const { type, id } = getTitleIdFromURL(url);
    let apiUrl = '';

    if (type === 'drama') {
        apiUrl = `https://mydramalist.com/v1/titles/${id}`;
    } else if (type === 'actor') {
        apiUrl = `https://mydramalist.com/v1/people/${id}`;
    } else if (type === 'list') {
        apiUrl = `https://mydramalist.com/v1/lists/${id}`;
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let title = null;

        if (type === 'drama') {
            title = data.title;
        } else if (type === 'actor') {
            title = data.display_name;
        } else if (type === 'list') {
            title = data.name;
        }

        console.log(logPrefix, logStyle, 'Title fetched:', title);
        return title;
    } catch (error) {
        console.error(logPrefix, logStyle, 'Error fetching title:', error);
        return null;
    }
}

// Function to fetch and store comments
function importComments() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();

    if (url === '') {
        alert('Please enter a valid URL.');
        return;
    }

    // console.log('URL:', url);

    fetchTitleFromAPI(url)
        .then((title) => {
            if (!title) {
                alert('Could not fetch title');
                return;
            }

            console.log(logPrefix, logStyle, 'Fetching comments...');
            // console.log('URL:', url);

            const storedComments = localStorage.getItem('betterMDLComments');
            const commentsObj = storedComments ? JSON.parse(storedComments) : {};

            const existingComments = commentsObj[url] || [];

            const { type, id } = getTitleIdFromURL(url);

            getAllComments(token, id, type, getTitleIdFromURL(url))
                .then((comments) => {
                    console.log(logPrefix, logStyle, 'Comments fetched:', comments);
                    if (comments.length === 0) {
                        alert("We couldn't find your comments.");
                    } else {
                        const newComments = [];
                        const deletedComments = [];

                        // Compare new comments with existing comments and identify new and deleted comments
                        comments.forEach((comment) => {
                            const existingCommentIndex = existingComments.findIndex(
                                (existingComment) => existingComment.id === comment.id
                            );
                            if (existingCommentIndex === -1) {
                                newComments.push(comment);
                            }
                        });

                        // Identify deleted comments
                        existingComments.forEach((existingComment) => {
                            const commentExists = comments.some((comment) => comment.id === existingComment.id);
                            if (!commentExists && !existingComment.deleted) {
                                deletedComments.push(existingComment);
                            }
                        });

                        // Remove deleted comments from existing comments
                        const updatedComments = existingComments.filter(
                            (comment) => !deletedComments.includes(comment)
                        );

                        // Append new comments to existing comments
                        const mergedComments = [...updatedComments, ...newComments].map((comment) => ({
                            ...comment,
                            url,
                            title,
                        }));

                        commentsObj[url] = mergedComments.map(comment => ({ ...comment, type }));
                        localStorage.setItem('betterMDLComments', JSON.stringify(commentsObj));
                        console.log(logPrefix, logStyle, 'Stored user comments:', comments);

                        if (newComments.length > 0) {
                            alert(`Successfully imported ${newComments.length} new comments!`);
                        } else if (deletedComments.length > 0) {
                            deletedComments.forEach((deletedComment) => {
                                alert(`Comment "${deletedComment.message}" has been deleted.`);
                            });
                        } else {
                            alert('No new comments to import.');
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching comments:', error);
                    alert('Error fetching comments. Please check the console for more details.');
                });
        })
        .catch((error) => {
            console.error('Error fetching title:', error);
            alert('Could not fetch title');
        });
}


// Create the modal HTML dynamically
const modalContainer = document.createElement('div');
modalContainer.innerHTML = `
  <!-- Button to open the modal -->
  <button id="importCommentsBtn" class="btn btn-primary">Import my comments</button>

  <!-- Modal -->
  <div id="importCommentsModal" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="background: var(--mdl-background);">
        <div class="modal-header">
          <h5 class="modal-title" style="color: var(--mdl-text);">Import Comments</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true" style="color: var(--mdl-text);">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info" role="alert">
            <p>Please note that importing comments will use your browser storage, so it may not be ideal to import a large number of comments.</p>
            <p>Allow some time for the script to go through all the comments, you will get a pop-up when it's done.</p>
            If you edit a comment, delete the comment here and re-import it.
          </div>
          <form id="importCommentsForm">
            <div class="form-group">
              <label for="urlInput" style="color: var(--mdl-text);">Enter the URL of the title:</label>
              <input type="text" class="form-control" style="background: var(--mdl-text); color: var(--mdl-background);" id="urlInput" required>
            </div>
            <!-- Progress Status and Import Button -->
            <div class="import-progress-wrapper">
              <button type="submit" class="btn btn-primary">Import</button>
              <span id="importProgress" style="margin-left:10px; color: var(--mdl-text);"></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
`;

document.body.appendChild(modalContainer);

// Open the modal when the button is clicked
const importCommentsBtn = document.getElementById('importCommentsBtn');
const importCommentsModal = document.getElementById('importCommentsModal');

importCommentsBtn.onclick = function () {
    $('#importCommentsModal').modal('show');
};

// Handle form submission
const importCommentsForm = document.getElementById('importCommentsForm');
importCommentsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    importComments();
});

