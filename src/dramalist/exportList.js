import { username } from "../index.js";

function downloadCSV(csv, filename) {
    var csvFile = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

const tableIds = {
    Watching: 'list_1',
    Completed: 'list_2',
    Planned: 'list_3',
    'On-Hold': 'list_4',
    Dropped: 'list_5',
    'Not Interested': 'list_6'
};

function extractData() {
    let data = [];
    document.querySelectorAll('tbody[id^="content_"] tr').forEach(item => {
        // Check if table is empty
        if (item.querySelector('.mdl-style-col-empty')) {
            return;
        }

        let id = item.id.replace('ml', '');
        let titleElement = item.querySelector('.title');
        let title = titleElement ? titleElement.querySelector('span').textContent.trim() : '';
        let url = titleElement ? titleElement.href : '';
        let country = item.querySelector('.mdl-style-col-country').textContent.trim();
        let year = item.querySelector('.mdl-style-col-year').textContent.trim();
        let type = item.querySelector('.mdl-style-col-type').textContent.trim();
        let scoreElement = item.querySelector('.score');
        let score = scoreElement ? scoreElement.textContent.trim() : '';
        let progressElement = item.querySelector('.episode-seen');
        let progressTotalElement = item.querySelector('.episode-total');
        let progress = '';
        if (progressElement && progressTotalElement) {
            progress = progressElement.textContent.trim() + '/' + progressTotalElement.textContent.trim();
        }
        let status = '';
        for (let key in tableIds) {
            if (item.closest(`#${tableIds[key]}`)) {
                status = key;
                break;
            }
        }
        data.push([id, status, title, country, year, type, score, progress, url]);
    });
    return data;
}

function generateCSV(data) {
    let csv = 'ID;Status;Title;Country;Year;Type;Score;Progress;URL\r';
    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        let progress = "'" + row[7]; // add single quote before progress value so Excel doesn't think it's a date
        row[7] = progress;
        csv += row.join(';') + '\r';
    }
    return csv;
}

function addExportButton() {
    const currentUrl = window.location.href;
  
    if (currentUrl.startsWith(`https://mydramalist.com/dramalist/${username}`)) {
      let exportBtn = document.createElement("button");
      exportBtn.innerText = "Export CSV";
      exportBtn.style.cssText =
        "position: fixed; bottom: 10px; right: 10px; z-index: 9999; padding: 5px 10px; background: var(--mdl-primary); var(--mdl-text); border: none; border-radius: 5px; cursor: pointer;";
      exportBtn.onclick = () => {
        let data = extractData();
        let csv = generateCSV(data);
        downloadCSV(csv, "MyDramaList.csv");
      };
      document.body.appendChild(exportBtn);
    }
  }

setTimeout(() => {
    addExportButton();
}, 2000);
