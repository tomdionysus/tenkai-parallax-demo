#!/usr/bin/env node
const path = require('path')

const Server = require("./lib/Server")
const Logger = require("./lib/Logger")
const JSCompiler = require("./lib/JSCompiler")

const routes = require('./config/routes')

function main() {
	// ENV and defaults
	var port = parseInt(process.env.PORT || "8080")

	// Logger
	var logger = new Logger()

	// Boot Message
	logger.log("Game Engine Demo","----")
	logger.log("BlackRaven 2020 (Tom Cully)","----")
	logger.log("v1.0.0","----")
	logger.log("","----")
	logger.log("Logging Level %s","----",Logger.logLevelToString(logger.logLevel))

	// Dependencies
	// DEV: For development purposes, the compiler also watches the core tenkai package for changes.
	var jsCompiler = new JSCompiler({ logger: logger, beautify: true, recompile: true, watchPaths: [ path.join(__dirname, 'node_modules/tenkai') ] })

	// Main Server
	var svr = new Server({
		jsCompiler: jsCompiler,
		logger: logger,
		port: port,
		env: process.env.ENV || 'prod'
	})

	routes.register(svr)

	// Server Start
	svr.start()
}

main()
