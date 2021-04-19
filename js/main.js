// useful global variables
const g = {
	mouseForce: 0,

	vis: opt.vision,
	sqVis: opt.vision * opt.vision,

	mouse: {
		x: 0,
		y: 0,
		down: false,
		over: true,
		button: 0,
	},

	explode: 0,
	explodePos: new V2D(),

	nextFrame: false,

	width: window.innerWidth,
	height: window.innerHeight,

	sprites: {
		explode: (() => {
			let shape = new PIXI.Graphics();

			shape.clear();
			shape.beginFill(0x000000);
			shape.drawCircle(0, 0, 100);
			shape.endFill();

			return shape;
		})(),
	},

	delta: 1,
	bias: parseFloat(opt.rbias),

	shapeMode: 1,
	noiseRange: Math.PI / 80 * opt.noise
}

// PIXI app
const app = new PIXI.Application({
	width: g.width,
	height: g.height,
	antialias: true,
	transparent: false,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: 0x161616
});

document.body.appendChild(app.view);

let flock = new Flock(opt.boids);

function loop(delta) {
	g.delta = delta;

	g.mouseForce = max(opt.maxForce *
		(opt.alignment + opt.cohesion + opt.separation + 1) / 4, 0);
	g.vis = opt.vision;
	g.sqVis = g.vis * g.vis;

	if (!opt.paused) {
		flock.update();
	} else if (g.nextFrame) {
		flock.update();
		g.nextFrame = false;
	}

	flock.draw();
	
	if (g.explode === 1) {
		app.stage.addChild(g.sprites.explode);
	}
	if (g.explode > 0.001) {
		let s = Math.sqrt(g.explode);
		g.sprites.explode.alpha = s;
		g.sprites.explode.scale.x = s;
		g.sprites.explode.scale.y = s;

		g.explode *= 0.9;
	} else if (g.explode !== 0) {
		app.stage.removeChild(g.sprites.explode);
		g.explode = 0;
	}

	if (opt.debug) {
		opt.special.fpsA.push(60 / delta);
		opt.special.fps = opt.special.fpsA.reduce((a, v) => a + v, 0) / 10;
		if (opt.special.fpsA.length >= 10) opt.special.fpsA.shift();
	}

	app.render();
}

app.ticker.add(loop);