"use strict";
const events_1 = require('events');
const cluster = require('cluster');
const fs = require('fs');
const os = require('os');
const mkdirp = require('mkdirp');
class AIService extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.installdir = `${process.env.USERPROFILE}/.victorai`;
        this.configFile = `${this.installdir}/.vconfig.json`;
        this.workers = [];
        // Overwrite default config file if one was specified
        if (options.configFile)
            this.configFile = options.configFile;
        // Try to load config file
        try {
            this.config = require(this.configFile);
        }
        catch (err) {
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
            require('copy')('dist/modules/**/*', this.config.moduledir, () => { });
            fs.writeFileSync(this.configFile, JSON.stringify(this.config));
        }
        // Set up the cluster
        cluster.setupMaster({ exec: './dist/worker.js' });
        let workers = this.workers;
        let config = this.config;
        for (let i = 0; i < this.config.instances; i++)
            (function fork() {
                // Create a new worker
                let worker = cluster.fork();
                // Send initialization configuration
                worker.send({ cmd: 'init', config: config });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AIService;
