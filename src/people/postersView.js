import { token, logPrefix, logStyle } from "../index.js";
import { colours } from '../index.js';
import { icons } from '../index.js';
import { statusNames } from '../index.js';


/* ---------------------------- Sort & View icons --------------------------- */
let $currentTable = null;
$('table.film-list').each(function () {
    //todo  Need to fix this because after switching each view twice, the table completely disappears 
    const $originalTable = $(this);
    const $table = $originalTable.clone(true);
    $originalTable.replaceWith($table);

    let viewMode = 'Thumbnail'; // Set the initial view mode to thumbnail
    const viewModes = ['Thumbnail', 'Poster', 'List']; // Define the view modes

    const $viewModeBtn = $('<button>').addClass('btn btn-secondary view-mode-btn mx-1').append($('<i>').addClass(getViewModeIcon(viewMode)).attr('title', 'Change View'));

    $viewModeBtn.click(function () {
        const currentViewIndex = viewModes.indexOf(viewMode);
        viewMode = viewModes[(currentViewIndex + 1) % viewModes.length]; // Cycle through the view modes
        $viewModeBtn.find('i').removeClass().addClass(getViewModeIcon(viewMode)); // Update the icon based on the new view mode
    });

    // Define the hide/show icons
    const $hideIcon = $('<button>').addClass('btn btn-secondary hide-btn mx-1').append($('<i>').addClass('far fa-eye-slash hide-icon').attr('title', 'Hide completed titles'));

    // Define the sort dropdown
    const $sortDropdown = $('<div>').addClass('btn-group mx-1');
    const $sortButton = $('<button>').addClass('btn btn-secondary dropdown-toggle').attr('type', 'button').attr('id', 'sort-dropdown').attr('data-toggle', 'dropdown').attr('aria-haspopup', 'true').attr('aria-expanded', 'false').text('Sort by');
    const $sortMenu = $('<div>').addClass('dropdown-menu').attr('aria-labelledby', 'sort-dropdown');
    const sortOptions = [
        { label: 'Title', class: '.title', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Year', class: '.year', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Episodes', class: '.episodes', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Rating', class: '.text-sm', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] }
    ];
    let currentSortIndex = null;

    $.each(sortOptions, function (index, option) {
        const $option = $('<a>').addClass('dropdown-item').attr('href', '#').attr('data-index', index).text(option.label);
        $sortMenu.append($option);
    });

    const $orderButton = $('<button>').addClass('btn btn-secondary').attr('type', 'button').append($('<i>').addClass('fas fa-arrow-up sort-icon'));

    $sortDropdown.append($sortButton).append($sortMenu).append($orderButton);

    $sortMenu.on('click', 'a.dropdown-item', function (e) {
        e.preventDefault();
        const $this = $(this);
        const newIndex = parseInt($this.attr('data-index'));

        // If the user selected a new sort option
        if (newIndex !== currentSortIndex) {
            currentSortIndex = newIndex;
            $sortButton.text('Sort by ' + sortOptions[newIndex].label);
            $orderButton.find('.sort-icon').removeClass('fas fa-arrow-up fas fa-arrow-down');
            $orderButton.find('.sort-icon').addClass(sortOptions[newIndex].icons[0]);
        }
    });

    $table.before(
        $('<div>').addClass('mio-filters btn-group')
            .append($viewModeBtn)
            .append($hideIcon)
            .append($sortDropdown)
    );

    function getViewModeIcon(viewMode) {
        console.log(logPrefix, logStyle, 'Current view mode:', viewMode);
        switch (viewMode) {
            case 'Thumbnail':
                return 'fas fa-th';
            case 'Poster':
                return 'fas fa-images';
            case 'List':
                return 'fas fa-list';
            default:
                return '';
        }
    }

    /* ---------------------------- Layout Views --------------------------- */

    // Clone the table to restore the original view
    const $originalHtml = $table.html(); // <-- Store the original HTML
    $table.addClass('thumbnail-view');

    const views = ['Thumbnail', 'Poster', 'List'];
    let currentViewIndex = 0;

    $viewModeBtn.on('click', function () {
        currentViewIndex = (currentViewIndex + 1) % views.length;
        const currentView = views[currentViewIndex];
        // remove existing icon classes
        $viewModeBtn.find('i').removeClass('fas fa-th fas fa-list-ul fas fa-images');

        // add new icon class based on the current view
        if (currentView === 'Thumbnail') {
            $viewModeBtn.find('i').addClass('fas fa-th');
        } else if (currentView === 'List') {
            $viewModeBtn.find('i').addClass('fas fa-list-ul');
        } else {
            $viewModeBtn.find('i').addClass('fas fa-images');
        }

        // toggle the view
        if (currentView === 'Thumbnail') {
            $table.addClass('thumbnail-view');
            $table.removeClass('list-view');

            $viewModeBtn.find('i').removeClass('fa-th-list').addClass('fa-th');

            // Reapply the "Poster" column to the table if it doesn't exist
            if ($table.find('th:nth-child(2)').text() !== 'Poster') {
                if (typeof Storage !== 'undefined') {
                    // Get the cached poster URLs from local storage
                    const cachedPosters =
                        JSON.parse(localStorage.getItem('betterMDLPosters')) || {};

                    // Add posters to the table
                    $table.find('th:nth-child(1)').after('<th>Poster</th>');
                    $table.find('tbody tr').each(function (index) {
                        const titleCell = $(this).find('td:nth-child(2)');
                        const titleLink = titleCell.find('a');
                        const titleHref = titleLink.attr('href');
                        if (titleHref) {
                            // Check if the poster URL is cached
                            if (cachedPosters[titleHref]) {
                                titleCell.before(
                                    `<td class="film-cover"><img src="${cachedPosters[titleHref]}" style="max-width: 70px;"></td>`
                                );
                            } else {
                                // Fetch the poster URL and cache it
                                setTimeout(() => {
                                    $.get(titleHref, function (data) {
                                        const posterUrl = $(data).find('.film-cover img').attr('src');
                                        cachedPosters[titleHref] = posterUrl;
                                        localStorage.setItem(
                                            'betterMDLPosters',
                                            JSON.stringify(cachedPosters)
                                        );
                                        titleCell.before(
                                            `<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`
                                        );
                                    }).fail(function () {
                                        // Image failed to load, try again
                                        setTimeout(() => {
                                            $.get(titleHref)
                                                .done(function (data) {
                                                    const posterUrl = $(data)
                                                        .find('.film-cover img')
                                                        .attr('src');
                                                    cachedPosters[titleHref] = posterUrl;
                                                    localStorage.setItem(
                                                        'betterMDLPosters',
                                                        JSON.stringify(cachedPosters)
                                                    );
                                                    titleCell.before(
                                                        `<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`
                                                    );
                                                })
                                                .fail(function () {
                                                    // Image failed to load again, give up
                                                    titleCell.before('<td></td>');
                                                });
                                        }, index * 125); // Delay requests by 125 milliseconds (8 requests per second)
                                    });
                                }, index * 125); // Delay requests by 125 milliseconds (8 requests per second)
                            }
                        } else {
                            titleCell.before('<td></td>');
                        }
                    });
                }
            }
        } else if (currentView === 'Poster') {
            // switch to poster view
            $table.addClass('poster-view');
            $table.removeClass('thumbnail-view');

            const movieIds = [];

            $table.find('tbody tr').each(function () {
                const $tr = $(this);
                const $img = $tr.find('img');
                const $link = $tr.find('a');
                const $rating = $tr.find('.rating');
                const $ratingNum = $tr.find('.text-sm');
                const imgSrc = $img.attr('src');
                const movieUrl = $link.attr('href');
                const year = $tr.find('.year').text();
                const $episodes = $tr.find('.episodes');
                const episodes = $episodes.length ? $episodes.text() : '';
                const movieId = $tr.attr('class').match(/\bmdl-\S+/)[0].substr(4);

                movieIds.push(movieId);

                const $poster = $('<div>').addClass(`col-md-3 mdl-${movieId}`).append(
                    $('<div>').addClass('card h-100 film-cover text-center').append(
                        $('<a>').attr('href', movieUrl).append(
                            $('<div>').addClass('image-container').append(
                                $('<img>').addClass('card-img-top img-fluid').attr('src', imgSrc).attr('alt', 'Movie poster'),
                                $('<span>').addClass('label label-left label-primary year').text(year),
                                episodes ? $('<span>').addClass('label label-right label-secondary episodes').text(`${episodes} episodes`) : null,
                                $('<span>').addClass('label-rating').html($rating),
                                $('<span>').addClass('label-ratingNum text-sm').html($ratingNum)
                            )
                        ),
                        $('<div>').addClass('card-body').append(
                            $('<p>').addClass('card-title mb-0 title').html(`<a href="${movieUrl}">${$tr.find('.title b').text()}</a>`),
                        ),
                        $('<div>').addClass('card-footer').append(
                            $('<button>').addClass('card-footer-btn btn-manage-list w-100').attr('data-id', $tr.attr('class').match(/\bmdl-\S+/)[0].substr(4)).attr('data-stats', 'mylist:' + $tr.attr('class').match(/\bmdl-\S+/)[0].substr(4)).append(
                                $('<span>').append(
                                    $('<i>').addClass('fas fa-plus-circle'),
                                    '&nbsp;',
                                    $('<span>').addClass('movie-status').text(" Add to list")
                                )
                            )
                        )
                    )
                );

                $tr.replaceWith($poster);
            });

            const baseUrl = 'https://mydramalist.com/v1/users/data';
            const params = new URLSearchParams({
                token: token,
                lang: 'en-US',
                mylist: movieIds.join('-'),
                t: 'z'
            });
            const apiUrl = `${baseUrl}?${params.toString()}`;

            $.getJSON(apiUrl, function (json) {
                json.mylist.forEach(function (movie) {
                    if (movie && movie.status >= 1 && movie.status <= 6) {
                        const $button = $(`.mdl-${movie.rid} .card-footer-btn`);
                        $button.css('background-color', colours[movie.status]);
                        $button.find('.movie-status').text(statusNames[movie.status]).css('color', 'var(--mdl-background)');
                        $button.find('i').removeClass().addClass(icons[movie.status]).css('color', 'var(--mdl-background)');
                    }
                });
            });

            $viewModeBtn.find('i').removeClass('fa-th').addClass('fa-list');

            // Remove the "Poster" column from the table
            $table.find('th:contains("Poster")').remove();
            $table.find('td.film-cover').remove();
            $table.find('thead').remove();
        } else {
            // switch to list view
            $table.addClass('list-view');
            $table.removeClass('poster-view');

            $table.empty().html($originalHtml);

            // Remove the "Poster" column from the table
            $table.find('th:contains("Poster")').remove();
            $table.find('td.film-cover').remove();

            const movieIds = [];

            // Reapply the status icons before the title
            $table.find('tbody tr[class]').each(function () {
                const classes = $(this).attr('class').split(' ');
                const rid = classes.find(x => x.startsWith('mdl-')).substr(4);

                movieIds.push(rid);
            });

            const baseUrl = 'https://mydramalist.com/v1/users/data';
            const params = new URLSearchParams({
                token: token,
                lang: 'en-US',
                mylist: movieIds.join('-'),
                t: 'z'
            });
            const apiUrl = `${baseUrl}?${params.toString()}`;

            $.getJSON(apiUrl, function (json) {
                // Iterate over each movie object in the response
                json.mylist.forEach(function (movie) {
                    if (movie.status >= 1 && movie.status <= 6) {
                        const row = $('table.film-list tbody tr.mdl-' + movie.rid);
                        const titleLink = row.find('.title a');
                        titleLink.prepend(
                            `<i class="${icons[movie.status]}" style="color: ${colours[movie.status]};"></i> `
                        );
                    }
                });
            });
        }

    });


    /* -------------------------- Hide completed titles ------------------------- */

    // Handle click event for hide/show icon
    $hideIcon.click(function () {
        const $icon = $(this).find('.hide-icon');
        const isHidden = $icon.hasClass('fa-eye');
        const $hiddenRows = $table.find('tbody > tr:hidden, tbody > div:hidden');

        if (isHidden) {
            $hiddenRows.show();
        } else {
            const movieIds = [];

            $table.find('tbody > tr, tbody > div').each(function () {
                const $row = $(this);
                if ($row.is(':visible')) {
                    const classes = $row.attr('class').split(' ');
                    const rid = classes.find(x => x.startsWith('mdl-')).substr(4);

                    movieIds.push(rid);
                }
            });

            const baseUrl = 'https://mydramalist.com/v1/users/data';
            const params = new URLSearchParams({
                token: token,
                lang: 'en-US',
                mylist: movieIds.join('-'),
                t: 'z'
            });
            const apiUrl = `${baseUrl}?${params.toString()}`;

            $.getJSON(apiUrl, function (json) {
                const hiddenMovieIds = json.mylist
                    .filter(movie => movie.status === 2)
                    .map(movie => movie.rid);

                // Update the visibility of rows based on hiddenMovieIds
                $table.find('tbody > tr, tbody > div').each(function () {
                    const $row = $(this);
                    const classes = $row.attr('class').split(' ');
                    const rid = classes.find(x => x.startsWith('mdl-')).substr(4);

                    if (hiddenMovieIds.includes(Number(rid))) {
                        $row.hide();
                    } else {
                        $row.show();
                    }
                });
            });
        }

        $icon.toggleClass('fa-eye-slash fa-eye');
    });

    /* ---------------------------- Sort by Dropdown ---------------------------- */

    let currentSortOption = 1;

    function sortView(ascending) {
        const $sortIcon = $orderButton.find('.sort-icon');
        const option = sortOptions[currentSortOption];
        let $rows;
        if (viewMode === 'Poster') {
            console.log(logPrefix, logStyle, 'Sorting posters');
            const $posterView = $('.poster-view');
            const $posterCardsContainer = $posterView.find('tbody');
            const $posterCards = $posterCardsContainer.children('.col-md-3');
            $posterCards.detach();
            $posterCards.sort(function (a, b) {
                const aValue = option.class === '.episodes' ?
                    parseInt($(a).find(option.class).text().trim().match(/(\d+)/)[1], 10) :
                    $(a).find(option.class).text().trim().toLowerCase();
                const bValue = option.class === '.episodes' ?
                    parseInt($(b).find(option.class).text().trim().match(/(\d+)/)[1], 10) :
                    $(b).find(option.class).text().trim().toLowerCase();
                if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
                    return ascending ? aValue - bValue : bValue - aValue;
                }
                return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            });

            $posterCards.appendTo($posterCardsContainer);
        } else {
            $rows = $table.find('tbody tr');
            $rows.sort(function (a, b) {
                const aRawValue = $(a).find(option.class).text().trim();
                const bRawValue = $(b).find(option.class).text().trim();
                // Remove the status icon from the cell value
                const aValue = aRawValue.replace(/^<i class="[^"]+"><\/i>\s*/, '').toLowerCase();
                const bValue = bRawValue.replace(/^<i class="[^"]+"><\/i>\s*/, '').toLowerCase();
                // Compare the values
                if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
                    return ascending ? aValue - bValue : bValue - aValue;
                }
                return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            });
            $table.find('tbody').empty().append($rows);
        }

        // Toggle the sort icon based on the current sort option and sort direction
        $sortIcon.removeClass(option.icons[ascending ? 1 : 0])
            .addClass(option.icons[ascending ? 0 : 1]);
    }

    // Sort the view when the order button is clicked
    $orderButton.on('click', function () {
        const $sortIcon = $(this).find('.sort-icon');
        const ascending = $sortIcon.hasClass(sortOptions[currentSortOption].icons[0]);
        sortView(!ascending);
    });

    // Sort the view when a sort option is clicked
    $sortMenu.on('click', 'a.dropdown-item', function (e) {
        e.preventDefault();
        const $link = $(this);
        const index = $link.data('index');
        currentSortOption = index;
        sortView(false);
    });

    // Initialize the sort icon based on the default sort option
    $orderButton.find('.sort-icon').addClass(sortOptions[currentSortOption].icons[1]);
});



