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

module.exports = {
    getRadio,
    getCheckbox,
    getInput
}
