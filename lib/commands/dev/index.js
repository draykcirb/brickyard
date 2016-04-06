/**
 * Created by scott on 16-3-31.
 */
'use strict'

const logger = require('log4js').getLogger('dev-command')
const configMaker = require('./webpack.config')
const webpack = require('webpack')
const util = require('util')

module.exports = {
	register,
	run
}

/**
 *
 * @param {Command} cmd
 * @param {function(Object)} runnerCallback
 */
function register(cmd, runnerCallback) {
	logger.trace('register dev command')

	cmd
		.description('develop a program')
		.arguments('<program...>')
		.usage('<program...> [options]')
		.option('--https', 'use https protocol to serve the resources')
		.option('--port <port>', 'access port', parseInt)
		.option('--proxy-port <port>', 'access proxy port', parseInt)
		.option('--livereload', 'livereload')
		.option('--dest <dir>', 'output dir')
		.option('--watch', 'watch file for changes')
		.option('--lint', 'lint the files')
		.option('--no-browse', 'open the browser automatically')
		.option('--no-daemon', 'no background serve')
		.option('--server-address', 'the server address for ajax request')
		.action(function (program) {
			logger.trace('dev command invoke')
			runnerCallback && runnerCallback(Object.assign({ program: program }, this.opts()))
		})

	return cmd
}

function run(runtime) {
	logger.trace('dev command running')


	const config = configMaker.make(runtime)

	// console.log(util.inspect(config, { depth: 3 }))

	webpack(config, function (err, stats) {
		if (err) throw new Error('webpack:build', err)
		logger.info(stats.toString({
			assets: true,
			colors: true,
			version: true,
			hash: true,
			timings: true,
			chunks: false
		}))
	})
}
