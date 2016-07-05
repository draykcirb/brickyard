/**
 * Created by scott on 16-2-26.
 *
 * 此模块用于获取 cwd 目录下package.json文件的内容
 */
'use strict'

const process = require('process')
const logger = require('./logger').getLogger('PackageInfo')

let info = null

module.exports = function getInfo() {
	if (!info) {
		info = require(process.cwd() + '/package.json')
		logger.trace('the package info is: ', info)
	}
	return info
}
