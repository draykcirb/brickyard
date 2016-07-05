/**
 * Created by scott on 16-3-8.
 */
'use strict'

const expect = require('chai').expect
const parseCommand = require('../bin/commandLoader')

describe('#Command line argument test', function () {

	describe('common handling', function () {
		beforeEach('reset command line arguments', function () {
			process.argv.length = 2
		})

		it('should successfully parse shortcut option like `-o dir`', function () {
			process.argv.push('-o', 'dir')

			let option = parseCommand()
			expect(option.output).to.equal('dir')
		})

		it('should successfully parse long-text option like `--watch`', function () {
			process.argv.push('--watch')

			let option = parseCommand()
			expect(option.watch).to.equal(true)
		})
	})

	describe('unknownOption handling', function () {
		beforeEach('reset command line arguments', function () {
			process.argv.length = 2
		})

		it('should ignore unknown shortcut option like `-a`', function () {
			process.argv.push('-a')

			let option = parseCommand()
			expect(option.a).to.be.an('undefined')
		})
		it('should ignore unknown long-text option like `--nobody`', function () {
			process.argv.push('--nobody')
			let option = parseCommand()
			expect(option.nobody).to.be.an('undefined')
		})
	})

	describe('parameter coercion', function () {
		beforeEach('reset command line arguments', function () {
			process.argv.length = 2
		})

		it('should parse into a normal string if nothing specified', function () {
			process.argv.push('--host', 'localhost')
			let option = parseCommand()
			expect(option.host).to.equal('localhost')
		})

		it('should parse number string into number like `8080`', function () {
			process.argv.push('--port', '8080')
			let option = parseCommand()
			expect(option.port).to.equal(8080)
		})

		it('should parse list string into array like `1,2,3`', function () {
			process.argv.push('--program', 'p1,p2,p3')
			let option = parseCommand()
			expect(option.program).to.eql(['p1', 'p2', 'p3'])
		})
	})

})
