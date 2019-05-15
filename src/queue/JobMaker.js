'use strict';

const kue = require('kue');
const randomString = require("randomstring");
const { JobFetchError } = require("../errors");

/**
 * Parse producer job contents and generate kue job
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
class JobMaker {
	
	/**
	 * Get the final made job
	 * @return {Kue/Job}
	 */
	getFinalJob() {
		return this._kueJob;
	}

	/**
	 * Inject the app job
	 * @param {App/Job} job
	 */
	setAppJob(job) {
		this._job = job;
		return this;
	}

	/**
	 * Inject the Kue queue
	 * @param {Queue} queue
	 */
	setQueue(queue) {
		this._queue = queue;
		return this;
	}

	/**
	 * Run through the making procedures
	 * @return {this}
	 */
	process() {
		return this.initialize()
				   .assignPriority()
				   .assignFailureAttempts()
				   .assignFailureBackoff()
				   .assignFailureBackoff()
				   .assignDelay()
				   .assignTTL()
				   .assignUnique()
				   .assignEventListeners();
	}

	/**
	 * Initalize the Kue Job
	 * @param  {App/Job} job
	 * @return {this}
	 */
	initialize() {
		// generate an UUID for this job along with its type
		this._job.data['__unique_id__'] = this._job.constructor.type + randomString.generate(15);
		this._kueJob = this._queue.createJob(
			this._job.constructor.type, 
			this._job.data
		);
		return this;
	}

	/**
	 * Set priority for the job
	 * @return {this}
	 */
	assignPriority() {
		if (this._job.priority) {
			this._kueJob.priority(this._job.priority);
		}
		return this;
	}

	/**
	 * Set failure attempts for the job
	 * @return {this}
	 */
	assignFailureAttempts() {
		if (this._job.attempts) {
			this._kueJob.attempts(this._job.attempts);
		}
		return this;
	}

	/**
	 * Set failure backoff for the job
	 * @return {this}
	 */
	assignFailureBackoff() {
		if (this._job.backoff) {
			this._kueJob.backoff(this._job.backoff);
		}
		return this;
	}

	/**
	 * Set job delay
	 * @return {this}
	 */
	assignDelay() {
		if (this._job.delay) {
			this._kueJob.delay(this,job.delay * 1000);
		}
		return this;
	}

	/**
	 * Set Time to live for the job
	 * @return {this}
	 */
	assignTTL() {
		if (this._job.ttl) {
			this._kueJob.ttl(this._job.ttl * 1000);
		}
		return this;
	}

	/**
	 * Set uniqueness of this job
	 * @return {this}
	 */
	assignUnique() {
		if (this._job.unique) {
			this._kueJob.unique(this._job.data['__unique_id__']);
		}
		return this;
	}

	/**
	 * Assign event listeners for the job
	 * @return {this}
	 */
	assignEventListeners() {
		let events = [
		  'enqueue', 'start', 'promotion', 'progress',
		  'failed attempts', 'failed', 'complete', 'remove'
		];
		events.forEach(event => {
			this._queue.on(`job ${event}`, (id, ...args) => {
				kue.Job.get(id, (err, job) => {
					if (!err) {
						if (job.data['__unique_id__'] === this._job.data['__unique_id__']) {
						  const eventName = "on" + event.split(' ').map(word => {
						    return word[0].toUpperCase() + word.slice(1);
						  }).join('');
						  if (event === 'enqueue') {
						    this._job.onInit(job);
						  }
						  if (this._job[eventName]) {
						    this._job[eventName](...args);
						  }
						} 
					} else if (this._job['onFailed']) {
					  this._job.onFailed(new JobFetchError(`Failed to fetch job id ${id}, event ${event}`).setError(err).updateMessage());
					}
					
				});
			});
		});
		return this;
	}

}

module.exports = JobMaker;
