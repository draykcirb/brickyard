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
	mergeWithValid,
	sortObjectKeys,
	filterDeep,
	mergeDeep,
	getFileGlobPattern
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
	args.push(_assignPredict)
	return _.assignWith.apply(_, args)
}

/**
 * to check if the property can be overrode
 *
 * @param older
 * @param newer
 * @returns {*}
 */
function _assignPredict(older, newer) {
	return isEmpty(newer) ? older : newer
}

function mergeWithValid(target, sources) {
	const args = Array.from(arguments)
	args.push(_mergeCustomizer)
	return _.mergeWith.apply(_, args)
}

function _mergeCustomizer(older, newer) {
	if (Array.isArray(older)) {
		return older.concat(newer)
	} else {
		if (_.isObject(older) && _.isObject(newer)) {
			return assignWithValid(older, newer)
		} else {
			return isEmpty(newer) ? older : newer
		}
	}
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


/**
 * filter some values deep into a collection according to the keyPath
 *
 * @example
 *
 * let col = { a: { b: { c: { d: 'd'} }, e: { c: { d: 'f'} } } }
 * filterDeep(col, 'c.d')
 * // [{ c: { d: 'd'} }, { c: { d: 'f'} }]
 *
 * @param collection
 * @param keyPath
 * @returns {Array}
 */
function filterDeep(collection, keyPath) {
	const path = keyPath.split('.')
	const id = path[0]
	const candidate = _findDeep(collection, id, [])
	if (path.length <= 1) {
		return candidate
	} else {
		return _.filter(candidate, _.drop(path).join('.'))
	}
}

/**
 * merge some values to an object deep into a collection according to the keyPath
 *
 * @example
 *
 * let col = { a: { b: { c: { d: 'd'} }, e: { c: { f: 'g'} } } }
 * mergeDeep(col, 'c.d')
 * // { d: 'd', f: 'g'}
 *
 * @param collection
 * @param keyPath
 * @returns {*}
 */
function mergeDeep(collection, keyPath) {
	const path = keyPath.split('.')
	const id = path[0]
	const candidate = _findDeep(collection, id, [])

	if (path.length <= 1) {
		return candidate.reduce(function (result, val) {
			Object.assign(result, val)
			return result
		})
	} else {
		const prop = _.drop(path).join('.')
		return candidate.reduce(function (result, val) {
			let value = _.get(val, prop)
			if (value) {
				Object.assign(result, value)
			}

			return result
		}, {})
	}
}

/**
 *
 * @param collection
 * @param key
 * @param result
 * @returns {*}
 * @private
 */
function _findDeep(collection, key, result) {
	if (Array.isArray(collection)) {
		for (let col of collection) {
			_findDeep(col, key, result)
		}
	} else if (_.isObject(collection)) {
		if (collection[key]) {
			result.push(collection[key])
		} else {
			for (let objKey in collection) {
				if (collection.hasOwnProperty(objKey)) {
					_findDeep(collection[objKey], key, result)
				}
			}
		}
	}

	return result
}


/**
 * 构造 插件数组 glob 匹配规则
 *
 * @param {String} prefix
 * @param {Array<string>} plugins
 * @param {String} postfix
 * @returns {string}
 */
function getFileGlobPattern(prefix, plugins, postfix) {
	if (plugins.length === 1) {
		return path.join(prefix, plugins[0], postfix)
	} else {
		return path.join(prefix, '{' + plugins.join(',') + '}', postfix)
	}
}
