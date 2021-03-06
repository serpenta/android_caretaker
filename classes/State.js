class ProgramState
{
    static settings = {
        general: {
            activeDevice: null,
            packageName: null,
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
        return this.settings.general.activeDevice;
    }

    static setActiveDevice(value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.general.activeDevice = value;
            return null;
    }

    static getPackageName() {
        return this.settings.general.packageName;
    }

    static setPackageName(value) {
        if (typeof value !== 'string')
            return -1;
        else
            this.settings.general.packageName = value;
            return null;
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
