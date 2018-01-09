'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider;

/**
 * Provider for inject Queue service into the Adonis Ioc
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

class QueueProvider extends ServiceProvider {

	/**
	 * Register a Queue instance
	 */
	* register() {
		const Queue = require('../src/queue/Driver');
		this.app.singleton('Adonis/Addon/Queue', app => {
			return new Queue(app); 
		});
	}
};

module.exports = QueueProvider;