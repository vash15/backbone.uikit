
import _        from "underscore";
import $        from "jquery";
import context  from "context-utils";
import Backbone from "backbone";
import BaseView from "./BaseView";
import animate  from "./utils/animate";
import { getVendorStyle, translate3d } from "./utils/style";
import { requestNextAnimationFrame } from "./utils/requestAnimationFrame";

//
// Utils
//

let getTouch = function getTouch(ev){
	let touch;
	if ( ev && ev.changedTouches ){
		let changedTouches = ev.changedTouches;
		if( changedTouches && changedTouches.length > 0 ){
			touch = changedTouches[0];
		}
	}
	return touch;
};

let getPageX = function getPageX(ev){
	let pageX = 0;
	let touch = getTouch(ev);
	if ( touch && _.isNumber(touch.pageX) )
		pageX = touch.pageX;
	return pageX;
};
let getPageY = function getPageY(ev){
	let pageY = 0;
	let touch = getTouch(ev);
	if ( touch && _.isNumber(touch.pageY) )
		pageY = touch.pageY;
	return pageY;
};
let isInRect = function isInRect( x, y, top, left, width, height ) {
	return x >= left && x <= (left+width) && y >= top && y <= (top+height);
};

//
// Page View
//

const STATUS_NORMAL = 'normal';
const STATUS_MOVING = 'moving';

export default class PageView extends BaseView {

	className() {
		return 'ui-page ' + ( _.result(this, "addClass") || '' );
	}

