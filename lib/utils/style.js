
import $ from 'jquery';
import { requestAnimationFrame } from './requestAnimationFrame';

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

// Request Next Animation Frame
export function requestNextAnimationFrame (callback){
	requestAnimationFrame(function () {
        requestAnimationFrame(function (ts) {
            callback(ts);
        });
    });
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
		x = x.toString() + 'px';
	if ( typeof z === 'number' )
		x = x.toString() + 'px';

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

// Overflow scrolling
export function overflowScrolling ($el, enable) {
	if ( !$el instanceof $ )
		$el = $($el);

	if (enable) {
		$el.addClass('overflow-scroll');
	} else {
		$el.removeClass('overflow-scroll');
	}

};
