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

async function printDevices()
{
    runCmd('adb devices')
    .then(value => console.log(value));
}

async function deleteApp()
{
    runCmd('adb uninstall com.artifexmundi.balefire')
    .then(value => console.log(value));;
}

async function pushObb(filepath, obbFilename)
{
    runCmd(`adb push ${filepath+obbFilename} mnt/sdcard/Android/obb/com.artifexmundi.balefire/${obbFilename}`)
    .then(value => console.log(value));;
}

async function installApp(filepath, apkFilename, obbFilename)
{
    console.log(`[installApp]: installing... ${apkFilename}`);
    await runCmd(`adb install ${filepath+apkFilename}`)
    .then(value => console.log(value));;

    console.log(`[installApp]: creating obb directory...`);
    await runCmd(`adb shell "mkdir mnt/sdcard/Android/obb/com.artifexmundi.balefire`)
    .then(value => console.log(value));;

    console.log(`[installApp]: pushing... ${obbFilename}`);
    await pushObb(filepath, obbFilename)
    .then(value => console.log(value));;

    console.log(`[installApp]: app installed!`);
}

printDevices();

// deleteApp();

installApp("C:\\Users\\Serpenta\\Downloads\\baldbound\\", "Bladebound_ftr-cached_dependencies(12098)-Debug.apk", "main.12098.com.artifexmundi.balefire.obb");
