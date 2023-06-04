import { token, logPrefix, logStyle } from "../index.js";

// Function to set the start date as today's date
function setStartDate(titleId, token) {
    console.log(logPrefix, logStyle, 'Setting start date to today');
    var today = new Date();
    var month = today.getMonth() + 1; // Months are zero-based
    var day = today.getDate();
    var year = today.getFullYear();

    var formattedDate = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);

    // console.log('Sending PATCH request');
    // Prepare the form data
    var formData = new URLSearchParams();
    formData.append('date_start', formattedDate);
    
    // Make the PATCH request to update the start date
    fetch('/v1/users/watchaction/' + titleId + '?lang=en-US', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        console.log(logPrefix, logStyle, 'Response received');
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log(logPrefix, logStyle, 'Start date updated successfully', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to handle the "Add to List" button click event
function handleAddToListClick(event) {
    event.preventDefault();

    console.log(logPrefix, logStyle, 'Add to List button clicked');

    // Store the title id of the clicked button
    var titleId = event.currentTarget.dataset.id;
    
    observePopUp(titleId, token);
}

// Function to observe the pop-up element
function observePopUp(titleId, token) {
    // console.log('Observing pop-up');
    var popUpElement = document.querySelector('.el-dialog__body');

    if (popUpElement) {
        // console.log('Pop-up found');
        // Apply modifications to the pop-up
        var fields = observeFields(popUpElement, titleId, token);
        var statusSelect = fields.statusSelect;
        var episodesWatchedInput = fields.episodesWatchedInput;

        var submitButton = document.querySelector('.el-dialog__footer .btn-success');
        if (submitButton) {
            // console.log('Submit button found');
            submitButton.addEventListener('click', function () {
                var statusValue = statusSelect.options[statusSelect.selectedIndex].value;
                var episodesWatchedValue = parseInt(episodesWatchedInput.value);

                console.log(logPrefix, logStyle, 'Status value at submit: ' + statusValue);
                console.log(logPrefix, logStyle, 'Episodes watched value at submit: ' + episodesWatchedValue);

                if (statusValue === '1' && episodesWatchedValue === 1) {
                    setTimeout(function () {
                        setStartDate(titleId, token);
                    }, 2000);  // Wait for 5 seconds
                }
            });
        } else {
            console.log(logPrefix, logStyle, 'Submit button not found');
        }
    } else {
        // console.log('Pop-up not found, waiting for mutations');
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var addedNode = mutation.addedNodes[i];
                        if (addedNode.classList && addedNode.classList.contains('el-dialog__body')) {
                            // console.log('Pop-up added');
                            // Apply modifications to the pop-up
                            var fields = observeFields(addedNode, titleId, token);
                            var statusSelect = fields.statusSelect;
                            var episodesWatchedInput = fields.episodesWatchedInput;
        
                            var submitButton = document.querySelector('.el-dialog__footer .btn-success');
                            if (submitButton) {
                                console.log(logPrefix, logStyle, 'Submit button found');
                                submitButton.addEventListener('click', function () {
                                    var statusValue = statusSelect.options[statusSelect.selectedIndex].value;
                                    var episodesWatchedValue = parseInt(episodesWatchedInput.value);
        
                                    console.log(logPrefix, logStyle, 'Status value at submit: ' + statusValue);
                                    console.log(logPrefix, logStyle, 'Episodes watched value at submit: ' + episodesWatchedValue);
        
                                    if (statusValue === '1' && episodesWatchedValue === 1) {
                                        setTimeout(function () {
                                            setStartDate(titleId, token);
                                        }, 2000);  // Wait for 5 seconds
                                    }
                                });
                            } else {
                                console.log(logPrefix, logStyle, 'Submit button not found');
                            }
        
                            observer.disconnect();
                            return;
                        }
                    }
                }
            });
        });        

        observer.observe(document.body, { childList: true, subtree: true });
    }
}

// Function to observe changes in the status and episodes watched fields
function observeFields(popUpElement, titleId, token) {
    // console.log('Observing status and episodes watched fields');
    // console.log('Token:', token);

    // Select the status and episodes watched fields
    var statusSelect = popUpElement.querySelector('select.form-control');
    var episodesWatchedInput = popUpElement.querySelector('input[type="number"]');

    // Check if the fields are found
    if (statusSelect && episodesWatchedInput) {
        console.log(logPrefix, logStyle, 'Status and episodes watched fields found');
    } else {
        console.log(logPrefix, logStyle, 'Status and episodes watched fields not found');
    }

    // Return these variables so they can be used in other functions
    return {
        statusSelect: statusSelect,
        episodesWatchedInput: episodesWatchedInput
    };
}

// Start the modification process when the page is loaded
window.addEventListener('load', function () {
    // Find all "Add to List" buttons
    var addToListButtons = document.querySelectorAll('.btn-manage-list');

    if (addToListButtons.length > 0) {
        console.log(logPrefix, logStyle, 'Add to List buttons found');
        addToListButtons.forEach(function (button) {
            button.addEventListener('click', handleAddToListClick);
        });
    } else {
        console.log(logPrefix, logStyle, 'Add to List buttons not found');
    }
});
