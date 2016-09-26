/**
 * 此模块用于加载/config目录下的运行配置文件
 * 文件优先级是  <configPath> > ./config.js > ./config/default.js
 */
'use strict'

const _ = require('lodash')
const path = require('path')
const logger = require('log4js').getLogger('ConfigLoader')
const butil = require('./util')

const frameworkDefaultConfigPath = path.resolve(__dirname, '../config/default.js')

module.exports = {
    loadDefaultConfig,
    mergeConfig
}

/**
 * 合并配置
 *
 * @param configs
 * @returns {Object}
 */
function mergeConfig(...configs) {
    logger.trace('merge all config')

    return butil.mergeWithValid({}, ...configs)
}

/**
 * load the default configuration
 * @param defaultConfPath
 * @param extraDefaultConfig
 */
function loadDefaultConfig(extraDefaultConfig, defaultConfPath = frameworkDefaultConfigPath) {
    logger.trace('load the default configuration')
    const defaultConf = require(defaultConfPath)
    return _.assignIn({}, defaultConf, extraDefaultConfig)
}
