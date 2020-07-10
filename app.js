const { app, ipcMain, BrowserWindow } = require('electron');

const cmdController = require('./controllers/cmd_ctrl');
const path = require('path');

const createWindow = () =>
{
    let win = new BrowserWindow
    ({
        width: 1280,
        height: 860,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('./windows/main_window.html');
    return null;
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());

async function deployApp(deviceID, filepath, apkFilename, obbFilename)
{
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;

    await cmdController.getDevices();

    console.log(`[deployApp]: deploying build to ${deviceID}`);

    await cmdController.deleteApp(deviceIdString);
    
    await cmdController.installApp(deviceIdString, filepath, apkFilename, obbFilename);

    console.log(`[deployApp]: build deployed!`);
}

ipcMain.on('btn-install-app', (e, deviceID, filepath, apkName, obbName) => {
    deployApp(deviceID, filepath, apkName, obbName);
});
