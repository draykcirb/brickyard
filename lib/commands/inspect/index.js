/**
 * Created by scott on 16-3-31.
 */
'use strict'

const butil = require('../../util')

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
		.description('output the runtime object of the plugin')
		.arguments('<program...>')
		.action(function (program, options) {
			optionsCallback({ program: program })
		})
}

function run(runtime) {
	runtime.config = butil.sortObjectKeys(runtime.config)
	console.log(JSON.stringify(runtime, null, 4))
}


