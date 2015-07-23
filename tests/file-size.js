setup(function(options) {
  options.phase = 'reboot';
});

afterEach(function(phase) {
  var promises = Promise.all([
    phase.waitForFilesize()
  ]);

  phase.device.log.filesize(phase.options.b2gfile);

  return promises;	
});
