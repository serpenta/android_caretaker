const cmd = require('node-cmd');

cmd.get(
    'adb shell "ps | grep balefire"',
   (err, data, stderr) => {
    //    response = data.split(' ');
       console.log(data);
   }
);
