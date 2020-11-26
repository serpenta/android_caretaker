const { ipcRenderer } = require('electron');

const utils = require('../common/utilities');

document
    .getElementById('btn_install-app')
    .addEventListener('click', () => {
        ipcRenderer.send('install-app',
            utils.getInput('device-id'),
            utils.getInput('package-name'),
            utils.getInput('file-abs-path'),
            utils.getInput('apk-filename'),
            utils.getInput('obb-filename'));
    });

document
    .getElementById('btn_print-package-version')
    .addEventListener('click', () => {
        ipcRenderer.send('print-package-version',
            utils.getInput('device-id'),
            utils.getInput('package-name'));
    });

ipcRenderer.on('print-package-version', (e) => {
    document.getElementById('package-version_display').innerHTML = 'version';
});
