// ==UserScript==
// @name         Better MyDramaList
// @author       Mio.
// @version      1.0
// @homepage     https://dear-clouds.carrd.co/#better-mdl
// @updateURL    https://github.com/dear-clouds/better-mdl/raw/main/better-mdl.user.js
// @match        *://www.mydramalist.com/*
// @match        *mydramalist.com/*
// @description  An enhance version making the website more friendly & modern

// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// ==/UserScript==
(function () {
    'use strict';

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

    // Apply the saved values to the color and icon inputs
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

    const statusNames = {
        1: 'Watching',
        2: 'Completed',
        3: 'Planned',
        4: 'On Hold',
        5: 'Dropped',
        6: 'Not Interested',
    };

    /* -------------------------------------------------------------------------- */
    /*                                 Custom CSS                                 */
    /* -------------------------------------------------------------------------- */



    const css = `
    .mio-filters { display:block; text-align: right; }
    .mio-filters .btn, .mio-filters .btn-group { float: none; }
    
    td:first-child {
        text-align: center;
    }      
    
    table.film-list th {
        vertical-align: top;
    }
    
    th.year, th.episodes {
        text-align: center;
    }   
    
    #backToTop {
        background: var(--mdl-primary);
        padding: 0px 15px 5px 15px;
        color: var(--mdl-background);
    }

    .count-box:hover {
        transform: scale(1.1);
        transition: transform 0.5s ease;
    }
    
    .poster-view {
        margin-top: 10px;
    }
    
    .image-container {
        position: relative;
        height: 215px;
        overflow: hidden;
    }
    
    .image-container .label {
        position: absolute;
        margin: 10px;
    }
    
    .label-left {
        top: 0;
        left: 0;
        background-color: var(--mdl-primary);
    }
    
    .label-right {
        top: 0;
        right: 0;
        color: var(--mdl-primary);
    }
    
    .label-rating {
        position: absolute;
        background: transparent;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        background-image: linear-gradient(rgba(var(--crustRaw), 0.1), rgba(var(--crustRaw), 0.8), rgb(var(--crustRaw)));
        padding: 5px;
        width: 100%;
    }

    .card {
        background-color: var(--mdl-background);
        border: none;
    }
    .poster-view .card-footer {
        background-color: var(--mdl-btn-white);
        padding: 0px;
    }

    .poster-view .film-cover img {
        min-height: 220px;
    }
    
    .poster-view .card-body {
        height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 5px;
    }
    
    .poster-view .card-title {
        font-weight: bold;
        color: var(--mdl-primary);
    }

    .poster-view .btn-manage-list.simple {
        font-size: 90%;
        padding: 5px 10px;
        border-radius: 10px;
    }

    .card-footer-btn {
        padding: 8px;
        box-shadow: none;
        border: 0;
        border-radius: 0px 0px 5px 5px;
        background-color: var(--mdl-btn-white);
        color: var(--mdl-text);
    }

    .card-footer-btn:hover {
        /*transform: scale(1.1);*/
        transition: transform 0.5s ease;
    }

    .mio-manga-box .card:hover {
        transform: scale(1.1);
        transition: transform 0.5s ease;
    }

    .mio-ratings {
        float: left;
        /*margin-left: 15px;*/
        font-weight: bold;
        line-height: 27px;
    }

    .mio-ratings img {
        margin-right: 5px;
    }

    .form-check-inline + .form-check-inline {
        margin-left: 0px;
    }
    `;

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Get the value of a cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const token = getCookie('jl_sess');
    if (token) {
        $.ajaxSetup({
            headers: {
                'authorization': `Bearer ${token}`,
            }
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                       Back to Top button on all pages                      */
    /* -------------------------------------------------------------------------- */

    // create the floating icon element
    const backToTop = document.createElement("div");
    backToTop.innerHTML = "&#8593;"; // up arrow icon
    backToTop.setAttribute("id", "backToTop");
    backToTop.setAttribute("title", "Return to top");
    backToTop.style.display = "none"; // hide by default
    backToTop.style.position = "fixed";
    backToTop.style.right = "20px";
    backToTop.style.bottom = "100px";
    backToTop.style.borderRadius = "10px";
    backToTop.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.3)";
    backToTop.style.fontSize = "20px";
    backToTop.style.cursor = "pointer";
    backToTop.style.zIndex = "999";

    document.body.appendChild(backToTop);

    window.addEventListener("scroll", function () {
        if (window.pageYOffset > 200) {
            backToTop.style.display = "block";
        } else {
            backToTop.style.display = "none";
        }
    });

    backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    /* -------------------------------------------------------------------------- */
    /*                                 People page                                */
    /* -------------------------------------------------------------------------- */

    const urlParts = window.location.pathname.split('/');
    if (token && urlParts[1] === 'people') {

        /* ---------------------- Add the counters on the side ---------------------- */

        // Count the titles on my list
        const movieCount = {
            1: 0, // currently watching
            2: 0, // completed
            3: 0, // plan to watch
            4: 0, // on hold
            5: 0, // dropped
            6: 0, // not interested
        };

        $('table.film-list tbody tr').each(function () {
            const classes = $(this).attr('class').split(' ');
            const rid = classes.find(x => x.startsWith('mdl-')).substr(4);
            $.getJSON(`/v1/users/data?token=${token}&lang=en-US&mylist=${rid}&t=z`, function (json) {
                const movie = json.mylist[0];
                movieCount[movie.status]++;

                // Update the title counts
                const countsHtml = `
            <div class="movie-counts" style="max-width: 100%; display: flex; justify-content: space-evenly; align-items: center; text-align: center; font-weight: bold; font-size: 14px;">
            <div style="margin-right: 5px; background-color: var(--mdl-background); padding: 5px 20px 5px 20px; border-radius: 5px;" class="count-box">
            <i class="${icons[1]}" style="color: ${colours[1]};" title="Currently Watching"></i><br>
            <span>${movieCount[1]}</span>
            </div>
            <div style="margin-right: 5px; background-color: var(--mdl-background); padding: 5px 20px 5px 20px; border-radius: 5px;" class="count-box">
            <i class="${icons[2]}" style="color: ${colours[2]};" title="Completed"></i><br>
            <span>${movieCount[2]}</span>
            </div>
            <div style="margin-right: 5px; background-color: var(--mdl-background); padding: 5px 20px 5px 20px; border-radius: 5px;" class="count-box">
            <i class="${icons[3]}" style="color: ${colours[3]};" title="Planning"></i><br>
            <span>${movieCount[3]}</span>
            </div>
            <div style="margin-right: 5px; background-color: var(--mdl-background); padding: 5px 20px 5px 20px; border-radius: 5px;" class="count-box">
            <i class="${icons[4]}" style="color: ${colours[4]};" title="On-Hold"></i><br>
            <span>${movieCount[4]}</span>
            </div>
            <div style="margin-right: 5px; background-color: var(--mdl-background); padding: 5px 20px 5px 20px; border-radius: 5px;" class="count-box">
            <i class="${icons[5]}" style="color: ${colours[5]};" title="Dropped"></i><br>
            <span>${movieCount[5]}</span>
            </div>
            <div style="background-color: var(--mdl-background); padding: 5px 20px 5px 20px; border-radius: 5px;" class="count-box">
            <i class="${icons[6]}" style="color: ${colours[6]}; title="Not Interested"></i><br>
            <span>${movieCount[6]}</span>
            </div>
            </div>
            `;

                $('.movie-counts').remove();
                $('.share-container').after(countsHtml);
            });
        });


        /* ---------------------------- Sort & View icons --------------------------- */

        $('table.film-list').each(function () {
            //todo  Need to fix this because after switching each view twice, the table completely disappears 
            const $originalTable = $(this);
            const $table = $originalTable.clone(true);
            $originalTable.replaceWith($table);

            let viewMode = 'Thumbnail'; // Set the initial view mode to thumbnail
            const viewModes = ['Thumbnail', 'Poster', 'List'];

            const $viewModeBtn = $('<button>').addClass('btn btn-secondary view-mode-btn mx-1').append($('<i>').addClass(getViewModeIcon(viewMode)).attr('title', 'Change View'));

            $viewModeBtn.click(function () {
                const currentViewIndex = viewModes.indexOf(viewMode);
                viewMode = viewModes[(currentViewIndex + 1) % viewModes.length]; // Cycle through the view modes
                $viewModeBtn.find('i').removeClass().addClass(getViewModeIcon(viewMode)); // Update the icon based on the new view mode
            });

            const $hideIcon = $('<button>').addClass('btn btn-secondary hide-btn mx-1').append($('<i>').addClass('far fa-eye-slash hide-icon').attr('title', 'Hide completed titles'));

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
                console.log('Current view mode:', viewMode);
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
                $viewModeBtn.find('i').removeClass('fas fa-th fas fa-list-ul fas fa-images');

                // add new icon class based on the current view
                if (currentView === 'Thumbnail') {
                    $viewModeBtn.find('i').addClass('fas fa-th');
                } else if (currentView === 'List') {
                    $viewModeBtn.find('i').addClass('fas fa-list-ul');
                } else {
                    $viewModeBtn.find('i').addClass('fas fa-images');
                }

                if (currentView === 'Thumbnail') {
                    $table.addClass('thumbnail-view');
                    $table.removeClass('list-view');
                    $viewModeBtn.find('i').removeClass('fa-th-list').addClass('fa-th');

                    // Reapply the "Poster" column to the table if it doesn't exist
                    if ($table.find('th:nth-child(2)').text() !== 'Poster') {

                        if (typeof (Storage) !== "undefined") {

                            // Get the cached poster URLs from local storage
                            const cachedPosters = JSON.parse(localStorage.getItem('betterMDLPosters')) || {};

                            $table.find('th:nth-child(1)').after('<th>Poster</th>');
                            $table.find('tbody tr').each(function () {
                                const titleCell = $(this).find('td:nth-child(2)');
                                const titleLink = titleCell.find('a');
                                const titleHref = titleLink.attr('href');
                                if (titleHref) {
                                    // Check if the poster URL is cached
                                    if (cachedPosters[titleHref]) {
                                        titleCell.before(`<td class="film-cover"><img src="${cachedPosters[titleHref]}" style="max-width: 70px;"></td>`);
                                    } else {
                                        // Fetch the poster URL and cache it
                                        $.get(titleHref, function (data) {
                                            const posterUrl = $(data).find('.film-cover img').attr('src');
                                            cachedPosters[titleHref] = posterUrl;
                                            localStorage.setItem('betterMDLPosters', JSON.stringify(cachedPosters));
                                            titleCell.before(`<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`);
                                        }).fail(function () {
                                            // Image failed to load, try again
                                            setTimeout(() => {
                                                $.get(titleHref).done(function (data) {
                                                    const posterUrl = $(data).find('.film-cover img').attr('src');
                                                    cachedPosters[titleHref] = posterUrl;
                                                    localStorage.setItem('betterMDLPosters', JSON.stringify(cachedPosters));
                                                    titleCell.before(`<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`);
                                                }).fail(function () {
                                                    // Image failed to load again, give up
                                                    titleCell.before('<td></td>');
                                                });
                                            }, 1000);
                                        });
                                    }
                                } else {
                                    titleCell.before('<td></td>');
                                }
                            });

                        } else {
                            // Local storage is not available
                            $table.find('th:nth-child(1)').after('<th>Poster</th>');
                            $table.find('tbody tr').each(function () {
                                const titleCell = $(this).find('td:nth-child(2)');
                                titleCell.before('<td></td>');
                            });
                        }
                    }
                } else if (currentView === 'Poster') {
                    $table.addClass('poster-view');
                    $table.removeClass('thumbnail-view');

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

                        $.getJSON(`/v1/users/data?token=${token}&lang=en-US&mylist=${movieId}&t=z`, function (json) {
                            const movie = json.mylist[0];
                            if (movie && movie.status >= 1 && movie.status <= 6) {
                                const $button = $poster.find('.card-footer-btn');
                                $button.css('background-color', colours[movie.status]);
                                $button.find('.movie-status').text(statusNames[movie.status]).css('color', 'var(--mdl-background)');
                                $button.find('i').removeClass().addClass(icons[movie.status]).css('color', 'var(--mdl-background)');
                            }
                        });


                        $tr.replaceWith($poster);
                    });

                    $viewModeBtn.find('i').removeClass('fa-th').addClass('fa-list');
                    $table.find('th:contains("Poster")').remove();
                    $table.find('td.film-cover').remove();
                    $table.find('thead').remove();
                } else {
                    $table.addClass('list-view');
                    $table.removeClass('poster-view');
                    $table.empty().html($originalHtml);
                    $table.find('th:contains("Poster")').remove();
                    $table.find('td.film-cover').remove();

                    // Reapply the status icons before the title
                    $table.find('tbody tr[class]').each(function () {
                        const classes = $(this).attr('class').split(' ');
                        const rid = classes.find(x => x.startsWith('mdl-')).substr(4);
                        $.getJSON(`/v1/users/data?token=${token}&lang=en-US&mylist=${rid}&t=z`, function (json) {
                            const movie = json.mylist[0];
                            if (movie.status >= 1 && movie.status <= 6) {
                                $(this).find('.title a').prepend(`<i class="${icons[movie.status]}" style="color: ${colours[movie.status]};"></i> `);
                            }
                        }.bind(this));
                    });

                }
            });

            /* -------------------------- Hide completed titles ------------------------- */

            $hideIcon.click(function () {
                const $icon = $(this).find('.hide-icon');
                const isHidden = $icon.hasClass('fa-eye');
                const $hiddenRows = $table.find('tbody > tr:hidden, tbody > div:hidden');
                if (isHidden) {
                    $hiddenRows.show();
                } else {
                    $table.find('tbody > tr, tbody > div').each(function () {
                        const $row = $(this);
                        if ($row.is(':visible')) {
                            const classes = $row.attr('class').split(' ');
                            const rid = classes.find(x => x.startsWith('mdl-')).substr(4);
                            $.getJSON(`/v1/users/data?token=${token}&lang=en-US&mylist=${rid}&t=z`, function (json) {
                                const movie = json.mylist[0];
                                if (movie.status === 2) {
                                    $row.hide();
                                }
                            });
                        }
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

            $orderButton.find('.sort-icon').addClass(sortOptions[currentSortOption].icons[1]);

            /* --------------------------- End of Tables --------------------------- */
        });




        /* ------------------------ Add posters to the tables ----------------------- */
        function addPosterColumn() {

            // Check if local storage is available
            if (typeof (Storage) !== "undefined") {

                // Get the cached poster URLs from local storage
                const cachedPosters = JSON.parse(localStorage.getItem('betterMDLPosters')) || {};

                // Add posters to the table
                $('table.film-list th:nth-child(1)').after('<th>Poster</th>');
                $('table.film-list tbody tr').each(function () {
                    const titleCell = $(this).find('td:nth-child(2)');
                    const titleLink = titleCell.find('a');
                    const titleHref = titleLink.attr('href');
                    if (titleHref) {
                        // Check if the poster URL is cached
                        if (cachedPosters[titleHref]) {
                            titleCell.before(`<td class="film-cover"><img src="${cachedPosters[titleHref]}" style="max-width: 70px;"></td>`);
                        } else {
                            // Fetch the poster URL and cache it
                            $.get(titleHref, function (data) {
                                const posterUrl = $(data).find('.film-cover img').attr('src');
                                cachedPosters[titleHref] = posterUrl;
                                localStorage.setItem('betterMDLPosters', JSON.stringify(cachedPosters));
                                titleCell.before(`<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`);
                            }).fail(function () {
                                // Image failed to load, try again
                                setTimeout(() => {
                                    $.get(titleHref).done(function (data) {
                                        const posterUrl = $(data).find('.film-cover img').attr('src');
                                        cachedPosters[titleHref] = posterUrl;
                                        localStorage.setItem('betterMDLPosters', JSON.stringify(cachedPosters));
                                        titleCell.before(`<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`);
                                    }).fail(function () {
                                        // Image failed to load again, give up
                                        titleCell.before('<td></td>');
                                    });
                                }, 1000);
                            });
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
        $('table.film-list tbody tr[class]').each(function () {
            const classes = $(this).attr('class').split(' ');
            const rid = classes.find(x => x.startsWith('mdl-')).substr(4);
            $.getJSON(`/v1/users/data?token=${token}&lang=en-US&mylist=${rid}&t=z`, function (json) {
                const movie = json.mylist[0];
                if (movie.status >= 1 && movie.status <= 6) {
                    $(this).find('.title a').prepend(`<i class="${icons[movie.status]}" style="color: ${colours[movie.status]};"></i> `);
                }
            }.bind(this));
        });


        /* -------------------------- Collape the sections -------------------------- */

        const $container = $('.col-lg-8.col-md-8');
        const $boxBodies = $container.find('.box-body').slice(0, 2);

        $boxBodies.each(function () {
            const $boxBody = $(this);
            const $collapseBtn = $('<button>').addClass('btn btn-link ml-2').html('<i class="fas fa-minus"></i> Hide section');

            const boxBodyId = `box-body-${$boxBody.index()}`;
            $boxBody.attr('id', boxBodyId);

            $collapseBtn.attr('data-target', `#${boxBodyId}`);

            $boxBody.before($collapseBtn);
            $boxBody.addClass('collapse');

            $collapseBtn.on('click', function () {
                toggleCollapse($boxBody, $collapseBtn);
                updateIcon($boxBody, $collapseBtn);
            });
        });

        // Add a collapse button before the .articles-listing element
        const $articlesListing = $('.articles-listing');
        const $articlesCollapseBtn = $('<button>').addClass('btn btn-link ml-2').html('<i class="fas fa-plus"></i> Show section');
        $articlesListing.before($articlesCollapseBtn);

        $articlesCollapseBtn.attr('data-target', `#${$articlesListing.attr('id')}`);

        $articlesListing.addClass('collapse');

        $articlesCollapseBtn.on('click', function () {
            toggleCollapse($articlesListing, $articlesCollapseBtn);
            updateIcon($articlesListing, $articlesCollapseBtn);
        });

        $($boxBodies[0]).collapse('show');
        $($boxBodies[0]).prev().find('button').html('<i class="fas fa-minus"></i> Hide section');
        $($boxBodies[1]).collapse('show');
        $($boxBodies[1]).prev().find('button').html('<i class="fas fa-minus"></i> Hide section');

        function toggleCollapse($element, $collapseBtn) {
            $element.collapse('toggle');
        }

        function updateIcon($element, $collapseBtn) {
            if ($collapseBtn.find('i').hasClass('fa-minus')) {
                $collapseBtn.html('<i class="fas fa-plus"></i> Show section');
            } else {
                $collapseBtn.html('<i class="fas fa-minus"></i> Hide section');
            }
        }


    }

    /* -------------------------------------------------------------------------- */
    /*                                  Settings                                  */
    /* -------------------------------------------------------------------------- */

    // Check if the user is on the profile page
    if (window.location.pathname.includes('/account/profile')) {
        // Get a reference to the div we created earlier
        let betterMDLDiv = $();

        betterMDLDiv = $('<div id="better-mdl" style="padding: 20px;"></div>');

        // Add the div before the box-footer b-t div
        $('div.el-loading-mask').before(betterMDLDiv);

        betterMDLDiv.append($('<h2></h2>').text('Better MDL Settings'));

        const formElement = $('<form class="form-horizontal"></form>');

        const tmdbGroup = $('<div class="form-group"></div>');
        const tmdbCheck = $('<div class="form-check form-check-inline"></div>');
        const tmdbCheckbox = $('<input type="checkbox" class="form-check-input offset-md-1" name="tmdb_search" value="true">');
        const tmdbLabel = $('<label class="form-check-label">Include TMDB/TVDB/IMDB icons on a title page?</label>');
        tmdbCheck.append(tmdbCheckbox, tmdbLabel);

        const ratingsCheck = $('<div class="form-check form-check-inline"></div>');
        const ratingsCheckbox = $('<input type="checkbox" class="form-check-input offset-md-1" name="ratings_enabled" value="true">');
        const ratingsLabel = $('<label class="form-check-label">Show ratings on a title page (TMDB must be enabled)?</label>');
        ratingsCheck.append(ratingsCheckbox, ratingsLabel);

        const optionsCol = $('<div class="col-md-4"></div>').append(tmdbCheck, ratingsCheck);
        tmdbGroup.append(optionsCol);

        // Load the value from local storage and set the checkbox state
        const tmdbSearchEnabled = localStorage.getItem('betterMDLTMDBSearch');
        if (tmdbSearchEnabled === 'true') {
            tmdbCheckbox.prop('checked', true);
        }
        const ratingsEnabled = localStorage.getItem('betterMDLRatings');
        if (ratingsEnabled === 'true') {
            ratingsCheckbox.prop('checked', true);
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

        betterMDLDiv.append(formElement);

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
                }
            });

            // Save the updated values to local storage
            localStorage.setItem('betterMDLIcons', JSON.stringify(icons));
            localStorage.setItem('betterMDLColours', JSON.stringify(colours));

            const tmdbSearchEnabled = tmdbCheckbox.prop('checked');
            localStorage.setItem('betterMDLTMDBSearch', tmdbSearchEnabled);

            const ratingsEnabled = ratingsCheckbox.prop('checked');
            localStorage.setItem('betterMDLRatings', ratingsEnabled);

            // Reload the page to apply the changes
            location.reload();
        });

        const navBar = $('ul.nav-tabs');
        const newTab = $('<li class="page-item nav-item" style="background: var(--mdl-primary); color: var(--mdl-background)"><a to="/better-mdl" href="#better-mdl" class="nav-link">Better MDL 🤍</a></li>');
        navBar.append(newTab);
    }



    /* -------------------------------------------------------------------------- */
    /*                                 Title pages                                */
    /* -------------------------------------------------------------------------- */

    // Get the native title value
    const nativeTitleLink = document.querySelector('b.inline + a');
    const nativeTitleValue = nativeTitleLink.textContent.trim();
    const year = $('.film-title').text().split('(')[1].slice(0, -1);
    // Check if the tag "Adapted From A Manga" is present
    const adaptedFromMangaTag = document.querySelector('a[href*="th=127"]');

    // Get the Romaji title
    const filmTitleLink = document.querySelector('h1.film-title a');
    const filmTitleValue = filmTitleLink.textContent.trim();

    // TMDB API base URL and API key
    const tmdbBaseUrl = 'https://api.themoviedb.org/3';
    const apiKey = 'd12b33d3f4fb8736dc06f22560c4f8d4';

    // Find media type
    let mediaType;
    const listItems = document.querySelectorAll('.box-body li');
    for (let i = 0; i < listItems.length; i++) {
        const text = listItems[i].innerText;
        if (text.includes('TV Show:') || text.includes('Drama:')) {
            mediaType = 'tv';
            break;
        } else if (text.includes('Movie')) {
            mediaType = 'movie';
            break;
        } else if (text.includes('Special:')) {
            mediaType = 'multi';
        }
    }

    // Perform search based on media type
    let tmdbSearchUrl;
    if (localStorage.getItem('betterMDLTMDBSearch') === 'true') {

        if (mediaType === 'tv') {
            tmdbSearchUrl = `${tmdbBaseUrl}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(nativeTitleValue)}&first_air_date_year=${year}`;
        } else if (mediaType === 'movie') {
            tmdbSearchUrl = `${tmdbBaseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(nativeTitleValue)}&year=${year}`;
        } else {
            tmdbSearchUrl = `${tmdbBaseUrl}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(nativeTitleValue)}`;
        }

        // Check if we get a result from TMDB for the native title search
        fetch(tmdbSearchUrl)
            .then(response => response.json())
            .then(data => {
                const results = data.results;

                // Filter out titles without genre 16 (Animation)
                const filteredResults = results.filter(result => {
                    const genres = result.genre_ids;
                    return !genres.includes(16);
                });

                if (filteredResults.length > 0) {
                    const firstResult = filteredResults[0];
                    const id = firstResult.id;

                    // Create the link to the TMDB page for the title
                    let tmdbTitleLink = '';
                    if (mediaType === 'movie') {
                        tmdbTitleLink = `https://www.themoviedb.org/movie/${id}`;
                    } else if (mediaType === 'tv') {
                        tmdbTitleLink = `https://www.themoviedb.org/tv/${id}`;
                    }

                    if (tmdbTitleLink !== '') {
                        if (mediaType === 'movie') {
                            createWebsiteIcon('TheMovieDB', `https://www.themoviedb.org/movie/${id}`);
                        } else if (mediaType === 'tv') {
                            createWebsiteIcon('TheMovieDB', `https://www.themoviedb.org/tv/${id}`);
                        }

                        // Get the IDs for the other websites from TMDB API
                        const tmdbIdsUrl = `${tmdbBaseUrl}/${mediaType}/${id}/external_ids?api_key=${apiKey}`;
                        return fetch(tmdbIdsUrl)
                            .then(response => response.json())
                            .then(idsData => {
                                // Create icons for the other websites using the IDs from TMDB API
                                if (idsData.imdb_id) {
                                    createWebsiteIcon('IMDB', `https://www.imdb.com/title/${idsData.imdb_id}`);

                                    const omdbkeys = ['8c967f70', 'dd37e5a4', '3fdb9c5a', 'b81150c9', '2981ebb6', 'f17eacb0'];
                                    const omdbkey = omdbkeys[Math.floor(Math.random() * omdbkeys.length)];

                                    if (localStorage.getItem('betterMDLRatings') === 'true') {
                                        // Make a request to the OMDB API to get the ratings
                                        fetch(`https://www.omdbapi.com/?apikey=${omdbkey}&i=${idsData.imdb_id}&plot=short&r=json`)
                                            .then(response => response.json())
                                            .then(data => {
                                                const ratings = data.Ratings;

                                                // Create a div to hold the ratings and logos
                                                const ratingsElement = document.createElement('div');
                                                ratingsElement.classList.add('mio-ratings');

                                                // Loop through the ratings and create a div for each one
                                                for (let i = 0; i < ratings.length; i++) {
                                                    const rating = ratings[i];
                                                    const ratingElement = document.createElement('div');
                                                    ratingElement.classList.add('mio-rating');

                                                    // Create an image element for the logo and set its source
                                                    const logoElement = document.createElement('img');
                                                    switch (rating.Source) {
                                                        case 'Internet Movie Database':
                                                            logoElement.src = 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/171_Imdb_logo_logos-512.png';
                                                            break;
                                                        case 'Rotten Tomatoes':
                                                            logoElement.src = 'https://www.google.com/s2/favicons?domain=https://www.rottentomatoes.com&sz=64';
                                                            break;
                                                        case 'Metacritic':
                                                            logoElement.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Metacritic.svg/1024px-Metacritic.svg.png';
                                                            break;
                                                        default:
                                                            logoElement.src = '';
                                                            break;
                                                    }
                                                    logoElement.alt = rating.Source;
                                                    logoElement.style.height = "25px";
                                                    ratingElement.appendChild(logoElement);

                                                    // Create a span element for the rating value and set its text
                                                    const valueElement = document.createElement('span');
                                                    valueElement.classList.add('value');
                                                    valueElement.innerText = rating.Value;
                                                    ratingElement.appendChild(valueElement);

                                                    ratingsElement.appendChild(ratingElement);
                                                }

                                                const colFilmRating = document.querySelector('.col-xs-8.col-sm-9.col-lg-9');
                                                colFilmRating.insertAdjacentElement('afterend', ratingsElement);
                                                const colFilmDetails = document.querySelector('.col-xs-8.col-sm-9.col-lg-9');
                                                colFilmDetails.classList.replace('col-xs-8', 'col-xs-6');
                                                colFilmDetails.classList.replace('col-sm-9', 'col-sm-7');
                                                colFilmDetails.classList.replace('col-lg-9', 'col-lg-7');

                                            });

                                    }
                                }

                                if (idsData.tvdb_id) {
                                    let tvdbUrl = '';
                                    if (mediaType === 'movie') {
                                        tvdbUrl = `https://www.thetvdb.com/movie/${idsData.tvdb_id}`;
                                    } else if (mediaType === 'tv') {
                                        tvdbUrl = `https://thetvdb.com/?tab=series&id=${idsData.tvdb_id}`;
                                    }
                                    createWebsiteIcon('TVDB', tvdbUrl);
                                }

                                // Search for the title using the TMDB ID on other websites
                                const tmdbId = filteredResults[0].id;
                                searchLetterboxd(tmdbId, mediaType);
                                searchTrakt(tmdbId);
                                searchSimkl(tmdbId, mediaType);

                                // Function to search for the title on Simkl
                                function searchSimkl(tmdbId, mediaType) {
                                    const type = mediaType === 'movie' ? 'movies' : 'tv';
                                    const simklSearchUrl = `https://simkl.com/search/?type=${type}&q=${tmdbId}`;

                                    GM.xmlHttpRequest({
                                        method: 'GET',
                                        url: simklSearchUrl,
                                        onload: function (response) {
                                            const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                                            const titleLink = doc.querySelector('a[href*="/movies/"], a[href*="/tv/"]');

                                            if (titleLink) {
                                                createWebsiteIcon('Simkl', simklSearchUrl);
                                            } else {
                                                throw new Error('No results found for title on Simkl');
                                            }
                                        },
                                        onerror: function (error) {
                                            console.error(error);
                                        }
                                    });
                                }


                                // Function to search for the title on Trakt
                                function searchTrakt(tmdbId) {
                                    const traktSearchUrl = `https://trakt.tv/search/tmdb?query=${tmdbId}`;

                                    GM.xmlHttpRequest({
                                        method: 'GET',
                                        url: traktSearchUrl,
                                        onload: function (response) {
                                            const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                                            const titleLink = doc.querySelector('a[href*="/movies/"], a[href*="/shows/"]');

                                            if (titleLink) {
                                                createWebsiteIcon('Trakt', traktSearchUrl);
                                            } else {
                                                throw new Error('No results found for title on Trakt');
                                            }
                                        },
                                        onerror: function (error) {
                                            console.error(error);
                                        }
                                    });
                                }

                                // Function to search for the title on Letterboxd
                                function searchLetterboxd(tmdbId, mediaType) {
                                    const letterboxdSearchUrl = `https://letterboxd.com/search/films/tmdb:${tmdbId}/`;
                                    return new Promise((resolve, reject) => {
                                        GM.xmlHttpRequest({
                                            method: 'GET',
                                            url: letterboxdSearchUrl,
                                            onload: (response) => {
                                                if (mediaType === 'movie') {
                                                    const parser = new DOMParser();
                                                    const doc = parser.parseFromString(response.responseText, 'text/html');
                                                    const titleLink = doc.querySelector('.results a[href*="/film/"]');
                                                    if (titleLink) {
                                                        createWebsiteIcon('Letterboxd', `https://letterboxd.com${titleLink.getAttribute('href')}`);
                                                        resolve();
                                                    }
                                                } else {
                                                    reject('No results found for title on Letterboxd');
                                                }
                                            },
                                            onerror: (response) => {
                                                reject(`Error ${response.status} retrieving ${letterboxdSearchUrl}`);
                                            }
                                        });
                                    });
                                }
                                shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
                            });
                    }
                }
                // If we don't get a result from TMDB for the native title search, create a simple search link using filmTitleValue
                createWebsiteIcon('TheMovieDB', `https://www.themoviedb.org/search?query=${encodeURIComponent(filmTitleValue)}`);
                shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
                throw new Error('No results found for native title');
            })
            .catch(error => console.error(error));
    }
    searchJFDB(nativeTitleValue);
    searchDramaOtaku(nativeTitleValue);
    searchAsianWiki(nativeTitleValue);
    searchPlex(filmTitleValue);

    function searchDramaOtaku(nativeTitleValue) {
        const DramaOtakuSearchUrl = `https://drama-otaku.com/?s=${encodeURIComponent(nativeTitleValue)}`;
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'GET',
                url: DramaOtakuSearchUrl,
                onload: (response) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const detailsBox = document.querySelector('.box.clear.hidden-sm-down');
                    if (detailsBox && detailsBox.textContent.includes('Country: Japan')) {
                        const titleLink = doc.querySelector('h3 a[href*="/movie/"], h3 a[href*="/drama/"]');
                        if (titleLink) {
                            createWebsiteIcon('DramaOtaku', `${titleLink.getAttribute('href')}`);
                            shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
                            resolve();
                        } else {
                            reject('No results found for title on DramaOtaku');
                        }
                    } else {
                        reject('Title is not from Japan');
                    }
                },
                onerror: (response) => {
                    reject(`Error ${response.status} retrieving ${DramaOtakuSearchUrl}`);
                }
            });
        });
    }


    function searchJFDB(nativeTitleValue) {
        const JFDBSearchUrl = `https://jfdb.jp/en/search/title/?KW=${encodeURIComponent(nativeTitleValue)}`;
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'GET',
                url: JFDBSearchUrl,
                onload: (response) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const detailsBox = document.querySelector('.box.clear.hidden-sm-down');
                    if (detailsBox && detailsBox.textContent.includes('Country: Japan')) {
                        const titleLink = doc.querySelector('.search-result-item a[href*="/en/title/"]');
                        if (titleLink) {
                            createWebsiteIcon('JFDB', `https://jfdb.jp${titleLink.getAttribute('href')}`);
                            shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
                            resolve();
                        } else {
                            reject('Title is not from Japan');
                        }
                    } else {
                        reject('No results found for title on DramaOtaku');
                    }
                },
                onerror: (response) => {
                    reject(`Error ${response.status} retrieving ${JFDBSearchUrl}`);
                }
            });
        });
    }
    function searchAsianWiki(nativeTitleValue) {
        const AsianWikiSearchUrl = `https://asianwiki.com/index.php?title=Special%253ASearch&search=${encodeURIComponent(nativeTitleValue)}`;
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'GET',
                url: AsianWikiSearchUrl,
                onload: (response) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const titleLink = doc.querySelector('.searchresults a');
                    if (titleLink) {
                        createWebsiteIcon('AsianWiki', `https://asianwiki.com${titleLink.getAttribute('href')}`);
                        shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
                        resolve();
                    }
                    else {
                        reject('No results found for title on AsianWiki');
                    }
                },
                onerror: (response) => {
                    reject(`Error ${response.status} retrieving ${AsianWikiSearchUrl}`);
                }
            });
        });
    }
    function searchPlex(filmTitleValue) {
        const PlexSearchUrl = `https://app.plex.tv/desktop/#!/search?query=${encodeURIComponent(filmTitleValue)}`;
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'GET',
                url: PlexSearchUrl,
                onload: (response) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    createWebsiteIcon('Plex', PlexSearchUrl);
                    shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
                    resolve();
                },
                onerror: (response) => {
                    reject(`Error ${response.status} retrieving ${PlexSearchUrl}`);
                }
            });
        });
    }

    // Create the TMDB icon element
    const tmdbIcon = document.createElement('a');
    tmdbIcon.innerHTML = '';

    // Add the TMDB icon to the page
    const shareContainer = document.querySelector('div.share-container.p-t.p-b.text-center');
    shareContainer.insertBefore(tmdbIcon, shareContainer.firstChild);

    // Create a new div to hold all the website icons
    const websiteIconsContainer = document.createElement('div');
    websiteIconsContainer.style.display = 'block';

    // Function to create an icon for a website with a link and append it to the websiteIconsContainer
    function createWebsiteIcon(websiteName, link) {
        const icon = document.createElement('a');
        icon.target = '_blank';
        icon.rel = 'noopener noreferrer';
        icon.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${link}&sz=64" height="40px" alt="${websiteName}" style="vertical-align: middle; margin-left: 5px; border-radius: 50px;">`;
        icon.href = link;
        websiteIconsContainer.appendChild(icon);
    }

    if (adaptedFromMangaTag) {
        // Create a new div to hold the AniList search result
        const anilistResultDiv = document.createElement('div');
        anilistResultDiv.classList.add('box', 'clear', 'hidden-sm-down', 'mio-manga-box');

        // Create a header for the box
        const header = document.createElement('div');
        header.classList.add('box-header', 'primary');
        header.innerHTML = '<h3>Check out the original work</h3>';
        anilistResultDiv.appendChild(header);

        // Create a body for the box
        const body = document.createElement('div');
        body.classList.add('box-body', 'light-b');
        anilistResultDiv.appendChild(body);

        // Create a loading message
        const loadingMessage = document.createElement('p');
        loadingMessage.textContent = 'Loading AniList search results...';
        body.appendChild(loadingMessage);

        // Insert the new div above the "title-contributors" div
        const titleContributorsDiv = document.querySelector('.title-contributors.box');
        titleContributorsDiv.parentNode.insertBefore(anilistResultDiv, titleContributorsDiv);

        // Make the AniList search request
        const query = `
        query ($search: String) {
          Media(search: $search, type: MANGA) {
            title {
              romaji
            }
            siteUrl
            coverImage {
              large
            }
            description(asHtml: false)
            averageScore
            genres
            startDate {
              year
            }
            endDate {
              year
            }
            format
            status
            chapters
            volumes
            isAdult
          }
        }
      `;
        const variables = {
            search: nativeTitleValue || filmTitleValue,
        };
        const apiUrl = 'https://graphql.anilist.co';
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        };
        fetch(apiUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                const media = data.data.Media;
                // Remove the loading message
                loadingMessage.remove();

                if (media) {
                    // Create the AniList card div
                    const cardDiv = document.createElement('div');
                    cardDiv.classList.add('card', 'my-3');

                    // Create the row div for the card content
                    const contentRow = document.createElement('div');
                    contentRow.classList.add('row', 'no-gutters');

                    // Create the column div for the poster image
                    const posterCol = document.createElement('div');
                    posterCol.classList.add('col-md-4');

                    // Create the card image
                    const cardImg = document.createElement('img');
                    cardImg.classList.add('card-img');
                    cardImg.style.width = '100%';
                    cardImg.src = media.coverImage.large;

                    // Add the image to the poster column div
                    posterCol.appendChild(cardImg);

                    // Create the column div for the card content
                    const contentCol = document.createElement('div');
                    contentCol.classList.add('col-md-8');

                    // Create the card body div for the content
                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');
                    cardBody.style = "padding: 8px 2px 5px 0px";

                    // Create the card title
                    const cardTitle = document.createElement('h6');
                    cardTitle.classList.add('card-title');
                    cardTitle.innerText = media.title.romaji;

                    // Create the card Year
                    const cardYear = document.createElement('div');
                    cardYear.classList.add('label', 'label-secondary');
                    cardYear.innerText = `${media.startDate.year}`;
                    cardYear.style = "margin-right: 8px;";

                    // Create the card rating
                    const cardRating = document.createElement('div');
                    cardRating.classList.add('card-rating', 'label', 'label-primary');
                    cardRating.style = "margin-right: 8px;";

                    const cardRatingIcon = document.createElement('i');
                    cardRatingIcon.classList.add('fas', 'fa-star', 'rating-icon');
                    cardRatingIcon.style = "margin-right: 2px;";
                    cardRating.appendChild(cardRatingIcon);

                    const cardRatingText = document.createElement('span');
                    cardRatingText.innerText = media.averageScore / 10;
                    cardRating.appendChild(cardRatingText);

                    // Create the card Volumes
                    const cardVolumes = document.createElement('div');
                    cardVolumes.classList.add('label', 'label-secondary');
                    cardVolumes.style = "font-weight: lighter; color: var(--mdl-text) !important;";
                    cardVolumes.innerText = `${media.volumes} volumes - ${media.chapters} chapters`;

                    // Create the card description
                    const cardDesc = document.createElement('p');
                    cardDesc.classList.add('card-text', 'small');
                    cardDesc.innerText = media.description.substring(0, 200) + '...';

                    // Add the title, rating label, and description to the card body div
                    cardBody.appendChild(cardTitle);
                    cardBody.appendChild(cardYear);
                    cardBody.appendChild(cardRating);
                    cardBody.appendChild(cardVolumes);
                    cardBody.appendChild(cardDesc);

                    // Add the poster column and card body to the content column div
                    contentCol.appendChild(cardBody);
                    contentRow.appendChild(posterCol);
                    contentRow.appendChild(contentCol);
                    cardDiv.appendChild(contentRow);

                    // Create a link to the AniList page
                    const anilistLink = document.createElement('a');
                    anilistLink.href = media.siteUrl;
                    anilistLink.target = '_blank';
                    anilistLink.rel = 'noopener noreferrer';
                    anilistLink.appendChild(cardDiv);

                    // Add the link to the box body div
                    body.appendChild(anilistLink);
                } else {
                    // Create an error message
                    const errorMessage = document.createElement('p');
                    errorMessage.textContent = 'No results found on AniList.';
                    body.appendChild(errorMessage);
                }
            })
            .catch(error => {
                console.error(error);
                // Create an error message
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'An error occurred while searching on AniList. Just contact Mio.';
                body.appendChild(errorMessage);
            });
    }

    /* ------------------------------ End of script ----------------------------- */
})();