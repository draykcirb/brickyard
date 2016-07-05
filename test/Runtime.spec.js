/**
 * Created by scott on 16-3-15.
 */
'use strict'

const expect = require('chai').expect

const runtime = require('../bin/runtime')

describe('#Runtime loader test', function () {
	before('fake the cwd', function () {
		process.chdir('./test-resources/fake-brickyard')
	})

	after('restore the cwd', function () {
		process.chdir('../../')
	})

	beforeEach('reset command line arguments', function () {
		process.argv.length = 2
	})

	it('should init the runtime successfully with target program and port', function () {
		process.argv.push('--program', 'wcg-portal', '--port', 8020)

		const rt = runtime.init()

		expect(rt).to.have.deep.property('FE.host.wcg-portal.entry', 'plugins/wcg-portal/index.js')
		expect(rt).to.have.deep.property('config.port', 8020)
	})
})
