#!/usr/bin/env node

const Server = require("./lib/Server")
const Logger = require("./lib/Logger")
const JSCompiler = require("./lib/JSCompiler")

const fs = require('fs')
const ncp = require('ncp')
const async = require('async')
const path = require('path')

var logger = new Logger({ logLevel: 'INFO' })

logger.info("Building into directory 'build'...")

async.series([
	// Clear Old Build Dir
	(cb) => { fs.rmdir('./build', { recursive: true }, cb) },
	// Make a new one, and subfolders
	(cb) => { fs.mkdir('./build', {}, cb) },
	(cb) => { fs.mkdir('./build/css', {}, cb) },
	(cb) => { fs.mkdir('./build/js', {}, cb) },
	// Build the app
	(cb) => {
		async.parallel([
			// Copy All electron support files
			(cb) => { ncp('./electron/', './build', cb) },
			// Copy All assets etc
			(cb) => { ncp('./game/public/', './build', cb) },
			// Compile JS
			(cb) => { compileJS('./build/js/app.js', cb) },
		], cb)
	}
], (err) => {
	if(err) {
		logger.error(err)
		return
	}
	logger.info("Build Complete")
})

function compileJS(filename, cb) {
	var jsCompiler = new JSCompiler({ logger: logger, beautify: false })
	jsCompiler.register(path.join(__dirname, './game', 'js'), (err, src) => {
		if(err) return cb(err)
		fs.writeFile(filename, src, cb)
	})
}