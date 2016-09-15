import { EventEmitter } from 'events';
import * as cluster from 'cluster';
import * as uuid from 'uuid';
import * as fs from 'fs';
import * as os from 'os';
import * as mkdirp from 'mkdirp';

export default class AIService extends EventEmitter {

  private port: number;
  private host: string;
  private config: Configuration;
  private installdir = `${process.env.USERPROFILE}/.victorai`;
  private configFile = `${this.installdir}/.vconfig.json`;
  private workers: cluster.Worker[] = [];

  constructor(options: { configFile?: string } = {}) {

    super();

    // Overwrite default config file if one was specified
    if(options.configFile)
      this.configFile = options.configFile;

    // Try to load config file
    try {
      this.config = require(this.configFile);
    } catch (err) {
      // If the file did not exist, create a Configuration object with default
      // values and write to disk
      this.config = {
        host: 'localhost',
        port: 27000,
        mongodb: 'mongodb://localhost:27017/ai',
        instances: os.cpus().length,
        moduledir: `${this.installdir}/modules`
      };
      mkdirp.sync(this.installdir);
      mkdirp.sync(this.config.moduledir);
      require('copy')('dist/modules/**/*', this.config.moduledir, () => {});
      fs.writeFileSync(this.configFile, JSON.stringify(this.config));
    }

    // Set up the cluster
    cluster.setupMaster({ exec: './dist/worker.js' });

    let workers = this.workers;
    let config = this.config;

    for(let i = 0; i < this.config.instances; i++)
      (function fork() {

        // Create a new worker
        let worker = cluster.fork();

        // Send initialization configuration
        worker.send({ cmd: 'init', config });

        // Register
        workers.push(worker);

        // On close by any cause, fork another one and unregister
        worker.on('close', () => {
          workers.splice(workers.indexOf(worker), 1);
          fork();
        });

      })();

  }

}
