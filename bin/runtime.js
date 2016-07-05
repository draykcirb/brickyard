/**
 * Created by scott on 16-3-8.
 */
'use strict'

const _ = require('lodash')


const logger = require('./logger').getLogger('Runtime')
const getCmdOptions = require('./commandLoader')
const configLoader = require('./configLoader')
const programsLoader = require('./programsLoader')
const pluginsLoader = require('./pluginsLoader')

module.exports = {
	init: init
}

/**
 * init the runtime config
 */
function init() {
	const cmdOptions = getCmdOptions()
	const fileConfig = configLoader(cmdOptions.config)
	const targetPrograms = programsLoader(cmdOptions.program)
	const config = mergeConfig(fileConfig, targetPrograms, cmdOptions)

	return compoundWholeProgram(config, targetPrograms)
}

/**
 * 合成整个程序所需要的基本数据
 *
 * @param config
 * @param targetPrograms
 * @returns {Object}
 */
function compoundWholeProgram(config, targetPrograms) {
	logger.trace('compounding whole runtime data for the program...')

	const runtime = {}
	// 如果输出目录没声明，根据program参数合成目录名
	if (!config.output) {
		config.output = constructOutputDir('assemble', config.program)
		logger.trace('output dir constructed: ', config.output)
	}

	// flatten the programs array with `plugins` property and get the unique set
	const mixedPluginDeclarations = _.chain(targetPrograms).map('plugins').flatten().uniq().value()
	logger.trace('mixed unique plugin declarations are:', mixedPluginDeclarations)

	const mixedPlugins = pluginsLoader.getTargetPlugins(mixedPluginDeclarations)

	Object.assign(runtime, { config: config }, groupPluginsByDomainAndType(mixedPlugins))

	return runtime

	// ----------------------------------------------------------------------

	function constructOutputDir(prefix, programs) {
		return [prefix].concat(programs).join('-')
	}
}

/**
 * group the plugins
 * @param {Object} plugins
 * @returns {Object} groupedPlugins
 */
function groupPluginsByDomainAndType(plugins) {
	// todo: unsure to put the plugin statement existence judgement here or in pluginsLoader

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

/**
 * 合并所有配置数据，包括命令行参数，配置文件，组装配方
 *
 * @param {Object} fileConfig
 * @param {Object} targetPrograms
 * @param {Object} cmdOptions
 *
 * @return {Object}
 */
function mergeConfig(fileConfig, targetPrograms, cmdOptions) {
	logger.debug('merging all configuration data...')
	const programsConfig = mergeProgramConfig(targetPrograms)

	/**
	 * 将接收到的命令行参数与配置数据合并，因为命令行参数会覆盖配置数据，不要在command.yml里面声明默认值
	 * 覆盖优先级： 命令行 > 配方数据 > 配置文件 config.js
	 */
	const res = _.assignInWith(
		{}, fileConfig, programsConfig, cmdOptions,
		function assignPredict(older, newer) {
			return isEmpty(newer) ? older : newer
		})

	return _.omitBy(res, isEmpty)
	// -------------------------------------------------------------------------


	/**
	 * 合并在命令行声明的程序，如果有多个的话
	 *
	 * @param {Object} targetPrograms
	 * @returns {Object}
	 */
	function mergeProgramConfig(targetPrograms) {
		// _.assignInWith.apply(_, [{}].concat(_.map(targetPrograms, 'config')))
		const config = {}

		_.each(targetPrograms, function (pro) {
			Object.assign(config, pro.config)
		})

		return config
	}
}

function isEmpty(val) {
	return val === undefined || val === null
}
