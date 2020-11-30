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

async function getVersionName(deviceId, packageName)
{
    let versionName = null;

    await runCmd(`adb ${deviceId} shell "dumpsys package ${packageName} | grep version"`)
    .then(value => {
        const lines = value.split("\n");
        versionName = lines[1].slice(lines[1].indexOf('versionName'));
    });

    return versionName;
}

function deleteApp(deviceId, packageName)
{
    console.log(`[deleteApp]: uninstalling...`);

    return runCmd(`adb ${deviceId} uninstall ${packageName}`)
    .then(value => console.log(`[deleteApp]: ${value}`));
}

function installAPK(deviceId, filepath, apkFilename)
{
    console.log(`[installAPK]: installing... ${apkFilename}`);

    return runCmd(`adb ${deviceId} install ${filepath+apkFilename}`)
    .then(value => console.log(`[installAPK]: ${value}`));
}

function pushOBB(deviceId, filepath, obbFilename)
{   
    console.log(`[pushOBB]: pushing... ${obbFilename}`);

    return runCmd(`adb ${deviceId} push ${filepath+obbFilename} mnt/sdcard/Android/obb/com.artifexmundi.balefire/${obbFilename}`)
    .then(value => console.log(`[pushOBB]: ${value}`));
}

/** procedures */

async function installApp(deviceId, filepath, apkFilename, obbFilename)
{
    await installAPK(deviceId, filepath, apkFilename);

    console.log(`[installApp]: creating obb directory...`);
    await runCmd(`adb ${deviceId} shell "mkdir mnt/sdcard/Android/obb/com.artifexmundi.balefire`)
    .then(value => console.log(value));
    
    await pushOBB(deviceId, filepath, obbFilename)
    .then(value => console.log(value));
}

module.exports = {
    scanDevices,
    getVersionName,
    deleteApp,
    installAPK,
    installApp,
};
