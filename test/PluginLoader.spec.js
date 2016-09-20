/**
 * Created by scott on 16-3-9.
 */
'use strict'

const expect = require('chai').expect
const loader = require('../lib/pluginLoader')

describe('#Plugins loader test', function () {

    describe('test with non-empty plugin store', function () {
        beforeEach('fake the cwd', function () {
            process.chdir('./test-resources/fake-brickyard')
        })

        afterEach('restore the cwd', function () {
            process.chdir('../../')
        })

        it('should load the specified plugins with direct plugin declaration', function () {
            const specifiedPlugins = ['common-service/udp-lbs', 'wcg-portal']
            const plugins = loader.getTargetPlugins('./plugins', specifiedPlugins)

            expect(plugins).to.have.all.keys('udp-lbs', 'wcg-portal')
        })

        it('should load the specified plugins without direct plugin declaration', function () {
            const specifiedPlugins = ['admin']
            const plugins = loader.getTargetPlugins('./plugins', specifiedPlugins)

            expect(plugins).to.have.all.keys(
                'admin-activation-code',
                'admin-activation-code-server',
                'admin-business',
                'admin-business-server'
            )
        })

        it('should load the specified plugins including a `bower.json`', function () {
            const specifiedPlugins = ['wcg-portal']
            const plugins = loader.getTargetPlugins('./plugins', specifiedPlugins)

            expect(plugins['wcg-portal']).to.have.deep.property('bower')
        })

        it('should throw an error with no matched plugin name', function () {
            const specifiedPlugins = ['heaven']

            const fn = function () {
                loader.getTargetPlugins('./plugins', specifiedPlugins)
            }

            expect(fn).to.throw(Error)
        })
    })

    describe('test with plugin doesn\'t have `package.json`', function () {
        beforeEach('fake the cwd', function () {
            process.chdir('./test-resources/fake-brickyard2')
        })

        afterEach('restore the cwd', function () {
            process.chdir('../../')
        })

        it('should throw an error with no plugin found', function () {
            const specifiedPlugins = ['wcg-portal']

            const fn = function () {
                loader.getTargetPlugins('./plugins', specifiedPlugins)
            }

            expect(fn).to.throw(Error)
        })
    })
})
