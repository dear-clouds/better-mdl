import { token } from "../index.js";
import { colours } from '../index.js';
import { icons } from '../index.js';

/* ---------------------- Add the counters on the side ---------------------- */

const movieCount = {
  1: 0, // currently watching
  2: 0, // completed
  3: 0, // plan to watch
  4: 0, // on hold
  5: 0, // dropped
  6: 0, // not interested
};

const movieIds = [];

$('table.film-list tbody tr').each(function (index) {
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
    if (json.mylist.length > 0) {
      json.mylist.forEach(function (movie) {
        movieCount[movie.status]++;
      });
  
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
            <i class="${icons[6]}" style="color: ${colours[6]};" title="Not Interested"></i><br>
            <span>${movieCount[6]}</span>
          </div>
        </div>
      `;
  
      $('.movie-counts').remove();
      $('.share-container').after(countsHtml);
    }
  });