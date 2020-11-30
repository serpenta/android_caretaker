const switcher = 'packageVersion';

switch (switcher)
{
    case 'deployApp': require('./deployApp_test');
    case 'scanDevices': require('./scanDevices_test');
    case 'packageVersion': require('./getPackageVersion_test');
}
