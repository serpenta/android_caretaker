const { app, ipcMain, BrowserWindow } = require('electron');

const cmdController = require('./controllers/cmd_ctrl');

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

ipcMain.on('btn-install-app', async (e, deviceID, filepath, apkFilename, obbFilename) => {
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    await cmdController.getDevices();
    console.log(`[deployApp]: deploying build to ${deviceID}`);
    await cmdController.deleteApp(deviceIdString);
    await cmdController.installApp(deviceIdString, filepath, apkFilename, obbFilename);
    console.log(`[deployApp]: build deployed!`);
});
