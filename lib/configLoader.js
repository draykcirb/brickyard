/**
 * 此模块用于加载/config目录下的运行配置文件
 * 文件优先级是  <configPath> > ./config.js > ./config/default.js
 */
'use strict'

const _ = require('lodash')
const path = require('path')
const logger = require('log4js').getLogger('ConfigLoader')

const defaultConfigPath = './config/default.js'

module.exports = Object.seal({
	run: loadConfig
})

/**
 * 获取默认配置文件与指定配置文件，并返回合并配置
 *
 * @param {String} [configPath]
 * @returns {Object}
 */
function loadConfig(configPath) {
	const configPathQueue = [configPath, defaultConfigPath]

	logger.debug('the config path queue is: ', configPathQueue)

	return configPathQueue.reduceRight(function (configObject, _path) {
		if (_path) {
			let targetConfig = require(path.resolve(process.cwd(), _path))
			_.assignIn(configObject, targetConfig)
		}

		return configObject
	}, {})
}
