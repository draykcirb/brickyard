#!/usr/bin/env node

'use strict'

const Liftoff = require('liftoff')
const Command = require('commander').Command
const packageInfo = require('../package.json')
const butil = require('../lib/util')

const rootCmd = initRootCmd(packageInfo)

rootCmd.parse(process.argv)

boot(rootCmd.opts())

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

	app.launch({
		configPath: argv.config
	}, env => {
		let brickyard = !env.modulePath ? require('../') : require(env.modulePath)

		if (argv.verbose) {
			brickyard.setLogLevel('debug')
		} else {
			brickyard.setLogLevel(argv.loglevel)
		}

		brickyard.cli.load(rootCmd, env.configPath ? require(env.configPath).commands : null)
			.spread((cmdName, options) => {
				const cmdOptions = butil.assignWithValid({}, options, rootCmd.opts())
				const targetCmd = brickyard.cli.commands[cmdName]

				brickyard.load(env.configPath)

				targetCmd.run(brickyard.hatchRuntime(cmdOptions))
			})
			.catch(e => {
				throw e
			})

		rootCmd.parse(process.argv)
	})
}

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
		.option('--loglevel <level>', 'output log verbosity. Available levels are: trace,debug,info,warn,error,fatal')
		.option('-V, --verbose', 'output log verbosely. Same as debug level. Prior to loglevel argument', Boolean, false)

	return cmd
}
