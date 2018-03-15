'use strict';

const co = require('co');
const dir = require('node-dir');

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
				   		return Promise.reject(error);
				   });
	}

	/**
	 * Get all job file paths
	 * @return {Promise<String>} File paths
	 */
	_jobFilePaths() {
		return dir.promiseFiles(this._config.get('queue.consumerPath') ? 
				this._config.get('queue.consumerPath') : this._helpers.appPath() + 'Jobs/Consumers'
			);
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
					let res = appJob.handle.apply(appJob);

					// check if the function is async
					if (res instanceof Promise) {
						res.then(
							success => {
								done(null, {
									'res': success
								});
							},
							error => done(error)
						);
					} else {
						// just a regular call that returns bool
						if (!res) {
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