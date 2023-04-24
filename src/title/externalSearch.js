import { logPrefix, logStyle, errorStyle } from "../index.js";
/* ------------------------ Add external sites icons ------------------------ */

// Get the native title value
const nativeTitleLink = document.querySelector('b.inline + a');
const nativeTitleValue = nativeTitleLink.textContent.trim();
const year = $('.film-title').text().split('(')[1].slice(0, -1);

// Get the h1.film-title a value
const filmTitleLink = document.querySelector('h1.film-title a');
const filmTitleValue = filmTitleLink.textContent.trim();

// TMDB API base URL and API key
const tmdbBaseUrl = 'https://api.themoviedb.org/3';
const apiKey = 'd12b33d3f4fb8736dc06f22560c4f8d4';

// console.log(nativeTitleValue);
// console.log(filmTitleValue);

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

    // console.log(tmdbSearchUrl);

    // Check if we get a result from TMDB for the native title search
    fetch(tmdbSearchUrl)
        .then(response => response.json())
        .then(data => {
            const results = data.results;

            // Filter out titles without genre 16
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
                                            // console.log(data);
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

                                            // Add the ratings and logos to the HTML
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


                            // if (idsData.tvrage_id) {
                            //     createWebsiteIcon('TVRage', `https://www.tvmaze.com/shows/${idsData.tvrage_id}`);
                            // }

                            // Search for the title using the TMDB ID on other websites
                            const tmdbId = filteredResults[0].id;
                            searchLetterboxd(tmdbId, mediaType);
                            searchTrakt(tmdbId);
                            searchSimkl(tmdbId, mediaType);

                            // Function to search for the title on Simkl
                            function searchSimkl(tmdbId, mediaType) {
                                const type = mediaType === 'movie' ? 'movies' : 'tv';
                                const simklSearchUrl = `https://simkl.com/search/?type=${type}&q=${tmdbId}`;
                                // console.log(simklSearchUrl);

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
                                // console.log(traktSearchUrl);

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
                                // console.log(letterboxdSearchUrl);
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

                            // Append the websiteIconsContainer to the page
                            shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
                        });
                }
            }
            // If we don't get a result from TMDB for the native title search, create a simple search link using filmTitleValue
            createWebsiteIcon('TheMovieDB', `https://www.themoviedb.org/search?query=${encodeURIComponent(filmTitleValue)}`);
            shareContainer.insertBefore(websiteIconsContainer, tmdbIcon.nextSibling);
            console.error(logPrefix, errorStyle, "No results found for native title");
        })
        .catch(error => console.error(error));
}
searchJFDB(nativeTitleValue);
searchDramaOtaku(nativeTitleValue);
searchAsianWiki(nativeTitleValue);
searchPlex(filmTitleValue);

function searchDramaOtaku(nativeTitleValue) {
    const DramaOtakuSearchUrl = `https://drama-otaku.com/?s=${encodeURIComponent(nativeTitleValue)}`;
    // console.log(DramaOtakuSearchUrl);
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
    // console.log(JFDBSearchUrl);
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
    // console.log(AsianWikiSearchUrl);
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
function searchPlex(nativeTitleValue) {
    const PlexSearchUrl = `https://app.plex.tv/desktop/#!/search?query=${encodeURIComponent(filmTitleValue)}`;
    // console.log(PlexSearchUrl);
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

// Create the parent element
const tmdbIcon = document.createElement('a');
tmdbIcon.innerHTML = '';
const shareContainer = document.querySelector('div.m-b-sm');
shareContainer.insertBefore(tmdbIcon, shareContainer.firstChild);

// Create a new div to hold all the website icons
const websiteIconsContainer = document.createElement('div');
websiteIconsContainer.style.display = 'block';
websiteIconsContainer.style.margin = '8px';
websiteIconsContainer.classList.add('text-center');

// Function to create an icon for a website with a link and append it to the websiteIconsContainer
function createWebsiteIcon(websiteName, link) {
    const icon = document.createElement('a');
    icon.target = '_blank';
    icon.rel = 'noopener noreferrer';
    icon.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${link}&sz=64" height="40px" alt="${websiteName}" style="vertical-align: middle; margin-left: 5px; border-radius: 50px;">`;
    icon.href = link;
    websiteIconsContainer.appendChild(icon);
}

