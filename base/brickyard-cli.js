#!/usr/bin/env node

'use strict'

const Liftoff = require('liftoff')
const Command = require('commander').Command
const packageInfo = require('../package.json')
const butil = require('../lib/util')
const logger = require('../lib/logger')
const _ = require('lodash')

boot(require('minimist')(process.argv.slice(2)))

/**
 * boot up the whole command app
 * @param {Object} argv
 */
function boot(argv) {
	const app = new Liftoff({
		name: packageInfo.name,
		processTitle: packageInfo.name,
		moduleName: packageInfo.name,
		configName: 'by-conf',
		extensions: {
			'.js': null,
			'.json': null
		},
		v8flags: ['--harmony']
	})

	if (argv.backlog) {
		let logPath = _.isBoolean(argv.backlog) ? 'logs/build.log' : argv.backlog

		logger.configure({
			appenders: [
				{ type: 'console' },
				{ type: 'file', filename: logPath, maxLogSize: 1000000, backups: 10 }
			],
			replaceConsole: true
		})
	}

	app.launch({
		configPath: argv.config
	}, env => {
		let brickyard = !env.modulePath ? require('../') : require(env.modulePath)

		if (argv.verbose) {
			brickyard.setLogLevel('debug')
		} else {
			brickyard.setLogLevel(argv.loglevel)
		}

		const rootCmd = initRootCmd(packageInfo)

		brickyard.cli.load(rootCmd, env.configPath ? require(env.configPath).commands : null)
			.spread((cmdName, options) => {
				const cmdOptions = butil.assignWithValid({}, options, rootCmd.opts())
				const targetCmd = brickyard.cli.commands[cmdName]

				brickyard.load(env.configPath, targetCmd.config)

				targetCmd.run(brickyard.hatchRuntime(cmdOptions))
			})
			.catch(e => {
				throw e
			})

		rootCmd.parse(process.argv)
	})
}

/**
 * initiate the root command
 * @param {Object} pkgInfo
 * @returns {*|Command}
 */
function initRootCmd(pkgInfo) {
	const cmd = new Command(pkgInfo.name)

	cmd
		.version(pkgInfo.version, '-v, --version')
		.alias('by')
		.arguments('[cmd]')
		.description(pkgInfo.description)
		.usage('[cmd] [options]')
		.option('--config <path>', 'config path')
		.option('--no-color', 'output without color')
		.option('--backlog [dir]', 'output without color')
		.option('--loglevel <level>', 'output log verbosity. Available levels are: trace,debug,info,warn,error,fatal')
		.option('-V, --verbose', 'output log verbosely. Same as debug level. Prior to loglevel argument', Boolean, false)

	return cmd
}
