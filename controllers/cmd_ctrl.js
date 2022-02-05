const childProcess = require('child_process');
const path = require('path');
// const { pid } = require('process');
const utils = require('../common/utilities');
const { ProgramState } = require('../classes/State');

function runCmd(command)
{
    return new Promise((resolve, reject) => {
        childProcess.exec(command, { maxBuffer: 1024**3 }, (error, stdout, stderr) => {
            if (error) console.warn(error);
            resolve(stdout ? stdout : stderr);
        });
    });
}


/** basic functions */

function sendTrimMemory(event, deviceId, packageName)
{
    runCmd(`adb ${deviceId} shell am send-trim-memory ${packageName} RUNNING_CRITICAL`);
    event.sender.send('app-log-print', '[MemInfo:] Memory trim sent');
    return null;
}

function deleteApp(event, deviceId, packageName)
{
    event.sender.send('app-log-print', `[deleteApp]: uninstalling...`);

    return runCmd(`adb ${deviceId} uninstall ${packageName}`)
    .then(value => event.sender.send('app-log-print', `[deleteApp]: ${value}`));
}

function installAPK(event, deviceId, directory, apkFilename)
{
    event.sender.send('app-log-print', `[installAPK]: installing... ${apkFilename}`);

    return runCmd(`adb ${deviceId} install ${directory+apkFilename}`)
    .then(value => event.sender.send('app-log-print', `[installAPK]: ${value}`));
}

function pushOBB(event, deviceId, directory, obbFilename)
{   
    event.sender.send('app-log-print', `[pushOBB]: pushing... ${obbFilename}`);

    return runCmd(`adb ${deviceId} push ${directory+obbFilename} /sdcard/Android/obb/com.artifexmundi.balefire/${obbFilename}`)
    .then(value => event.sender.send('app-log-print', `[pushOBB]: ${value}`));
}

function setProp(event, deviceId, propName, propValue)
{
    runCmd(`adb ${deviceId} shell setprop ${propName} ${propValue}`);
    
    event.sender.send('app-log-print', `[setProp]: property ${propName} set to ${propValue}`);
    return null;
}

function clearLogs (event, deviceId)
{
    runCmd(`adb ${deviceId} logcat --clear`);
    event.sender.send('app-log-print', `[clearLogs]: log cleared!`);
    return null;
}

function openExplorerWindow (directory)
{
    runCmd(`start explorer ${directory}`);
    return null;
}

async function memInfo(deviceIdString, packageName, measurePss)
{
    return runCmd(`adb ${deviceIdString} shell "dumpsys meminfo ${packageName} | grep TOTAL"`)
    .then(value => 
        {
            const totalsArray = value.match(/\d+/g);

            let totalVal = 0;
            if (measurePss)
                totalVal = parseInt(totalsArray[0]);
            else
                totalVal = parseInt(totalsArray[1]);

            if (totalVal / 1000 > ProgramState.getMaxValue()) ProgramState.setMaxValue(totalVal);
            ProgramState.addMeasurementToAverage(totalVal);

            console.log(`[memInfo]:
            current: ${totalVal} kB
            rollingAvg: ${ProgramState.fetchTenSecAvg()} mB
            MIN: ${ProgramState.fetchTenSecMinimum()} mB
            MAX: ${ProgramState.getMaxValue()} mB`);
        });
}

/** procedures */

async function scanDevices(event)
{
    event.sender.send('app-log-print', `Looking for connected devices...`);
    const detectedDevices = [];

    await runCmd('adb devices')
    .then(value => {
        const lines = value.split('\n');
        let idx = 1;
        while (lines[idx].length > 2) {
            const deviceID = lines[idx].slice(0, lines[idx].indexOf("\t"));
            detectedDevices.push(deviceID);
            idx += 1;
       }
    });

    event.sender.send('app-log-print', `${detectedDevices.length} connected device(s) found!`);
    return detectedDevices;
}

async function scanDirectory(directory, fileExt)
{
    const fileList = [];

    await runCmd (`dir /W /-N "${directory}"`)
    .then(value => {
        const lines = value.split('\n');
        lines.forEach(line => {
            if (line.indexOf(fileExt) > 0)
                fileList.push(line.slice(0, line.indexOf("\r")));
        });
    });

    return fileList;
}

