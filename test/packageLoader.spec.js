/**
 * Created by scott on 16-3-31.
 */
'use strict'

const expect = require('chai').expect
const loader = require('../lib/packageLoader')

describe('#Package loader test', function () {

	describe('test with fake-brickyard', function () {
		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})

		it('should load all the package.json under plugins', function () {

			const packages = loader.getPackages('./plugins/**/package.json')
			expect(Object.keys(packages)).to.have.lengthOf(6)

		})

	})


	describe('test with fake-brickyard2', function () {
		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard2')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})

		it('should load no package', function () {

			const packages = loader.getPackages('./plugins/**/package.json')
			expect(Object.keys(packages)).to.have.lengthOf(0)

		})
	})

	describe('test with fake-brickyard3', function () {
		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard3')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})

		it('should throw an error without package name', function () {

			const fn = function () {
				loader.getPackages('./plugins/**/package.json')
			}
			expect(fn).to.throw(Error)

		})
	})
	describe('test with fake-brickyard4', function () {
		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard3')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})


		it('should throw an error with duplicated package name', function () {

			const fn = function () {
				loader.getPackages('./plugins/**/package.json')
			}

			expect(fn).to.throw(Error)
		})
	})
})
