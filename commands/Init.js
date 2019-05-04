'use strict'

const path = require('path')
const BaseCommand = require('./Base');
const { copyFile, dirExistsSync, createDir } = require('../src/utils');

/**
 * Initialize all necessary boilerplates for the queue
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
class InitCommand extends BaseCommand {

    static get description() {
        return "Initialize queue configuration";
    }

    static get signature() {
        return "queue:init";
    }

    async handle() {
        
        try {
            // copy over sample configs and server files to respective directory
            const tmplPath = path.join(__dirname, '../src/templates');
            await copyFile(path.join(tmplPath, 'config.tmpl'),
                this._helpers.appRoot() + "/config/queue.js");

            await copyFile(path.join(tmplPath, 'queue.tmpl'),
                this._helpers.appRoot() + "/start/queue.js");

            await copyFile(path.join(tmplPath, 'queue_server.tmpl'),
                this._helpers.appRoot() + "/queue_server.js");

            // copy over test files
            const testPath = this._helpers.appRoot() + '/test';
            if (!dirExistsSync(testPath)) {
                await createDir(testPath);
            }

            await copyFile(
                path.join(__dirname, '../src/templates/test/adonis-queue-pro-tests.tmpl'), 
                testPath + '/adonis-queue-pro-tests.js');

            this.success('Queue initialized successfully!');

        } catch (e) {
            console.error(e);

            this.error('Failed to initialize queue with error: ' + e.message);
        }
    }

}

module.exports = InitCommand;
