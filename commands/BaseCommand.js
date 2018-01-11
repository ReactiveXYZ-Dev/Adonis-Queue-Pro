const path = require('path');
const dir = require('node-dir');
const Ioc = require('adonis-fold').Ioc;
const BaseCommand = Ioc.use('Adonis/Src/Command');
const { dirExistsSync } = require('../src/utils');

/**
 * Convenient base class for all commands
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */
class Command extends BaseCommand {

	/**
	 * Inject adonis dependencies into the command
	 * @param  {Adonis/Src/Helpers} Helpers
	 * @param  {Adonis/Src/Config} Config 
	 */
	constructor(Helpers, Config) {
		super();

		this._helpers = Helpers;
		this._config = Config;
	}


	/**
	* injections from IoC container required to
	* be injected inside the contructor
	*
	* @return {Array}
	*
	* @public
	*/
	static get inject () {
		return ['Adonis/Src/Helpers', 'Adonis/Src/Config']
	}

	/**
	 * Check whether the queue has finished setup
	 * @return {Boolean}
	 */
	hasInitialized() {

		return Boolean(this._config.get('queue'));
	}

	/**
	 * Check whether the app has jobs
	 * @return {Boolean}
	 */
	hasJobs() {

		const consumerPath = this._config.get('queue.consumerPath');
		const producerPath = this._config.get('queue.producerPath');

		if (!dirExistsSync(consumerPath) || !dirExistsSync(producerPath)) {
			return false;
		}

		let files = dir.files(consumerPath, { sync: true });
		if (files.length == 0) return false;

		files = dir.files(producerPath, { sync: true });
		if (files.length == 0) return false;

		return true;

	}

}

module.exports = Command;