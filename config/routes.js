module.exports.register = function(svr) {
	// Public Assets
	svr.registerStatic('/','game/public')

	// Clientside JS Compiler
	svr.registerJSCompiler('/js/app.js', 'game/js')
}
