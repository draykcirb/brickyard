/**
 * 此模块用来获取命令行参数
 */
'use strict'

const Command = require('commander').Command
const _ = require('lodash')
const repoInfo = require('./packageInfo')
const logger = require('./logger').getLogger('Command')

// console.log(rootCmd.opts())

module.exports = getOptions

function getOptions() {
	const rootCmd = new Command()
	const config = readCommandConfig(__dirname + '/command.yml')

	initCommands(rootCmd, config)

	rootCmd.allowUnknownOption(true)

	logger.debug('raw command line input is: ', process.argv)
	rootCmd.version(repoInfo().version)
		.parse(process.argv)

	return rootCmd.opts()
}

/**
 * read the command config file
 *
 * @param {String} _path config file path
 * @returns {Object} command config object
 */
function readCommandConfig(_path) {
	const yaml = require('js-yaml');
	const fs = require('fs');
	let doc
	try {
		logger.trace('reading file: ', _path)
		doc = yaml.load(fs.readFileSync(_path, 'utf8'))
	}
	catch (e) {
		logger.error('fail to read command config file', e)
		process.exit(1)
	}
	return doc
}

/**
 * 递归获取命令行的配置，因为可能有subCommand（暂时没用到）
 * @param cmd
 * @param config
 * @param [rootContext]
 */
function initCommands(cmd, config, rootContext) {
	rootContext = rootContext || config

	logger.trace(`initiating command ${cmd._name || 'root'}...`)
	_.each(config, function (val, key, context) {
		if (key === 'commands') {
			_.each(val, function (cmdVal) {
				let newCmd = cmd.command(cmdVal.name)
					.description(cmdVal.desc)

				initCommands(newCmd, cmdVal, context)
			})

		} else if (key === 'options') {
			val.forEach(function (option) {
				cmd.option(
					option.flags,
					option.desc,
					// reference the js function defined in the yml file
					option.coercionFn ? rootContext.util[option.coercionFn]() : option.coercionFn,
					option.default)
			})
		} else if (key === 'usage') {
			cmd.usage(val)
		} else if (key === 'arguments') {
			cmd.arguments(val)
		}
	})
}
