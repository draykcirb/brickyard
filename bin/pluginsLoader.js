/**
 * 此模块用于获取插件仓库的所有/指定插件的配置文件
 * 主要是package.json, bower.json
 */
'use strict'

const _ = require('lodash')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const logger = require('./logger').getLogger('PluginsLoader')

const pluginStore = './plugins/'
const pluginInfoFile = 'package.json'
const bowerInfoFile = 'bower.json'

module.exports = {
	getTargetPlugins: getTargetPlugins,
	getAllPlugins: getAllPlugins
}

/**
 * 返回指定插件的配置数据哈希表
 * @param {Array<string>} pluginDeps
 * @return {Object}
 */
function getTargetPlugins(pluginDeps) {
	const pluginsPathPattern = getPluginsPattern(pluginStore, pluginDeps, '/**/' + pluginInfoFile)
	logger.trace('get plugins pattern: ', pluginsPathPattern)

	const pluginPaths = glob.sync(pluginsPathPattern)

	if (pluginDeps.length && !pluginPaths.length) {
		throw new Error('Some of the plugins specified don\'t exist. Please have a check')
	}

	return pluginPaths.reduce(reducePlugins, {})


	/**
	 * 构造 插件数组 glob 匹配规则
	 *
	 *
	 * @param {String} prefix
	 * @param {Array<string>} plugins
	 * @param {String} postfix
	 * @returns {string}
	 */
	function getPluginsPattern(prefix, plugins, postfix) {
		if (plugins.length === 1) {
			return prefix + plugins[0] + postfix
		} else {
			return prefix + '{' + plugins.join(',') + '}' + postfix
		}
	}
}

/**
 * 返回所有插件的配置数据哈希表
 *
 * @return {Object}
 */
function getAllPlugins() {
	const pluginsPathPattern = path.join(pluginStore, '/**/', pluginInfoFile)
	const pluginPaths = glob.sync(pluginsPathPattern)

	return pluginPaths.reduce(reducePlugins, {})
}

/**
 * construct the plugin object and put it into the plugins collection
 *
 * @param {Object} plugins
 * @param {String} _path
 * @returns {Object}
 */
function reducePlugins(plugins, _path) {
	const plugin = constructPluginConfig(_path)
	plugins[plugin.name] = plugin
	logger.trace(`push plugin \`${plugins.name}\` into collection`)
	return plugins
}

/**
 * 构造插件对象，并计算出插件参数(如入口文件，插件路径，依赖)
 * 尝试获取`bower.json`文件
 *
 * @param {String} pluginPath
 * @returns {Object}
 */
function constructPluginConfig(pluginPath) {
	logger.debug('constructing plugin: ', pluginPath)

	const plugin = {}
	const fullPath = path.resolve(pluginPath)

	try {
		logger.trace(`trying to read the config file(package.json) of plugin`)
		plugin.raw = require(fullPath)
	}
	catch (e) {
		throw new Error('Couldn\'t read file: ' + fullPath + '. May that plugin doesn\'t exist')
	}

	plugin.name = plugin.raw.name
	plugin.path = path.dirname(pluginPath)

	if (Array.isArray(plugin.raw.main)) {
		logger.trace(`extract the valid main file path of plugin - ${plugin.name}`)
		let jsEntries = _.filter(plugin.raw.main, function (entry) {
			return entry.match(/\.js$/)
		})
		plugin.raw.main = jsEntries[0]
	}

	// todo: there is no process of empty entry, may add later
	if (plugin.raw.main) {
		plugin.entry = path.relative(process.cwd(), path.join(pluginPath, '..', plugin.raw.main))
	} else {
		logger.warn('There is no explicit entry file. It may cause error.')
	}

	const possibleBowerPath = fullPath.replace(pluginInfoFile, bowerInfoFile)

	if (fs.existsSync(possibleBowerPath)) {
		try {
			logger.trace(`trying to read the bower config of plugin - ${plugin.name}`)
			plugin.bower = require(possibleBowerPath)
		}
		catch (e) {
			throw new Error('Couldn\'t read file: ' + possibleBowerPath)
		}
	}

	return plugin
}

