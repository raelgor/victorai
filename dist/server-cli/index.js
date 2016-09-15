"use strict";
const AIService_1 = require('../AIService');
const program = require('commander');
const path = require('path');
let packageInfo = require('../../package');
program.version(packageInfo.version);
program.option('-c, --config [file]');
program.parse(process.argv);
let service = new AIService_1.default({
    configFile: program['config'] && path.resolve(program['config'])
});
