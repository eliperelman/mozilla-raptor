'use strict';

let path = require('path');
let R = require('ramda');
let test = require('./lib');
let utils = require('./lib/utils');

let normalize = R.evolve({
  app: utils.toFQDN,
  homescreen: utils.toFQDN,
  metrics: utils.toAbsolute,
  system: utils.toFQDN,
  nameOrPath: utils.findTest,
  logcat: utils.toAbsolute
});

module.exports = cli => {
  return cli
    .command('test <nameOrPath>')
    .description('Run a performance test by name or path location')
    .option('--runs [number]', 'Number of times to run a test and aggregate results', 1)
    .option('--app [origin]', 'Specify the origin or gaiamobile.org prefix of an application to test')
    .option('--entryPoint [entrance]', 'Specify an application entrance point other than the default')
    .option('--homescreen [origin]', 'Specify the origin or gaiamobile.org prefix of an application that is the device homescreen', 'homescreen.gaiamobile.org')
    .option('--system [origin]', 'Specify the origin or gaiamobile.org prefix or an application that is the system application', 'system.gaiamobile.org')
    .option('--serial [serial]', 'Target a specific device for testing')
    .option('--adbHost [host]', 'Connect to a device on a remote host. Tip: use with --adbPort', '')
    .option('--adbPort [port]', 'Port for connecting to a device on a remote host. Use with --adbHost', 0)
    .option('--marionetteHost [host]', 'Connect to Marionette on a remote host. Tip: use with --marionettePort', 'localhost')
    .option('--marionettePort [port]', 'Port for connecting to Marionette on a remote host. Use with --marionetteHost', 2828)
    .option('--forwardPort [port]', 'Forward an adb port to the --marionettePort', 0)
    .option('--metrics [filepath]', 'File location to store historical test metrics', path.join(process.cwd(), 'metrics.ldjson'))
    .option('--output [mode]', 'stdout output mode: console, json, quiet', 'console')
    .option('--timeout [milliseconds]', 'Time to wait between runs for success to occur', 60000)
    .option('--retries [number]', 'Number of times to retry a test or run if a failure or timeout occurs', 1)
    .option('--time [epochMilliseconds]', 'Override the start time and UID of the test', Date.now())
    .option('--logcat [path]', 'Write the output from logcat to a file')
    .option('--launchDelay [milliseconds]', 'Time to wait between subsequent application launches', 10000)
    .option('--memoryDelay [milliseconds]', 'Time to wait before capturing memory after application fully loaded', 0)
    .option('--scriptTimeout [milliseconds]', 'Time to wait when running scripts via Marionette', 10000)
    .option('--connectionTimeout [milliseconds]', 'Marionette driver TCP connection timeout threshold', 2000)
    .action(function(args) {
      return Promise
        .resolve(R.merge({ nameOrPath: args.nameOrPath }, cli.getOptions(this)))
        .then(normalize)
        .then(test)
        .catch(err => console.error(err.stack || err));
    });
};
