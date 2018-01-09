'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider;

/**
 * Provider for injecting Ace commands into the app
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class CommandProvider extends ServiceProvider {
	
	constructor() {
		super()
		// define types of commands
		// init: copy queue server boostrapper, sample configuration, and create default job path 
		// generate: create a producer consumer job pair with name
		// work: start queue listeners with optional number of instances
		this._commands = ['Init', 'Generate', 'Work'];
	}

	* register() {
		this._commands.forEach(command => {
			this.app.bind(`Adonis/Commands/Queue:${command}`, app => {
				const Command = require(`../commands/${command}`);
				return new Command(app.use('Adonis/Src/Helpers'), app.use('Adonis/Src/Config'));
			});
		});
	}
	
}

module.exports = CommandProvider;