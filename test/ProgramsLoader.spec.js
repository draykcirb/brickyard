/**
 * Created by scott on 16-3-8.
 */
'use strict'

const expect = require('chai').expect
const _ = require('lodash')
const loader = require('../bin/programsLoader')

describe('#Program recipe loader test', function () {

	it('should load the `qiji` recipe', function () {
		// fake the cwd'
		process.chdir('./test-resources/fake-brickyard')

		const programs = loader(['qiji'])

		expect(programs).to.have.all.keys('qiji')
		expect(programs['qiji']).to.have.property('id', 'qiji')

		// restore the cwd'
		process.chdir('../../')
	})

	it('should load the `qiji,wcg-portal` recipe', function () {
		// fake the cwd'
		process.chdir('./test-resources/fake-brickyard')

		const programs = loader(['qiji', 'wcg-portal'])

		expect(programs).to.have.all.keys('qiji', 'wcg-portal')
		expect(_.map(programs, 'id')).to.be.eql(['qiji', 'wcg-portal'])

		// restore the cwd'
		process.chdir('../../')
	})

	it('should load nothing with non-exist `heaven` recipe', function () {
		// fake the cwd'
		process.chdir('./test-resources/fake-brickyard')

		const programs = loader(['heaven'])

		expect(programs).to.be.eql({})

		// restore the cwd'
		process.chdir('../../')
	})

	it('should load nothing but catch an error', function () {
		let hasError = false
		// fake the cwd'
		process.chdir('./test-resources/fake-brickyard2')

		try {
			const programs = loader(['qiji'])
		}
		catch (e) {
			hasError = true
		}

		expect(hasError).to.be.equal(true)

		// restore the cwd'
		process.chdir('../../')
	})
})



