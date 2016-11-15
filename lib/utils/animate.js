
import _ from "underscore";
import { getVendorStyle } from "./style";


export default function(el, animation, done){

	if (!_.isObject(animation))
		throw new Error('animation is required');

	if (!_.isObject(animation.start))
		throw new Error('animation.start is required');

	if (!_.isObject(animation.end))
		throw new Error('animation.end is required');

	_.defaults(animation, {
		duration: '300ms',
		timing: ''
	});

	var properties = _.keys(animation.start);

	// Empty transition property. We don't want animation for initial state.
	var transitionProperty = getVendorStyle('transition');
	var timingProperty     = getVendorStyle('transition-timing-function');
	el.style[transitionProperty] = '';
	el.style[timingProperty]     = '';

	// Set the start state
	var transition = '';
	var aProperty;
	for (var i = 0, n = properties.length; i < n; i++) {
		aProperty = properties[i];

		if (animation.start[aProperty] !== null && animation.start[aProperty] !== undefined)
			el.style[getVendorStyle(aProperty)] = animation.start[aProperty];

		// Build the transition string
		transition += getVendorStyle(aProperty) + ' ' + animation.duration;
		if (i < n - 1)
			transition += ', ';
	}

	// Ensure to apply the initial state
	window.getComputedStyle(el)[transitionProperty];

	// Set the transition property to animate the element
	el.style[transitionProperty] = transition;
	el.style[timingProperty]     = animation.timing;

	window.requestNextAnimationFrame(function(){
		for (var i = 0, n = properties.length; i < n; i++) {
			aProperty = properties[i];
			el.style[getVendorStyle(aProperty)] = animation.end[aProperty];
		}
		if (_.isFunction(done))
			done();
	});

};
