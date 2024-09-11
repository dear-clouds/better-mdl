
import { logPrefix, logStyle } from "../index.js";

const username = window.location.pathname.match(/^\/profile\/([^/]+)/)[1];
const listsUrl = `https://mydramalist.com/profile/${username}/lists`;
fetch(listsUrl)
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const listTitle = "Better MDL: Favorites";
    const listLink = Array.from(doc.querySelectorAll(".col-sm-5.col-lg-6.col-md-6 .title-primary"))
      .find(link => link.textContent === listTitle)
      ?.getAttribute("href");
    // console.log(logPrefix, logStyle, `Found link for list: ${listLink}`);
    if (listLink) {
      fetch(`https://mydramalist.com${listLink}`)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const titles = Array.from(doc.querySelectorAll(".list-group-item")).map(item => ({
            title: item.querySelector(".title a").textContent,
            href: item.querySelector(".title a").getAttribute("href"),
            src: item.querySelector(".film-cover img")?.getAttribute("data-src")
          }));

          // Trigger lazy-loading of images
          // window.scrollTo(0, document.body.scrollHeight);
        
          // Wait for images to load
          window.addEventListener("load", () => {
            const images = Array.from(document.querySelectorAll(".film-cover img[data-src]"));
            images.forEach(img => {
              img.setAttribute("src", img.getAttribute("data-src"));
              img.removeAttribute("data-src");
            });
          });

          const favoritesBox = document.createElement("div");
          favoritesBox.classList.add("box");
          favoritesBox.classList.add("mio-favorites");
          favoritesBox.innerHTML = `
            <div class="box-header"><h3>Favorites</h3></div>
            <div class="box-divider m-a-0"></div>
            <div class="box-body text-center">
              ${titles.map(title => `
                <a href="${title.href}" class="film-cover cover">
                  <img src="${title.src}" alt="${title.title}" class="cover" style="height: 120px;">
                </a>
              `).join("")}
            </div>
          `;
          const customListPreview = document.querySelector(".custom-list-preview");
          customListPreview.parentNode.insertBefore(favoritesBox, customListPreview.nextSibling);
        });
    }
  });
