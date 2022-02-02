const { app, ipcMain, BrowserWindow, ipcRenderer } = require('electron');
const settings = require('./common/settings');
const utils = require('./common/utilities');
const cmdController = require('./controllers/cmd_ctrl');
const { ProgramState } = require('./classes/State');

ProgramState.init();

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
        const detectedDevices = await cmdController.scanDevices(event);
        const devicesToDisplay = ['<option disabled>- Detected Devices -</option>'];
        detectedDevices.forEach(device => {
            devicesToDisplay.push(`<option value="${device}">${device}</option>`);
            ProgramState.pushDeviceID(device);
        });
        event.sender.send('display-conn-devices', devicesToDisplay);
        event.sender.send('app-log-print', '[mainWindow]: App loaded!');
    });

    winMain.on('closed', () => app.quit());
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
    await cmdController.deleteApp(event, utils.wrapDeviceID(deviceID), packageName);
    await cmdController.installApp(event, utils.wrapDeviceID(deviceID), directory, apkFilename, obbFilename);
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

ipcMain.on('save-app-logs', async (event, deviceID, packageName, fileDirectory, fileName, pidSwitch) => {
    const pid = pidSwitch ? await cmdController.fetchPid(event, utils.wrapDeviceID(deviceID), packageName) : null;

    let fileDirSafe = null;
    if (fileDirectory.length > 0)
        fileDirSafe = fileDirectory.slice(fileDirectory.length-1) === '\\' ? fileDirectory : fileDirectory+'\\';
    else
        fileDirSafe = "./logs/";

    let fileNameSafe = null;
    if (fileName.length > 0)
        fileNameSafe = fileName.slice(fileName.length-4).match(/(\.[a-z]{3}$)/) === null ? fileName+".txt" : fileName;
    else
        fileNameSafe = `log_${packageName}_${utils.timeStampFile()}.txt`;

    cmdController.dumpLogs(event, utils.wrapDeviceID(deviceID), fileDirSafe, fileNameSafe, pid);
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

ipcMain.on('progstat-change-active-device', (e, deviceID) => {
    ProgramState.setActiveDevice(deviceID);
    console.log(ProgramState.getActiveDevice());
});

ipcMain.on('progstat-change-packagename', (e, packageName) => {
    ProgramState.setPackageName(packageName);
    console.log(ProgramState.getPackageName());
});

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
