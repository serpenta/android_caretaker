class ProgramState
{
    static deviceIDs = [];
    static jobDone = null;
    static maxValue = null;
    static tenSecVals = [];

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
