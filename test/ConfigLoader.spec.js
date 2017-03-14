/* eslint import/no-extraneous-dependencies:0 */
/**
 * Created by scott on 16-3-8.
 */
'use strict'

const expect = require('chai').expect
const loader = require('../lib/configLoader')

describe('#Config file loader test', function () {
    describe('test with only default config file', function () {
        beforeEach('', function () {
            process.chdir('./test-resources/fake-brickyard2')
        })

        afterEach('', function () {
            process.chdir('../../')
        })

        it('should load the default config file', function () {

            const config = loader.loadDefaultConfig()
            expect(config.destPrefix).to.equal('build')

        })
    })
})
