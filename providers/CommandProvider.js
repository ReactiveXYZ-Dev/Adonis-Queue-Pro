'use strict'

/**
 * Provider for injecting Ace commands into the app
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

const ServiceProvider = require('adonis-fold').ServiceProvider;

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
				return new Command(app);
			});
		});
	}
	
}

module.exports = CommandProvider;