	constructor(options){
		super(options);

		let state = this.getState();

		this._oldPercent = -1;
		this.viewport    = context.device && context.device.getViewport ? context.device.getViewport() : {width: 0, height: 0};
		this.isActive    = false;
		this.status      = STATUS_NORMAL;


		this.setDefaultsOptions({
			swipeBack               : true,
			animated                : true,
			duration                : 300,
			viewstack               : state ? state.get('viewstack') : context.viewstack,
			navigation              : state ? state.get('navigation') : context.navigation,
			swipeBackDirection      : 'horizontal', // horizontal, vertical, all
			swipeBackClassName      : 'swipe-back',
			swipeBackBoundaryLeft   : 0,
			swipeBackBoundaryTop    : 0,
			swipeBackBoundaryWidth  : 40,
			swipeBackBoundaryHeight : this.viewport.height,
			swipeBackVelocityLimit  : 0.4 // Velocity limit to trigger viewstack.popView()
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		this.renderingTimeoutHandler = null;

		// Set navigation controller
		this.setNavigationView( this.options.navigation );

		if ( this.options.animated === true ){
			this.el.style[ getVendorStyle('backfaceVisibility') ]  = 'hidden';
			translate3d(this.el, '100%', 0, 0, true); // if you put pixels the transform does not work
		}

		//
		// Swipe back
		//

		this._swipeBackStop = false;
		if ( this.options.swipeBack === true ){

			this.onSwipeBackTouchStart = _.bind(this.onSwipeBackTouchStart, this);
			this.onSwipeBackTouchMove  = _.bind(this.onSwipeBackTouchMove, this);
			this.onSwipeBackTouchEnd   = _.bind(this.onSwipeBackTouchEnd, this);

			this.el.addEventListener( 'touchstart', this.onSwipeBackTouchStart );
		}
	}

	// Render
	render() {
		// If the view is moving delay the render
		if (this.status == STATUS_MOVING) {
			if (this.renderingTimeoutHandler)
				clearTimeout(this.renderingTimeoutHandler);
			this.renderingTimeoutHandler = setTimeout(() => {
				this.renderingTimeoutHandler = null;
				this.render();
			}, 300);
			return;
		}

		if (this.options.animated === true) {
			this.el.style[ getVendorStyle('transition') ] = 'transform ' + this.options.duration + 'ms';
			requestNextAnimationFrame(() => {
				translate3d(this.el, 0, 0, 0);
			});
		}
		return super.render();
	}

	// Navigation view
	setNavigationView(navigation){
		let ctx = context; // Todo: Sostituire con State
		if ( navigation instanceof Backbone.View ){
			this.navigation = navigation;
		}else if ( ctx && ctx.views && ctx.views.navigation ){
			this.navigation = ctx.views.navigation;
		}else{
			this.navigation = null;
		}
		return this;
	}

	getNavigationView(){
		return this.navigation;
	}

	getNavigationBar(){
		return null;
	}


	// Può assumere più valori.
	// @return Number millisecondi di durata dell'animazione
	// @return String nome dell'animazione CSS
	getAnimationPushDuration(){
		return this.options.animated ? this.options.duration : null;
	}

	// Può assumere più valori.
	// @return Number millisecondi di durata dell'animazione
	// @return String nome dell'animazione CSS
	getAnimationPopDuration(){
		return this.options.duration || null;
	}


	//
	// Events
	//

	onDeactivate() {
		this.$el.addClass('deactivate');
		this.isActive = false;
		let state = this.getState();
		if (state) state.trigger('deactivated');
	}

	onActivate(firstTime) {
		this.$el.removeClass('deactivate');
		this.isActive = true;
		let state = this.getState();
		if (state) state.trigger('activated');
	}

	onDestroy() {
		if (this.renderingTimeoutHandler) {
			clearTimeout(this.renderingTimeoutHandler);
		}

		this.el.removeEventListener( 'touchstart',  this.onSwipeBackTouchStart );

		document.removeEventListener('touchmove',   this.onSwipeBackTouchMove );
		document.removeEventListener('touchend',    this.onSwipeBackTouchEnd  );
		document.removeEventListener('touchcancel', this.onSwipeBackTouchEnd  );

		super.onDestroy();
	}

	onBeforePop() {
		this.status = STATUS_MOVING;
		if (this.options.animated === true) {
			this.el.style[ getVendorStyle('transition') ] = 'transform '+this.options.duration+'ms';
			translate3d(this.el, '100%', 0, 0 );
		}
	}

	onSwipeBackTouchStart(ev) {
		if (!ev || !ev.timeStamp || !this.isActive ) return;

		let top     = this.options.swipeBackBoundaryTop;
		let left    = this.options.swipeBackBoundaryLeft;
		let width   = this.options.swipeBackBoundaryWidth;
		let height  = this.options.swipeBackBoundaryHeight;
		let pageX   = this._swipeBackStartX = getPageX( ev );
		let pageY   = this._swipeBackStartY = getPageY( ev );

		this._swipeBackMoveDirection = null;

		if ( isInRect( pageX, pageY, top, left, width, height ) && this.viewport.width > 0 && !this._swipeBackStop ){

			this.status = STATUS_MOVING;

			document.addEventListener('touchmove',   this.onSwipeBackTouchMove );
			document.addEventListener('touchend',    this.onSwipeBackTouchEnd );
			document.addEventListener('touchcancel', this.onSwipeBackTouchEnd );

			this.el.style[ getVendorStyle('transition') ] = '';
			this.$el.addClass( this.options.swipeBackClassName );

			this._swipeBackDeltaScreenX  = pageX;
			this._swipeBackDeltaScreenY  = pageY;
			this._swipeBackStop          = true;
			this._swipeBackStartTime     = ev.timeStamp;

		}
	}

	onSwipeBackTouchEnd(ev){
		if (!ev || !ev.timeStamp || !this.isActive ) return;

		this.status = STATUS_NORMAL;

		let ctx              = context;
		let navigation       = this.getNavigationView();
		let pageX            = getPageX(ev);
		let pageY            = getPageY(ev);
		let pop              = false;
		let currentDirection = this._swipeBackMoveDirection;
		let viewstack        = this.viewstack;

		this._swipeBackMoveDirection = null;

		// Check direction
		if ( this.options.swipeBackDirection === 'horizontal' && (Math.abs( this._swipeBackStartX - pageX ) === 0 || currentDirection === 'vertical') ){
			this._swipeBackStop = false;
			return;
		}else if ( this.options.swipeBackDirection === 'vertical' && (Math.abs( this._swipeBackStartY - pageY ) === 0 || currentDirection === 'horizontal') ){
			this._swipeBackStop = false;
			return;
		}


		var distance = pageX - this._swipeBackDeltaScreenX;
		var time     = ev.timeStamp - this._swipeBackStartTime;
		var speed    = Math.abs(distance) / time || 0.1;

		if ( speed >= this.options.swipeBackVelocityLimit || pageX > (this.viewport.width/2) ){
			pop = true;
			navigationOnSwipeBack( 0 );
		}else{
			navigationOnSwipeBack( 100 );

			this.el.style[ getVendorStyle('transition') ] = 'transform '+this.options.duration+'ms';
			translate3d( this.el, 0, 0, 0 );
		}

		document.removeEventListener('touchmove',   this.onSwipeBackTouchMove );
		document.removeEventListener('touchend',    this.onSwipeBackTouchEnd  );
		document.removeEventListener('touchcancel', this.onSwipeBackTouchEnd  );

		if ( pop &&  this.viewstack )
			this.viewstack.popView(this, {animated: true, delay: true});

		setTimeout(() => {
			this.el.style[ getVendorStyle('transition') ] = '';
			this._swipeBackStop = false;
			this.$el.removeClass(this.options.swipeBackClassName);
		}, this.options.duration);


		function navigationOnSwipeBack(percent){
			if ( navigation && navigation.onSwipeBack )
				navigation.onSwipeBack( percent, true );
			if ( viewstack )
				viewstack.onSwipeBack( percent, true );
		};
	}

	onSwipeBackTouchMove(ev){
		let ctx        = context;
		let navigation = this.getNavigationView();
		let pageX      = getPageX(ev) - this._swipeBackDeltaScreenX;
		let pageY      = getPageY(ev) - this._swipeBackDeltaScreenY;
		let percent    = 0;
		if ( pageX < 0 )
			pageX = 0;
		else if ( pageX > this.viewport.width )
			pageX = this.viewport.width;
		if ( pageY < 0 )
			pageY = 0;
		else if ( pageY > this.viewport.height )
			pageY = this.viewport.height;


		// Check direction
		if ( this.options.swipeBackDirection === 'horizontal' && (pageX === 0 || this._swipeBackMoveDirection === 'vertical') ){
			this._swipeBackMoveDirection = 'vertical';
			return;
		}else if ( this.options.swipeBackDirection === 'vertical' && (pageY === 0 || this._swipeBackMoveDirection === 'horizontal') ){
			this._swipeBackMoveDirection = 'horizontal';
			return;
		}

		// Stop propagation event
		ev.stopPropagation();
		ev.preventDefault();

		if ( this.viewport.width > 0 )
			percent = 100 - Math.round(pageX * 100 / this.viewport.width * 10) / 10;

		if ( navigation && navigation.onSwipeBack )
			navigation.onSwipeBack( percent, false );

		// Viewstack
		if ( this.viewstack )
			this.viewstack.onSwipeBack( percent, false );

		translate3d( this.el, pageX, 0, 0 );

		return false;
	}

	move(percent, direction, animated) {
		let self          = this;
		let transform     = '';
		let initTransform = '';

		switch (direction) {
			case 1: // IosBarView.DETACH:
				transform = 'translate3d('+(-50*(percent/100))+'%, 0, 0)';
				initTransform = 'translate3d(0, 0, 0)';
			break;
			case 2: // IosBarView.RESTORE:
				transform = 'translate3d(0, 0, 0)';
				initTransform= 'translate3d('+(-50*(percent/100))+'%, 0, 0)';
			break;
		}

		let el = this.el;
		el.style[ getVendorStyle('transition') ]  = '';

		if ( animated ){
			if (this._oldPercent !== -1) {
				initTransform = null;
			}

			animate(el, {
				duration: this.options.duration + 'ms',
				timing: 'ease-out',
				start: {
					'transform': initTransform
				},
				end: {
					'transform': transform
				}
			});

		} else {
			this._oldPercent = percent;
			el.style[ getVendorStyle('transform') ] = transform;
		}

		return this;
	}

};
