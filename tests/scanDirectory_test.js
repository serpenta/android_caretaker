const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

const { ProgramState } = require('../classes/State');

async function scanDirectory(directory)
{
    cmdController.scanDirectory(directory, ".apk");
    cmdController.scanDirectory(directory, ".obb");
}

scanDirectory(
    directory = "I:\\bladebound\\"
);
