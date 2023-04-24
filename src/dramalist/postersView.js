// import { token } from "../index.js";
// import { colours } from '../index.js';
// import { icons } from '../index.js';
// import { statusNames } from '../index.js';


// /* ---------------------------- Sort & View icons --------------------------- */
// /**------------------------------------------------------------------------
//  *todo                         TO FINISH LATER
//  *------------------------------------------------------------------------**/

// let viewMode = 'List'; // Set the initial view mode to thumbnail
// const viewModes = ['List', 'Thumbnail', 'Poster']; // Define the view modes

// // Define the view mode button
// const $viewModeBtn = $('<button>').addClass('btn btn-secondary view-mode-btn mx-1').append($('<i>').addClass(getViewModeIcon(viewMode)).attr('title', 'Change View'));

// // Define the click handler for the view mode button
// $viewModeBtn.click(function () {
//     const currentViewIndex = viewModes.indexOf(viewMode);
//     viewMode = viewModes[(currentViewIndex + 1) % viewModes.length]; // Cycle through the view modes
//     $viewModeBtn.find('i').removeClass().addClass(getViewModeIcon(viewMode)); // Update the icon based on the new view mode
// });


// // Define the sort dropdown
// const $sortDropdown = $('<div>').addClass('btn-group mx-1');
// const $sortButton = $('<button>').addClass('btn btn-secondary dropdown-toggle').attr('type', 'button').attr('id', 'sort-dropdown').attr('data-toggle', 'dropdown').attr('aria-haspopup', 'true').attr('aria-expanded', 'false').text('Sort by');
// const $sortMenu = $('<div>').addClass('dropdown-menu').attr('aria-labelledby', 'sort-dropdown');
// const sortOptions = [
//     { label: 'Title', class: '.title', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
//     { label: 'Year', class: '.mdl-style-col-year', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
//     { label: 'Progress', class: '.mdl-style-col-progress', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
//     { label: 'Score', class: '.score', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] }
// ];
// let currentSortIndex = null;

// $.each(sortOptions, function (index, option) {
//     const $option = $('<a>').addClass('dropdown-item').attr('href', '#').attr('data-index', index).text(option.label);
//     $sortMenu.append($option);
// });

// const $orderButton = $('<button>').addClass('btn btn-secondary').attr('type', 'button').append($('<i>').addClass('fas fa-arrow-up sort-icon'));

// $sortDropdown.append($sortButton).append($sortMenu).append($orderButton);

// $sortMenu.on('click', 'a.dropdown-item', function (e) {
//     e.preventDefault();
//     const $this = $(this);
//     const newIndex = parseInt($this.attr('data-index'));

//     // If the user selected a new sort option
//     if (newIndex !== currentSortIndex) {
//         // Update the current sort index
//         currentSortIndex = newIndex;
//         // Update the sort button text
//         $sortButton.text('Sort by ' + sortOptions[newIndex].label);
//         // Remove any existing sort icons
//         $orderButton.find('.sort-icon').removeClass('fas fa-arrow-up fas fa-arrow-down');
//         // Set the default sort icon (up arrow)
//         $orderButton.find('.sort-icon').addClass(sortOptions[newIndex].icons[0]);
//     }
// });

// // Append the buttons and dropdown to a container div and add it to the nav
// $('.mdl-style-nav-desktop ul').append(
//     $('<li>').addClass('mio-mdl-filters btn-group')
//         .append($viewModeBtn)
//         .append($sortDropdown)
// );

// // Define a helper function to get the appropriate icon for a given view mode
// function getViewModeIcon(viewMode) {
//     console.log('Current view mode:', viewMode);
//     switch (viewMode) {
//         case 'List':
//             return 'fas fa-list';
//         case 'Thumbnail':
//             return 'fas fa-th';
//         case 'Poster':
//             return 'fas fa-images';
//         default:
//             return '';
//     }
// }

// /* ---------------------------- Layout Views --------------------------- */
// $('table.mdl-style-table').each(function () {
//     const $originalTable = $(this);
//     const $table = $originalTable.clone(true);
//     $originalTable.replaceWith($table);
//     const $originalHtml = $table.html(); // <-- Store the original HTML
//     $table.addClass('thumbnail-view');

//     const views = ['List', 'Thumbnail', 'Poster'];
//     let currentViewIndex = 0;

//     $viewModeBtn.on('click', function () {
//         currentViewIndex = (currentViewIndex + 1) % views.length;
//         const currentView = views[currentViewIndex];
//         // Clone the original table every time the "Poster View" button is clicked
//         // const $listView = $originalTable.clone();

//         // remove existing icon classes
//         $viewModeBtn.find('i').removeClass('fas fa-th fas fa-list-ul fas fa-images');

