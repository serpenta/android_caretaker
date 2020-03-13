const { app, ipcMain, BrowserWindow } = require('electron');

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

    win.loadFile(path.resolve('./electron/windows/main.html'));
    return null;
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());
