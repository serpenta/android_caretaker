const switcher = 'dumpLogs';

switch (switcher)
{
    case 'deployApp':
        require('./deployApp_test');
        break;
    case 'scanDevices':
        require('./scanDevices_test');
        break;
    case 'scanDirectory':
        require('./scanDirectory_test');
        break;
    case 'packageVersion':
        require('./getPackageVersion_test');
        break;
    case 'properties':
        require('./properties_test');
        break;
    case 'dumpLogs':
        require('./dumpLogs_test');
        break;
}
