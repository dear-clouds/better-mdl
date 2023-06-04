import { token } from '../index.js';

/* -------------------------------------------------------------------------- */
/*                    Function originally written by Thenia                   */
/*                  (https://mydramalist.com/profile/Thenia)                  */
/* -------------------------------------------------------------------------- */

// Initial statuses for each filter
let showStatuses = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null
};

function showTitle(title, status, hasStatus) {
  let shouldHide = false;

  // When the title has status and the filter for this status is crossed
  if (hasStatus && showStatuses[status] === false) {
    shouldHide = true;
  } 
  // When the title has no status and there is any filter checked
  else if (!hasStatus && Object.values(showStatuses).some(val => val === true)) {
    shouldHide = true;
  } 
  // When the title has status and there is no filter checked for this status and no filter is crossed for this status
  else if (hasStatus && showStatuses[status] !== true && showStatuses[status] !== false) {
    // When there are filters checked for other statuses, hide the title
    if (Object.values(showStatuses).some(val => val === true)) {
      shouldHide = true;
    }
  }

  if (shouldHide) {
    title.closest('.box').style.display = 'none';
  } else {
    title.closest('.box').style.display = 'block';
  }
}

function restoreAllTitles() {
  const titles = document.querySelectorAll('.text-primary.title');
  titles.forEach(title => {
    title.closest('.box').style.display = 'block';
  });
}

// Create the new filter box
const newFilterBox = document.createElement('div');
newFilterBox.className = 'filter-box';

// Create the filter header
const filterHeader = document.createElement('div');
filterHeader.className = 'filter-header';
filterHeader.innerHTML = '🤍 <b>BetterMDL</b>';

// Create the additional information
const additionalInfo = document.createElement('div');
additionalInfo.className = 'text-xs text-muted';
additionalInfo.innerHTML = 'Recheck filters on each page/refresh.';
filterHeader.appendChild(additionalInfo);

// Create the filter body
const filterBody = document.createElement('div');
filterBody.className = 'filter-body row';

// Create a filter for each status
const statuses = {
  1: 'Currently Watching',
  2: 'Completed',
  3: 'Plan to Watch',
  4: 'On Hold',
  5: 'Dropped',
  6: 'Not Interested'
};

// Retrieve title IDs from the page
const titleElements = document.querySelectorAll('.box[id^="mdl-"]');
const titleIds = Array.from(titleElements).map(element => element.id.split('-')[1]);

// Construct the URL for the API call
const baseUrl = 'https://mydramalist.com/v1/users/data';
const params = new URLSearchParams({
  lang: 'en-US',
  mylist: titleIds.join('-')
});
const apiUrl = `${baseUrl}?${params.toString()}`;

for (let status in statuses) {
  // Create the checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `hideStatus${status}Checkbox`;
  checkbox.name = `hideStatus${status}Checkbox`;
  checkbox.value = `hideStatus${status}`;
  checkbox.style.display = 'none';

  const label = document.createElement('label');
  label.className = 'filter-select with-exclude col-xs-6 col-sm-4 col-md-6 col-lg-6';
  label.htmlFor = checkbox.id;

  const checkedIcon = document.createElement('i');
  checkedIcon.className = 'far text-primary include';
  checkedIcon.style.display = 'none';
  checkedIcon.style.marginRight = '5px';
  label.appendChild(checkedIcon);

  const uncheckedIcon = document.createElement('i');
  uncheckedIcon.className = 'far fa-square text-primary';
  uncheckedIcon.style.marginRight = '5px';
  label.appendChild(uncheckedIcon);

  // Additional icon for the 'crossed' state
  const crossedIcon = document.createElement('i');
  crossedIcon.className = 'far text-primary exclude';
  crossedIcon.style.display = 'none';
  crossedIcon.style.marginRight = '5px';
  label.appendChild(crossedIcon);

  const labelText = document.createTextNode(statuses[status]);
  label.appendChild(labelText);

  label.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    // Toggle state logic
    if (showStatuses[status] === null) {
      showStatuses[status] = true;
      checkedIcon.style.display = 'inline';
      uncheckedIcon.style.display = 'none';
      crossedIcon.style.display = 'none';
    } else if (showStatuses[status] === true) {
      showStatuses[status] = false;
      checkedIcon.style.display = 'none';
      uncheckedIcon.style.display = 'none';
      crossedIcon.style.display = 'inline';
    } else {
      showStatuses[status] = null;
      checkedIcon.style.display = 'none';
      uncheckedIcon.style.display = 'inline';
      crossedIcon.style.display = 'none';
    }

    // If no filter is checked or crossed, restore all titles
    if (!Object.values(showStatuses).some(val => val !== null)) {
      restoreAllTitles();
      return;
    }

    // Make a single API call using the constructed URL
    $.getJSON(apiUrl, function (json) {
      // Process the response
      const titles = document.querySelectorAll('.text-primary.title');
      titles.forEach(title => {
        const titleId = title.querySelector('.btn-manage-list').getAttribute('data-id');
        const movie = json.mylist.find(item => item.rid.toString() === titleId);
        const hasStatus = !!movie;
        showTitle(title, movie?.status, hasStatus);
      });
    });
  });

  filterBody.appendChild(label);
  filterBody.appendChild(checkbox);
}

// Add the filter header and filter body to the new filter box
newFilterBox.appendChild(filterHeader);
newFilterBox.appendChild(filterBody);

// Add the new filter box after the 'Type' filter box
const existingFilterBox = document.querySelector('.filter-box');
existingFilterBox.parentNode.insertBefore(newFilterBox, existingFilterBox.nextSibling);

// Add an event listener to the pagination links
const paginationElement = document.querySelector('.pagination');
if (paginationElement) {
  paginationElement.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') { // If clicked target is a link
      setTimeout(() => {
        // Reset statuses
        showStatuses = {
          1: null,
          2: null,
          3: null,
          4: null,
          5: null,
          6: null
        };

        restoreAllTitles();

        // Clear the checkboxes
        for (let status in statuses) {
          document.querySelector(`#hideStatus${status}Checkbox`).checked = false;
        }

        // Re-run script
        const titleElements = document.querySelectorAll('.box[id^="mdl-"]');
        const titleIds = Array.from(titleElements).map(element => element.id.split('-')[1]);
        const params = new URLSearchParams({
          lang: 'en-US',
          mylist: titleIds.join('-')
        });
        const apiUrl = `${baseUrl}?${params.toString()}`;
        $.getJSON(apiUrl, function (json) {
          const titles = document.querySelectorAll('.text-primary.title');
          titles.forEach(title => {
            const titleId = title.querySelector('.btn-manage-list').getAttribute('data-id');
            const movie = json.mylist.find(item => item.rid.toString() === titleId);
            const hasStatus = !!movie;
            showTitle(title, movie?.status, hasStatus);
          });
        });
      }, 1000); // Wait 1s for the content to load
    }
  });
}
