const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

const { ProgramState } = require('../classes/State');

async function getPackageVersion(deviceID, packageName)
{
    const versionName = await cmdController.getVersionName(deviceID, packageName);
    console.log(versionName);
}

getPackageVersion(
    deviceID="",
    packageName="com.artifexmundi.balefire"
);