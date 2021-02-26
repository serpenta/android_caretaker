const { app, ipcMain, BrowserWindow } = require('electron');

const settings = require('./common/settings');
const utils = require('./common/utilities');
const cmdController = require('./controllers/cmd_ctrl');
const { ProgramState } = require('./classes/State');

app.on('ready', () => {
    let win = new BrowserWindow
    ({
        width: 900,
        height: 1000,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('./windows/main_window.html');
    win.webContents.on('did-finish-load', async (event) => {
        const detectedDevices = await cmdController.scanDevices(event);
        const devicesToDisplay = ['<option disabled>- Detected Devices -</option>'];
        detectedDevices.forEach(device => {
            devicesToDisplay.push(`<option value="${device}">${device}</option>`);
            ProgramState.pushDeviceID(device);
        });
        event.sender.send('display-conn-devices', devicesToDisplay);
        event.sender.send('app-log-print', '[mainWindow]: App loaded!');
    });
});

app.on('window-all-closed', () => app.quit());

ipcMain.on('scan-dir-packages', async (event, directory) => {
    const apkList = await cmdController.scanDirectory(directory, ".apk");
    const apkToDisplay = ['<option disabled>- Detected APK -</option>'];
    apkList.forEach(file => {
        apkToDisplay.push(`<option value="${file}">${file}</option>`);
    });
    const obbList = await cmdController.scanDirectory(directory, ".obb");
    const obbToDisplay = ['<option value="">None</option>', '<option disabled>- Detected OBB -</option>'];
    obbList.forEach(file => {
        obbToDisplay.push(`<option value="${file}">${file}</option>`);
    });
    event.sender.send('display-packages', apkToDisplay, obbToDisplay);
});

ipcMain.on('install-app', async (event, deviceID, packageName, directory, apkFilename, obbFilename) => {
    await cmdController.deleteApp(utils.wrapDeviceID(deviceID), packageName, event);
    await cmdController.installApp(utils.wrapDeviceID(deviceID), directory, apkFilename, obbFilename, event);
});

ipcMain.on('scan-conn-devices', async (event) => {
    const detectedDevices = await cmdController.scanDevices(event);
    const devicesToDisplay = ['<option disabled>- Detected Devices -</option>'];
    detectedDevices.forEach(device => {
        devicesToDisplay.push(`<option value="${device}">${device}</option>`);
        ProgramState.pushDeviceID(device);
    });
    event.sender.send('display-conn-devices', devicesToDisplay);
});

ipcMain.on('print-package-version', async (event, deviceID, packageName) => {
    const versions = await cmdController.getVersionName(utils.wrapDeviceID(deviceID), packageName);
    event.sender.send('print-package-version', versions.versionName, versions.versionCode);
});

ipcMain.on('save-app-logs', async (event, deviceID, packageName, fileName, pidSwitch) => {
    const pid = pidSwitch ? await cmdController.fetchPid(event, utils.wrapDeviceID(deviceID), packageName) : null;

    let fileNameSafe = null;
    if (fileName.length > 0)
        fileNameSafe = fileName.slice(fileName.length-4).match(/(\.[a-z]{3}$)/) === null ? fileName+".txt" : fileName;
    else
        fileNameSafe = `log_${packageName}_${utils.timeStampFile()}.txt`;

    cmdController.dumpLogs(event, utils.wrapDeviceID(deviceID), fileNameSafe, pid);
});

ipcMain.on('clear-app-logs', (event, deviceID) => {
    cmdController.clearLogs(event, utils.wrapDeviceID(deviceID));
});

ipcMain.on('property-name-change', async (event, deviceID, propName, fieldId) => {
    const propValue = await cmdController.getProp(event, utils.wrapDeviceID(deviceID), propName);
    event.sender.send('display-prop-value', propValue, settings.propertyFields[fieldId]);
});

ipcMain.on('property-value-change', (event, deviceID, propValue, propName) => {
    cmdController.setProp(event, utils.wrapDeviceID(deviceID), propName, propValue);
});
