const { app, ipcMain, BrowserWindow } = require('electron');

const controller = require('./controllers/main_ctrl');
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

ipcMain.on('btn-install-app', (e, deviceID, filepath, apkName, obbName) => {
    controller.deployApp(deviceID, filepath, apkName, obbName);
});
