// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license


let vendors  = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
	var lastTime = 0;
	window.requestAnimationFrame = function(callback, element) {
		let currTime   = new Date().getTime();
		let timeToCall = Math.max(0, 16 - (currTime - lastTime));
		let id         = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
		lastTime       = currTime + timeToCall;
		return id;
	};
}

if (!window.cancelAnimationFrame) {
	window.cancelAnimationFrame = function(id) { clearTimeout(id); };
}

if (!window.requestNextAnimationFrame) {
	window.requestNextAnimationFrame = function (callback){
		window.requestAnimationFrame(function () {
			window.requestAnimationFrame(function (ts) {
				callback(ts);
			});
		});
	}
}

let requestAnimationFrame = window.requestAnimationFrame;
let cancelAnimationFrame = window.cancelAnimationFrame;
let requestNextAnimationFrame = window.requestNextAnimationFrame;

export {
	requestAnimationFrame as requestAnimationFrame,
	cancelAnimationFrame as cancelAnimationFrame,
	requestNextAnimationFrame as requestNextAnimationFrame
};
