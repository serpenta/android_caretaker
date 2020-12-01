function getRadio (radioName)
{
    const radio = document.getElementsByName(radioName);
    let value = null;
    radio.forEach(el => { if (el.checked) value = el.value; });
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

module.exports = {
    getRadio,
    getCheckbox,
    getInput,
    getAbsFilepath
}
