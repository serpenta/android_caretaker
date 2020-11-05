const { ipcRenderer } = require('electron');

const utils = require('../common/utilities');

document
    .getElementById('btn_install-app')
    .addEventListener('click', () => {
        console.log('ipcRenderer: install-app');
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
        console.log('ipcRenderer: print-package-version');
        ipcRenderer.send('print-package-version',
            utils.getInput('device-id'),
            utils.getInput('package-name'));
    });
