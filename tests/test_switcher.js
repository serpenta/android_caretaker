const switcher = 'scanDirectory';

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
}
