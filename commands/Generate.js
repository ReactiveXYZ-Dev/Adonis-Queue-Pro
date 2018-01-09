'use strict'

const fs = require('fs');
const util = require('util');
const path = require('path');
const mustache = require('mustache');
const { copyFile, readFile, writeFile, dirExistsSync, createDir } = require('../src/utils'); 
const { paramCase } = require('change-case');
const BaseCommand = require('./BaseCommand');

/**
 * Generate producer/consumer pair for new jobs
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class GenerateCommand extends BaseCommand {

	get signature() {
		return "queue:generate {jobName:Name of job to process} {--jobId=@value}"
	}

	* handle({ jobName }, { jobId }) {

		if (!jobId) {
			jobId = paramCase(jobName);
		}

		try {
			// parse respective templates
			const producerTmpl = yield readFile(path.join(__dirname, '../src/templates/producer.tmpl'), 'utf8');
			const producerTask = mustache.render(producerTmpl, {
				jobName, jobId
			});
			const consumerTmpl = yield readFile(path.join(__dirname, '../src/templates/consumer.tmpl'), 'utf8');
			const consumerTask = mustache.render(consumerTmpl, {
				jobName, jobId
			});

			// save into selected directory
			const consumerPath = this._config.get('queue.consumerPath');
			const producerPath = this._config.get('queue.producerPath');

			if (! dirExistsSync(consumerPath) ) {
				yield createDir(consumerPath);
			}

			if (! dirExistsSync(producerPath) ) {
				yield createDir(producerPath);
			}

			yield writeFile(`${consumerPath}/${jobName}.js`, consumerTask);
			yield writeFile(`${producerPath}/${jobName}.js`, producerTask);

			this.success("Job has been created");

		} catch (e) {
			console.error(e.stack);

			this.error("Failed to generate job classes with error " + e.message);
		}
		

	}
	
}

module.exports = GenerateCommand;
