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

		logging.setGlobalLogLevel('info')

		logger.trace('init brickyard instance')
	}

	/**
	 * load the config base on the path provided
	 *
	 * @param {String} configPath
	 */
	load(configPath) {

		this.config = configLoader.run(configPath)

		this.programs = programLoader.getAllPrograms(this.config.programStore)

		this.plugins = pluginLoader.getAllPlugins(this.config.pluginStore)

		logger.trace('load all things except plugins in brickyard')
	}

	setLogLevel(level) {
		if (_.isString(level) && logging.levels[level.toUpperCase()]) {
			logging.setGlobalLogLevel(level.toUpperCase())
		}
	}

	/**
	 * construct a runtime object, with cmdOptions to override some default config
	 * @param cmdOptions
	 * @returns {{config: (Object|*), plugins: Object}}
	 */
	hatchRuntime(cmdOptions) {
		logger.trace('hatching the runtime object')

		const mergePrograms = compoundPrograms(this.programs, cmdOptions.program)

		butil.assignWithValid(this.config, mergePrograms.config, cmdOptions)

		if (!this.config.dest) {
			this.config.dest = constructOutputDir(this.config.destPrefix, this.config.program)
		}

		const plugins = pluginLoader.getTargetPlugins(this.config.pluginStore, mergePrograms.plugins)

		if(_.isEmpty(plugins)){
			process.exit(1)
		}

		Object.seal(this)

		return {
			config: this.config,
			plugins: plugins
		}
	}
}

Brickyard.prototype.cli = require('./cli');

module.exports = new Brickyard()

// ==========================================================================

/**
 * compound the meta data of target programs
 * @param {Object} programs
 * @param {Array<String>} target
 * @returns {{plugins: *, config: *}}
 */
function compoundPrograms(programs, target) {
	const targetPrograms = programLoader.getTargetProgramsFromContext(target, programs)

	const mixedPluginDeclarations = _.chain(targetPrograms).map('plugins').flatten().uniq().compact().value()

	const programsConfig = _.chain(targetPrograms).map('config').assign().compact().value()

	return {
		plugins: mixedPluginDeclarations,
		config: programsConfig
	}
}

/**
 * produce the output dir name
 *
 * @param prefix
 * @param programs
 * @returns {string}
 */
function constructOutputDir(prefix, programs) {
	return [prefix].concat(programs).join('-')
}
