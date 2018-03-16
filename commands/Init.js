'use strict'

const fs = require('fs');
const path = require('path')
const BaseCommand = require('./Base');
const { copyFile } = require('../src/utils');

/**
 * Initialize all necessary boilerplates for the queue
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
class InitCommand extends BaseCommand {

    static get description() {
        return "Initialize queue requirements";
    }

    static get signature() {
        return "queue:init";
    }

    async handle() {
        // copy over sample configs and server files to respective directory
        try {
            await copyFile(path.join(__dirname, '../src/templates/config.tmpl'),
                this._helpers.appRoot() + "/config/queue.js");

            await copyFile(path.join(__dirname, '../src/templates/queue.tmpl'),
                this._helpers.appRoot() + "/start/queue.js");

            await copyFile(path.join(__dirname, '../src/templates/queue_server.tmpl'),
                this._helpers.appRoot() + "/queue_server.js");

            this.success('Queue initialized successfully!');

        } catch (e) {
            console.error(e);

            this.error('Failed to initialize queue with error: ' + e.message);
        }
    }

}

module.exports = InitCommand;