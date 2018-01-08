'use strict'

const util = require('util');
const copyFile = util.promsify(require('fs').copyFile);
const Ioc = require('adonis-fold').Ioc;
const BaseCommand = Ioc.use('Adonis/Src/Command');

/**
 * Generate producer/consumer pair for new jobs
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class GenerateCommand extends BaseCommand {
	

	get signature() {
		return "queue:generate {job:Unique name of job to process}"
	}

	/**
	 * Inject adonis app for dependency resolution
	 * @param  {Adonis/App} app
	 */
	constructor(app) {
		this._app = app;
	}
	
}

module.exports = GenerateCommand;
