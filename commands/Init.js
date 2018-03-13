'use strict'

const fs = require('fs');
const path = require('path')
const { copyFile } = require('../src/utils');
const BaseCommand = require('./BaseCommand');

/**
 * Initialize all necessary boilerplates for the queue
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
class InitCommand extends BaseCommand {

    get description() {
        return "Initialize queue requirements";
    }

    get signature() {
        return "queue:init";
    }

    async handle() {
        // copy over sample configs and server files to respective directory
        try {
            await copyFile(path.join(__dirname, '../src/templates/config.tmpl'),
                this._helpers.basePath() + "/config/queue.js");

            await copyFile(path.join(__dirname, '../src/templates/queue.tmpl'),
                this._helpers.basePath() + "/start/queue.js");

            await copyFile(path.join(__dirname, '../src/templates/queue_server.tmpl'),
                this._helpers.basePath() + "/queue_server.js");

            this.success('Queue initialized successfully!');

        } catch (e) {
            console.error(e);

            this.error('Failed to initialize queue with error: ' + e.message);
        }
    }

}