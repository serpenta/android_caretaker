const path = require('path');
const cmdController = require(path.resolve('./controllers/cmd_ctrl.js'));

const { ProgramState } = require('../classes/State');
const utils = require('../common/utilities');

async function dumpLogs_test(deviceID, packageName, fileName, pidSwitch)
{
    let fileNameSafe = null;
    if (fileName.length > 0)
        fileNameSafe = fileName.slice(fileName.length-4).match(/(\.[a-z]{3}$)/) === null ? fileName+".txt" : fileName;
    else
        fileNameSafe = `log_${packageName}_${utils.timeStampFile()}.txt`;
    console.log(fileNameSafe);
    const deviceIdString = deviceID.length > 0 ? `-s ${deviceID}` : deviceID;
    const pid = pidSwitch ? await cmdController.fetchPid(deviceIdString, packageName) : null;
    cmdController.dumpLogs(deviceIdString, fileNameSafe, pid);
}

dumpLogs_test(
    deviceID="",
    packageName="com.artifexmundi.balefire",
    fileName="",
    pid=false
);
