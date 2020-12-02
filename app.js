const { app, ipcMain, BrowserWindow } = require('electron');

const settings = require('./common/settings');
const cmdController = require('./controllers/cmd_ctrl');
const { ProgramState } = require('./classes/State');

app.on('ready', () => {
    let win = new BrowserWindow
    ({
        width: 900,
        height: 860,
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
    const versionName = await cmdController.getVersionName(deviceIdString, packageName);
    event.sender.send('print-package-version', versionName);
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
