import * as cp from 'child_process';

var config: Configuration;

export = function(_config: Configuration) {
  config = _config;
  return handler;
}

function handler(message) {
  let gitUrl = message.params[0];
  cp.execSync(`cd ${this.config.moduledir} && git clone ${gitUrl}`);
}
