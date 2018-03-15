'use strict'

const { ServiceProvider } = require('@adonisjs/fold');
const Queue = require('../src/queue/Driver');

/**
 * Provider for inject Queue service into the Adonis Ioc
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */

class QueueProvider extends ServiceProvider {

	/**
	 * Register a Queue instance
	 */
    register() {
        this.app.singleton('Adonis/Addon/Queue', app => {
            return new Queue(app);
        });
    }
};

module.exports = QueueProvider;