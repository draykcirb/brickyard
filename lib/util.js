/**
 * Created by scott on 16-3-30.
 */
'use strict'

const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const util = {
	isEmpty,
	checkFileExist,
	assignWithValid,
	sortObjectKeys
}

module.exports = util

/**
 * return the same obj with sorted keys
 *
 * @static
 * @memberOf util
 * @param obj
 * @returns {*}
 */
function sortObjectKeys(obj) {
	const sortedKeys = Object.keys(obj).sort()
	return sortedKeys.reduce(function (newObj, key) {
		newObj[key] = obj[key]
		return newObj
	}, {})
}

/**
 * merge the sources into target without overriding the valid value with empty value
 *
 * @static
 * @memberOf util
 * @param {Object} target
 * @param {...Object} sources The source objects.
 * @returns {Object} target
 */
function assignWithValid(target, sources) {
	const args = Array.from(arguments)
	args.push(assignPredict)
	return _.assignWith.apply(_, args)
}

/**
 * to check if the property can be overrode
 *
 * @param older
 * @param newer
 * @returns {*}
 */
function assignPredict(older, newer) {
	return isEmpty(newer) ? older : newer
}

/**
 * check the value to be valid value
 *
 * @param val
 * @returns {boolean}
 */
function isEmpty(val) {
	return val === undefined || val === null
}

/**
 * check if the file of target path exists relative to `cwd`
 *
 * @param {String} targetPath
 * @return {Boolean}
 */
function checkFileExist(targetPath) {
	logger.trace('testing if exists file: ', targetPath)
	return fs.existsSync(path.resolve(process.cwd(), targetPath))
}
