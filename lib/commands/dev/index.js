/**
 * Created by scott on 16-3-31.
 */
'use strict'

const logger = require('log4js').getLogger('dev-command')
const configMaker = require('./webpack.config')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
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
		.option('--show-config', 'output the webpack config')
		.action(function (program) {
			logger.trace('dev command invoke')
			runnerCallback && runnerCallback(Object.assign({ program: program }, this.opts()))
		})

	return cmd
}

function run(runtime) {
	logger.trace('dev command running')


	const config = configMaker.make(runtime)
	if (runtime.config.showConfig) {
		console.log(util.inspect(config, { depth: 3 }))
	} else {
		const compiler = webpack(config/*, function (err, stats) {
			if (err) throw new Error('webpack:build', err)
			logger.info(stats.toString({
				assets: true,
				colors: true,
				version: true,
				hash: true,
				timings: true,
				chunks: false
			}))
		}*/)

		const server = new WebpackDevServer(compiler, {
			// Tell the webpack dev server from where to find the files to serve.
			contentBase: config.output.path,
			colors: true,
			publicPath: config.output.publicPath,
			host: runtime.config.proxyHostname,
			port: runtime.config.proxyPort,
			hot: true,
			stats: {
				assets: true,
				colors: true,
				version: true,
				hash: true,
				timings: true,
				chunks: false
			}
		})

		server.listen(runtime.config.port, runtime.config.hostname, function () {
			logger.info('webpack-dev-server running...')
		})
	}

}
