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
	}

	load(configPath) {

		this.config = configLoader.run(configPath)

		this.programs = programLoader.getAllPrograms(this.config.programStore)

		this.plugins = pluginLoader.getAllPlugins(this.config.pluginStore)
	}

	hatchRuntime(cmdOptions) {
		const mergePrograms = compoundPrograms(this.programs, cmdOptions.program)

		butil.assignWithValid(this.config, mergePrograms.config, cmdOptions)

		if (!this.config.dest) {
			this.config.dest = constructOutputDir(this.config.destPrefix, this.config.program)
		}

		const plugins = pluginLoader.getTargetPlugins(this.config.pluginStore, mergePrograms.plugins)

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

function constructOutputDir(prefix, programs) {
	return [prefix].concat(programs).join('-')
}
