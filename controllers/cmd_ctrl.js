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

function getPackageVersion(deviceIdString, packageName)
{
    return runCmd(`adb ${deviceIdString} shell "dumpsys package ${packageName} | grep version"`)
    .then(value => console.log(`[appVersion]: ${value}`));
}

function deleteApp(deviceIdString, packageName)
{
    console.log(`[deleteApp]: uninstalling...`);

    return runCmd(`adb ${deviceIdString} uninstall ${packageName}`)
    .then(value => console.log(`[deleteApp]: ${value}`));
}

function installAPK(deviceIdString, filepath, apkFilename)
{
    console.log(`[installAPK]: installing... ${apkFilename}`);

    return runCmd(`adb ${deviceIdString} install ${filepath+apkFilename}`)
    .then(value => console.log(`[installAPK]: ${value}`));
}

function pushOBB(deviceIdString, filepath, obbFilename)
{   
    console.log(`[pushOBB]: pushing... ${obbFilename}`);

    return runCmd(`adb ${deviceIdString} push ${filepath+obbFilename} mnt/sdcard/Android/obb/com.artifexmundi.balefire/${obbFilename}`)
    .then(value => console.log(`[pushOBB]: ${value}`));
}

/** procedures */

async function installApp(deviceIdString, filepath, apkFilename, obbFilename)
{
    await installAPK(deviceIdString, filepath, apkFilename);

    console.log(`[installApp]: creating obb directory...`);
    await runCmd(`adb ${deviceIdString} shell "mkdir mnt/sdcard/Android/obb/com.artifexmundi.balefire`)
    .then(value => console.log(value));
    
    await pushOBB(deviceIdString, filepath, obbFilename)
    .then(value => console.log(value));
}

module.exports = {
    scanDevices,
    getPackageVersion,
    deleteApp,
    installAPK,
    installApp,
};
