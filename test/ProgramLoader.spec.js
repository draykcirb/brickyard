/**
 * Created by scott on 16-3-8.
 */
'use strict'

const expect = require('chai').expect
const _ = require('lodash')
const loader = require('../lib/programLoader')

describe('#Program loader test', function () {

	describe('test with fake-brickyard', function () {

		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})

		it('should load the single `qiji` recipe and load correctly', function () {

			const programs = loader.getTargetPrograms(['qiji'], './recipes')

			expect(programs).to.have.all.keys('qiji')
			expect(programs['qiji']).to.have.property('id', 'qiji')

		})

		it('should load the multiple recipes', function () {

			const programs = loader.getTargetPrograms(['qiji', 'wcg-portal'], './recipes')

			expect(programs).to.have.all.keys('qiji', 'wcg-portal')
			expect(_.map(programs, 'id')).to.be.eql(['qiji', 'wcg-portal'])

		})

		it('should load all the recipes', function () {

			const programs = loader.getAllPrograms('./recipes')

			expect(programs).to.have.all.keys('admin', 'qiji', 'wcg-portal')
			expect(_.map(programs, 'id')).to.be.eql(['admin', 'qiji', 'wcg-portal'])

		})

		it('should load the single `qiji` recipe with a context', function () {

			const programs = loader.getTargetProgramsFromContext(['qiji'], loader.getAllPrograms('./recipes'))

			expect(programs).to.have.all.keys('qiji')
			expect(programs['qiji']).to.have.property('id', 'qiji')

		})

		it('should load nothing with non-exist `heaven` recipe', function () {

			const programs = loader.getTargetPrograms(['heaven'], './recipes')

			expect(programs).to.be.empty

		})
	})

	describe('test with fake-brickyard2', function () {

		beforeEach('fake the cwd', function () {
			process.chdir('./test-resources/fake-brickyard2')
		})

		afterEach('restore the cwd', function () {
			process.chdir('../../')
		})

		it('should load nothing but catch an error', function () {

			const fn = function () {
				loader.getTargetPrograms(['qiji'], './recipes')
			}

			expect(fn).to.throw(Error)

		})
	})

})



