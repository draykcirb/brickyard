/**
 * Created by scott on 16-3-15.
 */
'use strict'

const logger = require('../bin/logger')

before(function () {
	logger.configure({
		appenders: [
			{type:'console'}
		],
		levels: {
			'[all]': 'warn'
		}
	})
})
