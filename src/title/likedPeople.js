import { token, logPrefix, logStyle, errorStyle } from "../index.js";

function getActorIdFromUrl(url) {
    const regex = /\/people\/(\d+)-/;
    const match = url.match(regex);
    return match ? parseInt(match[1]) : null;
}

async function getActorLikeStatus(actorId) {
    return new Promise((resolve, reject) => {
        const url = `https://mydramalist.com/v1/users/data?token=${token}&lang=en-US&people=${actorId}`;

        $.getJSON(url, function(result) {
            console.log(logPrefix, logStyle, `Actor ID: ${actorId}, Result:`, result);
            if (result.people && Array.isArray(result.people) && result.people.length > 0 && result.people[0].liked !== undefined) {
                resolve(result.people[0].liked);
            } else {
                console.error(logPrefix, errorStyle, `Invalid response format for actor ID: ${actorId}`);
                reject('Invalid response format');
            }
        }).fail(function(jqxhr, textStatus, error) {
            console.error(logPrefix, errorStyle, `Error getting actor like status for ID: ${actorId} - ${textStatus} - ${error}`);
            reject(error);
        });
    });
}

async function addHeartToLikedActors(actorId, actorElement) {
    try {
        const liked = await getActorLikeStatus(actorId);

        if (liked) {
            const heartIcon = '<p><i class="fas fa-heart" style="color: var(--mdl-red);"></i></p>';
            const nameElement = actorElement.querySelector('.text-primary.text-ellipsis > b[itempropx="name"]');
            const mainRoleElement = actorElement.querySelector('.text-muted');
            if (mainRoleElement) {
                mainRoleElement.insertAdjacentHTML('afterend', heartIcon);
            } else if (nameElement) {
                nameElement.insertAdjacentHTML('afterend', heartIcon);
            } else {
                console.error(logPrefix, errorStyle, `Actor name element not found for ID: ${actorId}`);
            }
        }
    } catch (error) {
        console.error(logPrefix, errorStyle, `Error processing actor ID: ${actorId}`, error);
    }
}

const actorElements = document.querySelectorAll('li.list-item.col-sm-4');

async function processActors() {
    const actorElements = document.querySelectorAll('li.list-item.col-sm-4');

    for (let i = 0; i < actorElements.length; i++) {
        const actorElement = actorElements[i];
        const actorUrl = actorElement.querySelector('a[href*="/people/"]').getAttribute('href');
        const actorId = getActorIdFromUrl(actorUrl);

        if (actorId) {
            console.log(logPrefix, logStyle, `Processing Actor ID: ${actorId}`);
            await addHeartToLikedActors(actorId, actorElement);
        }

        // Introduce a delay of 1 second before processing the next actor
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

processActors();
