
import $ from 'jquery';

// Create an element div for util
export let _elementStyle = document.createElement('div').style;


// Return the vendor
// http://addyosmani.com/polyfillthehtml5gaps/slides/#78
export function getVendorStyle(prop){
	let prefixes = ['Moz','Khtml','Webkit','O','ms'];
	let upper    = prop.charAt(0).toUpperCase() + prop.slice(1);

	if ( prop in _elementStyle )
		return prop;

	for (var len = prefixes.length; len--; ){
		if ( (prefixes[len] + upper)  in _elementStyle )
			return (prefixes[len] + upper);
	}
	return;
};

// Translate3d
export function translate3d(el, x, y, z, immediate) {

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
	let transformProp = getVendorStyle('transform');
	let transform     = 'translate3d(' + x +', ' + y + ', ' + z + ')';

	//
	if (immediate) {
		el.style[ transformProp ] = transform;
		return;
	}

	//
	window.requestAnimationFrame(() => {
		el.style[ transformProp ] = transform;
	});

};

// scale
export function scale(el, scale, immediate) {

	if ( el instanceof $ )
		el = el.get(0);

	if ( !el instanceof Element )
		throw new Error('It is not an object Element');

	let transformProp = getVendorStyle('transform');
	let transform     = 'scale(' + scale + ')';

	if (immediate) {
		el.style[ transformProp ] = transform;
		return;
	}

	window.requestAnimationFrame(() => {
		el.style[ transformProp ] = transform;
	});

};

// scaleAndTranslate3d
export function scaleAndTranslate3d(el, scale, x, y, z, immediate) {

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

	let transformProp = getVendorStyle('transform');
	let transform     = 'scale(' + scale + ') translate3d(' + x +', ' + y + ', ' + z + ')';

	if (immediate) {
		el.style[ transformProp ] = transform;
		return;
	}

	window.requestAnimationFrame(() => {
		el.style[ transformProp ] = transform;
	});

};

// Overflow scrolling
let overflowScrollingProperty;
export function overflowScrolling(el, enable, orientation = 'vertical') {
	if (!overflowScrollingProperty)
		overflowScrollingProperty = 'webkitOverflowScrolling' in el.style ? 'webkitOverflowScrolling' : 'overflowScrolling';

	if (enable) {
		el.style[overflowScrollingProperty] = 'touch';
		if (orientation === 'vertical') {
			el.style.overflowX = 'hidden';
			el.style.overflowY = 'auto';
		}
		else if (orientation === 'horizontal') {
			el.style.overflowX = 'auto';
			el.style.overflowY = 'hidden';
		}
	} else {
		el.style[overflowScrollingProperty] = 'auto';
		el.style.overflowX = 'hidden';
		el.style.overflowY = 'hidden';
	}

};

// CSS transition
export function transition(el, transition) {
	if ( el instanceof $ )
		el = el.get(0);
	el.style[getVendorStyle('transition')] = transition;
}
