'use strict'

const fs = require('fs');
const util = require('util');
const copyFile = util.promisify(fs.copyFile);
const Ioc = require('adonis-fold').Ioc;
const BaseCommand = Ioc.use('Adonis/Src/Command');

/**
 * Initialize all necessary boilerplates for the queue
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class InitCommand extends BaseCommand {
	

	get signature() {
		return "queue:init";
	}

	/**
	 * Inject adonis app for dependency resolution
	 * @param  {Adonis/App} app
	 */
	constructor(app) {
		this._app = app;
		this._helpers = this._app.use('Adonis/Src/Helpers');
	}

	* handle(args, options) {
		// copy over sample configs and server 
		// files to respective directory
		try {
			yield copyFile('../src/templates/config.tmpl', 
					this._helpers.configPath('queue.js'));

			yield copyFile('../src/templates/server.tmpl',
					this._helpers.basePath() + "/bootstrap/queue.js");

			this.success('Queue initialization success!');

		} catch (e) {
			console.error(e);
			
			this.error('Failed to initialize queue with error: ' + e.message);
		}
	}
		
}

module.exports = InitCommand;
