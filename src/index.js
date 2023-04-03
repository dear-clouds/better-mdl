import 'style-loader';
import 'css-loader';

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

console.log(token);

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
                    console.log(`Response for page ${page}:`, json); // Log the response
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
        console.log('Processing page:', currentPage); // Log the current page
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
            console.log('Friends on pages', currentPage - promises.length, 'to', currentPage - 1, ':', friends); // Log friends on the current pages
            allFriends.push(...friends);
        } else {
            hasMore = false;
        }
    }

    console.log('All friends:', allFriends); // Log the final allFriends array
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

if (window.location.pathname.includes('/profile/')) {
    importAll(require.context('./profile/', true, /\.js$/), /\.js$/);
}

/* -------------------------------------------------------------------------- */
/*                                 People page                                */
/* -------------------------------------------------------------------------- */

if (window.location.pathname.includes('/people/')) {
    importAll(require.context('./people/', true, /\.js$/), /\.js$/);
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
export { currentUrl };