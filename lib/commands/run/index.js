/**
 * Created by scott on 16-3-31.
 */
'use strict'

const sps = require('./static-proxy-server')

module.exports = {
	register,
	run
}

/**
 *
 * @param {Command} cmd
 * @param {function(Object)} optionsCallback
 */
function register(cmd, optionsCallback) {
	cmd
		.description('run a program on the target release dir')
		.arguments('<dir>')
		.usage('<dir> [options]')
		.option('--program <program...>', 'specify the program to read config', function (param) {
			return param.split(',').map(function (program) {
				return program.trim()
			})
		})
		.option('--no-browse', 'do not open the browser automatically')
		.option('--https', 'use https protocol to serve the resources')
		.action(function (dir) {
			optionsCallback(Object.assign({ dir: dir }, this.opts()))
		})
}

function run(runtime) {
	sps(runtime.config)
}
