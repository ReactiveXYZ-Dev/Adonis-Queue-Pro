'use strict'

const { fork } = require('child_process');
const Ioc = require('adonis-fold').Ioc;
const BaseCommand = Ioc.use('Adonis/Src/Command');

/**
 * Launch queue workers to start processing
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class WorkCommand extends BaseCommand {
	

	get signature() {
		return "queue:work {numWorkers?:Number of workers to start with default of 1}"
	}

	/**
	 * Inject adonis app for dependency resolution
	 * @param  {Adonis/App} app
	 */
	constructor(app) {
		this._app = app;
		this._helpers = this._app.use('Adonis/Src/Helpers');
	}

	* handle({ numWorkers }) {

		numWorkers = parseInt(numWorkers);

		for (let i = 1; i <= numWorkers; ++i) {
			const worker = fork(this._helpers.basePath() + "/bootstrap/queue.js");
			worker.stdout.on('data', message => {
				console.log(message);
			});
			worker.stderr.on('data', message => {
				console.log(message);
			});
		}

		this.success('Workers are running...');

	}
}

module.exports = WorkCommand;
