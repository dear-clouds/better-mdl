const nativeTitleLink = document.querySelector('b.inline + a');
const nativeTitleValue = nativeTitleLink.textContent.trim();
const filmTitleLink = document.querySelector('h1.film-title a');
const filmTitleValue = filmTitleLink.textContent.trim();

const adaptedFromMangaTag = document.querySelector('a[href*="th=127&"]');
const adaptedFromWebtoonTag = document.querySelector('a[href*="th=122&"]');
const adaptedFromManhwaTag = document.querySelector('a[href*="th=752&"]');
const adaptedFromManhuaTag = document.querySelector('a[href*="th=935&"]');
const adaptedFromAnimeTag = document.querySelector('a[href*="th=2853&"]');
const adaptedFromVideoGameTag = document.querySelector('a[href*="th=88&"]');

if (adaptedFromMangaTag || adaptedFromWebtoonTag || adaptedFromManhuaTag || adaptedFromManhwaTag) {
    const anilistResultDiv = document.createElement('div');
    anilistResultDiv.classList.add('box', 'clear', 'hidden-sm-down', 'mio-manga-box');

    const header = document.createElement('div');
    header.classList.add('box-header', 'primary');
    header.innerHTML = '<h3>Check out the original work</h3>';
    anilistResultDiv.appendChild(header);

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
            Media(search: $search, type: MANGA, isAdult: false) {
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
        search: nativeTitleValue,
    };
    console.log('variables:', variables);
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
    console.log('AniList API request:', apiUrl, requestOptions);
    fetch(apiUrl, requestOptions)
        .then(response => response.json())
        .then(data => {
            const media = data.data.Media;
            if (!media && filmTitleValue) {
                // If no results found with nativeTitleValue, search again with filmTitleValue
                variables.search = filmTitleValue;
                const requestOptions2 = {
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
                return fetch(apiUrl, requestOptions2).then(response => response.json());
            }
            return data;
        })
        .then(data => {
            console.log('AniList API response:', data);
            const media = data.data.Media;

            // Remove the loading message
            loadingMessage.remove();

            if (media) {
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('card', 'my-3');

                const contentRow = document.createElement('div');
                contentRow.classList.add('row', 'no-gutters');

                const posterCol = document.createElement('div');
                posterCol.classList.add('col-md-4');

                const cardImg = document.createElement('img');
                cardImg.classList.add('card-img');
                cardImg.style.width = '100%';
                cardImg.src = media.coverImage.large;

                posterCol.appendChild(cardImg);

                const contentCol = document.createElement('div');
                contentCol.classList.add('col-md-8');

                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardBody.style = "padding: 8px 2px 5px 0px";

                const cardTitle = document.createElement('h6');
                cardTitle.classList.add('card-title');
                cardTitle.innerText = media.title.romaji;

                const cardYear = document.createElement('div');
                cardYear.classList.add('label', 'label-secondary');
                cardYear.innerText = `${media.startDate.year}`;
                cardYear.style = "margin-right: 8px;";

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

                const cardVolumes = document.createElement('div');
                cardVolumes.classList.add('label', 'label-secondary');
                cardVolumes.style = "font-weight: lighter; color: var(--mdl-text) !important;";
                cardVolumes.innerText = `${media.volumes} volumes - ${media.chapters} chapters`;

                const cardDesc = document.createElement('p');
                cardDesc.classList.add('card-text', 'small');
                cardDesc.innerText = media.description.substring(0, 200) + '...';

                cardBody.appendChild(cardTitle);
                cardBody.appendChild(cardYear);
                cardBody.appendChild(cardRating);
                cardBody.appendChild(cardVolumes);
                cardBody.appendChild(cardDesc);

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