/**
 * Created by scott on 16-3-30.
 */
'use strict'

const path = require('path')
const glob = require('globby')

const logger = require('log4js').getLogger('packageLoader')

module.exports = Object.seal({
	getPackages
})

/**
 * @name Package
 * @property path
 */

/**
 * read all the packages' info matching the glob-style pattern,
 * and do some transform to the info object through reduceFn
 *
 * @param {String|Array} pathPattern
 * @param {function(Package)} [transform]
 * @returns {Object}
 */
function getPackages(pathPattern, transform) {
	const packagesPaths = glob.sync(pathPattern)

	return packagesPaths.reduce(reducePackages, {})

	/**
	 * reducer
	 * @param {Object} packages
	 * @param {String} packagePath
	 * @returns {Object}
	 */
	function reducePackages(packages, packagePath) {
		const fullPath = path.resolve(packagePath)

		logger.debug(`try to read \`package.json\` of the package - ${packagePath}`)

		const pack = require(fullPath)

		pack.path = path.dirname(fullPath)

		const transformedPack = transform ? transform(pack) : pack

		if (packages[transformedPack.name]) {
			throw new Error(`Duplicated package ${transformedPack.name} - ${pack.path}`)
		} else if (transformedPack.name) {
			packages[transformedPack.name] = transformedPack
		} else {
			throw new Error(`Invalid package without a name - ${fullPath}`)
		}

		logger.trace(`push package \`${transformedPack.name}\` into collection`)
		return packages
	}
}
