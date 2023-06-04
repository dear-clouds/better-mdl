import { token, logPrefix, logStyle } from "../index.js";
import { colours } from '../index.js';
import { icons } from '../index.js';
import { statusNames } from '../index.js';

if (
    window.location.pathname.includes('watching') ||
    window.location.pathname.includes('on_hold') ||
    window.location.pathname.includes('completed') ||
    window.location.pathname.includes('dropped') ||
    window.location.pathname.includes('plan_to_watch') ||
    window.location.pathname.includes('not_interested')
) {
    /* ---------------------------- Sort & View icons --------------------------- */

    let viewMode = 'List'; // Default View
    const viewModes = ['List', 'Thumbnail', 'Poster']; // View Modes

    const $viewModeBtn = $('<button>').addClass('btn btn-secondary view-mode-btn mx-1').append($('<i>').addClass(getViewModeIcon(viewMode)).attr('title', 'Change View'));

    $viewModeBtn.click(function () {
        const currentViewIndex = viewModes.indexOf(viewMode);
        viewMode = viewModes[(currentViewIndex + 1) % viewModes.length];
        $viewModeBtn.find('i').removeClass().addClass(getViewModeIcon(viewMode)); // Update the icon based on the new view mode
    });

    // Define the sort dropdown
    const $sortDropdown = $('<div>').addClass('btn-group mx-1');
    const $sortButton = $('<button>').addClass('btn btn-secondary dropdown-toggle').attr('type', 'button').attr('id', 'sort-dropdown').attr('data-toggle', 'dropdown').attr('aria-haspopup', 'true').attr('aria-expanded', 'false').text('Sort by');
    const $sortMenu = $('<div>').addClass('dropdown-menu').attr('aria-labelledby', 'sort-dropdown');
    const sortOptions = [
        { label: 'Title', class: '.title', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Year', class: '.mdl-style-col-year', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Country', class: '.mdl-style-col-country', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Type', class: '.mdl-style-col-type', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Progress', class: '.mdl-style-col-progress', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] },
        { label: 'Score', class: '.score', icons: ['fas fa-arrow-up', 'fas fa-arrow-down'] }
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

    // Append the buttons and dropdown to a container div and add it to the nav
    $('.mdl-style-nav-desktop ul').append(
        $('<li>').addClass('mio-filters btn-group')
            .css('float', 'right')
            .append($viewModeBtn)
            .append($sortDropdown)
    );

    function getViewModeIcon(viewMode) {
        console.log(logPrefix, logStyle, 'Current view mode:', viewMode);
        switch (viewMode) {
            case 'List':
                return 'fas fa-list';
            case 'Thumbnail':
                return 'fas fa-th';
            case 'Poster':
                return 'fas fa-images';
            default:
                return '';
        }
    }

    /* ---------------------------- Layout Views --------------------------- */

    const $container = $('<div>').addClass('poster-view');
    $('table.mdl-style-table').each(function () {
        let $originalTable = $(this);
        const originalTableId = $originalTable.attr('id');
        const $originalHtml = $originalTable.prop('outerHTML');
        const $originalRows = $originalTable.find('tbody tr').clone();

        const views = ['List', 'Thumbnail', 'Poster'];
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
            if (currentView === 'List') {
                $viewModeBtn.find('i').removeClass('fa-th').addClass('fa-th-list');
                $container.hide();
                $originalTable.replaceWith($originalHtml);
                $originalTable = $(`#${originalTableId}`);
                $originalTable.show();
            } else if (currentView === 'Thumbnail') {
                $originalTable.addClass('thumbnail-view');
                $originalTable.removeClass('list-view');
                $viewModeBtn.find('i').removeClass('fa-th-list').addClass('fa-th');

                // Reapply the "Poster" column to the table if it doesn't exist
                if ($originalTable.find('th:nth-child(2)').text() !== 'Poster') {
                    if (typeof Storage !== 'undefined') {
                        // Get the cached poster URLs from local storage
                        const cachedPosters =
                            JSON.parse(localStorage.getItem('betterMDLPosters')) || {};

                        // Add posters to the table
                        $originalTable.find('thead th:nth-child(1)').after(
                            '<th class="mdl-style-thead-poster text-center hidden-sm-down" width="80">Poster</th>'
                        );

                        $originalTable.find('tbody tr').each(function (index) {
                            const $tr = $(this);
                            const $titleCell = $tr.find('td:nth-child(2)');
                            const $link = $titleCell.find('a');
                            const movieUrl = $link.attr('href');

                            if (movieUrl) {
                                // Check if the poster URL is cached
                                if (cachedPosters[movieUrl]) {
                                    $titleCell.before(
                                        `<td class="film-cover"><img src="${cachedPosters[movieUrl]}" style="max-width: 70px;"></td>`
                                    );
                                } else {
                                    // Fetch the poster URL and cache it
                                    setTimeout(() => {
                                        $.get(movieUrl, function (data) {
                                            const $poster = $(data).find('.film-cover img');
                                            const posterUrl = $poster.attr('src');

                                            cachedPosters[movieUrl] = posterUrl;
                                            localStorage.setItem(
                                                'betterMDLPosters',
                                                JSON.stringify(cachedPosters)
                                            );

                                            $titleCell.before(
                                                `<td class="film-cover"><img src="${posterUrl}" style="max-width: 80px;"></td>`
                                            );
                                        }).fail(function () {
                                            // Image failed to load, try again
                                            setTimeout(() => {
                                                $.get(movieUrl)
                                                    .done(function (data) {
                                                        const $poster = $(data).find('.film-cover img');
                                                        const posterUrl = $poster.attr('src');

                                                        cachedPosters[movieUrl] = posterUrl;
                                                        localStorage.setItem(
                                                            'betterMDLPosters',
                                                            JSON.stringify(cachedPosters)
                                                        );

                                                        $titleCell.before(
                                                            `<td class="film-cover"><img src="${posterUrl}" style="max-width: 70px;"></td>`
                                                        );
                                                    })
                                                    .fail(function () {
                                                        // Image failed to load again, give up
                                                        $titleCell.before('<td></td>');
                                                    });
                                            }, index * 125); // Delay requests by 125 milliseconds (8 requests per second)
                                        });
                                    }, index * 125); // Delay requests by 125 milliseconds (8 requests per second)
                                }
                            } else {
                                $titleCell.before('<td></td>');
                            }
                        });

                    } else {
                        // Local storage is not available
                        $originalTable.find('th:nth-child(1)').after('<th>Poster</th>');
                        $originalTable.find('tbody tr').each(function () {
                            const $tr = $(this);
                            const $titleCell = $tr.find('td:nth-child(2)');
                            $titleCell.before('<td></td>');
                        });
                    }
                }
            } else if (currentView === 'Poster') {
                $originalTable.hide();
                $container.empty();

                const movieNotes = {};

                $originalTable.find('tbody tr').each(function (index) {
                    const $tr = $(this);
                    const $titleCell = $tr.find('td.mdl-style-col-title');
                    const $link = $titleCell.find('a');
                    const movieUrl = $link.attr('href');
                    const title = $link.find('span').text().trim();
                    const $rating = $tr.find('.rating');
                    const $ratingNum = $tr.find('.score');
                    const imgSrc = $tr.find('.film-cover img').attr('src');
                    const year = $tr.find('.mdl-style-col-year').text();
                    const country = $tr.find('.mdl-style-col-country').text().trim();
                    const type = $tr.find('.mdl-style-col-type').text().trim();
                    const $progress = $tr.find('.mdl-style-col-progress');
                    const $episodeSeen = $progress.find('.episode-seen').clone();
                    const $episodeTotal = $progress.find('.episode-total').clone();
                    const movieId = $tr.attr('id').substr(2);
                    const idNumber = movieId.replace('mdl-', '');
                    const hasAiring = $tr.find('.mdl-style-col-title .airing').length > 0;
                    let episodeProgress = $episodeSeen.text() + '/' + $episodeTotal.text();

                    const $poster = $('<div>')
                        .addClass('col-md-2 mdl-' + movieId)
                        .append(
                            $('<div>')
                                .addClass('card h-100 film-cover text-center')
                                .append(
                                    $('<a>').attr('href', movieUrl).append(
                                        $('<div>')
                                            .addClass('image-container')
                                            .append(
                                                $('<img>')
                                                    .addClass('card-img-top img-fluid')
                                                    .attr('src', imgSrc)
                                                    .attr('alt', 'Movie poster'),
                                                $('<span>')
                                                    .addClass('label label-right label-secondary mdl-style-col-country')
                                                    .text(country),
                                                $('<span>')
                                                    .addClass('label label-left label-primary mdl-style-col-year' + (hasAiring ? ' airing-label' : ''))
                                                    .text(hasAiring ? 'Airing' : year),
                                                $('<span>').addClass('label-rating').html($rating),
                                                $('<span>').addClass('label-ratingNum score').html($ratingNum),
                                                $('<span>').addClass('mdl-style-col-type').html(type),
                                                $('<span>').addClass('title').text(title)
                                            )
                                    ),
                                    $('<div>')
                                        .addClass('card-body')
                                        .append(
                                            $('<p>')
                                                .addClass('card-title mb-0 title')
                                                .html(`<a href="${movieUrl}">${$tr.find('.title').text()}</a>`)
                                        ),
                                    $('<div>')
                                        .addClass('card-footer')
                                        .append(
                                            $('<button>')
                                                .addClass('card-footer-btn btn-manage-list w-100 font-weight-bold')
                                                .attr('data-id', movieId)
                                                .attr('data-stats', 'mylist:' + movieId)
                                                .css({
                                                    background: 'var(--mdl-primary)',
                                                    color: 'var(--mdl-background)',
                                                })
                                                .append(
                                                    $('<span>').append(
                                                        $('<i>').addClass('fas fa-edit'),
                                                        '&nbsp;',
                                                        $('<span>').addClass('mdl-style-col-progress').text(episodeProgress)
                                                    )
                                                )
                                        )
                                )
                        );

                    if (hasAiring) {
                        $poster.find('.mdl-style-col-year').text('Airing').css('background-color', 'var(--mdl-tag-vip)');
                    }

                    $container.append($poster);

                    // Check if notes exist in the cache
                    const cachedNotes = movieNotes[movieId];
                    if (cachedNotes) {
                        const $hoverContent = $('<div>').addClass('mio-notes').text(cachedNotes);
                        $poster.prepend($hoverContent);
                    }

                    // Fetch movie notes if not in cache
                    $poster.on({
                        mouseenter: function () {
                            const $currentPoster = $(this);
                            clearTimeout($currentPoster.data('timeout'));

                            if (!$currentPoster.data('notesFetched')) {
                                // Assign the AJAX request to the jQuery data
                                $currentPoster.data('ajaxRequest', $.ajax({
                                    url: `/v1/users/watchaction/${idNumber}?lang=en-US`,
                                    dataType: 'json',
                                    headers: {
                                        authorization: `Bearer ${token}`,
                                    },
                                    success: function (response) {
                                        const notes = response.data.note;
                                        movieNotes[movieId] = notes; // Save the notes in the cache

                                        // Display the notes in a div
                                        const $notesDisplay = $('<div>').addClass('mio-notes').text(notes);
                                        $currentPoster.prepend($notesDisplay);
                                        $currentPoster.data('notesFetched', true);

                                        const $editIcon = $('<i>').addClass('fas fa-pen mio-edit-icon').appendTo($notesDisplay);

                                        // Attach a click event to the edit icon
                                        $editIcon.on('click', function () {
                                            // Change the div into a textarea
                                            const $textarea = $('<textarea>').addClass('mio-notes').val(notes);
                                            $notesDisplay.replaceWith($textarea);
                                            $textarea.focus();

                                            // Attach a keypress event to the textarea
                                            $textarea.on('keypress', function (event) {
                                                if (event.which == 13) { // Enter key
                                                    event.preventDefault();
                                                    const updatedNotes = $(this).val();

                                                    // Make a PATCH request to update the notes
                                                    $.ajax({
                                                        url: `https://mydramalist.com/v1/users/watchaction/${idNumber}?lang=en-US`,
                                                        type: 'PATCH',
                                                        dataType: 'json',
                                                        headers: {
                                                            authorization: `Bearer ${token}`,
                                                        },
                                                        data: { note: updatedNotes },
                                                        success: function () {
                                                            movieNotes[movieId] = updatedNotes;

                                                            const $updatedNotesDisplay = $('<div>').addClass('mio-notes').text(updatedNotes);
                                                            $textarea.replaceWith($updatedNotesDisplay);

                                                            $updatedNotesDisplay.on({
                                                                mouseenter: function () {
                                                                    $editIcon.show();
                                                                },
                                                                mouseleave: function () {
                                                                    $editIcon.hide();
                                                                }
                                                            });
                                                        },
                                                        error: function (jqXHR, textStatus, errorThrown) {
                                                            console.error(`Request failed: ${textStatus} - ${errorThrown}`);
                                                        },
                                                    });
                                                }
                                            });
                                        });

                                        // Show the edit icon on hover over the notes
                                        $notesDisplay.on({
                                            mouseenter: function () {
                                                $editIcon.show();
                                            },
                                            mouseleave: function () {
                                                $editIcon.hide();
                                            }
                                        });
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        if (textStatus === 'abort') {
                                            // The AJAX request was aborted, so do nothing
                                            return;
                                        }
                                        console.error(`Request failed: ${textStatus} - ${errorThrown}`);
                                    },
                                }));
                            } else {
                                $currentPoster.find('.mio-notes').show();
                            }
                        },
                        mouseleave: function () {
                            const $currentPoster = $(this);
                            // Get the AJAX request from the jQuery data and abort it if it exists and is not yet complete
                            let ajaxRequest = $currentPoster.data('ajaxRequest');
                            if (ajaxRequest && ajaxRequest.readyState !== 4) {
                                ajaxRequest.abort();
                            }
                            $currentPoster.data('timeout', setTimeout(function () {
                                $currentPoster.find('.mio-notes').remove();
                                $currentPoster.removeData('notesFetched');
                                $currentPoster.removeData('ajaxRequest');
                            }, 200));
                        }
                    });

                });

                $originalTable.hide();
                $container.show();
                $container.append('<div style="clear:both;"></div>');

            }

            // Append the $container after the loop
            $originalTable.after($container);
        });


        /* ---------------------------- Sort by Dropdown ---------------------------- */

        let currentSortOption = 1;

        // Sort the table or poster view based on the current sort option
        function sortView(ascending) {
            const $sortIcon = $orderButton.find('.sort-icon');
            const option = sortOptions[currentSortOption];
            let $rows;
            if (viewMode === 'Poster') {
                console.log(logPrefix, logStyle, 'Sorting posters');
                const $posterView = $('.poster-view');
                const $posterCardsContainer = $posterView.find('.col-md-2');
                $posterCardsContainer.sort(function (a, b) {
                    const aValue = $(a).find(option.class).text().trim();
                    const bValue = $(b).find(option.class).text().trim();
                    // Compare the values
                    if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
                        return ascending ? aValue - bValue : bValue - aValue;
                    }
                    return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                });

                $posterCardsContainer.detach().appendTo($posterView);
            } else {
                $rows = $originalTable.find('tbody tr');
                $rows.sort(function (a, b) {
                    const aValue = $(a).find(option.class).text().trim();
                    const bValue = $(b).find(option.class).text().trim();
                    // Compare the values
                    if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
                        return ascending ? aValue - bValue : bValue - aValue;
                    }
                    return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                });
                $originalTable.find('tbody').empty().append($rows);
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





        /* --------------------------- End of Tables --------------------------- */
    });
}