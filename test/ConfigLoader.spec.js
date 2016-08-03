/* eslint import/no-extraneous-dependencies:0 */
/**
 * Created by scott on 16-3-8.
 */
'use strict'

const expect = require('chai').expect
const loader = require('../lib/configLoader')

describe('#Config file loader test', function () {

	describe('test with full config file stack', function () {
		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})

		it('should load the config file on `cwd`', function () {

			const config = loader.run('./config.js')
			expect(config.port).to.be.equal(3002)

		})

		it('should load the specified config file like `./config/production/config.js`', function () {

			const config = loader.run('./config/production/config.js')
			expect(config.msg).to.be.equal(123456)

		})
	})

	describe('test with only default config file', function () {
		beforeEach('', function () {
			process.chdir('./test-resources/fake-brickyard2')
		})

		afterEach('', function () {
			process.chdir('../../')
		})

		it('should load the default config file', function () {

			const config = loader.run()
			expect(config.hashbit).to.equal(7)

		})
	})
})
