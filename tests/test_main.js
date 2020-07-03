const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

async function deployApp(deviceID, filepath, apkFilename, obbFilename)
{
    await cmdController.getDevices();

    console.log(`[deployApp]: deploying build to ${deviceID}`);

    await cmdController.deleteApp(deviceID);
    
    await cmdController.installApp(deviceID, filepath, apkFilename, obbFilename);

    console.log(`[deployApp]: build deployed!`);
}

deployApp(
    deviceID= "FFY5T17C21001655",
    filepath= "I:\\bladebound\\",
    apkFilename= "Bladebound_ftr-new_joystick(12302)-Debug.apk",
    obbFilename= "main.12302.com.artifexmundi.balefire.obb");

// FFY5T17C21001655 - Huawei
// bc5afd11 - Xiaomi
