const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

const { ProgramState } = require('../classes/State');

async function getDeviceIDs()
{
    const detectedDevices = await cmdController.scanDevices();
    console.log(detectedDevices);

    const devicesToDisplay = ['<option disabled>- Detected -</option>', '<option value="">Don\'t specify</option>'];
    detectedDevices.forEach(device => {
        devicesToDisplay.push(`<option value="${device}">${device}</option>`);
        ProgramState.pushDeviceID(device);
    });
    console.log(devicesToDisplay);

    const deviceIDs = ProgramState.getDeviceIDs();
    console.log(deviceIDs);
}

getDeviceIDs();