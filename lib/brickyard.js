/**
 * Created by scott on 16-3-29.
 */
'use strict'

const EventEmitter = require('events').EventEmitter
const _ = require('lodash')

const butil = require('./util')
const logging = require('./logger')
const configLoader = require('./configLoader')
const programLoader = require('./programLoader')
const pluginLoader = require('./pluginLoader')
const path = require('path')

const logger = logging.getLogger('Brickyard')

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
     * @param {Object} extraDefaultConfig
     */
    load(configPath, extraDefaultConfig) {
        this.config = configLoader.run(configPath, extraDefaultConfig)

        this.programs = programLoader.getAllPrograms(this.config.programStore, this.config.allowNoPrograms)

        this.plugins = pluginLoader.getAllPlugins(this.config.pluginStore)

        logger.trace('load all things except plugins in brickyard')
    }

    setLogLevel(level) {
        if (_.isString(level) && logging.levels[level.toUpperCase()]) {
            this.level = level.toUpperCase()
            logging.setGlobalLogLevel(this.level)
        }
    }

    /**
     * construct a runtime object, with cmdOptions to override some default config
     * @param cmdOptions
     * @returns Object
     */
    hatchRuntime(cmdOptions) {
        logger.trace('hatching the runtime object')

        const mergePrograms = compoundPrograms(this.programs, cmdOptions.program)

        // 将所有 config 合并到 this.config, 有效值会按顺序 左->右 被覆盖
        butil.mergeWithValid(this.config, mergePrograms.config, cmdOptions)

        // 动态构建输出目录名
        if (!this.config.dest) {
            this.config.dest = path.join('dist', constructOutputDir(this.config.destPrefix, this.config.program))
        }

        this.config.outputBase = path.resolve(process.cwd(), this.config.dest)

        const plugins = pluginLoader.getTargetPlugins(this.config.pluginStore, mergePrograms.plugins)


        return {
            config: this.config,
            plugins: plugins
        }
    }
}

Brickyard.prototype.cli = require('./cli')

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

    const mixedPluginDeclarations = _.chain(targetPrograms)
        .map('plugins')
        .flatten()
        .uniq()
        .compact()
        .value()

    const programsConfig = _.chain(targetPrograms)
        .map('config')
        .compact()
        .reduce((sum, val) => {
            Object.assign(sum, val)
            return sum
        }, {})
        .value()

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
