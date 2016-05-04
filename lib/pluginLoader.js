/**
 * 此模块用于获取插件仓库的所有/指定插件的配置文件
 * 主要是package.json, bower.json
 */
'use strict'

const _ = require('lodash')
const butil = require('./util')
const path = require('path')
const fs = require('fs')
const packageLoader = require('./packageLoader')
const logger = require('log4js').getLogger('PluginLoader')

const pluginInfoFile = 'package.json'
const bowerInfoFile = 'bower.json'
const ignorePattern = '!**/{node_modules,bower_components}/**'

module.exports = Object.seal({
	getTargetPlugins: getTargetPlugins,
	getAllPlugins: getAllPlugins
})

/**
 * 返回指定插件的配置数据哈希表
 * @param {String} pluginStore
 * @param {Array<string>} pluginDeps
 * @return {Object}
 */
function getTargetPlugins(pluginStore, pluginDeps) {
	const pluginsPathPattern = butil.getFileGlobPattern(pluginStore, pluginDeps, '**/' + pluginInfoFile)
	logger.trace('get plugins pattern: ', pluginsPathPattern)

	const plugins = packageLoader.getPackages([pluginsPathPattern, ignorePattern], _constructPluginConfig)

	if (pluginDeps.length && _.isEmpty(plugins)) {
		throw new Error('plugins specified don\'t exist. Please have a check')
	}

	return plugins
}

/**
 * 返回所有插件的配置数据哈希表
 *
 * @return {Object}
 */
function getAllPlugins(pluginStore) {
	const pluginsPathPattern = path.join(pluginStore, '**', pluginInfoFile)
	return packageLoader.getPackages([pluginsPathPattern, ignorePattern], _constructPluginConfig)
}

/**
 * 转换插件对象，并计算出插件参数(如入口文件，依赖)
 * 尝试获取`bower.json`文件
 *
 * @param {Object} rawPlugin
 * @returns {Object}
 */
function _constructPluginConfig(rawPlugin) {
	logger.debug('constructing plugin: ', rawPlugin.name)

	const plugin = {}

	plugin.raw = rawPlugin

	plugin.name = rawPlugin.name
	plugin.path = rawPlugin.path

	if (Array.isArray(rawPlugin.main)) {
		logger.trace(`extract the valid main file path of plugin - ${plugin.name}`)

		// `main` may has many entries, just take the first
		let jsEntries = _.filter(rawPlugin.main, function (entry) {
			return entry.match(/\.js$/)
		})
		rawPlugin.main = jsEntries[0]
	}

	// todo: there is no process of empty entry, may add later
	if (rawPlugin.main) {
		plugin.entry = path.relative(process.cwd(), path.join(plugin.path, rawPlugin.main))
	} else {
		logger.warn(`No explicit entry file of plugin '${plugin.name}'. It may causes error.`)
	}

	const possibleBowerPath = path.join(rawPlugin.path, bowerInfoFile)

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

