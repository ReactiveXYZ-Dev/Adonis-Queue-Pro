'use strict'

const fs = require('fs');
const util = require('util');
const path = require('path');
const mustache = require('mustache');
const { copyFile, readFile, writeFile, dirExistsSync, createDir } = require('../src/utils');
const { paramCase } = require('change-case');
const BaseCommand = require('./Base');

/**
 * Generate producer/consumer pair for new jobs
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */

class JobCommand extends BaseCommand {

    get description() {
        return "Create a new job";
    }

    get signature() {
        return "queue:job {jobName:Name of job to process} {--jobId=@value}"
    }

    async handle({ jobName }, { jobId }) {

        if (!this.hasInitialized()) {
            this.error("Please run queue:init before creating job!");
            return;
        }

        if (!jobId) {
            jobId = paramCase(jobName);
        }

        try {
            // parse respective templates
            const producerTmpl = await readFile(path.join(__dirname, '../src/templates/producer.tmpl'), 'utf8');
            const producerTask = mustache.render(producerTmpl, {
                jobName, jobId
            });
            const consumerTmpl = await readFile(path.join(__dirname, '../src/templates/consumer.tmpl'), 'utf8');
            const consumerTask = mustache.render(consumerTmpl, {
                jobName, jobId
            });

            // save into selected directory
            const consumerPath = this._config.get('queue.consumerPath');
            const producerPath = this._config.get('queue.producerPath');

            if (!dirExistsSync(consumerPath)) {
                await createDir(consumerPath);
            }

            if (!dirExistsSync(producerPath)) {
                await createDir(producerPath);
            }

            await writeFile(`${consumerPath}/${jobName}.js`, consumerTask);
            await writeFile(`${producerPath}/${jobName}.js`, producerTask);

            this.success("Job has been created");

        } catch (e) {
            console.error(e);

            this.error("Failed to generate job classes with error " + e.message);
        }


    }

}

module.exports = GenerateCommand;
