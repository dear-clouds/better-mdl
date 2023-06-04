if (localStorage.getItem('betterMDLdramalistLink') === 'true') {

    function addWatchingToLink() {
        var link = document.querySelector('a.btn[href^="/dramalist/"]');
        if (link) {
            var username = link.getAttribute('href').split('/')[2];
            var newHref = '/dramalist/' + username + '/watching';
            link.setAttribute('href', newHref);
        }
    }

    window.addEventListener('load', addWatchingToLink);

}