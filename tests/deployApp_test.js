const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

async function deployApp(deviceID, filepath, packageName, apkFilename, obbFilename)
{
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;
    await cmdController.getDevices();
    console.log(`[deployApp]: deploying build to ${deviceID}`);

    await cmdController.deleteApp(deviceIdString, packageName);
    await cmdController.installApp(deviceIdString, filepath, apkFilename, obbFilename);
    console.log(`[deployApp]: build deployed!`);
}

deployApp(
    deviceID= "",
    filepath= "I:\\bladebound\\",
    packageName= "com.artifexmundi.balefire",
    apkFilename= "Bladebound_rel-2-10-0(12768)-Release.apk",
    obbFilename= "main.12768.com.artifexmundi.balefire.obb");

// FFY5T17C21001655 - Huawei
// bc5afd11 - Xiaomi
