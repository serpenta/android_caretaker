class ProgramState
{
    static settings = {
        activeDevice: null,
        general: {
            'package-name': null,
            'logs-target-path': null,
            'logs-target-name': null,
            'packages-abs-path': null,
            'property-name_1': null,
            'property-name_2': null,
            'property-name_3': null,
            'property-name_4': null,
            'property-name_5': null,
            'property-name_6': null,
            'property-name_7': null,
            'property-name_8': null,
            'property-name_9': null
        },
        propFieldsDict: {
            propNameFields: {
                'property-name_1': 'property-value_1',
                'property-name_2': 'property-value_2',
                'property-name_3': 'property-value_3',
                'property-name_4': 'property-value_4',
                'property-name_5': 'property-value_5',
                'property-name_6': 'property-value_6',
                'property-name_7': 'property-value_7',
                'property-name_8': 'property-value_8',
                'property-name_9': 'property-value_9',
            },
            propValueFields: {
                'property-value_1': 'property-name_1',
                'property-value_2': 'property-name_2',
                'property-value_3': 'property-name_3',
                'property-value_4': 'property-name_4',
                'property-value_5': 'property-name_5',
                'property-value_6': 'property-name_6',
                'property-value_7': 'property-name_7',
                'property-value_8': 'property-name_8',
                'property-value_9': 'property-name_9',
            }
        },
        meminfo: {
            measurePss: false,
            sendRunningCritical: true,
            memoryTrimInterval: 50,
        }
    }
    static memoryTrimTicks = 0;
    static deviceIDs = [];
    static jobDone = null;
    static maxValue = null;
    static tenSecVals = [];

    static getActiveDevice() {
        return this.settings.activeDevice;
    }

    static setActiveDevice(value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.activeDevice = value;
            return null;
    }

    static getPackageName() {
        return this.settings.general['package-name'];
    }

    static setPackageName(value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.general['package-name'] = value;
            return null;
    }

    static getLogsTargetPath() {
        return this.settings.general['logs-target-path'];
    }

    static setLogsTargetPath(value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.general['logs-target-path'] = value;
            return null;
    }

    static getLogsTargetName() {
        return this.settings.general['logs-target-name'];
    }

    static setLogsTargetName(value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.general['logs-target-name'] = value;
            return null;
    }

    static getPackagesPath() {
        return this.settings.general['packages-abs-path'];
    }

    static setPackagesPath(value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.general['packages-abs-path'] = value
            return null;
    }

    static getPropertyName(fieldId) {
        return this.settings.general[fieldId];
    }

    static setPropertyName(fieldId, value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.general[fieldId] = value;
            return null;
    }

    static getFieldsContents() {
        return this.settings.general;
    }

    static restoreFieldsContents(contents) {
        if (typeof contents !== 'object')
            return -1;
        else
            Object.keys(contents).forEach(key => {
                this.settings.general[key] = contents[key];
            });
    }

    static getPropValueFieldByName(propNameField) {
        return this.settings.propFieldsDict.propNameFields[propNameField];
    }

    static getPropNameFieldByValue(propValueField) {
        return this.settings.propFieldsDict.propValueFields[propValueField];
    }

    static getMeasurePss() {
        return this.settings.meminfo.measurePss;
    }

    static setMeasurePss(value) {
        if (typeof value !== 'boolean')
            return -1;
        else
            this.settings.meminfo.measurePss = value;
            return null;
    }

    static getSendRunningCritical() {
        return this.settings.meminfo.sendRunningCritical;
    }

    static setSendRunningCritical(value) {
        if (typeof value !== 'boolean')
            return -1;
        else
            this.settings.meminfo.sendRunningCritical = value;
            return null;
    }

    static getMemoryTrimInterval() {
        return this.settings.meminfo.memoryTrimInterval;
    }

    static getMeminfoTicks() {
        return this.memoryTrimTicks;
    }

    static incrementMeminfoTicks() {
        this.memoryTrimTicks += 1;
        return null;
    }

    static resetMeminfoTicks() {
        this.memoryTrimTicks = 0;
        return null;
    }

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

    static setJobDone()
    {
        this.jobDone = true;
        return null;
    }

    static resetJobDone()
    {
        this.jobDone = false;
        return null;
    }

    static resetAverage()
    {
        this.tenSecVals = [];
        return null;
    }

    static setMaxValue(value)
    {
        this.maxValue = Math.round(value / 1000);
        return null;
    }

    static getJobDone()
    {
        return this.jobDone;
    }

    static getCurrentValue()
    {
        return this.tenSecVals[this.tenSecVals.length -1];
    }

    static getMaxValue()
    {
        return this.maxValue;
    }

    static addMeasurementToAverage(value)
    {
        this.tenSecVals.push(value);
        if (this.tenSecVals.length > 100)
            this.tenSecVals.splice(0,1);
    }

    static fetchTenSecAvg()
    {
        const average = (accumulator, current) => accumulator + current;
        return Math.round(this.tenSecVals.reduce(average) / this.tenSecVals.length / 1000);
    }

    static fetchTenSecMinimum()
    {
        let minimum = 5000000;
        for (let el = 0; el < this.tenSecVals.length; el++)
        {
            if (this.tenSecVals[el] < minimum) minimum = this.tenSecVals[el];
        };
        return Math.round(minimum / 1000);
    }
    
    static init()
    {
        this.jobDone = false;
        console.log(`[ProgramState]: initialized!`);
        return null;
    }
}

module.exports = {
    ProgramState
};
