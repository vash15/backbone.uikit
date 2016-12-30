
var $ = require('jquery');

var _elementStyle = document.createElement('div').style;
var _transition   = 'webkitTransition' in _elementStyle ? 'webkitTransition' : 'transition';
var _transform    = 'webkitTransform' in _elementStyle ? 'webkitTransform' : 'transform';
var _backface     = 'webkitBackfaceVisibility' in _elementStyle ? 'webkitBackfaceVisibility' : 'backfaceVisibility';

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
function requestNextAnimationFrame(callback){
	requestAnimationFrame(function () {
        requestAnimationFrame(function (ts) {
            callback(ts);
        });
    });
};


// Return the vendor
// http://addyosmani.com/polyfillthehtml5gaps/slides/#78
var  getVendorStyle = function getVendorStyle(prop){
	var prefixes = ['Moz','Khtml','Webkit','O','ms'];
	var upper    = prop.charAt(0).toUpperCase() + prop.slice(1);

	if ( prop in _elementStyle )
		return prop;

	for (var len = prefixes.length; len--; ){
		if ( (prefixes[len] + upper)  in _elementStyle )
			return (prefixes[len] + upper);
	}
	return;
};

// Translate3d
var translate3d = function translate3d(el, x, y, z, immediate) {

	if ( el instanceof $ )
		el = el.get(0);

	if ( !el instanceof Element )
		throw new Error('It is not an object Element');

	if ( typeof x === 'number' )
		x = x.toString() + 'px';
	if ( typeof y === 'number' )
		y = y.toString() + 'px';
	if ( typeof z === 'number' )
		z = z.toString() + 'px';

	//
	var transformProp = getVendorStyle('transform');
	var transform     = 'translate3d(' + x +', ' + y + ', ' + z + ')';

	//
	if (immediate) {
		el.style[ transformProp ] = transform;
		return;
	}

	//
	requestAnimationFrame(function(){
		el.style[ transformProp ] = transform;
	});

};

var scale = function scale(el, scale, immediate) {

	if ( el instanceof $ )
		el = el.get(0);

	if ( !el instanceof Element )
		throw new Error('It is not an object Element');

	var transformProp = getVendorStyle('transform');
	var transform     = 'scale(' + scale + ')';

	if (immediate) {
		el.style[ transformProp ] = transform;
		return;
	}

	requestAnimationFrame(function(){
		el.style[ transformProp ] = transform;
	});

}

var scaleAndTranslate3d = function scaleAndTranslate3d(el, scale, x, y, z, immediate) {

	if ( el instanceof $ )
		el = el.get(0);

	if ( !el instanceof Element )
		throw new Error('It is not an object Element');

	if ( typeof x === 'number' )
		x = x.toString() + 'px';
	if ( typeof y === 'number' )
		y = y.toString() + 'px';
	if ( typeof z === 'number' )
		z = z.toString() + 'px';

	var transformProp = getVendorStyle('transform');
	var transform     = 'scale(' + scale + ') translate3d(' + x +', ' + y + ', ' + z + ')';

	if (immediate) {
		el.style[ transformProp ] = transform;
		return;
	}

	requestAnimationFrame(function(){
		el.style[ transformProp ] = transform;
	});

};

// Overflow scrolling
var overflowScrollingProperty;
var overflowScrolling = function overflowScrolling(el, enable) {
	if (!overflowScrollingProperty)
		overflowScrollingProperty = 'webkitOverflowScrolling' in el.style ? 'webkitOverflowScrolling' : 'overflowScrolling';

	if (enable) {
		el.style[overflowScrollingProperty] = 'touch';
	} else {
		el.style[overflowScrollingProperty] = 'auto';
	}

};


module.exports = {
	transition                : _transition,
	transform                 : _transform,
	backface                  : _backface,
	requestNextAnimationFrame : requestNextAnimationFrame,
	getVendorStyle            : getVendorStyle,
	translate3d               : translate3d,
	scale                     : scale,
	scaleAndTranslate3d       : scaleAndTranslate3d,
	overflowScrolling         : overflowScrolling
};
