"use strict";
const events_1 = require('events');
const ws_1 = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
process.on('message', message => {
    if (message.cmd == 'init')
        new Instance(message.config);
});
class Instance extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.modules = {};
        for (let dir of fs.readdirSync(config.moduledir))
            this.modules[dir] = require(path.resolve(config.moduledir, dir))(config);
        this.expressApp = express();
        this.expressApp.use(this.handleHttp.bind(this));
        this.httpServer = http.createServer(this.expressApp);
        this.webSocketServer = new ws_1.Server({ server: this.httpServer });
        this.webSocketServer.on('connection', this.handleWs.bind(this));
        this.httpServer.listen(config.port, config.host, () => this.log('listening'));
    }
    log(x) { console.log(`[${process.pid}][${new Date().toJSON()}] `, x); }
    handleHttp(req, res, next) {
        if (req.headers['content-type'] === 'application/json') {
            let jsonString = '';
            req.on('data', d => jsonString += d);
            req.on('end', () => {
                let json = JSON.parse(jsonString);
                this.modules[json.module](json);
            });
        }
        else if (req.headers['content-type'] === 'victorai/stream')
            this.modules[req.headers['victorai-module']].call(this, req);
    }
    handleWs(socket) {
        socket.on('message', message => this.modules[message.module].call(this, message));
    }
}
