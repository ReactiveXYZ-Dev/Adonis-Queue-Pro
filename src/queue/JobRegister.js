'use strict';

const co = require('co');
const dir = require('node-dir');
const isGenerator = require('is-generator-function');

/**
 * Register and preload consumer processes
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */
class JobRegister {
	
	/**
	 * Inject adonis app for accessing dynamic data
	 * @param  {Adonis/Src/Config} config
	 * @param {Adonis/Src/Helpers} helpers
	 */
	constructor(Config, Helpers) {
		this._config = Config;
		this._helpers = Helpers;
	}

	/**
	 * Inject Kue Queue into the app
	 * @param {Kue/Queue} queue
	 */
	setQueue(queue) {
		this.queue = queue;
		return this;
	}

	/**
	 * Load all job classes aynchronously 
	 * @return {Promise}
	 */
	listenForAppJobs() {

		return this._jobFilePaths()

				   .then(filePaths => {

				   		this._requireAndProcessJobs(filePaths);

				   		return Promise.resolve({
				   			message: "Preprocessed jobs and started queue listener!"
				   		});

				   }, error => { 
				   		return Promise.reject(error);
				   })

	}

	/**
	 * Get all job file paths
	 * @return {Promise<String>} File paths
	 */
	_jobFilePaths() {

		return dir.promiseFiles(this._config.get('queue.consumerPath') ? 
								this._config.get('queue.consumerPath') : this._helpers.appPath() + 'Jobs/Consumers');

	}

	/**
	 * Require all available jobs and process them
	 * @param  {Array} filePaths Job class files
	 * @return {Void}
	 */
	_requireAndProcessJobs(filePaths) {

		filePaths.forEach(path => {

   			let Job = require(path);

   			this.queue.process(Job.type, Job.concurrency ? Job.concurrency : 1, (job, ctx, done) => {

   				let appJob = new Job(job.data);

   				if (isGenerator(appJob.handle)) {

   					co(appJob.handle.bind(appJob)).then(
						success => {
							done(null, {
								'res': success
							});
						},
						error => done(error)
					);
   				} else {
   					let res = appJob.handle();
   					if (res === false) {
   						done(new Error(`Failed to process job ${Job.name}!`))
   					} else {
   						done(null, {
   							'res': res
   						});
   					}
   				}

   			});

   		});

	}


}

module.exports = JobRegister;