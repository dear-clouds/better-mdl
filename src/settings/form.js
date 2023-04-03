import { colours } from '../index.js';
import { icons } from '../index.js';

// Get a reference to the div we created earlier
let betterMDLDiv = $();

betterMDLDiv = $('<div id="better-mdl" style="padding: 20px;"></div>');

// Add the div before the box-footer b-t div
$('div#footer').before(betterMDLDiv);

// Add a title to the div
betterMDLDiv.append($('<h2></h2>').text('Better MDL Settings'));

const formElement = $('<form class="form-horizontal"></form>');

const tmdbGroup = $('<div class="form-group"></div>');
const tmdbCheck = $('<div class="form-check form-check-inline"></div>');
const tmdbCheckbox = $('<input type="checkbox" class="form-check-input offset-md-1" name="tmdb_search" value="true">');
const tmdbLabel = $('<label class="form-check-label">Include TMDB/TVDB/IMDB icons on a title page</label>');
const tmdbTooltip = $('<span class="tmdb-tooltip" style="margin-left: 5px;"><i class="fas fa-question-circle"></i></span>');
const tmdbTooltipImage = $('<img src="https://raw.githubusercontent.com/dear-clouds/better-mdl/main/images/external_icons.png" style="max-width: 350px;display:none;">');
tmdbTooltip.hover(function () {
    tmdbTooltipImage.show();
}, function () {
    tmdbTooltipImage.hide();
});
tmdbCheck.append(tmdbCheckbox, tmdbLabel, tmdbTooltip);
tmdbTooltip.append(tmdbTooltipImage);
tmdbLabel.append(tmdbTooltip);
tmdbGroup.append(tmdbCheck);

const ratingsCheck = $('<div class="form-check form-check-inline"></div>');
const ratingsCheckbox = $('<input type="checkbox" class="form-check-input offset-md-1" name="ratings_enabled" value="true">');
const ratingsLabel = $('<label class="form-check-label">Show external ratings (TMDB must be enabled)</label>');
const ratingsTooltip = $('<span class="ratings-tooltip" style="margin-left: 5px;"><i class="fas fa-question-circle"></i></span>');
const ratingsTooltipImage = $('<img src="https://raw.githubusercontent.com/dear-clouds/better-mdl/main/images/external_ratings.png" style="max-width: 350px;display:none;">');
ratingsTooltip.hover(function () {
    ratingsTooltipImage.show();
}, function () {
    ratingsTooltipImage.hide();
});
ratingsLabel.append(ratingsTooltip);
ratingsTooltip.append(ratingsTooltipImage);
ratingsCheck.append(ratingsCheckbox, ratingsLabel);


const shareCheck = $('<div class="form-check form-check-inline"></div>');
const shareCheckbox = $('<input type="checkbox" class="form-check-input offset-md-1" name="share_enabled" value="true">');
const shareLabel = $('<label class="form-check-label">Hide the share icons</label>');
const shareTooltip = $('<span class="share-tooltip" style="margin-left: 5px;"><i class="fas fa-question-circle"></i></span>');
const shareTooltipImage = $('<img src="https://raw.githubusercontent.com/dear-clouds/better-mdl/main/images/share_icons.png" style="max-width: 350px;display:none;">');
shareTooltip.hover(function () {
    shareTooltipImage.show();
}, function () {
    shareTooltipImage.hide();
});
shareLabel.append(shareTooltip);
shareTooltip.append(shareTooltipImage);
shareCheck.append(shareCheckbox, shareLabel);

const defaultStatsCheck = $('<div class="form-check form-check-inline"></div>');
const defaultStatsCheckbox = $('<input type="checkbox" class="form-check-input offset-md-1" name="defaultStats_enabled" value="true">');
const defaultStatsLabel = $('<label class="form-check-label">Hide the default MDL stats on profile</label>');
const defaultStatsTooltip = $('<span class="defaultStats-tooltip" style="margin-left: 5px;"><i class="fas fa-question-circle"></i></span>');
const defaultStatsTooltipImage = $('<img src="https://raw.githubusercontent.com/dear-clouds/better-mdl/main/images/mdl_default_stats.png" style="max-width: 350px;display:none;">');
defaultStatsTooltip.hover(function () {
    defaultStatsTooltipImage.show();
}, function () {
    defaultStatsTooltipImage.hide();
});
defaultStatsLabel.append(defaultStatsTooltip);
defaultStatsTooltip.append(defaultStatsTooltipImage);
defaultStatsCheck.append(defaultStatsCheckbox, defaultStatsLabel);

const optionsCol = $('<div class="col-md-4"></div>').append(tmdbCheck, ratingsCheck, shareCheck, defaultStatsCheck);
tmdbGroup.append(optionsCol);

// Load the value of the TMDB search checkbox from local storage and set the checkbox state
const tmdbSearchEnabled = localStorage.getItem('betterMDLTMDBSearch');
if (tmdbSearchEnabled === 'true') {
    tmdbCheckbox.prop('checked', true);
}
const ratingsEnabled = localStorage.getItem('betterMDLRatings');
if (ratingsEnabled === 'true') {
    ratingsCheckbox.prop('checked', true);
}

const shareEnabled = localStorage.getItem('betterMDLhideShareContainer');
if (shareEnabled === 'true') {
    shareCheckbox.prop('checked', true);
}

const defaultStatsEnabled = localStorage.getItem('betterMDLhidedefaultStats');
if (defaultStatsEnabled === 'true') {
    defaultStatsCheckbox.prop('checked', true);
}

// Create a div to hold the form groups for the icons
const iconColumn = $('<div class="col-md-4"></div>');

