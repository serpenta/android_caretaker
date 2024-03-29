function wrapDeviceID (deviceID)
{
    return deviceID.length > 0 ? `-s ${deviceID}` : deviceID;
}

function timeStamp ()
{
    return JSON.stringify(new Date()).slice(1, 20);
}

function timeStampFile ()
{
    return JSON.stringify(new Date()).slice(1, 20).replace(/:/g, "-");
}

function dateStamp ()
{
    return JSON.stringify(new Date()).slice(1, 11);
}

function getRadio (radioName)
{
    const radio = document.getElementsByName(radioName);
    let value = null;
    for (i = 0; i < radio.length; i++) {
        if (radio[i].checked) {
            value = radio[i];
            break;
        }
    }
    return value;
}

function getCheckbox (boxName)
{
    return document.getElementById(boxName).checked;
}

function getInput (input)
{
    return document.getElementById(input).value;
}

function getAbsFilepath (input)
{
    const path = utils.getInput(input);
    const pathSafe = path.charAt(path.length-1) === '\\' ? path : path+'\\';
    return pathSafe;
}

function appLog (event, message)
{
    event.sender.send('app-log-print', message);
    return null;
}

module.exports = {
    wrapDeviceID,
    timeStamp,
    timeStampFile,
    dateStamp,
    getRadio,
    getCheckbox,
    getInput,
    getAbsFilepath,
    appLog
}
