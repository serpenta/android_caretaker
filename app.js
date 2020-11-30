const { app, ipcMain, BrowserWindow } = require('electron');

const cmdController = require('./controllers/cmd_ctrl');
const { ProgramState } = require('./classes/State');

app.on('ready', () => {
    let win = new BrowserWindow
    ({
        width: 1280,
        height: 860,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('./windows/main_window.html');
});

app.on('window-all-closed', () => app.quit());

ipcMain.on('install-app', async (e, deviceID, packageName, filepath, apkFilename, obbFilename) => {
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    await cmdController.deleteApp(deviceIdString, packageName);
    await cmdController.installApp(deviceIdString, filepath, apkFilename, obbFilename);
});

ipcMain.on('scan-conn-devices', async (event) => {
    const detectedDevices = await cmdController.scanDevices();
    const devicesToDisplay = ['<option value="">Don\'t specify</option>', '<option disabled>- Detected -</option>'];
    detectedDevices.forEach(device => {
        devicesToDisplay.push(`<option value="${device}">${device}</option>`);
        ProgramState.pushDeviceID(device);
    });
    event.sender.send('display-conn-devices', devicesToDisplay);
});

ipcMain.on('print-package-version', (event, deviceID, packageName) => {
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    cmdController.getPackageVersion(deviceIdString, packageName);
    event.sender.send('print-package-version');
});
