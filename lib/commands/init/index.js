/**
 * Created by scott on 16-3-31.
 */
'use strict'

const Promise = require('bluebird')
const path = require('path')
const fs = require('fs');
const mkdirp = Promise.promisify(require('mkdirp'))
const logger = require('log4js').getLogger('init-command')

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
		.description('init a plugin placing inside pluginStore')
		.arguments('<plugin>')
		.action(function (plugin) {
			optionsCallback({ pluginName: plugin })
		})
}

function run(runtime) {
	const targetDir = path.join(process.cwd(), runtime.config.pluginStore, runtime.config.pluginName)
	mkdirp(targetDir)
		.then(function () {
			logger.info('initiating plugin')
			const template = require('./template.json')

			template.name = path.basename(targetDir)

			fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(template, null, 2), null, function () {
				logger.info(`plugin ${runtime.config.pluginName} initiated`)
			})
		})
}
