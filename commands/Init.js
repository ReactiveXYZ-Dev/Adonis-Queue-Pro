'use strict'

const Ioc = require('adonis-fold').Ioc;
const BaseCommand = Ioc.use('Adonis/Src/Command');

/**
 * Initialize all necessary boilerplates for the queue
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class InitCommand extends BaseCommand {
	
	/**
	 * Inject adonis app for dependency resolution
	 * @param  {Adonis/App} app
	 */
	constructor(app) {
		this._app = app;
	}

	
}

module.exports = InitCommand;
