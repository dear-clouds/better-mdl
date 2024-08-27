/* -------------------------- Collape the sections -------------------------- */

// Select the container and find the first 2 .box-body elements inside it
const $container = $('.col-lg-8.col-md-8');
const $boxBodies = $container.find('.box-body').slice(0, 2);

// Add a collapse button before each .box-body
$boxBodies.each(function () {
    const $boxBody = $(this);
    const $collapseBtn = $('<button>').addClass('btn btn-link ml-2').html('<i class="fas fa-minus"></i> Hide section');

    // Add an ID to the .box-body so it can be targeted by the collapse button
    const boxBodyId = `box-body-${$boxBody.index()}`;
    $boxBody.attr('id', boxBodyId);

    // Add a data-target to the button to control the collapse
    $collapseBtn.attr('data-target', `#${boxBodyId}`);

    // Insert the button before the .box-body
    $boxBody.before($collapseBtn);

    // Add the 'collapsed' class to each .box-body to make it start collapsed
    $boxBody.addClass('collapse');

    // Add a click event handler to the button to toggle the collapse
    $collapseBtn.on('click', function () {
        toggleCollapse($boxBody, $collapseBtn);
        updateIcon($boxBody, $collapseBtn);
    });
});

// Add a collapse button before the .articles-listing element
const $articlesListing = $('.articles-listing');
const $articlesCollapseBtn = $('<button>').addClass('btn btn-link ml-2').html('<i class="fas fa-plus"></i> Show section');
$articlesListing.before($articlesCollapseBtn);

// Add a data-target to the button to control the collapse
$articlesCollapseBtn.attr('data-target', `#${$articlesListing.attr('id')}`);

// Add the 'collapsed' class to the .articles-listing element to make it start collapsed
$articlesListing.addClass('collapse');

// Add a click event handler to the button to toggle the collapse
$articlesCollapseBtn.on('click', function () {
    toggleCollapse($articlesListing, $articlesCollapseBtn);
    updateIcon($articlesListing, $articlesCollapseBtn);
});

// Open the second box-body
$($boxBodies[0]).collapse('show');
$($boxBodies[0]).prev().find('button').html('<i class="fas fa-minus"></i> Hide section');
$($boxBodies[1]).collapse('show');
$($boxBodies[1]).prev().find('button').html('<i class="fas fa-minus"></i> Hide section');

// Function to toggle the collapse
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
