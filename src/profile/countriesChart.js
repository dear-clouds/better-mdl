import { colours } from '../index.js';

/* ---------------------- Force rows to be same height ---------------------- */
if (localStorage.getItem('betterMDLhidedefaultStats') === 'true') {

    window.addEventListener('load', function () {
        var leftColumn = document.querySelector('.stats-section .col-sm-6:first-child');
        var rightColumn = document.querySelector('.stats-section .col-sm-6:last-child');
        var maxHeight = Math.max(leftColumn.offsetHeight, rightColumn.offsetHeight);
        leftColumn.style.height = maxHeight + 'px';
        rightColumn.style.height = maxHeight + 'px';
    });
}
/* ---------------------------- Titles by Country --------------------------- */
// Find the username from the profile page URL
const ProfileUsername = window.location.pathname.split('/').pop();
// console.log('Username:', ProfileUsername);

// Load the D3.js library from a CDN
const d3Script = document.createElement('script');
d3Script.type = 'text/javascript';
d3Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.3/d3.min.js';
d3Script.onload = function () {
    const countryCounts = {};
    // Make an AJAX request to the user's dramalist page
    $.ajax({
        url: `https://mydramalist.com/dramalist/${ProfileUsername}`,
        type: 'GET',
        success: function (data) {
            // Extract the country names and counts from the HTML content
            $(data).find('td.mdl-style-col-country').each(function () {
                const tableId = $(this).closest('.table-responsive').attr('id');
                // Exclude Plan To Watch & Not Interested
                if (tableId !== 'mylist_3' && tableId !== 'mylist_6') {
                    const countryName = $(this).text().trim();
                    if (countryCounts[countryName]) {
                        countryCounts[countryName]++;
                    } else {
                        countryCounts[countryName] = 1;
                    }
                }
            });

            // console.log('Country counts:', countryCounts);

            const statsContainer = $('<div class="bettermdl-stats"></div>');
            $('div#chart-legend').before(statsContainer);

            const pieChartContainer = $('<div class="chart-container"></div>');
            statsContainer.append(pieChartContainer);

            const pieChart = d3.select(pieChartContainer.get(0))
                .append('svg')
                .attr('width', 300)
                .attr('height', 300)
                .append('g')
                .attr('transform', 'translate(150,150)');

            colours[7] = 'var(--mdl-primary)';
            const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };

            const shuffledColours = shuffleArray(Object.values(colours));
            const colorScale = d3.scaleOrdinal()
                .range(shuffledColours);


            const pie = d3.pie()
                .value(d => d.count);

            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(150);

            const arcs = pieChart.selectAll('arc')
                .data(pie(Object.entries(countryCounts).map(([countryName, count]) => ({ country: countryName, count }))))
                .enter()
                .append('g')
                .attr('class', 'arc');

            arcs.append('path')
                .attr('d', arc)
                .attr('fill', d => colorScale(d.data.country));

            const legendContainer = d3.select('.bettermdl-stats')
                .insert('div', ':first-child')
                .classed('legend-container', true);

            const legend = legendContainer.append('span')
                .classed('legend', true);

            const totalTitles = Object.values(countryCounts).reduce((total, count) => total + count, 0);

            const sortedCountries = Object.entries(countryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([countryCode, count]) => ({ country: countryCode, count }));

            legend.selectAll('div')
                .data(pie(sortedCountries))
                .enter()
                .append('div')
                .style('display', 'flex')
                .style('justify-content', 'space-between')
                .html(d => `<span style="color:${colorScale(d.data.country)}">${d.data.country}</span><span><strong>${d.data.count}</strong> (<i>${(d.data.count / totalTitles * 100).toFixed(1)}%</i>)</span>`);

            // Add a title to the chart
            d3.select('.bettermdl-stats')
                .insert('h6', ':first-child')
                .html('Titles by Country')
                .style('text-align', 'center')
                .style('margin-top', '8px');

        }
    });
};
document.head.appendChild(d3Script);