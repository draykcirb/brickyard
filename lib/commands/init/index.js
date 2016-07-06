/**
 * Created by scott on 16-3-31.
 */
'use strict'

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
		.description('init a plugin')
		.arguments('<plugin>')
		.action(function (plugin, options) {
			optionsCallback({ pluginName: plugin })
		})
}
