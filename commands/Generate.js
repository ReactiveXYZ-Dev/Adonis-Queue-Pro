'use strict'

const fs = require('fs');
const util = require('util');
const mustache = require('mustache');
const copyFile = util.promisify(fs.copyFile);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const { paramCase } = require('change-case');
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
		return "queue:generate {job:Name of job to process} {--id=@value}"
	}

	/**
	 * Inject adonis app for dependency resolution
	 * @param  {Adonis/App} app
	 */
	constructor(app) {
		this._app = app;
		this._helpers = this._app.use('Adonis/Src/Helpers');
		this._config = this._app.use('Adonis/Src/Config');
	}

	* handle({ job }, { name }) {

		let jobClassName = job;
		let jobId = name;

		if (!jobId) {
			jobId = paramCase(job);
		}

		try {
			// parse respective templates
			const producerTmpl = yield readFile('../src/templates/producer.tmpl', 'utf8');
			const producer = mustache.render(producerTmpl, {
				jobClassName, jobId
			});
			const consumerTmpl = yield readFile('../src/templates/consumer.tmpl', 'utf8');
			const producer = mustache.render(consumerTmpl, {
				jobClassName, jobId
			});

			// save into selected directory
			const consumerPath = this._config.get('queue.consumerPath');
			const producerPath = this._config.get('queue.producerPath');

			yield writeFile(consumerPath, consumer);
			yield writeFile(producerPath, producer);

			this.success("Job has been created");

		} catch (e) {
			console.error(e.message);

			this.error("Failed to generate job classes with error " + e.message);
		}
		

	}
	
}

module.exports = GenerateCommand;
