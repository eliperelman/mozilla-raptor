setup(function(options) {
  options.phase = 'reboot';
});

afterEach(function(phase) {
  var promise = phase.waitForFilesize();
  phase.device.log.filesize(phase.options.remoteFile, 'system.gaiamobile.org');
  return promise;
});
