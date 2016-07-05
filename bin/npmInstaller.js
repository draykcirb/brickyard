/**
 * Created by scott on 16-3-9.
 */
'use strict'

const npm = require('npm')
const Promise = require('bluebird')
const semver = require('semver')
const _ = require('lodash')
const logger = require('./logger').getLogger('NpmInstaller')

// 对npm.load方法进行promise转换
const npmLoad = Promise.promisify(npm.load)

module.exports = {
	diff: diffNpmInstalledPackages,
	install: installNpmPackages,
	checkAndInstall: checkAndInstall
}

/**
 *
 * @param {Object} targetDependencies
 * @param {Object} config
 * @returns {Promise.<T>}
 */
function checkAndInstall(targetDependencies, config) {
	logger.debug('install config is: ', config)

	if (!_.isPlainObject(config)) {
		throw new Error('npm install config must be an Object')
	}

	/**
	 * npm.load 有个特性是load之后再次load传入的config不会生效，所以要预载
	 */
	return npmLoad(config)
		.then(function () {
			return diffNpmInstalledPackages(targetDependencies)
		})
		.then(function (dependencies) {
			return installNpmPackages(dependencies)
		})
}

/**
 * install target dependencies with custom config
 *
 * @param {Object} dependencies
 * @returns {Promise.<T>}
 */
function installNpmPackages(dependencies) {
	logger.trace('npm packages to be installed are: ', dependencies)

	return npmLoad()
		.then(function () {
			const installCmd = Promise.promisify(npm.commands.install, { multiArgs: true })

			logger.info('installing npm dependencies...')
			return installCmd('.', createNpmDependenciesArray(dependencies))
		})
		.then(function (list) {
			logger.debug('installed npm packages: ', list[0])
			return list
		})
}

/**
 * transform the dependency object into array style for npm convention
 *
 * e.g. { "jquery": "~2.1.4" } => ["jquery@~2.1.4"]
 *
 * @param {Object} dependencies
 * @returns {Array}
 */
function createNpmDependenciesArray(dependencies) {
	const result = _.map(dependencies, function (dep, name) {
		return name + '@' + dep
	})

	logger.trace('bower dependencies array is: ', result)

	return result
}

/**
 * compare the targetDependencies with installedDependencies,
 * and filter the unmatched dependencies
 *
 * @param {Object} targetDependencies
 * @returns {Promise.<T>}
 */
function diffNpmInstalledPackages(targetDependencies) {
	logger.info('checking npm dependencies...')

	logger.trace('target bower packages are: ', targetDependencies)

	return extractInstalledPackagesData()
		.then(function (installedPackages) {
			return _.omitBy(targetDependencies, function (targetVersion, name) {
				if (installedPackages[name]) {
					if (semver.satisfies(installedPackages[name].version, targetVersion)) {
						return true
					} else {
						logger.debug(`package ${name} was installed, but doesn't match the target version - ${targetVersion}`)
						return false
					}
				} else {
					logger.debug(`package ${name} isn't installed`)
					return false
				}
			})
		})
}

/**
 * use npm list command to extract installed packages' data
 *
 * @returns {Promise.<T>}
 */
function extractInstalledPackagesData() {
	return npmLoad()
		.then(function () {
			const listCmd = Promise.promisify(npm.commands.list, { multiArgs: true })

			logger.trace('listing npm packages...')
			return listCmd(null, true)
		})
		.spread(function (data, liteData) {
			return liteData.dependencies
		})
		.catch(function (err) {
			logger.error(err)
			return error
		})
}