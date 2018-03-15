'use strict';

const randomString = require("randomstring");

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
		return this.kueJob;
	}

	/**
	 * Inject the app job
	 * @param {App/Job} job
	 */
	setAppJob(job) {
		this.job = job;
		return this;
	}

	/**
	 * Inject the Kue queue
	 * @param {Queue} queue
	 */
	setQueue(queue) {
		this.queue = queue;
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
		this.job.data['_uuid'] = this.job.constructor.type + randomString.generate(8);
		this.kueJob = this.queue.createJob(
			this.job.constructor.type, 
			this.job.data
		);
		return this;
	}

	/**
	 * Set priority for the job
	 * @return {this}
	 */
	assignPriority() {
		if (this.job.priority) {
			this.kueJob.priority(this.job.priority);
		}
		return this;
	}

	/**
	 * Set failure attempts for the job
	 * @return {this}
	 */
	assignFailureAttempts() {
		if (this.job.attempts) {
			this.kueJob.attempts(this.job.attempts);
		}
		return this;
	}

	/**
	 * Set failure backoff for the job
	 * @return {this}
	 */
	assignFailureBackoff() {
		if (this.job.backoff) {
			this.kueJob.backoff(this.job.backoff);
		}
		return this;
	}

	/**
	 * Set job delay
	 * @return {this}
	 */
	assignDelay() {
		if (this.job.delay) {
			this.kueJob.delay(this,job.delay * 1000);
		}
		return this;
	}

	/**
	 * Set Time to live for the job
	 * @return {this}
	 */
	assignTTL() {
		if (this.job.ttl) {
			this.kueJob.ttl(this.job.ttl * 1000);
		}
		return this;
	}

	/**
	 * Set uniqueness of this job
	 * @return {this}
	 */
	assignUnique() {
		if (this.job.unique) {
			this.kueJob.unique(this.job.data['_uuid']);
		}
		return this;
	}

	/**
	 * Assign event listeners for the job
	 * @return {this}
	 */
	assignEventListeners() {

		let events = ['enqueue', 'start', 'promotion', 'progress', 
					'failed attempts', 'failed', 'complete', 'remove'];

		// register unique job listeners
		if (this.job.unique) {
			this.queue.on('already scheduled', scheduledJob => {
			   this._bindJobEventListeners(scheduledJob, true);
			});
		}

		// for all jobs
		this.queue.on("schedule success", scheduledJob => {
			this._bindJobEventListeners(scheduledJob, false);
		});

		return this;

	}

	/**
	 * Bind job-level event listeners
	 * @param  {Kue/Job} scheduledJob     Kue job
	 * @param  {Bool} alreadyScheduled
	 * @return {Void}
	 */
	_bindJobEventListeners(scheduledJob, alreadyScheduled) {

		// check job match
		if (scheduledJob.data['_uuid'] != this.job.data['_uuid'] || 
			this.job.constructor.type != scheduledJob.type) {
			return;
		}

		// trigger the init action and pass in the scheduled job
		// if a job is unique, then onInit is only triggered once
		if (!this.job.kueId && this.job.onInit && scheduledJob.id) {
			this.job.onInit(scheduledJob);
			if (this.job.unique) {
				// save id for unique jobs since it will be reused
				this.job.kueId = scheduledJob.id;
			}
		}

		// add event listeners 
		events.forEach(event => {

			let tokens = event.split(' ').map(word => {
				return word[0].toUpperCase() + word.slice(1);
			});

			// merge to capitalized case
			const eventName = "on" + tokens.join("");
			// check if the App job has registered the event listener
			if (this.job[eventName]) {
				if (alreadyScheduled) {
					// if already scheduled event fired
					// trigger respective event directly
					if (event == 'failed' || event == 'failed attempts') {
						this.job[eventName](scheduledJob._error);
					} else if (event == 'enqueue' || event == 'start' || 
								event == 'promotion' || event == 'remove') {
						this.job[eventName](scheduledJob.type);
					} else if (event == 'progress') {
						this.job[eventName](scheduledJob.progress);
					} else {
						this.job[eventName](scheduledJob.result);
					}
				} else {
					// bind event for schedule success
					scheduledJob.on(event, (...args) => {
						this.job[eventName](args);
					});
				}
			}
		});

	}
	
}

module.exports = JobMaker;