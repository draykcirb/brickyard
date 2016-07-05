/**
 * Created by scott on 16-3-8.
 */
'use strict'

const expect = require('chai').expect
const loader = require('../bin/configLoader')

describe('#Config file loader test', function () {

	describe('test with full config file stack', function () {
		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})

		it('should load the config file on `cwd`', function () {

			const config = loader()
			expect(config).to.be.eql({})

		})

		it('should load the specified config file like `./config/production/config.js`', function () {

			const config = loader('./config/production/config.js')
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

			const config = loader()
			expect(config.msg).to.be.equal(123)

		})
	})


	describe('test with no config file', function () {
		beforeEach('', function () {
			process.chdir('./test-resources/fake-brickyard3')
		})

		afterEach('', function () {
			process.chdir('../../')
		})

		it('should throw an error if there is no config file', function () {

			let hasError = false

			try {
				const config = loader()
			}
			catch (e) {
				hasError = true
			}

			expect(hasError).to.be.equal(true)

		})
	})
})
