/**
 * 此模块主要用来获取`配方仓库`的程序配方
 */

'use strict'

const path = require('path')
const glob = require('glob')
const _ = require('lodash')
const logger = require('./logger').getLogger('ProgramsLoader')

const programStore = './recipes'

module.exports = getTargetPrograms

/**
 * 获取指定的程序配方
 *
 * @param {Array<String>} programs
 * @return {Object}
 */
function getTargetPrograms(programs) {
	const availablePrograms = getAvailableProgramRecipes()
	logger.debug('available programs are: ', availablePrograms)
	return _.pick(availablePrograms, programs)
}

/**
 * 收集所有可用程序配方
 *
 * @return {Object} 配方字典表
 */
function getAvailableProgramRecipes() {

	const programPaths = glob.sync(path.resolve(programStore, './**/*.js'))

	logger.trace('recipe paths are: ', programPaths)

	/**
	 * 此处主要是将 ["xxx/${programStore}/xx/xx.js", "xxx\${programStore}\xx\xx.js", ...]，
	 * 转换成哈希表{"xx/xx":{...}, ...}，存储程序配置数据
	 *
	 * 路径风格都是 unix/linux 友好的
	 */
	const programs = programPaths.reduce(function (result, filePath) {
		let relativePath = path.relative(programStore, filePath)
		let basename = path.basename(relativePath, '.js')
		let dirName = path.dirname(relativePath)
		let key = path.join(dirName, basename).replace('\\', '/')
		result[key] = require(filePath)
		return result
	}, {})

	if (!_.keys(programs).length) {
		throw Error('There is no even a program recipe exists. Please at lease add one recipe')
	}

	return programs
}

