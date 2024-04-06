// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
// not supported in all browsers though and sometimes needs a prefix, so we need a shim
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
})();



var canvas;
var ctx;
var cw;
var ch;

function setCanvas() {
    // now we will setup our basic variables for the demo
    canvas = document.createElement('canvas')

    // Canvas settings.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.position = "absolute";

    // Put the canvas in the html body.
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    // full screen dimensions
    cw = window.innerWidth;
    ch = window.innerHeight;
    loop();
}

var fireworks = [];
var particles = [];
var hue = 120;
var timerTotal = 20;
var timerTick = 0;

// get a random number within a range
function random(min, max) {
	return Math.random() * (max - min) + min;
}

// calculate the distance between two points
function calculateDistance( p1x, p1y, p2x, p2y ) {
	var xDistance = p1x - p2x;
	var yDistance = p1y - p2y;
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// create firework
function Firework(sx, sy, tx, ty) {
	// actual coordinates
	this.x = sx;
	this.y = sy;

	// starting coordinates
	this.sx = sx;
	this.sy = sy;

	// target coordinates
	this.tx = tx;
	this.ty = ty;

	// distance from starting point to target
	this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
	this.distanceTraveled = 0;

	// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 3;

	// populate initial coordinate collection with the current coordinates
	while(this.coordinateCount--) {
		this.coordinates.push( [this.x, this.y] );
	}
	this.angle = Math.atan2(ty - sy, tx - sx);
	this.speed = 2;
	this.acceleration = 1.05;
	this.brightness = random( 50, 70 );
	timerTotal = random(5, 80);
}

// update firework
Firework.prototype.update = function( index ) {
	// remove last item in coordinates array
	this.coordinates.pop();

	// add current coordinates to the start of the array
	this.coordinates.unshift( [ this.x, this.y ] );

	// speed up the firework
	this.speed *= this.acceleration;

	// get the current velocities based on angle and speed
	var vx = Math.cos(this.angle) * this.speed;
	var vy = Math.sin(this.angle) * this.speed;

	// how far will the firework have traveled with velocities applied?
	this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

	// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
	if(this.distanceTraveled >= this.distanceToTarget) {
		createParticles(this.tx, this.ty);
		// remove the firework, use the index passed into the update function to determine which to remove
		fireworks.splice(index, 1);
	} else {
		// target not reached, keep traveling
		this.x += vx;
		this.y += vy;
	}
}

// draw firework
Firework.prototype.draw = function() {
	// move to the last tracked coordinate in the set, then draw a line to the current x and y
	ctx.beginPath();
	ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
	ctx.stroke();
}

// create particle
function Particle(x, y) {
	this.x = x;
	this.y = y;

	// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 5;
	while(this.coordinateCount--) {
		this.coordinates.push([this.x, this.y]);
	}

	// set a random angle in all possible directions, in radians
	this.angle = random(0, Math.PI * 2);
	this.speed = random(1, 10);

	// friction will slow the particle down
	this.friction = 0.95;

	// gravity will be applied and pull the particle down
	this.gravity = 1;

	// set the hue to a random number +-50 of the overall hue variable
	this.hue = random(hue - 50, hue + 50);
	this.brightness = random(50, 80);
	this.alpha = 1;

	// set how fast the particle fades out
	this.decay = random( 0.015, 0.03 );
}

// update particle
Particle.prototype.update = function( index ) {
	// remove last item in coordinates array
	this.coordinates.pop();

	// add current coordinates to the start of the array
	this.coordinates.unshift([this.x, this.y]);

	// slow down the particle
	this.speed *= this.friction;

	// apply velocity
	this.x += Math.cos(this.angle) * this.speed;
	this.y += Math.sin(this.angle) * this.speed + this.gravity;

	// fade out the particle
	this.alpha -= this.decay;

	// remove the particle once the alpha is low enough, based on the passed in index
	if(this.alpha <= this.decay) {
		particles.splice(index, 1);
	}
}

// draw particle
Particle.prototype.draw = function() {
	// move to the last tracked coordinates in the set, then draw a line to the current x and y
	ctx.beginPath();
	ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
	ctx.stroke();
}

// create particle group/explosion
function createParticles(x, y) {
	// increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
	var particleCount = 30;
	while( particleCount--) {
		particles.push(new Particle(x, y));
	}
}

// main loop
function loop() {
	// this function will run endlessly with requestAnimationFrame
	requestAnimFrame( loop );

	// create random color
	hue = random(0, 360);

	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(0, 0, cw, ch);
	ctx.globalCompositeOperation = 'lighter';

	// loop over each firework, draw it, update it
	var i = fireworks.length;
	while(i--) {
		fireworks[i].draw();
		fireworks[i].update(i);
	}

	// loop over each particle, draw it, update it
	var i = particles.length;
	while(i--) {
		particles[i].draw();
		particles[i].update(i);
	}

	// launch fireworks automatically to random coordinates
	if(timerTick >= timerTotal) {
		xPlusOrMinus = Math.random() < 0.5 ? -1 : 1;
		fireworks.push( new Firework(((cw/8)*xPlusOrMinus)+(cw/2), ch, random(100, cw-100), random(100, ch/2)));
		timerTick = 0;
	} else {
		timerTick++;
	}
}

// once the window loads, we are ready for some fireworks!
window.onload = setCanvas;
