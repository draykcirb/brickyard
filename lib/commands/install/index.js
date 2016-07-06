/**
 * Created by scott on 16-3-29.
 */
'use strict'

//const brickyard = require('brickyard')

module.exports = {
	register
}

/**
 *
 * @param {Command} cmd
 * @param {function(Object)} optionsCallback
 */
function register(cmd, optionsCallback) {
	cmd
		.description('install all dependencies of target program')
		.arguments('<program>')
		.usage('<program> [options]')
		.option('--registry <reg>', 'npm registry')
		.option('--offline', 'bower offline installation')
		.option('--save', 'save the dependencies to the root package')
		.action(function (program, options) {
			optionsCallback(Object.assign({ program: program }, options))
		})
}
