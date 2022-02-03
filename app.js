const { app, ipcMain, BrowserWindow } = require('electron');
const filesys = require('fs');
const path = require('path');

const utils = require('./common/utilities');
const cmdController = require('./controllers/cmd_ctrl');
const { ProgramState } = require('./classes/State');

ProgramState.init();

function readUserSettings (event) {
    try { return JSON.parse(filesys.readFileSync(path.resolve(`./UserSettings.json`), 'utf-8')); }
    catch(error) { 
        console.log(error);
        event.sender.send('app-log-print', '[main]: No user settings file found!');
    }
}

async function scanConnectedDevices (event) {
    const detectedDevices = await cmdController.scanDevices(event);
    const devicesToDisplay = ['<option disabled>- Detected Devices -</option>'];
    detectedDevices.forEach(device => {
        devicesToDisplay.push(`<option value="${device}">${device}</option>`);
        ProgramState.pushDeviceID(device);
        ProgramState.setActiveDevice(device);
    });
    return devicesToDisplay;
}

async function scanPackagesDirectory (packagesAbsPath) {
    const apkList = await cmdController.scanDirectory(packagesAbsPath, ".apk");
    const apkToDisplay = ['<option disabled>- Detected APK -</option>'];
    apkList.forEach(file => {
        apkToDisplay.push(`<option value="${file}">${file}</option>`);
    });
    const obbList = await cmdController.scanDirectory(packagesAbsPath, ".obb");
    const obbToDisplay = ['<option value="">None</option>', '<option disabled>- Detected OBB -</option>'];
    obbList.forEach(file => {
        obbToDisplay.push(`<option value="${file}">${file}</option>`);
    });
    return [apkToDisplay, obbToDisplay];
}

async function scanProperties (event, userSettings) {
    const activeDevice = ProgramState.getActiveDevice();
    if (activeDevice) {
        Object.keys(userSettings).forEach(async (propNameField) => {
            if (ProgramState.getPropValueFieldByName(propNameField)) {
                const propName = ProgramState.getPropertyName(propNameField);
                if (propName) {
                    const propValue = await cmdController.getProp(event, utils.wrapDeviceID(activeDevice), propName);
                    event.sender.send('display-prop-value', propValue, ProgramState.getPropValueFieldByName(propNameField));
                }
            }
        });
    }
}

app.on('ready', () => {
    let winMain = new BrowserWindow
    ({
        width: 900,
        height: 1200,
        webPreferences: {
            nodeIntegration: true
        }
    });

    winMain.loadFile('./windows/main_window.html');
    winMain.webContents.on('did-finish-load', async (event) => {
        const devicesToDisplay = await scanConnectedDevices(event);
        const userSettings = readUserSettings(event);
        ProgramState.restoreFieldsContents(userSettings);
        await scanProperties(event, userSettings);
        if (ProgramState.getPackagesPath()) {
            const packagesAbsPath = ProgramState.getPackagesPath();
            const [apkToDisplay, obbToDisplay] = await scanPackagesDirectory(packagesAbsPath); 
            event.sender.send('display-packages', apkToDisplay, obbToDisplay);
        }
        event.sender.send('display-conn-devices', devicesToDisplay);
        event.sender.send('app-log-print', '[main]: App loaded!');
        event.sender.send('restore-fields-contents', ProgramState.getFieldsContents());
    });

    winMain.on('closed', () => {
        filesys.writeFileSync(`./UserSettings.json`, JSON.stringify(ProgramState.getFieldsContents()));
        app.quit();
    });
});

ipcMain.on('open-meminfo', () => {
    let winMeminfo = new BrowserWindow
    ({
        width: 900,
        heigth: 1200,
        webPreferences: {
            nodeIntegration: true
        }
    });

    winMeminfo.setAlwaysOnTop(true);
    winMeminfo.loadFile('./windows/meminfo_window.html');
    winMeminfo.webContents.on('did-finish-load', () => {
        winMeminfo.webContents.send('results-display-init');
    });

    winMeminfo.on('closed', () => {
        ProgramState.setJobDone();
    })
});

/* MAIN WINDOW RENDERER */

ipcMain.on('scan-dir-packages', async (event, packagesAbsPath) => {
    const [apkToDisplay, obbToDisplay] = await scanPackagesDirectory(packagesAbsPath);
    event.sender.send('display-packages', apkToDisplay, obbToDisplay);
});

ipcMain.on('install-app', async (event, deviceId, packageName, packagesAbsPath, apkFilename, obbFilename) => {
    await cmdController.deleteApp(event, utils.wrapDeviceID(deviceId), packageName);
    await cmdController.installApp(event, utils.wrapDeviceID(deviceId), packagesAbsPath, apkFilename, obbFilename);
});

