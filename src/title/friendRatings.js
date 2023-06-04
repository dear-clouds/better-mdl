import { token, getAllFriends, logPrefix, logStyle } from "../index.js";

/* ------------------------- Friend status on title ------------------------- */

// Load favorite friends from local storage
function loadFavoriteFriends() {
  const storedFavorites = localStorage.getItem('betterMDLFavFriends');
  return storedFavorites ? JSON.parse(storedFavorites) : [];
}

// Update friend objects with favorite status
function updateFavoriteStatus(friends) {
  const favoriteFriends = loadFavoriteFriends();
  return friends.map((friend) => {
    friend.favorite = favoriteFriends.includes(friend.username);
    return friend;
  });
}

async function checkUserList(titleId) {
  const friendsData = await getAllFriends(token);
  // console.log('Friends data:', friendsData);

  // Update favorite status for all friends
  const friendsWithFavorites = updateFavoriteStatus(friendsData);
  console.log(logPrefix, logStyle, 'All Friends:', friendsWithFavorites);

  const tableIds = {
    Watching: 'list_1',
    Completed: 'list_2',
    Planned: 'list_3',
    'On-Hold': 'list_4',
    Dropped: 'list_5',
    'Not Interested': 'list_6',
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

  let scores = [];

  // Check if the "Friends' Average Score" element already exists
  const $friendsAverageScore = $('.bettermdl-friends .average-score');
  if ($friendsAverageScore.length === 0) {
    // Create the "Friends' Average Score" element if it doesn't exist
    const friendsAverageScoreHtml = `
        <div class="list-item p-a-0"><b class="inline">Friends' Average Score:</b> <span class="average-score">N/A</span></div>
        `;
    $('.bettermdl-friends .box-body').eq(1).prepend(friendsAverageScoreHtml);
  }

  // Update the "Friends' Average Score" as we get friend data
  const $averageScore = $('.bettermdl-friends .average-score');
  let totalScore = 0;
  let count = 0;

  $('.title-contributors.box').before(friendListHtml);

  $('.bettermdl-friends .contributor-list').on('click', '.favorite', function () {
    const selectedFriend = friendsWithFavorites.find(
      (friend) => friend.username === $(this).parent().data('username')
    );
    selectedFriend.favorite = !selectedFriend.favorite;

    // Update local storage
    const updatedFavorites = friendsWithFavorites
      .filter((friend) => friend.favorite)
      .map((friend) => friend.username);
    localStorage.setItem('betterMDLFavFriends', JSON.stringify(updatedFavorites));

    // Toggle the class of the heart icon
    const $heartIcon = $(this).find('i');
    if (selectedFriend.favorite) {
      $heartIcon.removeClass('far').addClass('fas');
    } else {
      $heartIcon.removeClass('fas').addClass('far');
    }
  });

  const friendsToCheckPerSecond = 8;
  const delay = 1000 / friendsToCheckPerSecond;

  for (let i = 0; i < friendsWithFavorites.length; i++) {
    if (i > 0 && i % friendsToCheckPerSecond === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for 1 second after checking 8 friends
    }

    const friend = friendsWithFavorites[i];
    const userListUrl = `https://mydramalist.com/dramalist/${friend.username}`;
    console.log(logPrefix, logStyle, 'Checking friend list:', userListUrl);

    await new Promise((resolve) => setTimeout(resolve, i % friendsToCheckPerSecond * delay)); // Delay between each friend request

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

          // Only add valid scores to the array
          if (score !== 'N/A' && score !== '0.0') {
            scores.push(parseFloat(score));
          }

          isTitleOnList = true;
        }
      }

      // If the title is on the friend's list, update the friendData and HTML
      if (isTitleOnList) {
        $('.loading').remove();
        friendData.push({ profileUrl, profileName, avatar, status, score });
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
                <div class="favorite" title="Make favorite"><i class="${
          friend.favorite ? 'fas' : 'far'
        } fa-heart" style="color: var(--mdl-red);"></i></div>
                </div>
                `;
        if (friend.favorite) {
          $('.bettermdl-friends .contributor-list').prepend(friendHtml);
        } else {
          $('.bettermdl-friends .contributor-list').append(friendHtml);
        }

        // Favorite friend functionality
        if (friend.favorite) {
          $('.contributor[data-username="' + friend.username + '"] .favorite i')
            .removeClass('far')
            .addClass('fas');
        } else {
          $('.contributor[data-username="' + friend.username + '"] .favorite i')
            .removeClass('fas')
            .addClass('far');
        }
      }

      // Check if this is the last friend in the loop and update the page
      if (friendData.length === friendsData.length) {
        console.log(logPrefix, logStyle, 'Friend data with title info:', friendData);
        if (friendData.length === 0) {
          $('.bettermdl-friends .loading').text(
            'No friends have this title on their list. Time to makes new ones!'
          );
        } else {
          $('.bettermdl-friends .loading').remove();
        }
      }

      const scoresAverage = calculateAverageScore(scores);
      updateFriendsScoreHtml(scoresAverage);
    });
  }
}

function calculateAverageScore(scores) {
  const validScores = scores.filter((score) => score !== 0.0 && score !== 'N/A');
  if (validScores.length > 0) {
    const totalScore = validScores.reduce((total, score) => total + score, 0);
    return (totalScore / validScores.length).toFixed(1);
  } else {
    return 'N/A';
  }
}

function updateFriendsScoreHtml(averageScore) {
  const $statsBox = $('.box.clear.hidden-sm-down').eq(1);
  const $listElement = $statsBox.find('.list');
  const $scoreElement = $listElement.find('.list-item:nth-child(1)');
  const $scoreText = $scoreElement.find('.inline');

  // Add the "Friends' Average Score" text if it doesn't exist
  const friendsScoreHtml = `
        <li class="list-item p-a-0">
            <b class="inline">Friends' Average Score:</b> 
            <span class="average-score">${averageScore}</span>
        </li>
    `;
  if (!$statsBox.find('.average-score').length) {
    $scoreElement.after(friendsScoreHtml);
  } else {
    $statsBox.find('.average-score').text(averageScore);
  }
}

function main() {
  // Get title ID from URL
  const titleId = window.location.pathname.split('-')[0].split('/').pop();
  // console.log('Title ID:', titleId);
  if (!titleId) {
    console.log(logPrefix, logStyle, 'Error: No title ID found in URL');
    return;
  }
  checkUserList(titleId);
}

$(document).ready(function () {
  main();
});
