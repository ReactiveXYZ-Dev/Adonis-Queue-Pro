'use strict'

const { ServiceProvider } = require('@adonisjs/fold');

/**
 * Provider for injecting Ace commands into the app
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
class CommandProvider extends ServiceProvider {

    constructor(Ioc) {
        super(Ioc)
        // define types of commands
        // init: copy queue server boostrapper, sample configuration, and create default job path 
        // job: create a producer consumer job pair with name
        // work: start queue listeners with optional number of instances
        this._commands = ['Init', 'Job', 'Work'];
    }

    /**
     * Register all commands
     */
    register() {
        this._commands.forEach(command => {
            this.app.bind(`Adonis/Commands/Queue:${command}`, () => require(`../commands/${command}`));
        });
    }

    /**
     * Add commands to ace
     */
    boot() {
        const ace = require('@adonisjs/ace')
        this._commands.forEach(command => {
            ace.addCommand(`Adonis/Commands/Queue:${command}`);
        });
    }

}

module.exports = CommandProvider;