async function installApp(event, deviceId, directory, apkFilename, obbFilename)
{
    await installAPK(event, deviceId, directory, apkFilename);

    event.sender.send('app-log-print', `[installApp]: creating obb directory...`);
    await runCmd(`adb ${deviceId} shell "mkdir /sdcard/Android/obb/com.artifexmundi.balefire"`)
    .then(value => event.sender.send('app-log-print', value));
    
    await pushOBB(event, deviceId, directory, obbFilename)
    .then(value => event.sender.send('app-log-print', value));
}

async function getVersionName(deviceId, packageName)
{
    let versionName = null;
    let versionCode = null;

    await runCmd(`adb ${deviceId} shell "dumpsys package ${packageName} | grep version"`)
    .then(value => {
        const lines = value.split("\n");
        versionCode = lines[0].slice(lines[0].indexOf('versionCode'), lines[0].indexOf('minSdk')-1);
        versionName = lines[1].slice(lines[1].indexOf('versionName'), lines[1].indexOf('\r'));
    });

    return {
        versionName,
        versionCode
    };
}

async function fetchPid(event, deviceId, packageName)
{
    let pid = null;

    await runCmd(`adb ${deviceId} shell "ps | grep ${packageName}"`)
    .then(value => {
        const matchPid = value.match(/(\s\d+\s)/);
        pid = matchPid[0].slice(1, matchPid[0].length-1);
        event.sender.send('app-log-print', `[fetchPid]: ${pid}`);
    });
        
    return pid;
}

async function dumpLogs (event, deviceId, packageName, targetPath, targetName, pidSwitch)
{
    const pid = pidSwitch ? await fetchPid(event, deviceId, packageName) : null;
    const targetPathSafe = targetPath.length > 1 ? targetPath : path.resolve('./logs/')+'\\';
    
    let targetNameSafe = null;
    if (targetName.length > 0)
        targetNameSafe = targetName.slice(targetName.length-4).match(/(\.[a-z]{3}$)/) === null 
            ? `log_${packageName}_${utils.timeStampFile()}_`+targetName+".txt"
            : `log_${packageName}_${utils.timeStampFile()}_`+targetName;
    else
        targetNameSafe = `log_${packageName}_${utils.timeStampFile()}.txt`;

    if (pid !== null)
        await runCmd(`adb ${deviceId} logcat -d -f /sdcard/Download/${targetNameSafe} --pid=${pid}`);
    else
        await runCmd(`adb ${deviceId} logcat -d -f /sdcard/Download/${targetNameSafe}`);

    utils.appLog(event, `[dumpLogs]: log \'${targetNameSafe}\' dumped at /sdcard/Download`);
    runCmd(`if not exist ${targetPathSafe} mkdir ${targetPathSafe}`);
    runCmd(`adb ${deviceId} pull "/sdcard/Download/${targetNameSafe}" "${targetPathSafe}${targetNameSafe}"`);
    utils.appLog(event, `[dumpLogs]: log \'${targetNameSafe}\' pulled to ${targetPathSafe}`);
    return null;
}

async function openLogcatWindow (event, deviceId, packageName, pidSwitch)
{
    if (pidSwitch)
    {
        const pid = await fetchPid(event, deviceId, packageName);
        runCmd(`start cmd /K adb ${deviceId} logcat --pid=${pid}`);
    }
    else
        runCmd(`start cmd /K adb ${deviceId} logcat`);
}

async function getProp(event, deviceId, propName)
{
    let propValue = null;

    await runCmd(`adb ${deviceId} shell getprop ${propName}`)
    .then(value => propValue = value);

    event.sender.send('app-log-print', `[getProp]: property ${propName} is set to ${propValue}`);
    return propValue;
}

module.exports = {
    scanDevices,
    scanDirectory,
    getVersionName,
    getProp,
    setProp,
    deleteApp,
    installAPK,
    installApp,
    dumpLogs,
    openLogcatWindow,
    clearLogs,
    openExplorerWindow,
    memInfo,
    sendTrimMemory
};
