import 'style-loader';
import 'css-loader';

console.log(`%c
██████  ███████ ████████ ████████ ███████ ██████      ███    ███ ██████  ██      
██   ██ ██         ██       ██    ██      ██   ██     ████  ████ ██   ██ ██      
██████  █████      ██       ██    █████   ██████      ██ ████ ██ ██   ██ ██      
██   ██ ██         ██       ██    ██      ██   ██     ██  ██  ██ ██   ██ ██      
██████  ███████    ██       ██    ███████ ██   ██     ██      ██ ██████  ███████ 
                                                                                                                                           
`, 'color: #846D62; text-shadow: 0px 4px 1px #A8A29C;');


/* -------------------------------------------------------------------------- */
/*                               Cookie session                               */
/* -------------------------------------------------------------------------- */

// Get the value of a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const token = getCookie('jl_sess');

if (token) {
    $.ajaxSetup({
        headers: {
            'authorization': `Bearer ${token}`,
        }
    });
}

// console.log(token);

const logPrefix = '%c Better MDL ';
const logStyle = 'background-color: #846D62; color: white; font-weight: bold;';
const errorStyle = 'background-color: #A8A29C; color: black; font-weight: bold;';

function importAll(r) {
    r.keys().forEach(key => r(key));
}

importAll(require.context('./css/', true, /\.css$/));
importAll(require.context('./common/', true, /\.js$/));

/* -------------------------------------------------------------------------- */
/*                                getAllFriends                               */
/* -------------------------------------------------------------------------- */

