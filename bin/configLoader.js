/**
 * 此模块用于加载/config目录下的运行配置文件
 * 文件优先级是  <configPath> > ./config.js > ./config/default.js
 */
'use strict'

const fs = require('fs')
const path = require('path')
const logger = require('./logger').getLogger('ConfigLoader')

const localConfigPath = './config.js'
const defaultConfigPath = './config/default.js'

module.exports = loadConfig

/**
 * 按优先级获取配置文件
 *
 * @param {String} [cmdConfig]
 * @returns {Object}
 */
function loadConfig(cmdConfig) {
	const configPathQueue = [cmdConfig, localConfigPath, defaultConfigPath]

	logger.debug('the config path queue is: ', configPathQueue)

	for (let _path of configPathQueue) {
		if (_path && checkFileExist(_path)) {
			return require(path.resolve(process.cwd(), _path))
		}
	}

	throw new Error('no config file found! Please checkout a config file.')
}

/**
 * 检查相对于 cwd 的文件是否存在
 *
 * @param {String} targetPath
 * @return {Boolean}
 */
function checkFileExist(targetPath) {
	logger.trace('testing if exists file: ', targetPath)
	return fs.existsSync(path.resolve(process.cwd(), targetPath))
}
