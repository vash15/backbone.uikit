import _ from 'underscore';
import $ from 'jquery';
import BaseView from './BaseView';
import { scaleAndTranslate3d, getVendorStyle } from './utils/style';

const isTouch = function isTouch() {
	return 'ontouchstart' in window // works on most browsers
	|| navigator.maxTouchPoints;    // works on IE10/11 and Surface
};

const normalizePointerEvent = function normalizePointerEvent(e) {
	let result = {
		x: 0,
		y: 0
	};
	if (e.changedTouches) {
		result.x = e.changedTouches[0].pageX;
		result.y = e.changedTouches[0].pageY;
	} else {
		result.x = e.pageX;
		result.y = e.pageY;
	}
	return result;
}

const limit = function limit(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

/**
 * Define a 3D Card that react to the mouse move and touch events.
 * It works like Apple TV tiles. It triggers a 'click' event.
 * @version 2.1.2
 * @param {Object} options - View options
 * @param {integer} [options.maxRotationX] [5] - Define the maximum rotation on the X axis (deg)
 * @param {integer} [options.maxRotationY] [7] - Define the maximum rotation on the Y axis (deg)
 * @param {integer} [options.rotationDuration] [300] - The time the card spent to return to the original position
 * @param {float} [options.scale] [1.05] - The scale size used on mouseover or touchstart
 * @param {integer} [options.scaleDuration] [150] - The time the card spent to increase, or reduce, his scale
 * @param {string} [options.activeClassName] [active] - Class added when the card is active
 */
export default class Card3DView extends BaseView {

	constructor(options) {
		super(options);

		this.options = _.defaults(options || {}, {
			maxRotationX: 5, // deg
			maxRotationY: 7,
			rotationDuration: 300,
			scale: 1.05,
			scaleDuration: 150,
			activeClassName: 'active'
		});

		this.isTouch    = isTouch();
		this.x          = 0;
		this.y          = 0;
		this.size       = 1;
		this.width      = 0;
		this.height     = 0;
		this.top        = 0;
		this.left       = 0;
		this.centerY    = 0;
		this.centerX    = 0;
		this.halfWidth  = 0;
		this.halfHeight = 0;

		this.onPointerStart = _.bind(this.onPointerStart, this);
		this.onPointerMove  = _.bind(this.onPointerMove, this);
		this.onPointerEnd   = _.bind(this.onPointerEnd, this);

		if (this.isTouch) {
			this.addEvents({
				'touchstart .js-card': 'onPointerStart',
				// 'touchend .js-card': 'onPointerEnd',
				// 'touchmove .js-card': 'onPointerMove',
				'click .js-card': 'onPointerClick'
			});
		} else {
			this.addEvents({
				'mouseenter': 'onPointerStart',
				'mouseleave': 'onPointerEnd',
				'mousemove': 'onPointerMove',
				'click .js-card': 'onPointerClick'
			});
		}
	}

	addClass() {
		return 'ui-card3d';
	}

	onRender(rendered) {
		if (!rendered) {
			this.cache.$card  = $('<div class="card js-card"></div>');
			this.cache.$shine = $('<div class="shine js-shine"></div>');
			this.cache.card   = this.cache.$card.get(0);
			this.cache.shine  = this.cache.$shine.get(0);

			// Style
			this.cache.shine.style.backgroundRepeat   = 'no-repeat';
			this.cache.shine.style.backgroundImage    = 'radial-gradient(circle closest-side at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)';
			this.cache.shine.style.backgroundSize     = '200% 200%';
			this.cache.shine.style.backgroundPosition = 'center center';
			this.cache.shine.style.opacity            = 0;
			this.cache.shine.style.position           = 'absolute';
			this.cache.shine.style.top                = 0;
			this.cache.shine.style.right              = 0;
			this.cache.shine.style.bottom             = 0;
			this.cache.shine.style.left               = 0;

			this.$el.append(
				this.cache.$card.append(this.cache.$shine)
			);
		}
		return this;
	}

	onPointerStart(e) {
		// Events
		document.addEventListener('touchmove',   this.onPointerMove, { passive: true });
		document.addEventListener('touchend',    this.onPointerEnd, { passive: true });
		document.addEventListener('touchcancel', this.onPointerEnd, { passive: true });

		const rect      = this.cache.card.getBoundingClientRect();
		this.width      = rect.width;
		this.height     = rect.height;
		this.top        = rect.top;
		this.left       = rect.left;
		this.centerY    = rect.top + rect.height / 2;
		this.centerX    = rect.left + rect.width / 2;
		this.halfWidth  = this.width / 2;
		this.halfHeight = this.height / 2;
		this.cache.$card.addClass(this.options.activeClassName);
		this.animateScaleTo(this.options.scale);

		const event = normalizePointerEvent(e);
		const x = limit(event.x - this.left, 0, this.width);
		const y = limit(event.y - this.top, 0, this.height);
		this.requestAnimationFrame(() => {
			this.move(x, y);
		});
	}

	onPointerEnd(e) {
		// Events
		document.removeEventListener('touchmove',   this.onPointerMove);
		document.removeEventListener('touchend',    this.onPointerEnd);
		document.removeEventListener('touchcancel', this.onPointerEnd);

		this.cache.$card.removeClass(this.options.activeClassName);
		this.animateMoveTo(this.x, this.y, this.halfWidth, this.halfHeight);
		this.animateScaleTo(1);
	}

	onPointerMove(e) {
		const event = normalizePointerEvent(e);
		const x = limit(event.x - this.left, 0, this.width);
		const y = limit(event.y - this.top, 0, this.height);
		this.requestAnimationFrame(() => {
			this.move(x, y);
		});
	}

	onPointerClick(e) {
		if (!this.isTouch) {
			const event = normalizePointerEvent(e);
			const x = limit(event.x - this.left, 0, this.width);
			const y = limit(event.y - this.top, 0, this.height);
			this.animateScaleTo(1, () => {
				this.animateScaleTo(this.options.scale);
			});
		}
		this.trigger('click', this);
	}

	move(x, y) {
		this.x = x;
		this.y = y;
		this.trasform();
	}

	scale(size) {
		this.size = size;
		this.trasform();
	}

	trasform() {
		const x = this.x;
		const y = this.y;
		const size = this.size;
		const px = (x / this.width - 0.5) * 2;
		const py = (y / this.height - 0.5) * 2;
		const angleX = this.options.maxRotationX * py;
		const angleY = -this.options.maxRotationY * px;
		const shineX = px * this.width - this.halfWidth;
		const shineY = py * this.height - this.halfHeight;
		const shineOpacity = Math.max(Math.abs(px), Math.abs(py));

		this.cache.card.style[ getVendorStyle('transform') ]  = `scale(${size}) rotate3d(1,0,0,${angleX}deg) rotate3d(0,1,0,${angleY}deg)`;
		this.cache.shine.style.backgroundPosition = `${shineX}px ${shineY}px`;
		this.cache.shine.style.opacity = shineOpacity;
	}

	animateMoveTo(fromX, fromY, endX, endY, callback, firstCall = true) {
		if (firstCall) {
			this.cancelAnimationFrame(this.moveToAnimationHandler);
			const animationSteps = this.options.rotationDuration / (1 / 60 * 1000);
			this.animationStepCounter = animationSteps;
			this.animationStepX = (fromX - endX) / animationSteps;
			this.animationStepY = (fromY - endY) / animationSteps;
		}
		if (this.animationStepCounter == 0) {
			this.move(endX, endY);
			if (callback) callback();
			return;
		}
		this.moveToAnimationHandler = this.requestAnimationFrame(() => {
			const x = this.x - this.animationStepX;
			const y = this.y - this.animationStepY;
			this.move(x, y);
			this.animationStepCounter--;
			this.animateMoveTo(x, y, endX, endY, callback, false);
		});
	}

	animateScaleTo(endSize, callback, firstCall = true) {
		if (firstCall) {
			this.cancelAnimationFrame(this.scaleToAnimationHandler);
			const animationSteps = this.options.scaleDuration / (1 / 60 * 1000);
			this.scaleAnimationStepCounter = animationSteps;
			this.scaleAnimationStep = (this.size - endSize) / animationSteps;
		}
		if (this.scaleAnimationStepCounter == 0) {
			this.scale(endSize);
			if (callback) callback();
			return;
		}
		this.scaleToAnimationHandler = this.requestAnimationFrame(() => {
			const size = this.size - this.scaleAnimationStep;
			this.scale(size);
			this.animateScaleTo(endSize, callback, false);
			this.scaleAnimationStepCounter--;
		});
	}

}
