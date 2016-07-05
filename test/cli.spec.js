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
	let currentDirData = {}

	it('should load all the commands in the commandStore', function () {
		const command = new Command('')

		cli.load(command, {}, function () {})

		expect(Object.keys(cli.commands)).to.have.lengthOf(1)
	})

})

