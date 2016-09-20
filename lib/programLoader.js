/* eslint max-len: 0 */
/**
 * 此模块主要用来获取`配方仓库`的程序配方
 */

'use strict'

const path = require('path')
const glob = require('glob')
const _ = require('lodash')
const logger = require('log4js').getLogger('ProgramsLoader')

module.exports = Object.seal({
    getTargetPrograms,
    getTargetProgramsFromContext,
    getAllPrograms: getAvailableProgramRecipes
})

/**
 * 获取指定的程序配方
 *
 * @param {Array<String>} programs program names
 * @param {String} programStore path
 * @return {Object}
 */
function getTargetPrograms(programs, programStore) {
    const availablePrograms = getAvailableProgramRecipes(programStore)
    return getTargetProgramsFromContext(programs, availablePrograms)
}

/**
 * 获取指定的程序配方
 *
 * @param {Array<String>} programs
 * @param {Object} availablePrograms
 * @return {Object}
 */
function getTargetProgramsFromContext(programs, availablePrograms) {
    if (!programs) return {}

    for (let pro of programs) {
        if (!availablePrograms[pro]) {
            logger.error(`the program - "${pro}" doesn't exist. Please have a check.\nAvailable programs are:\n\t${Object.keys(availablePrograms).join(', ')}\n`)
            break
        }
    }

    logger.trace('available programs are: ', Object.keys(availablePrograms))

    return _.pick(availablePrograms, programs)
}

/**
 * 收集所有可用程序配方
 *
 * @param {String} programStore
 *
 * @param {Boolean} allowNoPrograms
 * @return {Object} 配方字典表
 */
function getAvailableProgramRecipes(programStore, allowNoPrograms) {
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
        let recipe = require(filePath)

        result[recipe.id || key] = recipe

        return result
    }, {})

    if (!allowNoPrograms && !Object.keys(programs).length) {
        throw Error('There is no even a program recipe exists. Please at lease add one recipe')
    }

    return programs
}
