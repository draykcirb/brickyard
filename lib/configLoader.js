/**
 * 此模块用于加载/config目录下的运行配置文件
 * 文件优先级是  <configPath> > ./config.js > ./config/default.js
 */
'use strict'

const _ = require('lodash')
const path = require('path')
const logger = require('log4js').getLogger('ConfigLoader')

const frameworkDefaultConfigPath = path.resolve(__dirname, '../config/default.js')

module.exports = {
    run: loadConfig
}

/**
 * 获取默认配置文件与指定配置文件，并返回合并配置
 *
 * @param {String} [configPath]
 * @param {Object} [extraDefaultConfig]
 * @returns {Object}
 */
function loadConfig(configPath, extraDefaultConfig) {
    const configPathQueue = [configPath, extraDefaultConfig, frameworkDefaultConfigPath]

    logger.debug('the config path queue is: ', configPathQueue)

    return configPathQueue.reduceRight(function (configObject, pathOrConfig) {
        if (_.isString(pathOrConfig)) {
            const resolvedPath = path.resolve(process.cwd(), pathOrConfig)

            _.assignIn(configObject, require(resolvedPath))
        }

        if (_.isPlainObject(pathOrConfig)) {
            _.assignIn(configObject, pathOrConfig)
        }

        return configObject
    }, {})
}