ipcMain.on('scan-conn-devices', async (event) => {
    const devicesToDisplay = await scanConnectedDevices(event);
    event.sender.send('display-conn-devices', devicesToDisplay);
});

ipcMain.on('print-package-version', async (event, deviceId, packageName) => {
    const versions = await cmdController.getVersionName(utils.wrapDeviceID(deviceId), packageName);
    event.sender.send('print-package-version', versions.versionName, versions.versionCode);
});

ipcMain.on('save-app-logs', async (event, deviceId, packageName, targetPath, fileName, pidSwitch) => {
    cmdController.dumpLogs(event, utils.wrapDeviceID(deviceId), packageName, targetPath, fileName, pidSwitch);
});

ipcMain.on('open-logcat', (event, deviceId, packageName, pidSwitch) => {
    cmdController.openLogcatWindow(event, utils.wrapDeviceID(deviceId), packageName, pidSwitch);
});

ipcMain.on('clear-app-logs', (event, deviceId) => {
    cmdController.clearLogs(event, utils.wrapDeviceID(deviceId));
});

ipcMain.on('property-name-change', async (event, deviceId, propName, propNameField) => {
    ProgramState.setPropertyName(propNameField, propName);
    const propValue = await cmdController.getProp(event, utils.wrapDeviceID(deviceId), propName);
    event.sender.send('display-prop-value', propValue, ProgramState.getPropValueFieldByName(propNameField));
});

ipcMain.on('property-value-change', (event, deviceId, propValue, propName) => {
    cmdController.setProp(event, utils.wrapDeviceID(deviceId), propName, propValue);
});

ipcMain.on('change-active-device', (event, deviceId) => {
    ProgramState.setActiveDevice(deviceId);
});

ipcMain.on('change-packagename', async (event, deviceId, packageName) => {
    ProgramState.setPackageName(packageName);
    const versions = await cmdController.getVersionName(utils.wrapDeviceID(deviceId), packageName);
    event.sender.send('print-package-version', versions.versionName, versions.versionCode);
});

ipcMain.on('change-logs-target-path', (event, targetPath) => {
    ProgramState.setLogsTargetPath(targetPath);
});

ipcMain.on('change-logs-target-name', (event, targetName) => {
    ProgramState.setLogsTargetName(targetName);
})

ipcMain.on('change-packages-abs-path', (event, packagesPath) => {
    ProgramState.setPackagesPath(packagesPath);
})

/* MEMINFO WINDOW RENDERER */

ipcMain.on('btn-run-measurement', (event) => {
    ProgramState.resetJobDone();
    ProgramState.resetMeminfoTicks();
    event.sender.send('results-status-on');
    const deviceIdString = utils.wrapDeviceID(ProgramState.getActiveDevice());
    const packageName = ProgramState.getPackageName();

    async function measureMemory()
    {
        if (ProgramState.getJobDone())
            clearInterval(measureMemoryJob);
            
        await cmdController.memInfo(deviceIdString, packageName, ProgramState.getMeasurePss());

        event.sender.send('print-results',
            ProgramState.getCurrentValue(),
            ProgramState.getMaxValue(),
            ProgramState.fetchTenSecAvg(),
            ProgramState.fetchTenSecMinimum());

        if (ProgramState.getSendRunningCritical()
            && ProgramState.getMeminfoTicks() === ProgramState.getMemoryTrimInterval())
            await cmdController.sendTrimMemory(event, deviceIdString, packageName);
                
        ProgramState.incrementMeminfoTicks();
        if (ProgramState.getMeminfoTicks() > ProgramState.getMemoryTrimInterval())
            ProgramState.resetMeminfoTicks();

        return null;
    };

    const measureMemoryJob = setInterval(measureMemory, 100);
});

ipcMain.on('progstat-change-send-trim-memory', (e) =>  {
    ProgramState.setSendRunningCritical(!ProgramState.getSendRunningCritical());
});

ipcMain.on('progstat-change-measure-pss', (e) =>  {
    ProgramState.setMeasurePss(!ProgramState.getMeasurePss());
});

ipcMain.on('btn-reset-max', (e) => {
    ProgramState.setMaxValue(0);
});

ipcMain.on('btn-reset-avg', (e) => {
    ProgramState.resetAverage();
});

ipcMain.on('btn-stop-measurement', (event) => {
    ProgramState.setJobDone();
    event.sender.send('results-status-off');
});
