<p align="center"><img src="https://raw.githubusercontent.com/dear-clouds/better-mdl/main/images/Logo.png" width="300px"></p>
<h3 align="center">Enhance your <a href="https://mydramalist.com/" target="_blank">MyDramaList</a> experience~</h3>

<p align="center">
<a href="https://github.com/dear-clouds/better-mdl/stargazers"><img src="https://img.shields.io/github/stars/dear-clouds/better-mdl?colorA=846D62&colorB=a8a29c&style=for-the-badge"></a>
	<a href="https://github.com/dear-clouds/better-mdl/raw/main/better-mdl.user.js"><img src="https://img.shields.io/github/package-json/v/dear-clouds/better-mdl?colorA=846D62&colorB=a8a29c&style=for-the-badge"></a>
    <a href="https://github.com/dear-clouds/better-mdl/issues"><img src="https://img.shields.io/github/license/dear-clouds/better-mdl?colorA=846D62&colorB=a8a29c&style=for-the-badge"></a>
</p>

Better MDL is a project i'm working on to enhance the website. I've been using MDL since the very beginning and it hasn't improved that much over the years. So here I am, trying to make the website more friendly and modern!

If you have suggestions, feel free to post them on [this post](https://mydramalist.com/discussions/general-discussion/88611-gathering-feedbacks), just keep in mind that there's a limitation to what I can do on with a userscript.

_The themes I use in my screenshots is [Catppuccin](https://github.com/dear-clouds/mydramalist) and must be installed separately._

## Installation

1. Install <a href="https://www.tampermonkey.net/" target="_blank">Tampermonkey</a> for your browser (or your preferred Userscripts Manager)

2. Install my userscript by clicking [here](https://github.com/dear-clouds/better-mdl/raw/main/better-mdl.user.js) and click "Install". This may take some time to load.

3. Go to <a href="https://mydramalist.com/account/profile" target="_blank">MyDramaList settings page</a> to customize the script, just like you would to edit your profile (_You need to scroll down to the end of the page to see the `Better MDL Settings` section_)

4. Try it out and let me know what you think!

### How to use / customize (MAKE SURE TO READ)

- For other website icons not in the settings, the first time you go on a title page, you will get asked if you want to allow a website on a screen <a href="https://imgur.com/E1eWJJW" target="_blank">like this</a>. Simply allow or forbid the websites you want. <details>
  <summary>List of currently supported websites</summary>
  
  * https://simkl.com
  * https://trakt.tv
  * https://letterboxd.com
  * https://drama-otaku.com
  * https://jfdb.jp
  * https://asianwiki.com
  * https://app.plex.tv

  #### Feel free to request more websites!
</details>

- The first time you're using the Thumbnail View on a page (people or dramalist), it might take a little while to load all the posters, especially if there's a lot of titles or if you have slow internet, just be patient.

- It might take a little while to show all your Friend ratings, especially if you have many friends or if you have slow internet, just be patient. Also to favorite/unfavorite a friend, just click the heart. It will reflect the change on refresh.

- For the pie chart "Titles by Country", the colors are the ones you defined in your settings for the status icons. Also stats don't include Planned & Not Interested.

- To show your favorite titles on your profile for other BetterMDL users to see, you MUST create a Public List named "[Better MDL: Favorites](https://mydramalist.com/list/1zEzQND4)". It must be this exact title for it to work.

- To see all the lists you bookmarked, just go to your custom lists and you will see a new button "Saved Lists".

- To export your dramalist in .csv, go to your dramalist and a new button will appear at the bottom right of the page.

- Dramalist' Poster View is not available on tab "All Dramas & Films" for performance reasons. It will already take a lot of time the first time if you have a lot of titles in a category! You can check in your settings the option to automatically change the default list link on profile to the "Currently Watching" tab. Directly edit your notes by clicking the pen icon and save with ENTER.

- Filters for Search currently only works with the sidebar on the right. They work the same way as the Genre filters. (*Originally written by [Thenia](https://mydramalist.com/profile/Thenia)*)

- To import/view your comments on a drama/movie, list or people, simply go to your tab "Stats" and click the new button "My Comments"

### Known Bugs

- [**WON'T FIX**] Some titles don't have the right result for external searches. Currently there's nothing I can do as MDL don't refer to those external ids anywhere and scraping can only be that accurate. _But what you can do is reporting it to me and providing me the right urls for each website_. I plan to make a mapping file at some point if you have many titles with this issue.

## Features Available

#### Everywhere
- Back to Top button
- Hide comments with defined terms
- Option to hide the default MDL stats on profile
- Autofill Start Date if title is Currently Watching and episode watched is 1

#### Profile
- Titles by Country
- Option to hide share icons on drama & people
- Bookmark lists & see saved lists on profile
- Pin favorite titles on profile via a list (*suggested by [KC Drama LOVER](https://mydramalist.com/profile/KCDramaLOVER)*)
- Import/See your comments made on drama/people/list  (*suggested by [Soju](https://mydramalist.com/profile/PearlMilkChaii)*)
- Change the user's list link to the Currently Watching tab by default

#### Title pages
- Links to IMDB/Trakt etc.
- Ratings from IMDB/Rotten Tomatoes/Metacritic
- Link to Anilist for Adaptations
- Add a heart to your liked people
- Friend ratings & ability to put your favs at the top (_suggested by sailingmars_)
- Average friends score (suggested by Saarthak)

#### People pages
- 3 Layout Views (Original, Thumbnails & Posters)
- Status icons
- Show the total for each status on your list
- Sorting & Ordering options
- Hide completed titles
- Collapse the sections

#### Dramalist
- Export dramalists in .csv (*suggested by spepp*)
- 3 Layout Views (Original, Thumbnails & Posters) 
- Quick notes edit on hover (Poster View only)

#### Search
- List status filters (*suggested by [Ruth](https://mydramalist.com/profile/9306491) and originally written by [Thenia](https://mydramalist.com/profile/Thenia)*)

### Screenshots

<p align="center">
<img src="https://dear-clouds.carrd.co/assets/images/gallery22/ebcc1fb5_original.jpg?v=21bef0a8" width="48%">
<img src="https://dear-clouds.carrd.co/assets/images/gallery22/1863a508_original.jpg" width="48%">
<img src="https://dear-clouds.carrd.co/assets/images/gallery22/0d9c43c7_original.jpg?v=e8880db8" width="48%">
<img src="https://i.imgur.com/3TxCK0i.png" width="48%"> 
<img src="https://i.imgur.com/YbSvrTI.png" width="48%"> 
<img src="https://i.imgur.com/VCeEe88.png" width="48%">
</p>

## To-do & Suggestions

| Task                                              | Doable?  |     ETA     |
| :------------------------------------------------ | :------: | :---------: |
| Click on a status total to only show those titles |    ✔️    |     N/A     |
| Add the top 3 genres on Poster View               |    ✔️    |     N/A     |
| Hide cancelled titles                             |    ✔️    |     N/A     |
| More stats & achievements                         |    ✔️    |     N/A     |

_This list might no be up-to-date so please check the official <a href="https://mydramalist.com/discussions/general-discussion/88611-gathering-feedbacks?r=notif&_nid=134641861&page=1" target="__blank">MDL Thread</a>._

## Credits

- My script was originally inspired by <a href="https://greasyfork.org/en/scripts/414922-mydramalist-com-item-highlighter" target="_blank">Item Highlighter</a> by **luckz**
- Switched to <a href="https://github.com/momocow/webpack-userscript/" target="_blank">Webpack Userscript</a> starting v1.1.0 as my script was becoming too long
