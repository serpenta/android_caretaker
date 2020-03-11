const cmd = require('node-cmd');
const exec = require('child_process').exec;

const getProcessId = () =>
{
    cmd.get(
        'adb shell "ps | grep balefire"',
       (err, data, stderr) => {
        const pidStart = data.search(/\d{4,5}/);
        const response = parseInt(data.slice(pidStart, pidStart + 5));
       }
    );
}

function runCmd(command)
{
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) console.log(error);
            resolve(stdout ? stdout : stderr);
        });
    });
}

async function printDevices()
{
    const cmdOut = await runCmd('adb devices');
    console.log(cmdOut);
}

getProcessId();

printDevices();
