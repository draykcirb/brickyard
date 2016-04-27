#!/usr/bin/env node

'use strict'

const Liftoff = require('liftoff')
const argv = require('minimist')(process.argv.slice(2))
const Command = require('commander').Command
const packageInfo = require('../package.json')
const butil = require('../lib/util')

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
	//cwd: argv.r || argv.root,
	configPath: argv.config
}, function (env) {
	let brickyard
	if (!env.modulePath) {
		brickyard = require('../')
	} else {
		brickyard = require(env.modulePath)
	}

	const cli = brickyard.cli

	const commander = new Command(packageInfo.name)

	if (argv.verbose) {
		brickyard.setLogLevel('debug')
	} else {
		brickyard.setLogLevel(argv.loglevel)
	}

	brickyard.load(env.configPath)

	cli.load(commander, packageInfo, commandRunner)

	commander.parse(process.argv)

	/**
	 * a callback runner invoke when a subcommand is at action,
	 * and then invoke the subcommand's run with runtime object
	 *
	 * @param options
	 */
	function commandRunner(options) {
		const cmdOptions = butil.assignWithValid({}, options, commander.opts())
		const command = argv._[0]

		cli.commands[command].run(brickyard.hatchRuntime(cmdOptions))
	}
})
