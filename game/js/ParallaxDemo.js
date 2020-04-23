const async = require('async')

const { GameEngine, TiledScene, Entity } = require('tenkai')

class ParallaxDemo extends GameEngine {
	constructor(options) {
		super(options)

		// Fullscreen, for electron
		this.fullscreen = true

		// No scrolling, zooming or debug HUD
		this.enableScroll = false
		this.enableZoom = false
		this.showHUD = false

		// Start faded out
		this.globalAlpha = 1

		// Scale
		this.scale = 1

		// Bring in that cute Kobold village
		this.addAsset('layer_0','./backgrounds/landscape_layer_0.png')
		this.addAsset('layer_1','./backgrounds/landscape_layer_1.png')
		this.addAsset('layer_2','./backgrounds/landscape_layer_2.png')
		this.addAsset('layer_3','./backgrounds/landscape_layer_3.png')
		this.addAsset('layer_4','./backgrounds/landscape_layer_4.png')
		this.addAsset('layer_5','./backgrounds/landscape_layer_5.png')

		this.on('mousedown', this.onMouseDown.bind(this))
		this.on('resize', this.onResize.bind(this))
	}

	init(callback) {
		this.bg_0 = this.addScene('bg_0', new TiledScene({ asset: this.getAsset('layer_0'), x: -512, y: 150, z: 5, tileWidth: 512, tileHeight: 512, layers: { 0: [[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]] }}))
		this.bg_1 = this.addScene('bg_1', new TiledScene({ asset: this.getAsset('layer_1'), x: -512, y: 120, z: 4, tileWidth: 512, tileHeight: 512, layers: { 0: [[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]] }}))
		this.bg_2 = this.addScene('bg_2', new TiledScene({ asset: this.getAsset('layer_2'), x: -512, y: 90, z: 3, tileWidth: 512, tileHeight: 512, layers: { 0: [[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]] }}))
		this.bg_3 = this.addScene('bg_3', new TiledScene({ asset: this.getAsset('layer_3'), x: -512, y: 60, z: 2, tileWidth: 512, tileHeight: 512, layers: { 0: [[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]] }}))
		this.bg_4 = this.addScene('bg_4', new TiledScene({ asset: this.getAsset('layer_4'), x: -512, y: 30, z: 1, tileWidth: 512, tileHeight: 512, layers: { 0: [[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]] }}))
		this.bg_5 = this.addScene('bg_5', new TiledScene({ asset: this.getAsset('layer_5'), x: -512, y: 0, z: 0, tileWidth: 512, tileHeight: 512, layers: { 0: [[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]] }}))

		// Store the middle of the screen in x
		this.charStopX = (this.width/2)-24

		callback()
	}

	onMouseDown() {
		if(!this.playing) {
			this.playing = true

			this.scrTimeout = setInterval(()=>{
				this.bg_0.x -= 0.8; this.bg_0.redraw()
				this.bg_1.x -= 0.6; this.bg_1.redraw()
				this.bg_2.x -= 0.4; this.bg_2.redraw()
				this.bg_3.x -= 0.3; this.bg_3.redraw()
				this.bg_4.x -= 0.2; this.bg_4.redraw()
				this.bg_5.x -= 0.1; this.bg_5.redraw()
			},25)
		} else {
			clearInterval(this.scrTimeout)
			this.playing = false
		}
	}

	onResize() {
		this.redraw()
	}
}

module.exports = ParallaxDemo