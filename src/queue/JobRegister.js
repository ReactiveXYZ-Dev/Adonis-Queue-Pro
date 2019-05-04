'use strict';

const dir = require('node-dir');
const { JobDirectoryNotFoundException, JobProcessError } = require('../errors');

/**
 * Register and preload consumer processes
 *
 * @version 2.0.0
 * @adonis-version 4.0+
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
					   	const e = new JobDirectoryNotFoundException("Consumer/Producer directory not found. Please make sure to create job with ./ace queue:job")
				   		return Promise.reject(e.setError(error));
				   });
	}

	/**
	 * Get all job file paths
	 * @return {Promise<String>} File paths
	 */
	_jobFilePaths() {
		let consumerPath = this._config.get('queue.consumerPath');
		return dir.promiseFiles(consumerPath ? consumerPath : this._helpers.appRoot() + '/app/Jobs/Consumers');
	}

	/**
	 * Require all available jobs and process them
	 * @param  {Array} filePaths Job class files
	 * @return {Void}
	 */
	_requireAndProcessJobs(filePaths) {
		filePaths.forEach(path => {
			let Job = require(path);
			const concurrency = Job.concurrency ? Job.concurrency : 1;
			
			this.queue.process(
				Job.type, 
				concurrency, 
				(job, ctx, done) => {
					// recreate the job and apply the handle function
   					let appJob = new Job(job.data);
					try {
						let res = appJob.handle.apply(appJob);

						if (res instanceof Promise) {
							res.then(
								success => done(null, {
									'res': success
								}),
								error => {
									let e = new JobProcessError(`Failed to process job ${Job.name}!`);
									done(e.setError(error));
								}
							);
						} else {
							// just a regular call
							done(null, {
								'res': res
							});
						}
					} catch (error) {
						let e = new JobProcessError(`Failed to process job ${Job.name}!`);
						done(e.setError(error));
					}
   			});
   		});
	}
}

module.exports = JobRegister;
