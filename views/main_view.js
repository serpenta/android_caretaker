const { ipcRenderer } = require('electron');

const utils = require('../common/utilities');

function getAbsFilepath () {
    const path = utils.getInput('file-abs-path');
    const pathSafe = path.charAt(path.length-1) === '\\' ? path : path+'\\';
    return pathSafe;
}

document
    .getElementById('btn_install-app')
    .addEventListener('click', () => {
        ipcRenderer.send('install-app',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'),
            getAbsFilepath(),
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

ipcRenderer.on('display-conn-devices', (e, devicesToDisplay) => {
    document.getElementById('device-id-select').innerHTML = "";
    devicesToDisplay.forEach(device => {
        document.getElementById('device-id-select').insertAdjacentHTML('beforeend', device);
    });
});

ipcRenderer.on('print-package-version', (e, versionName) => {
    document.getElementById('package-version_display').innerHTML = versionName;
});
