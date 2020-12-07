const childProcess = require('child_process');

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

function deleteApp(deviceId, packageName)
{
    console.log(`[deleteApp]: uninstalling...`);

    return runCmd(`adb ${deviceId} uninstall ${packageName}`)
    .then(value => console.log(`[deleteApp]: ${value}`));
}

function installAPK(deviceId, directory, apkFilename)
{
    console.log(`[installAPK]: installing... ${apkFilename}`);

    return runCmd(`adb ${deviceId} install ${directory+apkFilename}`)
    .then(value => console.log(`[installAPK]: ${value}`));
}

function pushOBB(deviceId, directory, obbFilename)
{   
    console.log(`[pushOBB]: pushing... ${obbFilename}`);

    return runCmd(`adb ${deviceId} push ${directory+obbFilename} mnt/sdcard/Android/obb/com.artifexmundi.balefire/${obbFilename}`)
    .then(value => console.log(`[pushOBB]: ${value}`));
}

function setProp(deviceId, propName, propValue)
{
    runCmd(`adb ${deviceId} shell setprop ${propName} ${propValue}`);
    
    console.log(`[setProp]: property ${propName} set to ${propValue}`);
    return null;
}

function clearLogs (deviceId)
{
    runCmd(`adb ${deviceId} logcat --clear`);
    console.log(`[clearLogs]: log cleared!`);
    return null;
}


/** procedures */

async function scanDevices()
{
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

async function installApp(deviceId, directory, apkFilename, obbFilename)
{
    await installAPK(deviceId, directory, apkFilename);

    console.log(`[installApp]: creating obb directory...`);
    await runCmd(`adb ${deviceId} shell "mkdir mnt/sdcard/Android/obb/com.artifexmundi.balefire`)
    .then(value => console.log(value));
    
    await pushOBB(deviceId, directory, obbFilename)
    .then(value => console.log(value));
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

async function fetchPid(deviceId, packageName)
{
    let pid = null;

    await runCmd(`adb ${deviceId} shell "ps | grep ${packageName}`)
    .then(value => {
        const matchPid = value.match(/(\s\d+\s)/);
        pid = matchPid[0].slice(1, matchPid[0].length-1);
        console.log(`[fetchPit]: ${pid}`);
    });
        
    return pid;
}

async function dumpLogs (deviceId, fileName, pid)
{
    if (pid !== null)
        await runCmd(`adb ${deviceId} logcat -d -f mnt/sdcard/Download/${fileName} --pid=${pid}`);
    else
        await runCmd(`adb ${deviceId} logcat -d -f mnt/sdcard/Download/${fileName}`);
    console.log(`[dumpLogs]: log ${fileName} dumped at mnt/sdcard/Download`);
    runCmd(`adb ${deviceId} pull "mnt/sdcard/Download/${fileName}" "./logs/${fileName}"`)
    console.log(`[dumpLogs]: log ${fileName} pulled to ./logs/`);
    return null;
}

async function getProp(deviceId, propName)
{
    let propValue = null;

    await runCmd(`adb ${deviceId} shell getprop ${propName}`)
    .then(value => propValue = value);

    console.log(`[getProp]: property ${propName} is set to ${propValue}`);
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
    clearLogs,
    fetchPid,
};
