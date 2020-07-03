const childProcess = require('child_process');
const path = require('path');

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

async function getDevices()
{
    return runCmd('adb devices')
    .then(value => console.log(value));
}

async function deleteApp(deviceID)
{
    console.log(`[deleteApp]: uninstalling...`);

    return runCmd(`adb -s ${deviceID} uninstall com.artifexmundi.balefire`)
    .then(value => console.log(`[deleteApp]: ${value}`));
}

async function installAPK(deviceID, filepath, apkFilename)
{
    console.log(`[installAPK]: installing... ${apkFilename}`);

    return runCmd(`adb -s ${deviceID} install ${filepath+apkFilename}`)
    .then(value => console.log(`[installAPK]: ${value}`));
}

async function pushOBB(deviceID, filepath, obbFilename)
{   
    console.log(`[pushOBB]: pushing... ${obbFilename}`);

    return runCmd(`adb -s ${deviceID} push ${filepath+obbFilename} mnt/sdcard/Android/obb/com.artifexmundi.balefire/${obbFilename}`)
    .then(value => console.log(`[pushOBB]: ${value}`));
}

/** procedures */

async function installApp(deviceID, filepath, apkFilename, obbFilename)
{
    await installAPK(deviceID, filepath, apkFilename);

    console.log(`[installApp]: creating obb directory...`);
    await runCmd(`adb -s ${deviceID} shell "mkdir mnt/sdcard/Android/obb/com.artifexmundi.balefire`)
    .then(value => console.log(value));
    
    await pushOBB(deviceID, filepath, obbFilename)
    .then(value => console.log(value));
}

module.exports = {
    getDevices,
    deleteApp,
    installAPK,
    installApp,
};
