/**
 * Created by scott on 16-3-31.
 */
'use strict'

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
		.description('release a program')
		.arguments('<program>')
		.usage('<program> [options]')
		.option('--dest <dir>', 'output dir')
		.option('--hashbit', 'fingerprint length of the resources')
		.option('--debuggable', 'release with debuggable application')
		.option('--server-address', 'the server address for ajax request')
		.action(function (program) {
			optionsCallback(Object.assign({ program: program }, this.opts()))
		})
}


function run() {

}
