/**
 * Created by scott on 16-3-29.
 */
'use strict'

const _ = require('lodash')
const packageLoader = require('./packageLoader')
const path = require('path')
const logger = require('log4js').getLogger('CLI')

const cli = {
	commands: {}
}

/**
 * load all the command modules in the `./commands`,
 * and register them all so you can see them through CLI,
 * pass a callback to the command so when the command is
 * triggered, brickyard can do something to run the command.
 *
 * @param {Command} rootcmd
 * @param {Object} packageInfo
 * @param {function} [commandRunner]
 */
cli.load = function (rootcmd, packageInfo, commandRunner) {

	logger.trace('register root commands')

	rootcmd
		.version(packageInfo.version, '-v, --version')
		.alias('by')
		.arguments('[cmd]')
		.description(packageInfo.description)
		.usage('[cmd] [options]')
		//.option('--root', 'project dir')
		.option('--config', 'config path')
		.option('--no-color', 'output without color')
		.option('--loglevel', 'output log verbosity')
		.option('--verbose', 'output log verbosity', Boolean, false)

	loadCommands(rootcmd, commandRunner)
}

module.exports = Object.seal(cli)

function loadCommands(rootcmd, commandRunner) {
	const commandsRepo = 'node_modules/brickyard-command-*/'
	const commandsPathPattern = path.join(process.cwd(), commandsRepo, 'package.json')
	const commandsConfig = packageLoader.getPackages(commandsPathPattern)

	logger.trace('batch register commands')

	_.forOwn(commandsConfig, function (cmdConfig, name) {
		const cmd = require(cmdConfig.path)
		const cmdName = name.split('-')[2]

		if (!cmdName) {
			throw new Error('Invalid brickyard command module, it should be `brickyard-command-***`')
		}
		cmd.register(rootcmd.command(cmdName), commandRunner)

		if (cli.commands[cmdName]) {
			throw new Error(`Duplicated command ${name} - ${cmdConfig.path}`)
		}
		cli.commands[cmdName] = cmd
	})
}
