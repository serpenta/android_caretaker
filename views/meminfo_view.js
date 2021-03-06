const { ipcRenderer } = require('electron');

ipcRenderer.on('results-display-init', (e) => {
    document.getElementById('results-status').innerHTML = 'NOT Running';
});

ipcRenderer.on('results-status-on', (e) => {
    document.getElementById('results-status').innerHTML = 'RUNNING';
});

ipcRenderer.on('results-status-off', (e) => {
    document.getElementById('results-status').innerHTML = 'NOT Running';
});

ipcRenderer.on('print-results', (e, currentVal, maxVal, tenSecAvg, tenSecMin) => {
    document.getElementById('results-value_current').innerHTML = currentVal+' KB';
    document.getElementById('results-value_minimum').innerHTML = tenSecMin+' MB';
    document.getElementById('results-value_average').innerHTML = tenSecAvg+' MB';
    document.getElementById('results-value_max').innerHTML = maxVal+' MB';
});

document
    .getElementById('send-trim-memory')
    .addEventListener('change', () => {
        ipcRenderer.send('progstat-change-send-trim-memory')
    });

document
    .getElementById('pss-uss_controls')
    .addEventListener('change', () => {
        ipcRenderer.send('progstat-change-measure-pss')
    });
    
document
    .getElementById('run-measurement')
    .addEventListener('click', () => 
        ipcRenderer.send('btn-run-measurement'));

document
    .getElementById('reset-max')
    .addEventListener('click', () => ipcRenderer.send('btn-reset-max'));

document
    .getElementById('reset-avg')
    .addEventListener('click', () => ipcRenderer.send('btn-reset-avg'));
    
document
    .getElementById('stop-measurement')
    .addEventListener('click', () => ipcRenderer.send('btn-stop-measurement'));