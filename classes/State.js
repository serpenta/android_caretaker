class ProgramState
{
    static deviceIDs = [];

    static getDeviceIDs() {
        return this.deviceIDs;
    }

    static clearDeviceIDs() {
        deviceIDs = [];
        return null;
    }

    static pushDeviceID(id) {
        if (this.deviceIDs.indexOf(id) === -1)
            this.deviceIDs.push(id);
        return null;
    }
}

module.exports = {
    ProgramState
};