//         // add new icon class based on the current view
//         if (currentView === 'Thumbnail') {
//             $viewModeBtn.find('i').addClass('fas fa-th');
//         } else if (currentView === 'List') {
//             $viewModeBtn.find('i').addClass('fas fa-list-ul');
//         } else {
//             $viewModeBtn.find('i').addClass('fas fa-images');
//         }

//         // toggle the view
//         if (currentView === 'Thumbnail') {
//             // switch to thumbnail view
//             // Restore the original view
//             $table.addClass('thumbnail-view');
//             $table.removeClass('list-view');
//             // $table.find('tbody').empty().append($listView.find('tbody').contents());
//             $viewModeBtn.find('i').removeClass('fa-th-list').addClass('fa-th');

//             // Reapply the "Poster" column to the table if it doesn't exist
//             if ($table.find('th:nth-child(2)').text() !== 'Poster') {

//                 if (typeof (Storage) !== "undefined") {

//                     // Get the cached poster URLs from local storage
//                     const cachedPosters = JSON.parse(localStorage.getItem('betterMDLPosters')) || {};

//                     // Add posters to the table
//                     $table.find('thead th:nth-child(1)').after('<th class="mdl-style-thead-poster text-center hidden-sm-down" width="80">Poster</th>');
//                     $table.find('tbody tr').each(function () {
//                         const titleCell = $(this).find('td:nth-child(2)');
//                         const titleLink = titleCell.find('a');
//                         const titleHref = titleLink.attr('href');
//                         if (titleHref) {
//                             // Check if the poster URL is cached
//                             if (cachedPosters[titleHref]) {
//                                 titleCell.before(`<td class="film-cover"><img src="${cachedPosters[titleHref]}" style="max-width: 70px;"></td>`);
//                             } else {
//                                 // Fetch the poster URL and cache it
//                                 $.get(titleHref, function (data) {
//                                     const posterUrl = $(data).find('.film-cover img').attr('src');
//                                     cachedPosters[titleHref] = posterUrl;
//                                     localStorage.setItem('betterMDLPosters', JSON.stringify(cachedPosters));
//                                     titleCell.before(`<td class="film-cover"><img src="${posterUrl}" style="max-width: 80px;"></td>`);
//                                 }).fail(function () {
//                                     // Image failed to load, try again
//                                     setTimeout(() => {
//                                         $.get(titleHref).done(function (data) {
//                                             const posterUrl = $(data).find('.film-cover img').attr('src');
//                                             cachedPosters[titleHref] = posterUrl;
//                                             localStorage.setItem('betterMDLPosters', JSON.stringify(cachedPosters));
//                                             titleCell.before(`<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`);
//                                         }).fail(function () {
//                                             // Image failed to load again, give up
//                                             titleCell.before('<td></td>');
//                                         });
//                                     }, 1000);
//                                 });
//                             }
//                         } else {
//                             titleCell.before('<td></td>');
//                         }
//                     });

//                 } else {
//                     // Local storage is not available
//                     $table.find('th:nth-child(1)').after('<th>Poster</th>');
//                     $table.find('tbody tr').each(function () {
//                         const titleCell = $(this).find('td:nth-child(2)');
//                         titleCell.before('<td></td>');
//                     });
//                 }
//             }
//         } else if (currentView === 'Poster') {
//             $table.addClass('poster-view');
//             $table.removeClass('thumbnail-view');

//             $table.find('tbody tr').each(function () {
//                 const $tr = $(this);
//                 const $img = $tr.find('img');
//                 const $link = $tr.find('a');
//                 const $rating = $tr.find('.rating');
//                 const $ratingNum = $tr.find('.score');
//                 const imgSrc = $img.attr('src');
//                 const movieUrl = $link.attr('href');
//                 const year = $tr.find('.mdl-style-col-year').text();
//                 const progress = $tr.find('.mdl-style-col-progress');
//                 const movieId = $tr.attr('class').match(/\bmdl-\S+/)[0].substr(4);
//                 const $poster = $('<div>').addClass(`col-md-3 mdl-${movieId}`).append(
//                     $('<div>').addClass('card h-100 film-cover text-center').append(
//                         $('<a>').attr('href', movieUrl).append(
//                             $('<div>').addClass('image-container').append(
//                                 $('<img>').addClass('card-img-top img-fluid').attr('src', imgSrc).attr('alt', 'Movie poster'),
//                                 $('<span>').addClass('label label-left label-primary mdl-style-col-year').text(year),
//                                 $('<span>').addClass('label label-right label-secondary progress').text(`${progress}`),
//                                 $('<span>').addClass('label-rating').html($rating),
//                                 $('<span>').addClass('label-ratingNum score').html($ratingNum)
//                             )
//                         ),
//                         $('<div>').addClass('card-body').append(
//                             $('<p>').addClass('card-title mb-0 title').html(`<a href="${movieUrl}">${$tr.find('.title b').text()}</a>`),
//                         ),
//                         $('<div>').addClass('card-footer').append(
//                             $('<button>').addClass('card-footer-btn btn-manage-list w-100').attr('data-id', $tr.attr('class').match(/\bmdl-\S+/)[0].substr(4)).attr('data-stats', 'mylist:' + $tr.attr('class').match(/\bmdl-\S+/)[0].substr(4)).append(
//                                 $('<span>').append(
//                                     $('<i>').addClass('fas fa-plus-circle'),
//                                     '&nbsp;',
//                                     $('<span>').addClass('movie-status').text(" Add to list")
//                                 )
//                             )
//                         )
//                     )
//                 );

