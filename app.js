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
        const detectedDevices = await cmdController.scanDevices();
        const devicesToDisplay = ['<option disabled>- Detected Devices -</option>'];
        detectedDevices.forEach(device => {
            devicesToDisplay.push(`<option value="${device}">${device}</option>`);
            ProgramState.pushDeviceID(device);
        });
        event.sender.send('display-conn-devices', devicesToDisplay);
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

ipcMain.on('install-app', async (e, deviceID, packageName, directory, apkFilename, obbFilename) => {
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    await cmdController.deleteApp(deviceIdString, packageName);
    await cmdController.installApp(deviceIdString, directory, apkFilename, obbFilename);
});

ipcMain.on('scan-conn-devices', async (event) => {
    const detectedDevices = await cmdController.scanDevices();
    const devicesToDisplay = ['<option disabled>- Detected Devices -</option>'];
    detectedDevices.forEach(device => {
        devicesToDisplay.push(`<option value="${device}">${device}</option>`);
        ProgramState.pushDeviceID(device);
    });
    event.sender.send('display-conn-devices', devicesToDisplay);
});

ipcMain.on('print-package-version', async (event, deviceID, packageName) => {
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    const versions = await cmdController.getVersionName(deviceIdString, packageName);
    event.sender.send('print-package-version', versions.versionName, versions.versionCode);
});

ipcMain.on('save-app-logs', async (e, deviceID, packageName, fileName, pidSwitch) => {
    const deviceIdString = deviceID.length > 0 ? `-s ${deviceID}` : deviceID;
    const pid = pidSwitch ? await cmdController.fetchPid(deviceIdString, packageName) : null;

    let fileNameSafe = null;
    if (fileName.length > 0)
        fileNameSafe = fileName.slice(fileName.length-4).match(/(\.[a-z]{3}$)/) === null ? fileName+".txt" : fileName;
    else
        fileNameSafe = `log_${packageName}_${utils.timeStampFile()}.txt`;

    cmdController.dumpLogs(deviceIdString, fileNameSafe, pid);
});

ipcMain.on('clear-app-logs', (e, deviceID) => {
    const deviceIdString = deviceID.length > 0 ? `-s ${deviceID}` : deviceID;
    cmdController.clearLogs(deviceIdString);
});

ipcMain.on('property-name-change', async (event, deviceID, propName, fieldId) => {
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    const propValue = await cmdController.getProp(deviceIdString, propName);
    event.sender.send('display-prop-value', propValue, settings.propertyFields[fieldId]);
});

ipcMain.on('property-value-change', (e, deviceID, propValue, propName) => {
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    cmdController.setProp(deviceIdString, propName, propValue);
});
