import AIService from '../AIService';
import * as program from 'commander';
import * as path from 'path';

let packageInfo = require('../../package');

program.version(packageInfo.version);

program.option('-c, --config [file]');

program.parse(process.argv);

let service = new AIService({
  configFile: program['config'] && path.resolve(program['config'])
});
