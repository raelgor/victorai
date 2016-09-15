"use strict";
const cp = require('child_process');
var config;
function handler(message) {
    let gitUrl = message.params[0];
    cp.execSync(`cd ${this.config.moduledir} && git clone ${gitUrl}`);
}
module.exports = function (_config) {
    config = _config;
    return handler;
};
