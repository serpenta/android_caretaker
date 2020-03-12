const exec = require('child_process').exec;

function runCmd(command)
{
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) console.warn(error);
            resolve(stdout ? stdout : stderr);
        });
    });
}

async function printDevices()
{
    runCmd('adb devices')
    .then(value => console.log(value));
    // console.log(cmdOut);
}

printDevices();
