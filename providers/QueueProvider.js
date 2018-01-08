'use strict'

/**
 * Provider for inject Queue service into the Adonis Ioc
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

const ServiceProvider = require('adonis-fold').ServiceProvider;
const Queue = require('./src/queue/Driver');

class QueueProvider extends ServiceProvider {

	/**
	 * Register a singleton Queue instance
	 */
	* register() {
		this.app.singleton('Adonis/Src/Queue', app => {
			return new Queue(app); 
		});
	}
};

module.exports = QueueProvider;