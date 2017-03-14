/* eslint no-underscore-dangle:0 */
/**
 * Created by scott on 16-3-29.
 */
'use strict'

const _ = require('lodash')
const path = require('path')
const logger = require('log4js').getLogger('CLI')
const Promise = require('bluebird')

const brickyard = require('./brickyard')
const packageLoader = require('./packageLoader')
const butil = require('../lib/util')

const cli = {
    commands: {},
    load
}

module.exports = cli

/**
 * load all the target command modules,
 * and register them all so you can see them through CLI,
 * pass a callback to the command so when the command is
 * triggered, brickyard can do something to run the command.
 *
 * @param {Command} rootCmd
 * @param {Object} env
 * @returns {Promise}
 */
function load(rootCmd, env) {
    brickyard.userConfig = env ? loadUserConfig(env.configPath) : null

    return new Promise(resolve => loadCommands(rootCmd, getUserSpecifiedCommands(brickyard.userConfig), resolve))
        .spread((cmdName, options) => {
            const targetCmd = brickyard.cli.commands[cmdName]

            brickyard.cmdOptions = butil.assignWithValid({}, options, rootCmd.opts())

            brickyard.load(targetCmd.config)

            targetCmd.run(brickyard.hatchRuntime())
        })
        .catch((e) => {
            throw e
        })
}

function getUserSpecifiedCommands(userConfig) {
    return userConfig ? userConfig.commands : null
}

function loadUserConfig(confPath) {
    return confPath ? require(confPath) : null
}

function loadCommands(rootCmd, userCommands, resolve) {
    logger.trace('batch register commands')

    if (Array.isArray(userCommands)) {
        loadSpecificCommands(rootCmd, userCommands, resolve)
    } else {
        autoDetectCommands(rootCmd, resolve)
    }
}

function loadSpecificCommands(rootCmd, userCommands, resolve) {
    logger.trace('loading specific commands')
    const commandsConfig = userCommands.reduce(function constructCmdConfig(result, cmd) {
        if (_.isObject(cmd)) {
            if (!path.isAbsolute(cmd.path)) {
                throw Error('Path inside command object must be absolute path.')
            } else {
                result.push(cmd)
            }
        } else {
            result.push({ name: cmd })
        }

        return result
    }, [])

    _loadCommands(rootCmd, commandsConfig, resolve)
}

function autoDetectCommands(rootCmd, resolve) {
    logger.trace('auto-detecting commands')
    const commandsRepo = 'brickyard-command-*'
    const commandsPathPattern = path.join(process.cwd(), 'node_modules', commandsRepo, 'package.json')
    const commandsConfig = packageLoader.getPackages(commandsPathPattern)

    _loadCommands(rootCmd, commandsConfig, resolve)
}

function _loadCommands(rootCmd, commandsConfig, resolve) {
    logger.trace('loading the actual commands')

    _.forOwn(commandsConfig, function (cmdConfig) {
        const cmdModule = require(cmdConfig.path || cmdConfig.name)
        const cmdName = cmdConfig.name.split('-')[2]

        if (!cmdName) {
            throw new Error('Invalid brickyard command module, it should be named by `brickyard-command-***`.')
        }

        cmdModule.register(rootCmd.command(cmdName), result => resolve([cmdName, result]))

        cli.commands[cmdName] = cmdModule
    })
}
