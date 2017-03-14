/**
 * Created by scott on 16-3-31.
 */
'use strict'

const expect = require('chai').expect
const cli = require('../lib/cli')
const path = require('path')
const fs = require('fs')
const Command = require('commander').Command

describe('#CLI test', function () {
    beforeEach('', function () {
        process.chdir('./test-resources/fake-brickyard')
    })

    afterEach('', function () {
        process.chdir('../../')
    })

    it('should load all the commands in the commandStore', function () {
        const command = new Command('test')

        cli.load(command, null)

        expect(Object.keys(cli.commands)).to.eql(['init'])
    })

})

