const exec = require('child_process').exec;
const path = require('path');

function runCmd(command)
{
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) console.warn(error);
            resolve(stdout ? stdout : stderr);
        });
    });
}

async function printDevices()
{
    runCmd('adb devices')
    .then(value => console.log(value));
    // console.log(cmdOut);
}

async function deleteApp()
{
    runCmd('adb uninstall com.artifexmundi.balefire')
    .then(value => console.log(value));
}

async function pushObb(filepath, obbFilename)
{
    runCmd(`adb push ${filepath+obbFilename} mnt/sdcard/Android/obb/com.artifexmundi.balefire/${obbFilename}`)
    .then(value => console.log(value));
}

async function installApp(filepath, apkFilename, obbFilename)
{
    await runCmd(`adb install ${filepath+apkFilename}`)
    .then(value => console.log(value));

    await runCmd(`adb shell "mkdir mnt/sdcard/Android/obb/com.artifexmundi.balefire`)
    .then(value => console.log(value));

    await pushObb(filepath, obbFilename);
}

printDevices();

pushObb("C:\\Users\\Serpenta\\Downloads\\baldbound\\", "main.12098.com.artifexmundi.balefire.obb");