export async function getAllFriends(token) {
    const processPage = async (page) => {
        return new Promise((resolve) => {
            $.ajax({
                url: `/v1/users/friends?page=${page}&lang=en-US`,
                dataType: 'json',
                headers: {
                    'authorization': `Bearer ${token}`,
                },
                success: function (json) {
                    console.log(logPrefix, logStyle, `Response for page ${page}:`, json);
                    if (json.error) {
                        console.error(`Error on page ${page}: ${json.error}`);
                        resolve(null);
                    } else {
                        resolve(json.items);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Request failed on page ${page}: ${textStatus} - ${errorThrown}`);
                    resolve(null);
                },
            });
        });
    };

    const allFriends = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
        console.log(logPrefix, logStyle, 'Processing page:', currentPage); // Log the current page
        const promises = [];

        // Fetch up to 5 pages at a time
        for (let i = 0; i < 5 && hasMore; i++) {
            promises.push(processPage(currentPage));
            currentPage++;
        }

        const pages = await Promise.all(promises);

        // Flatten the array of friend arrays into a single array of friends
        const friends = pages.flat().filter(friend => friend !== null);

        if (friends.length > 0) {
            console.log(logPrefix, logStyle, 'Friends on pages', currentPage - promises.length, 'to', currentPage - 1, ':', friends);
            allFriends.push(...friends);
        } else {
            hasMore = false;
        }
    }

    // console.log('All friends:', allFriends); // Log the final allFriends array
    return allFriends;
}


// getAllFriends(token).then(friends => {
//     console.log(friends);
// });


/* -------------------------------------------------------------------------- */
/*    Settings are customizable at https://mydramalist.com/account/profile    */
/* -------------------------------------------------------------------------- */

const storedIcons = localStorage.getItem('betterMDLIcons');
const icons = storedIcons ? JSON.parse(storedIcons) : {
    1: 'fas fa-spinner', // currently watching
    2: 'fas fa-check', // completed
    3: 'far fa-clock', // plan to watch
    4: 'fas fa-pause', // on hold
    5: 'fas fa-heart-broken', // dropped
    6: 'fas fa-minus-circle', // not interested
};

const storedColours = localStorage.getItem('betterMDLColours');
const colours = storedColours ? JSON.parse(storedColours) : {
    1: '#85C1DC', // currently watching
    2: '#A6D189', // completed
    3: '#CA9EE6', // plan to watch
    4: '#E5C890', // on hold
    5: '#E78284', // dropped
    6: '#BBBBBB', // not interested
};

for (let key in colours) {
    $(`input[name=color_${key}]`).val(colours[key]);
}
for (let key in icons) {
    $(`input[name=icon_${key}]`).val(icons[key]);
}

// Set the default values to true
if (localStorage.getItem('betterMDLRatings') === null) {
    localStorage.setItem('betterMDLRatings', 'true');
}
if (localStorage.getItem('betterMDLTMDBSearch') === null) {
    localStorage.setItem('betterMDLTMDBSearch', 'true');
}
if (localStorage.getItem('betterMDLhideShareContainer') === null) {
    localStorage.setItem('betterMDLhideShareContainer', 'true');
}
// Set the default values to false
if (localStorage.getItem('betterMDLhidedefaultStats') === null) {
    localStorage.setItem('betterMDLhidedefaultStats', 'false');
}

const statusNames = {
    1: 'Watching',
    2: 'Completed',
    3: 'Planned',
    4: 'On Hold',
    5: 'Dropped',
    6: 'Not Interested',
};

const username = $('div.mdl-dropdown-content').find('a[href^="/profile/"]').attr('href').split('/').pop();
const currentUrl = window.location.href;

/* -------------------------------------------------------------------------- */
/*                        Hide the share icons & stats                        */
/* -------------------------------------------------------------------------- */

if (localStorage.getItem('betterMDLhideShareContainer') === 'true') {
    $('div.share-container').hide();
}

if (localStorage.getItem('betterMDLhidedefaultStats') === 'true') {
    $('#chart-legend').hide();
    $('#radar-drama').hide();
    $('#drama-chart-bar').hide();

}

/* -------------------------------------------------------------------------- */
/*                        Tag next to my username hehe                        */
/* -------------------------------------------------------------------------- */

// if (document.querySelector('.post-header a[href="/profile/Mio_"]')) {
//     const bettermdlTag = document.createElement('span');
//     bettermdlTag.classList.add('bettermdl-tag');
//     bettermdlTag.innerHTML = 'Better MDL ♡';
//     const bettermdlLink = document.createElement('a');
//     bettermdlLink.href = 'https://mydramalist.com/discussions/general-discussion/88611-gathering-feedbacks?pid=2493837&page=1#p2493837';
//     bettermdlLink.appendChild(bettermdlTag);
//     const postHeaders = document.querySelectorAll('.post-header');
//     postHeaders.forEach(header => {
//         if (header.querySelector('a[href="/profile/Mio_"]')) {
//             header.appendChild(bettermdlLink);
//         }
//     });
// }


/* -------------------------------------------------------------------------- */
/*                                  Profiles                                  */
/* -------------------------------------------------------------------------- */

const profileUrlPattern = /^https:\/\/mydramalist\.com\/profile\/\w+$/;
if (profileUrlPattern.test(window.location.href)) {

    importAll(require.context('./profile/', true, /\.js$/), /\.js$/);

}

/* -------------------------------------------------------------------------- */
/*                                 People page                                */
/* -------------------------------------------------------------------------- */

if (window.location.pathname.includes('/people/')) {

    importAll(require.context('./people/', true, /\.js$/), /\.js$/);

}

/* -------------------------------------------------------------------------- */
/*                                    Lists                                   */
/* -------------------------------------------------------------------------- */

if (window.location.pathname.includes('/list/')) {

    importAll(require.context('./list/', true, /\.js$/), /\.js$/);

}

/* -------------------------------------------------------------------------- */
/*                                Custom lists                                */
/* -------------------------------------------------------------------------- */

if (window.location.pathname.includes(`${username}/lists`)) {

    var savedListsButton = document.createElement("a");
    savedListsButton.className = "btn white pull-right";
    savedListsButton.textContent = "Saved Lists";
    var createListButton = document.querySelector(".box-header a[href='/list/create']");
    createListButton.parentNode.insertBefore(savedListsButton, createListButton.nextSibling);

    // Store the original content
    var originalListContent = document.querySelector(".col-lg-8.col-md-8 .box-body").innerHTML;

    var savedLists = JSON.parse(localStorage.getItem("betterMDLbookmarkLists")) || [];

    savedListsButton.addEventListener("click", function () {
        var savedDetails = JSON.parse(localStorage.getItem("betterMDLbookmarkDetails")) || {};

        // Get the container for the list items and clear its contents
        var listContainer = document.querySelector(".col-lg-8.col-md-8 .box-body");
        listContainer.innerHTML = "";

        // Create a list item for each saved list and append it to the container
        Object.keys(savedDetails).forEach(function (listUrl) {
            if (savedLists.includes(listUrl)) {
                var listDetails = savedDetails[listUrl];
                var listItem = document.createElement("div");
                listItem.className = "row custom-list-preview large mio-saved-list";
                listItem.innerHTML = '<div class="list-type">public list</div>' +
                    '<a class="text-primary title-primary" href="' + listUrl + '">' +
                    '<b>' + listDetails.title + '</b></a>' +
                    '<div class="list-bars text-black-lt">' +
                    '<span class="m-r"><i class="fal fa-tv m-r-xs"></i> ' + listDetails.numTitles + ' titles</span>' +
                    '<span class="m-r"><i class="fas fa-user m-r-xs"></i>' + listDetails.author + '</span>' +
                    '<span class="m-r"><i class="far fa-clock m-r-xs"></i>' + listDetails.lastUpdated + '</span>' +
                    '</div>';
                listContainer.appendChild(listItem);

                // Fetch the last updated date and number of titles from the list page
                fetch(listUrl)
                    .then(response => response.text())
                    .then(html => {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(html, "text/html");
                        var numTitlesText = doc.querySelector(".list-bars span:first-of-type").textContent.trim();
                        var numTitles = numTitlesText.match(/\d+/)[0];
                        var lastUpdatedText = doc.querySelector(".list-footer .text-muted").textContent.trim();
                        lastUpdatedText = lastUpdatedText.replace("Lists are updated approximately every 5 minutes. ", "");
                        var icon = doc.querySelector(".list-bars span:first-of-type i").outerHTML;
                        listItem.querySelector(".list-bars span:first-of-type").innerHTML = icon + ' ' + numTitles + ' titles';
                        listItem.querySelector(".list-bars span:last-of-type").innerHTML = '<i class="far fa-clock m-r-xs"></i>' + lastUpdatedText;
                    });
            }
        });

        if (savedListsButton.textContent === "Saved Lists") {
            savedListsButton.textContent = "Custom Lists";
            document.querySelector(".box-header a[href='/list/create']").style.display = "none";
        } else {
            listContainer.innerHTML = originalListContent;
            savedListsButton.textContent = "Saved Lists";
            document.querySelector(".box-header a[href='/list/create']").style.display = "inline-block";
        }

        window.scrollTo(0, 0);
    });

}

/* -------------------------------------------------------------------------- */
/*                              MyDramaList Pages                             */
/* -------------------------------------------------------------------------- */

if (window.location.pathname.includes('/dramalist/')) {

    importAll(require.context('./dramalist/', true, /\.js$/), /\.js$/);

}

/* -------------------------------------------------------------------------- */
/*                                  Settings                                  */
/* -------------------------------------------------------------------------- */

// Check if the user is on the profile page
if (window.location.pathname.includes('/account/profile')) {

    importAll(require.context('./settings/', true, /\.js$/), /\.js$/);

}


/* -------------------------------------------------------------------------- */
/*                                 Title pages                                */
/* -------------------------------------------------------------------------- */
if (currentUrl.match(/https:\/\/mydramalist\.com\/\d+\-.+/)) {

    importAll(require.context('./title/', true, /\.js$/), /\.js$/);

}

/* ------------------------------ End of script ----------------------------- */
export { colours };
export { icons };
export { statusNames };
export { username };
export { currentUrl, logPrefix, logStyle, errorStyle };