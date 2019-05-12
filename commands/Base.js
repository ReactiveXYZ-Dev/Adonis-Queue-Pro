'use strict'

const dir = require('node-dir');
const { Command } = require('@adonisjs/ace');
const { dirExistsSync } = require('../src/utils');

/**
 * Convenient base class for all commands
 * 
 * @version 2.0.0
 * @adonis-version 4.0+
 */
class BaseCommand extends Command {

    /**
     * Inject adonis services into command
     * @param {Adonis/Src/Helpers} Helpers 
     * @param {Adonis/Src/Config} Config 
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
    static get inject() {
        return ['Adonis/Src/Helpers', 'Adonis/Src/Config']
    }

	/**
	 * Check whether queue:init has run
	 * @return {Boolean}
	 */
    hasInitialized() {
        return Boolean(this._config.get('queue'));
    }

	/**
	 * Check whether the app has job files
	 * @return {Boolean}
	 */
    hasJobs() {
        // load from defined job path
        const consumerPath = this._config.get('queue.consumerPath');
        const producerPath = this._config.get('queue.producerPath');

        if (!dirExistsSync(consumerPath) || !dirExistsSync(producerPath)) {
            return false;
        }

        let files = dir.files(consumerPath, { sync: true });
        if (!files || files.length == 0) return false;

        files = dir.files(producerPath, { sync: true });
        if (!files || files.length == 0) return false;

        return true;
    }

}

module.exports = BaseCommand;