/* ------------------------ Add posters to the tables ----------------------- */

// Apply the "Poster" column to the table if it doesn't exist
function addPosterColumn() {
    // Check if local storage is available
    if (typeof Storage !== 'undefined') {
        // Get the cached poster URLs from local storage
        const cachedPosters =
            JSON.parse(localStorage.getItem('betterMDLPosters')) || {};

        // Add posters to the table
        $('table.film-list th:nth-child(1)').after('<th>Poster</th>');
        $('table.film-list tbody tr').each(function (index) {
            const titleCell = $(this).find('td:nth-child(2)');
            const titleLink = titleCell.find('a');
            const titleHref = titleLink.attr('href');
            if (titleHref) {
                // Check if the poster URL is cached
                if (cachedPosters[titleHref]) {
                    titleCell.before(
                        `<td class="film-cover"><img src="${cachedPosters[titleHref]}" style="max-width: 70px;"></td>`
                    );
                } else {
                    // Fetch the poster URL and cache it
                    setTimeout(() => {
                        $.get(titleHref, function (data) {
                            const posterUrl = $(data)
                                .find('.film-cover img')
                                .attr('src');
                            cachedPosters[titleHref] = posterUrl;
                            localStorage.setItem(
                                'betterMDLPosters',
                                JSON.stringify(cachedPosters)
                            );
                            titleCell.before(
                                `<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`
                            );
                        }).fail(function () {
                            // Image failed to load, try again
                            setTimeout(() => {
                                $.get(titleHref)
                                    .done(function (data) {
                                        const posterUrl = $(data)
                                            .find('.film-cover img')
                                            .attr('src');
                                        cachedPosters[titleHref] = posterUrl;
                                        localStorage.setItem(
                                            'betterMDLPosters',
                                            JSON.stringify(cachedPosters)
                                        );
                                        titleCell.before(
                                            `<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`
                                        );
                                    })
                                    .fail(function () {
                                        // Image failed to load again, give up
                                        titleCell.before('<td></td>');
                                    });
                            }, index * 125); // Delay requests by 125 milliseconds (8 requests per second)
                        });
                    }, index * 125); // Delay requests by 125 milliseconds (8 requests per second)
                }
            } else {
                titleCell.before('<td></td>');
            }
        });
    } else {
        // Local storage is not available
        $('table.film-list th:nth-child(1)').after('<th>Poster</th>');
        $('table.film-list tbody tr').each(function () {
            const titleCell = $(this).find('td:nth-child(2)');
            titleCell.before('<td></td>');
        });
    }
}

$(document).ready(function () {
    addPosterColumn();
});

// Add the status icons before the title
const movieIds = [];
$('table.film-list tbody tr[class]').each(function (index) {
    const classes = $(this).attr('class').split(' ');
    // Find the class that starts with 'mdl-' and extract the ID
    const rid = classes.find((x) => x.startsWith('mdl-')).substr(4);
    movieIds.push(rid);
});

const baseUrl = 'https://mydramalist.com/v1/users/data';
const params = new URLSearchParams({
    token: token,
    lang: 'en-US',
    mylist: movieIds.join('-'),
    t: 'z'
});
const apiUrl = `${baseUrl}?${params.toString()}`;

$.getJSON(apiUrl, function (json) {
    // Iterate over each movie object in the response
    json.mylist.forEach(function (movie) {
        if (movie.status >= 1 && movie.status <= 6) {
            const row = $('table.film-list tbody tr.mdl-' + movie.rid);
            const titleLink = row.find('.title a');
            titleLink.prepend(
                `<i class="${icons[movie.status]}" style="color: ${colours[movie.status]};"></i> `
            );
        }
    });
});

