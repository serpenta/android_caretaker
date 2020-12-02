const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

const { ProgramState } = require('../classes/State');

function setProp(deviceId, propName, propValue)
{
    cmdController.setProp(deviceId, propName, propValue);
}

async function getProp(deviceId, propName)
{
    const propValue = await cmdController.getProp(deviceId, propName);
    console.log(propValue);
}

setProp(
    deviceId = "-s RF8NA2PJ51Y",
    propName = "debug.AM_DevelopmentDevice",
    propValue = "true"
)

getProp(
    deviceId = "-s RF8NA2PJ51Y",
    propName = "debug.AM_DevelopmentDevice"
);
