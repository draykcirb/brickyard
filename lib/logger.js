/**
 * Created by scott on 16-3-11.
 */
'use strict'

const log4js = require('log4js')
const _ = require('lodash')

// log4js.replaceConsole()
log4js.backlogFile = function (backlogPath) {
    let logPath = _.isBoolean(backlogPath) ? 'logs/build.log' : backlogPath

    log4js.configure({
        appenders: [
            { type: 'console' },
            { type: 'file', filename: logPath, maxLogSize: 1000000, backups: 10 }
        ],
        replaceConsole: true
    })
}

module.exports = log4js