//                 $.getJSON(`/v1/users/data?token=${token}&lang=en-US&mylist=${movieId}&t=z`, function (json) {
//                     const movie = json.mylist[0];
//                     if (movie && movie.status >= 1 && movie.status <= 6) {
//                         console.log(movie);
//                         const $button = $poster.find('.card-footer-btn');
//                         $button.css('background-color', colours[movie.status]);
//                         $button.find('.movie-status').text(statusNames[movie.status]).css('color', 'var(--mdl-background)');
//                         $button.find('i').removeClass().addClass(icons[movie.status]).css('color', 'var(--mdl-background)');
//                     }
//                 });
//                 $tr.replaceWith($poster);
//             });
//             $viewModeBtn.find('i').removeClass('fa-th').addClass('fa-list');
//             $table.find('th:contains("Poster")').remove();
//             $table.find('td.film-cover').remove();
//             $table.find('thead').remove();
//         } else {
//             // switch to list view
//             $table.addClass('list-view');
//             $table.removeClass('poster-view');

//             $table.empty().html($originalHtml);

//             // Remove the "Poster" column from the table
//             $table.find('th:contains("Poster")').remove();
//             $table.find('td.film-cover').remove();

//         }
//     });

//     /* ---------------------------- Sort by Dropdown ---------------------------- */

//     // Define a variable to keep track of the current sort option
//     let currentSortOption = 1;

//     // Define a function to sort the table or poster view based on the current sort option
//     function sortView(ascending) {
//         const $sortIcon = $orderButton.find('.sort-icon');
//         const option = sortOptions[currentSortOption];
//         let $rows;
//         if (viewMode === 'Poster') {
//             console.log('Sorting posters');
//             const $posterView = $('.poster-view');
//             const $posterCardsContainer = $posterView.find('tbody');
//             const $posterCards = $posterCardsContainer.children('.col-md-3');
//             $posterCards.detach();
//             $posterCards.sort(function (a, b) {
//                 const aRawValue = $(a).find(option.class).text().trim();
//                 const bRawValue = $(b).find(option.class).text().trim();
//                 // Remove the status icon from the cell value
//                 const aValue = aRawValue.replace(/^<i class="[^"]+"><\/i>\s*/, '').toLowerCase();
//                 const bValue = bRawValue.replace(/^<i class="[^"]+"><\/i>\s*/, '').toLowerCase();
//                 if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
//                     return ascending ? aValue - bValue : bValue - aValue;
//                 }
//                 return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
//             });

//             $posterCards.appendTo($posterCardsContainer);
//         } else {
//             $rows = $table.find('tbody tr');
//             $rows.sort(function (a, b) {
//                 const aValue = $(a).find(option.class).text().trim();
//                 const bValue = $(b).find(option.class).text().trim();
//                 // Compare the values
//                 if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
//                     return ascending ? aValue - bValue : bValue - aValue;
//                 }
//                 return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
//             });
//             $table.find('tbody').empty().append($rows);
//         }

//         // Toggle the sort icon based on the current sort option and sort direction
//         $sortIcon.removeClass(option.icons[ascending ? 1 : 0])
//             .addClass(option.icons[ascending ? 0 : 1]);
//     }

//     // Sort the view when the order button is clicked
//     $orderButton.on('click', function () {
//         const $sortIcon = $(this).find('.sort-icon');
//         const ascending = $sortIcon.hasClass(sortOptions[currentSortOption].icons[0]);
//         sortView(!ascending);
//     });

//     // Sort the view when a sort option is clicked
//     $sortMenu.on('click', 'a.dropdown-item', function (e) {
//         e.preventDefault();
//         const $link = $(this);
//         const index = $link.data('index');
//         currentSortOption = index;
//         sortView(false);
//     });

//     // Initialize the sort icon based on the default sort option
//     $orderButton.find('.sort-icon').addClass(sortOptions[currentSortOption].icons[1]);





//     /* --------------------------- End of Tables --------------------------- */
// });
