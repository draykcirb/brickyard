#!/usr/bin/env node

'use strict'

const Liftoff = require('liftoff')
const Command = require('commander').Command
const packageInfo = require('../package.json')

boot(require('minimist')(process.argv.slice(2)))

/**
 * boot up the whole command app
 * @param {Object} argv
 */
function boot(argv) {
    const app = new Liftoff({
        name: packageInfo.name,
        processTitle: packageInfo.name,
        moduleName: packageInfo.name,
        configName: 'by-conf',
        extensions: {
            '.js': null,
            '.json': null
        },
        v8flags: ['--harmony']
    })

    app.launch({
        configPath: argv.config
    }, (env) => {
        let brickyard = !env.modulePath ? require('../') : require(env.modulePath)

        if (argv.backlog) {
            brickyard.logger.backlogFile(argv.backlog)
        }

        if (argv.verbose) {
            brickyard.setLogLevel('debug')
        } else {
            brickyard.setLogLevel(argv.loglevel)
        }

        const rootCmd = initRootCmd(packageInfo)

        brickyard.cli.load(rootCmd, env)

        rootCmd.parse(process.argv)
    })
}

/**
 * initiate the root command
 * @param {Object} pkgInfo
 * @returns {*|Command}
 */
function initRootCmd(pkgInfo) {
    const cmd = new Command(pkgInfo.name)

    cmd
        .version(pkgInfo.version, '-v, --version')
        .alias('by')
        .arguments('[cmd]')
        .description(pkgInfo.description)
        .usage('[cmd] [options]')
        .option('--config <path>', 'config path')
        .option('--no-color', 'output without color')
        .option('--backlog [dir]', 'output without color. If not dir specified, will use default dir name.')
        .option('--loglevel <level>', 'output log verbosity. Available levels are: trace,debug,info,warn,error,fatal')
        .option('-V, --verbose', 'output log verbosely. Same as debug level. Prior to loglevel argument', Boolean, false)

    return cmd
}
