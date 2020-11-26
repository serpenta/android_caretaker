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
    apkFilename= "Bladebound_rel-2-11-0(12865)-Release.apk",
    obbFilename= "main.12865.com.artifexmundi.balefire.obb");
