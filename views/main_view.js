const { ipcRenderer } = require('electron');
const utils = require('../common/utilities');
const { ProgramState } = require('../classes/State');

/** on click */

document.getElementById('btn_scan-dir-packages')
    .addEventListener('click', () => {
        ipcRenderer.send('scan-dir-packages',
            utils.getAbsFilepath('packages-abs-path'));
    });

document.getElementById('btn_open-dir-packages')
    .addEventListener('click', () => {
        if (document.getElementById('packages-abs-path').value) {
            ipcRenderer.send('open-folder',
                utils.getInput('packages-abs-path'));
        }
    });

document.getElementById('btn_install-app')
    .addEventListener('click', () => {
        ipcRenderer.send('install-app',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'),
            utils.getAbsFilepath('packages-abs-path'),
            utils.getInput('apk-filename'),
            utils.getInput('obb-filename'));
    });

document.getElementById('btn_scan-conn-devices')
    .addEventListener('click', () => {
        ipcRenderer.send('scan-conn-devices');
    });

document.getElementById('btn_print-package-version')
    .addEventListener('click', () => {
        ipcRenderer.send('print-package-version',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'));
    });

document.getElementById('btn_open-dir-logs')
    .addEventListener('click', () => {
        if (document.getElementById('logs-target-path').value) {
            ipcRenderer.send('open-folder',
                utils.getInput('logs-target-path'));
        }
    })

document.getElementById('btn_save-logs')
    .addEventListener('click', () => {
        ipcRenderer.send('save-app-logs',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'),
            utils.getAbsFilepath('logs-target-path'),
            utils.getInput('logs-target-name'),
            utils.getCheckbox('logs-pid-filter'));
    });

document.getElementById('btn_open-logcat')
    .addEventListener('click', () => {
        ipcRenderer.send('open-logcat',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'),
            utils.getCheckbox('logs-pid-filter'));
    });

document.getElementById('btn_clear-logs')
    .addEventListener('click', () => {
        ipcRenderer.send('clear-app-logs',
            utils.getInput('device-id-select'));
    });

document.getElementById('btn_open-meminfo')
    .addEventListener('click', () => {
        ipcRenderer.send('open-meminfo');
    });

/** on change */

document.getElementById('device-id-select')
    .addEventListener('change', () => {
        Array.from(document.getElementsByClassName('feature-control_group_property-name'))
            .forEach(element => {
                if (element.value.length > 0)
                {
                    ipcRenderer.send('property-name-change',
                    utils.getInput('device-id-select'),
                    element.value,
                    element.id);
                }
            });
        ipcRenderer.send('change-active-device',
            utils.getInput('device-id-select'));
    });

document.getElementById('package-name')
    .addEventListener('change', () => {
        ipcRenderer.send('change-packagename',
            utils.getInput('device-id-select'),
            utils.getInput('package-name'));
    });

document.getElementById('logs-target-path')
    .addEventListener('change', () => {
        ipcRenderer.send('change-logs-target-path',
            utils.getInput('logs-target-path'));
    });

document.getElementById('logs-target-name')
    .addEventListener('change', () => {
        ipcRenderer.send('change-logs-target-name',
            utils.getInput('logs-target-name'));
    });

document.getElementById('packages-abs-path')
    .addEventListener('change', () => {
        ipcRenderer.send('change-packages-abs-path',
            utils.getInput('packages-abs-path'));
    });

Array.from(document.getElementsByClassName('feature-control_group_property-name'))
    .forEach(element => {
        element.addEventListener('change', (event) => {
            ipcRenderer.send('property-name-change',
                utils.getInput('device-id-select'),
                event.target.value,
                event.target.id)});
        element.addEventListener('click', (event) => {
            if (event.target.value.length > 0)
            {
                ipcRenderer.send('property-name-change',
                    utils.getInput('device-id-select'),
                    event.target.value,
                    event.target.id);
            }
        });
    });

Array.from(document.getElementsByClassName('feature-control_group_property-value'))
    .forEach(element => element.addEventListener('change', (event) => {
        const propNameFieldId = ProgramState.getPropNameFieldByValue(event.target.id);
        ipcRenderer.send('property-value-change',
            utils.getInput('device-id-select'),
            event.target.value,
            utils.getInput(propNameFieldId))
    }));

/** ipcMain channel handlers */

ipcRenderer.on('restore-fields-contents', (e, fieldsContents) => {
    Object.keys(fieldsContents).forEach(key => {
        document.getElementById(key).value = fieldsContents[key];
    });
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
    ipcRenderer.send('progstat-change-active-device',
        utils.getInput('device-id-select'));
});

ipcRenderer.on('print-package-version', (e, versionName, versionCode) => {
    document.getElementById('package-version-code_display').value = versionCode.slice(versionCode.indexOf("=")+1);
    document.getElementById('package-version-name_display').value = versionName.slice(versionName.indexOf("=")+1);
});

ipcRenderer.on('display-prop-value', (e, propValue, fieldId) => {
    document.getElementById(fieldId).value = propValue;
});

ipcRenderer.on('app-log-print', (e, line) => {
    const textarea = document.getElementById('app-log')
    textarea.insertAdjacentHTML('beforeend', line+'&#10;');
    textarea.scrollTop = textarea.scrollHeight;
});
