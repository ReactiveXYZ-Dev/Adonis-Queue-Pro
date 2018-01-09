const Ioc = require('adonis-fold').Ioc;
const BaseCommand = Ioc.use('Adonis/Src/Command');

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
}

module.exports = Command;