const { ipcRenderer } = require('electron');

const utils = require('../common/utilities');


document
    .getElementById('btn_scan-dir-packages')
    .addEventListener('click', () => {
        ipcRenderer.send('scan-dir-packages',
            utils.getAbsFilepath('file-abs-path'));
    });

document
    .getElementById('btn_install-app')
    .addEventListener('click', () => {
        ipcRenderer.send('install-app',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'),
            utils.getAbsFilepath('file-abs-path'),
            utils.getInput('apk-filename'),
            utils.getInput('obb-filename'));
    });

document
    .getElementById('btn_scan-conn-devices')
    .addEventListener('click', () => {
        ipcRenderer.send('scan-conn-devices');
    });

document
    .getElementById('btn_print-package-version')
    .addEventListener('click', () => {
        ipcRenderer.send('print-package-version',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'));
    });

ipcRenderer.on('display-packages', (e, apkToDisplay, obbToDisplay) => {
    document.getElementById('apk-filename').innerHTML = "";
    apkToDisplay.forEach(file => {
        document.getElementById('apk-filename').insertAdjacentHTML('beforeend', file);
    });
    document.getElementById('obb-filename').innerHTML = "";
    obbToDisplay.forEach(file => {
        document.getElementById('obb-filename').insertAdjacentHTML('beforeend', file);
    });
});

ipcRenderer.on('display-conn-devices', (e, devicesToDisplay) => {
    document.getElementById('device-id-select').innerHTML = "";
    devicesToDisplay.forEach(device => {
        document.getElementById('device-id-select').insertAdjacentHTML('beforeend', device);
    });
});

ipcRenderer.on('print-package-version', (e, versionName) => {
    document.getElementById('package-version_display').value = versionName.slice(versionName.indexOf("=")+1);
});
