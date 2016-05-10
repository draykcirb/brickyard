/**
 * Created by scott on 16-5-10.
 */

'use strict'

const _ = require('lodash')
const express = require('express')
const proxy = require('http-proxy-middleware')
const morgan = require('morgan')
const path = require("path")
const open = require('opn')
const url = require('url')

const logger = require('log4js').getLogger('SPS')

module.exports = function createServer(config) {
	const server = express()
	const staticPath = path.resolve(process.cwd(), config.dir)

	server.use(express.static(staticPath))
	server.use(morgan('dev'))

	if (config.apiProxy) {
		server.use(proxy(config.apiProxy.address, {
			target: config.apiProxy.host,
			ws: true,
			changeOrigin: true
		}))
	}

	server.listen(config.port, config.host, function () {
		logger.info(`\nserving file from ${staticPath}\nstatic-proxy-server is running...`)

		const serverUrl = url.format({
			protocol: config.protocol,
			hostname: config.host,
			port: config.port
		})

		logger.info(`opening ${serverUrl}`)
		open(serverUrl)
	})
}
