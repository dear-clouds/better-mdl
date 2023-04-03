import { token } from "../index.js";
import { getAllFriends } from "../index.js";

/* ------------------------- Friend status on title ------------------------- */

// Load favorite friends from local storage
function loadFavoriteFriends() {
    const storedFavorites = localStorage.getItem('BetterMDL-FavFriends');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
}

// Update friend objects with favorite status
function updateFavoriteStatus(friends) {
    const favoriteFriends = loadFavoriteFriends();
    return friends.map(friend => {
        friend.favorite = favoriteFriends.includes(friend.username);
        return friend;
    });
}

async function checkUserList(titleId) {
    const friendsData = await getAllFriends(token);
    console.log('Friends data:', friendsData);

    // Update favorite status for all friends
    const friendsWithFavorites = updateFavoriteStatus(friendsData);
    console.log('Friends with favorites:', friendsWithFavorites);

    const tableIds = {
        Watching: 'list_1',
        Completed: 'list_2',
        Planned: 'list_3',
        'On-Hold': 'list_4',
        Dropped: 'list_5',
        'Not Interested': 'list_6'
    };

    let friendData = [];
    let friendListHtml = `
    <div class="bettermdl-friends box clear hidden-sm-down">
    <div class="box-header primary"><h3>Friends</h3></div>
    <div class="box-body light-b contributor-list">
    <div class="loading">No friends have this title on their list. Time to makes new ones!</div>
    </div>
    </div>
    `;
    $('.title-contributors.box').before(friendListHtml);

    $('.bettermdl-friends .contributor-list').on('click', '.favorite', function () {
        const selectedFriend = friendsWithFavorites.find((friend) => friend.username === $(this).parent().data('username'));
        selectedFriend.favorite = !selectedFriend.favorite;

        // Update local storage
        const updatedFavorites = friendsWithFavorites.filter(friend => friend.favorite).map(friend => friend.username);
        localStorage.setItem('BetterMDL-FavFriends', JSON.stringify(updatedFavorites));

        // Toggle the class of the heart icon
        const $heartIcon = $(this).find('i');
        if (selectedFriend.favorite) {
            $heartIcon.removeClass('far').addClass('fas');
        } else {
            $heartIcon.removeClass('fas').addClass('far');
        }
    });

    for (let friend of friendsWithFavorites) {
        const userListUrl = `https://mydramalist.com/dramalist/${friend.username}`;
        console.log('Checking user list at:', userListUrl);

        $.get(userListUrl, function (data) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');

            const profileUrl = `https://mydramalist.com/profile/${friend.username}`;
            const profileName = friend.display_name;
            const avatar = friend.avatar_url;
            let status = 'not on list';
            let score = 'N/A';
            let isTitleOnList = false;

            // Check all six lists for each friend
            for (let [key, value] of Object.entries(tableIds)) {
                const table = doc.getElementById(value);
                if (table && table.querySelector(`a[href*="/${titleId}"]`)) {
                    status = key.replace('_', ' ');
                    const link = table.querySelector(`a[href*="/${titleId}"]`);
                    const row = link && link.closest('tr');
                    const scoreElement = row && row.querySelector('.score');
                    score = scoreElement ? scoreElement.textContent : 'N/A';

                    isTitleOnList = true;
                }
            }

            // If the title is on the friend's list, update the friendData and HTML
            if (isTitleOnList) {
                $('.loading').remove();
                friendData.push({ profileUrl, profileName, avatar, status, score });
                // Add this friend data to page
                let friendHtml = '';
                friendHtml += `
                <div class="contributor" data-username="${friend.username}">
                <a class="author-avatar" href="${profileUrl}">
                <img class="avatar" src="${avatar}" alt="${profileName}'s avatar">
                </a>
                <div class="details">
                <div><a class="text-primary" href="${profileUrl}"><b>${profileName}</b></a></div>
                <div class="author-status">${status}</div>
                <div class="author-score"><i class="fas fa-star"></i> ${score}</div>
                </div>
                <div class="favorite" title="Make favorite"><i class="${friend.favorite ? 'fas' : 'far'} fa-heart" style="color: var(--mdl-red);"></i></div>
                </div>
                `;
                if (friend.favorite) {
                    $('.bettermdl-friends .contributor-list').prepend(friendHtml);
                } else {
                    $('.bettermdl-friends .contributor-list').append(friendHtml);
                }

                // Favorite friend functionality
                if (friend.favorite) {
                    $('.contributor[data-username="' + friend.username + '"] .favorite i').removeClass('far').addClass('fas');
                } else {
                    $('.contributor[data-username="' + friend.username + '"] .favorite i').removeClass('fas').addClass('far');
                }

            }

            // Check if this is the last friend in the loop and update the page
            if (friendData.length === friendsData.length) {
                console.log('Friend data with title info:', friendData);
                if (friendData.length === 0) {
                    $('.bettermdl-friends .loading').text('No friends have this title on their list. Time to makes new ones!');
                } else {
                    $('.bettermdl-friends .loading').remove();
                }
            }
        });
    }
}

// Main function to run on page load
function main() {
    // Get title ID from URL
    const titleId = window.location.pathname.split('-')[0].split('/').pop();
    console.log('Title ID:', titleId);
    if (!titleId) {
        console.log('Error: No title ID found in URL');
        return;
    }
    checkUserList(titleId);
}

$(document).ready(function () {
    main();
});            