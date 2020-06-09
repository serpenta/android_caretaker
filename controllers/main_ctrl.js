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

async function printDevices()
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

async function deployApp(deviceID)
{
    await printDevices();

    console.log(`[deployApp]: deploying build to ${deviceID}`);

    await deleteApp(deviceID);
    
    await installApp(deviceID, "C:\\Users\\Serpenta\\Downloads\\baldbound\\", "Bladebound_ftr-new_boss_challenge(12199)-Debug.apk", "main.12199.com.artifexmundi.balefire.obb");

    console.log(`[deployApp]: build deployed!`);
}

deployApp("FFY5T17C21001655");

// FFY5T17C21001655 - Huawei
// bc5afd11 - Xiaomi