// Loop through the icons and create an input field for each one
for (let key in icons) {
    let labelText;
    switch (key) {
        case '1':
            labelText = 'Icon for "Currently Watching"';
            break;
        case '2':
            labelText = 'Icon for "Completed"';
            break;
        case '3':
            labelText = 'Icon for "Plan to Watch"';
            break;
        case '4':
            labelText = 'Icon for "On Hold"';
            break;
        case '5':
            labelText = 'Icon for "Dropped"';
            break;
        case '6':
            labelText = 'Icon for "Not Interested"';
            break;
        default:
            labelText = '';
            break;
    }

    const label = $('<label class="control-label"></label>').text(labelText);
    const input = $(`<input type="text" class="form-control" name="icon_${key}" value="${icons[key]}">`);
    const formGroup = $('<div class="form-group"></div>').append(label, input);
    iconColumn.append(formGroup);
}

// Create a div to hold the form groups for the colors
const colorColumn = $('<div class="col-md-4"></div>');

// Loop through the colors and create an input field for each one
for (let key in colours) {
    let labelText;
    switch (key) {
        case '1':
            labelText = 'Color for "Currently Watching"';
            break;
        case '2':
            labelText = 'Color for "Completed"';
            break;
        case '3':
            labelText = 'Color for "Plan to Watch"';
            break;
        case '4':
            labelText = 'Color for "On Hold"';
            break;
        case '5':
            labelText = 'Color for "Dropped"';
            break;
        case '6':
            labelText = 'Color for "Not Interested"';
            break;
        default:
            labelText = '';
            break;
    }

    const label = $('<label class="control-label"></label>').text(labelText);
    const input = $(`<input type="text" class="form-control" name="color_${key}" value="${colours[key]}">`);
    const formGroup = $('<div class="form-group"></div>').append(label, input);
    colorColumn.append(formGroup);
}

const hideWordsLabel = $('<label class="control-label">Hide comments containing any of those terms (separated by comma)</label>');
const hideWordsInput = $(`<input type="text" class="form-control" name="hide_words" value="${localStorage.getItem('betterMDLHideWords') ?? ''}">`);
const hideWordsGroup = $('<div class="form-group"></div>').append(hideWordsLabel, hideWordsInput);
// const defaultWordsButton = $('<button class="btn btn-secondary">Load Default Hidden Words</button>');
// hideWordsGroup.append(defaultWordsButton);

formElement.append(hideWordsGroup);

// defaultWordsButton.on('click', async () => {
//     try {
//         const response = await fetch('https://raw.githubusercontent.com/dear-clouds/better-mdl/main/default_hidden_words.txt');
//         const defaultWords = await response.text();
//         hideWordsInput.val(defaultWords);
//     } catch (error) {
//         console.error('Error retrieving default hidden words:', error);
//     }
// });



// Add the two columns to the form element
const row = $('<div class="row"></div>').append(iconColumn, colorColumn, tmdbGroup);
formElement.append(row);

// Add a submit button to the form
const submitButton = $('<button type="submit" class="btn btn-primary">Save Changes</button>');
const buttonColumn = $('<div class="col-md-12"></div>').append(submitButton);
const buttonRow = $('<div class="row"></div>').append(buttonColumn);
formElement.append(buttonRow);

// Add some explanatory text to the form
const helpText = $('<div class="alert alert-info" role="alert">Enter the name of the icon (e.g. fa-bell) and the color value (e.g. #ff0000) that you want to use. You can find a list of available icons at <a href="https://fontawesome.com/icons" target="_blank">https://fontawesome.com/icons</a>.</div>');
formElement.prepend(helpText);

// Add the form to the div
betterMDLDiv.append(formElement);

// Handle form submission
formElement.submit(function (event) {
    event.preventDefault();

    // Loop through the inputs and update the icons and colors
    formElement.find('input').each(function () {
        const inputName = $(this).attr('name');
        const inputValue = $(this).val();
        const inputType = inputName.split('_')[0];
        const inputKey = inputName.split('_')[1];

        if (inputType === 'icon') {
            icons[inputKey] = inputValue;
        } else if (inputType === 'color') {
            colours[inputKey] = inputValue;
        } else if (inputName === 'hide_words') {  // Add this block to save hide words input value
            localStorage.setItem('betterMDLHideWords', inputValue);
        }
    });

    // Save the updated values to local storage
    localStorage.setItem('betterMDLIcons', JSON.stringify(icons));
    localStorage.setItem('betterMDLColours', JSON.stringify(colours));

    // Save the values of the checkbox to local storage
    const tmdbSearchEnabled = tmdbCheckbox.prop('checked');
    localStorage.setItem('betterMDLTMDBSearch', tmdbSearchEnabled);

    const ratingsEnabled = ratingsCheckbox.prop('checked');
    localStorage.setItem('betterMDLRatings', ratingsEnabled);

    const shareEnabled = shareCheckbox.prop('checked');
    localStorage.setItem('betterMDLhideShareContainer', shareEnabled);

    const defaultStatsEnabled = defaultStatsCheckbox.prop('checked');
    localStorage.setItem('betterMDLhidedefaultStats', defaultStatsEnabled);

    // Reload the page to apply the changes
    location.reload();
});

// Get a reference to the navigation bar
const navBar = $('ul.nav-tabs');

// Create a new list item for the Better MDL tab
const newTab = $('<li class="page-item nav-item" style="background: var(--mdl-primary); color: var(--mdl-background)"><a to="/better-mdl" href="#better-mdl" class="nav-link">Better MDL 🤍</a></li>');

// Add the new tab to the navigation bar
navBar.append(newTab);