const express = require('express')
const fs = require('fs')
const path = require('path')
const Busboy = require('busboy')
const tmp = require('tmp')
const _ = require('underscore')
const compression = require('compression')

const Logger = require('./Logger')
const ScopedLogger = require('./ScopedLogger')

class Server {
	constructor(options) {
		options = options || {}

		
		this.port = options.port || 8080
		this.env = options.env || 'prod'

		// IoC depedencies
		this.logger = new ScopedLogger('HTTP', options.logger || new Logger())
		this.i18nEngine = options.i18nEngine || null
		this.jsCompiler = options.jsCompiler || null

		// The main HTTP server
		this.app = express()
		this.app.disable('x-powered-by')

		// Public healthcheck route for Load Balancer
		this.app.get('/healthcheck', (req,res) => { res.status(200).end() })

		// In production, redirect HTTP to HTTPS
		if(this.env=='prod') {
			this.app.use((req,res,next) => { this.httpsRedirect(req,res,next) })
		}

		// Logger
		this.app.use(this.httpLogger.bind(this))

		// Body Parser for forms/json
		this.app.use(this.formParser.bind(this))

		// i18n
		if (this.i18nEngine) this.app.use(this.i18nEngine.express.bind(this.i18nEngine))

		// Compression
		this.app.use(compression())
	}

	registerStatic(route, filepath) {
		this.app.use(route, express.static(path.join(__dirname, '../', filepath)))
	}

	registerJSCompiler(route, filepath) {
		this.jsCompiler.register(path.join(__dirname, '../', filepath))
		this.app.use(route, this.jsCompiler.express)
	}

	start() {
		
		// Finally, return not found
		this.app.use((req,res) => {
			this.statusEnd(req, res, 404)
		})

		// Catch All Error Handler
		this.app.use((err, req, res) => {
			this.status500End(req, res, err)
		})

		this.app.listen(this.port, () => {
			this.logger.info('Server listening on port %d', this.port)
		})
	}

	// HTTPS redirect middleware
	httpsRedirect(req, res, next) {
		var forwardedProto = req.get('x-forwarded-proto')
		if(forwardedProto && forwardedProto!='https') { return res.redirect('https://'+req.hostname+req.originalUrl) }
		next()
	}

	// Redirect
	redirect(res, url) {
		res.redirect(url)
	}

	// HTTP logger middleware
	httpLogger(req, res, next) {
		this.logger.info(req.method+' '+req.url)
		next()
	}

	// Multipart Form/File parser middleware
	formParser(req, res, next) {
		if(['POST','PATCH'].indexOf(req.method)==-1) { next(); return }
		var ct = req.get('content-type') || ''
		switch (ct) {
		case 'application/json':
			req.setEncoding('utf8')
			var data = ''
			req.on('data', (chunk) => { data += chunk })
			req.on('end', () => {
				try {
					req.body = JSON.parse(data)
				} catch(e) {
					res.status(422).send(JSON.stringify({code: 'JSON_ERROR', message: 'Error decoding JSON'})).end()
					return
				}
				next()
			})
			return
		case 'application/x-www-form-urlencoded':
			req.body = {}
			var busboy = new Busboy({ headers: req.headers })
			busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
				var tmpFile = tmp.fileSync()
				req.body[fieldname] = {
					filename: filename,
					encoding: encoding,
					mimetype: mimetype,
					stream: fs.createWriteStream(null, {fd: tmpFile.fd}),
					length: 0
				}
				file.on('data', (data) => {
					req.body[fieldname].stream.write(data)
					req.body[fieldname].length += data.length
				})
				file.on('end', () => {
					req.body[fieldname].stream.end()
					req.body[fieldname].stream = fs.createReadStream(tmpFile.name)
				})
			})
			busboy.on('field', (fieldname, val) => {
				if(req.body[fieldname]) {
					if(!_.isArray(req.body[fieldname])) req.body[fieldname] = [ req.body[fieldname] ]
					req.body[fieldname].push(val)
				} else {
					req.body[fieldname] = val
				}
			})
			busboy.on('finish', () => {
				next()
			})
			req.pipe(busboy)
			break
		default:
			res.status(415).send(JSON.stringify({code: 415, message: 'Unsupported Content-Type `'+ct+'`'})).end()
			break
		}

	}

	statusEnd(req, res, status) {
		status = status.toString()
		res.status(status).end()
	}

	status500End(req, res, err) {
		this.logger.error('Exception: '+err+': '+err.stack)
		this.statusEnd(req, res,  500)
	}

	status404End(req, res, err) {
		this.logger.error('Exception: '+err+': '+err.stack)
		this.statusEnd(req, res,  404)
	}

	serveAndExit(res, file, code) {
		res.set('Content-Type','text/html')
		res.send(fs.readFileSync(path.join(__dirname,file))).status(code).end()
	}
}

module.exports = Server