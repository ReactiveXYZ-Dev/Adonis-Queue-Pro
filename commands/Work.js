'use strict'

const Ioc = require('adonis-fold').Ioc;
const BaseCommand = Ioc.use('Adonis/Src/Command');

/**
 * Launch queue workers to start processing
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class WorkCommand extends BaseCommand {
	
	/**
	 * Inject adonis app for dependency resolution
	 * @param  {Adonis/App} app
	 */
	constructor(app) {
		this._app = app;
	}

	
}

module.exports = WorkCommand;
