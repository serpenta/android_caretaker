const { ipcRenderer } = require('electron');

const utils = require('../common/utilities');

document
    .getElementById('install-app')
    .addEventListener('click', () => {
        console.log('ipcRenderer: install-app');
        ipcRenderer.send('btn-install-app',
            utils.getInput('device-id'),
            utils.getInput('file-abs-path'),
            utils.getInput('apk-filename'),
            utils.getInput('obb-filename'));
    });
