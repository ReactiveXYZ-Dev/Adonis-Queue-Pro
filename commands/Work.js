'use strict'

const { fork } = require('child_process');
const BaseCommand = require('./BaseCommand');

/**
 * Launch queue workers to start processing
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class WorkCommand extends BaseCommand {
	
	get description() {
		return "Start one or more workers";
	}

	get signature() {
		return "queue:work {numWorkers?:Number of workers to start with default of 1}"
	}

	* handle({ numWorkers }) {

		if (!this.hasInitialized()) {
			this.error("Please run queue:init before processing!");

			return;
		}

		numWorkers = parseInt(numWorkers);

		for (let i = 1; i <= numWorkers; ++i) {
			const worker = fork(this._helpers.basePath() + "/bootstrap/queue.js");
			worker.stdout.on('data', message => {
				console.log(message);
			});
			worker.stderr.on('data', message => {
				console.error(message);
			});
		}

		this.success('Workers are running...');

		// prevent the main process from exiting...
		setInterval(() => {}, 1000);
	}
}

module.exports = WorkCommand;
