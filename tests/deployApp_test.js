const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

async function deployApp(deviceID, filepath, apkFilename, obbFilename)
{
    const deviceIdString = deviceID === "" ? deviceID : `-s ${deviceID}`;

    await cmdController.getDevices();

    console.log(`[deployApp]: deploying build to ${deviceID}`);

    await cmdController.deleteApp(deviceIdString);
    
    await cmdController.installApp(deviceIdString, filepath, apkFilename, obbFilename);

    console.log(`[deployApp]: build deployed!`);
}

deployApp(
    deviceID= "",
    filepath= "I:\\bladebound\\",
    apkFilename= "Bladebound_htf-2-6-2(12328)-Debug.apk",
    obbFilename= "main.12328.com.artifexmundi.balefire.obb");

// FFY5T17C21001655 - Huawei
// bc5afd11 - Xiaomi
