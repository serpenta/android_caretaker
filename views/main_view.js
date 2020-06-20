const { ipcRenderer } = require('electron');

const getRadio = radioName =>
{
    const radio = document.getElementsByName(radioName);
    let value = null;
    radio.forEach(el => 
        {
            if (el.checked)
            {
                value = el.value;
            } 
        });
    return value;
}

const getCheckbox = boxName =>
{
    return document.getElementById(boxName).checked;
}

const getInput = input =>
{
    return document.getElementById(input).value;
}

document
    .getElementById('install-app')
    .addEventListener('click', () => {
        console.log('ipcRenderer: install-app');
        ipcRenderer.send('btn-install-app',
            getInput('device-id'),
            getInput('file-abs-path'),
            getInput('apk-filename'),
            getInput('obb-filename'));
    });
