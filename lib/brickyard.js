/**
 * Created by scott on 16-3-29.
 */
'use strict'

const EventEmitter = require('events').EventEmitter
const _ = require('lodash')

const butil = require('./util')
const logging = require('./logger')
const logger = logging.getLogger('Brickyard')
const configLoader = require('./configLoader')
const programLoader = require('./programLoader')
const pluginLoader = require('./pluginLoader')

class Brickyard extends EventEmitter {
	constructor() {
		super()

		logging.setGlobalLogLevel('ERROR')
	}

	load(configPath) {

		this.config = configLoader.run(configPath)

		this.programs = programLoader.getAllPrograms(this.config.programStore)

		this.plugins = pluginLoader.getAllPlugins(this.config.pluginStore)
	}

	hatchRuntime(cmdOptions) {
		const mergePrograms = compoundPrograms(this.programs, cmdOptions.program)

		butil.assignWithValid(this.config, mergePrograms.config, cmdOptions)

		const groupedPlugins = groupPlugins(pluginLoader.getTargetPlugins(this.config.pluginStore, mergePrograms.plugins))

		Object.seal(this)

		return {
			config: this.config,
			groupedPlugins
		}
	}
}

Brickyard.prototype.cli = require('./cli');

module.exports = new Brickyard()

// ==========================================================================

function compoundPrograms(programs, target) {
	const targetPrograms = programLoader.getTargetProgramsFromContext([target], programs)

	const mixedPluginDeclarations = _.chain(targetPrograms).map('plugins').flatten().uniq().value()

	const programsConfig = _.chain(targetPrograms).map('config').assign().value()

	return {
		plugins: mixedPluginDeclarations,
		config: programsConfig
	}
}

/**
 * group the plugins
 * @param {Object} plugins
 * @returns {Object} groupedPlugins
 */
function groupPlugins(plugins) {
	// todo: unsure to put the plugin declaration existence judgement here or in pluginsLoader

	logger.debug('grouping plugins by domain and type...')

	return _.reduce(plugins, function (groupedPlugins, plugin, name) {
		const pluginInfo = plugin.raw
		if (!pluginInfo.plugin) {
			throw new Error(`There is no plugin declaration of plugins - ${name}`)
		}

		switch ((pluginInfo.plugin.domain).toUpperCase()) {
			case 'FE':
				logger.trace(`grouped plugin \`${name}\` into FE.${pluginInfo.plugin.type}`)

				_.set(
					groupedPlugins,
					"FE." + pluginInfo.plugin.type + '.' + name,
					plugin
				)

				break;

			case 'BE':
				logger.trace(`grouped plugin \`${name}\` into BE.${pluginInfo.plugin.type}`)

				_.set(
					groupedPlugins,
					"BE." + pluginInfo.plugin.type + '.' + name,
					plugin
				)

				break;

			default :
				throw new Error(`There is no match for the domain of plugin - ${name}`)
		}

		return groupedPlugins
	}, {})
}
