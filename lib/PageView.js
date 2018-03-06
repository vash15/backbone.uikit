
import _                 from "underscore";
import $                 from "jquery";
import context           from "context-utils";
import Backbone          from "backbone";
import BaseView          from "./BaseView";
import animate           from "./utils/animate";
import BezierEasing      from "./utils/BezierEasing";
import BarView           from "./navigations/BarView";
import getContextOptions from "./utils/getContextOptions";
import { getVendorStyle, translate3d, scaleAndTranslate3d } from "./utils/style";

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

const ANIMATION_PUSH_LEFT = 'push_left';
const ANIMATION_ZOOM_IN   = 'zoom_in';

/**
 * Class rappresenting a page in the app. It support entering animation and remove
 * @extends BaseView
 * @version 2.0.0
 * @param {Object} options - Page options
 * @param {bool} [options.swipeBack] [true] - Enable swipe back gesture to close the page. Usually only the first page of a stack should has it false.
 * @param {bool} [options.animated] [true] - Should enter with an animation or not. Usually only the first page of a stack should has it false.
 * @param {integer} [options.duration] [300] - Animation duration in ms.
 * @param {integer} [options.deltaPageRender] [100] - Delay the content rendering of deltaPageRender ms. It provides a smooth animation.
 * @param {Viewstack} [options.viewstack] [state.viewstack] - Instance of Backbone.Viewstack where the page is pushed. Default is the state viewstack, fallback the context.viewstack.
 * @param {NavigationView} [options.navigation] [state.navigation] - Instance of NavigationView, the top navigation bar. Default is the state navigation, fallback the context.navigation.
 * @param {string} [options.swipeBackDirection] [horizontal] - Direction of the swipe back gesture. It could be: 'horizontal', 'vertical', 'all'.
 * @param {string} [options.swipeBackClassName] [swipe-back] - CSS class appended to the page when a swipe back is occurring.
 * @param {integer} [options.swipeBackBoundaryLeft] [0] - Left position of the area that triggers the swipe back.
 * @param {integer} [options.swipeBackBoundaryTop] [0] - Top position of the area that triggers the swipe back.
 * @param {integer} [options.swipeBackBoundaryWidth] [40] - Width of the area that triggers the swipe back.
 * @param {integer} [options.swipeBackBoundaryHeight] [viewport.height] - Height of the area that triggers the swipe back.
 * @param {float} [options.swipeBackVelocityLimit] [0.4] - Velocity of the swipe back that triggers the anticipated closure of the page.
 * @param {string} [options.pageAnimation] [PageView.ANIMATION_PUSH_LEFT] - Type of animation. It could be: PageView.ANIMATION_PUSH_LEFT, PageView.ANIMATION_ZOOM_IN. They represents iOS and Android standard animations.
 * @example
 * import context from 'contex-utils';
 * import { PageView, OSBarView } from 'backbone.uikit';
 *
 * class ProductPageView extends PageView {
 *   construtor(options) {
 *     super(options);
 *     this.setSubView('bar', new OSBarView({
 *       addClass: 'back-bar',
 *       left: 'f',
 *       center: null
 *     }));
 *     this.model.fetch({
 *       network: 'product:' + this.model.id
 *     });
 *     this.listenTo(this.model, 'change', this.render);
 *   }
 *   getBarView() {
 *     return this.getSubView('bar');
 *   }
 *   onRender(rendered) {
 *     if (!rendered) {
 *       this.$el.html(this.template());
 *       this.cache.$name = this.$el.find('js-name');
 *     }
 *     if (this.model) {
 *       this.cache.$name.text(this.model.get('name'));
 *     } else {
 *       this.cache.$name.text('');
 *     }
 *   }
 *   onBeforePop() {
 *     super.onBeforePop();
 *     // Abort current fetch
 *     context.network.close('product' + this.model.id);
 *   }
 * }
 *
 * // In the controller
 * const productPageView = new ProductPageView({ model: product });
 * context.viewstack.pushView(productPageView, { animated: true });
 */
export default class PageView extends BaseView {

	constructor(options){
		super(options);

		let state = this.getState();

		this._oldPercent = -1;
		this.viewport    = context.device && context.device.getViewport ? context.device.getViewport() : {width: 0, height: 0};
		this.isActive    = false;
		this.pageStatus      = STATUS_NORMAL;

		this.setDefaultsOptions(getContextOptions('PageView'), {
			swipeBack               : true,
			animated                : true,
			duration                : 300,
			deltaPageRender         : 100,
			viewstack               : state ? state.get('viewstack') : context.viewstack,
			navigation              : state ? state.get('navigation') : context.navigation,
			swipeBackDirection      : 'horizontal', // horizontal, vertical, all
			swipeBackClassName      : 'swipe-back',
			swipeBackBoundaryLeft   : 0,
			swipeBackBoundaryTop    : 0,
			swipeBackBoundaryWidth  : 40,
			swipeBackBoundaryHeight : this.viewport.height,
			swipeBackVelocityLimit  : 0.4, // Velocity limit to trigger viewstack.popView()
			pageAnimation           : ANIMATION_PUSH_LEFT // Don't set to null or _.defaults consider it as valid value
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		this.renderingTimeoutHandler = null;

		// Set navigation controller
		this.setNavigationView( this.options.navigation );

	}

	/**
	 * Return the CSS class
	 * @private
	 * @version 2.0.0
	 */
	className() {
		return 'ui-page ' + ( _.result(this, "addClass") || '' );
	}

	/**
	 * Draw the content of the page. If the page is moving due to a gesture the
	 * onRender method is not fired.
	 * PageView add a customizable delay to the render to prevent animation
	 * flickering. Use options.deltaPageRender parameter to change this behaviour.
	 * @public
	 * @version 2.0.0
	 */
	render() {
		// If the view is moving delay the render
		if ( this.pageStatus == STATUS_MOVING ) {
			if (this.renderingTimeoutHandler)
				clearTimeout(this.renderingTimeoutHandler);
			this.renderingTimeoutHandler = setTimeout(() => {
				this.renderingTimeoutHandler = null;
				this.render();
			},  this.options.duration );
			return;
		}

		if (this.options.animated === true && !this.rendered ) {
			// Move animation
			if (!this.moved) {
				this.move(100, 0, true);
				this.moved = true;
			}
			// Rendering
			window.requestNextAnimationFrame(() => {
				if (this.renderingTimeoutHandler)
					clearTimeout(this.renderingTimeoutHandler);
				this.renderingTimeoutHandler =
					setTimeout(()=>{
						this.renderingTimeoutHandler = null;
						return super.render();
					}, this.options.duration + this.options.deltaPageRender );
			});
			return;
		}
		return super.render();
	}

	/**
	 * Set a navigation view after initialization
	 * @public
	 * @version 2.0.0
	 * @param {NavigationView} navigation - Instance of NavigationView
	 */
	setNavigationView(navigation) {
		let ctx = this.getState() || context; // Todo: Sostituire con State
		if (navigation instanceof Backbone.View) {
			this.navigation = navigation;
		} else if (ctx && ctx.views && ctx.views.navigation) {
			this.navigation = ctx.views.navigation;
		} else {
			this.navigation = null;
		}
		return this;
	}

	/**
	 * Get the navigation view
	 * @public
	 * @version 2.0.0
	 * @return {NavigatinView} - The instance of the NavigationView associated with the current page
	 */
	getNavigationView() {
		return this.navigation;
	}

	/**
	 * Returns the page bar view.
	 * @public
	 * @deprecated since version 2.0.0, use and override getBarView instead
	 * @version 2.0.0
	 * @return {BarView} - The instance of the BarView
	 */
	getNavigationBar() {
		return null;
	}

	/**
	 * Returns the page bar view. It's an instantiated BarView created in the
	 * page constructor used by NavigationView to show buttons and titles.
	 * @public
	 * @version 2.0.0
	 * @return {BarView} - The instance of the BarView
	 */
	getBarView() {
		return null;
	}

	/**
	 * Returns the push animation duration of the page. Used by Viewstack to regulate
	 * push and pop events
	 * @public
	 * @version 2.0.0
	 * @return {integer} - The options.duration in ms or null if options.animated == false
	 */
	getAnimationPushDuration(){
		return this.options.animated ? this.options.duration : null;
	}

	/**
	 * Returns the pop animation duration of the page. Used by Viewstack to regulate
	 * push and pop events
	 * @public
	 * @version 2.0.0
	 * @return {integer} - The options.duration in ms or null
	 */
	getAnimationPopDuration(){
		return this.options.duration || null;
	}

	/**
	 * Helper function that close the device keyboard
	 * @private
	 * @version 2.0.0
	 */
	closeKeyboard() {
		$(':focus').blur();
		// if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard)
		// 	cordova.plugins.Keyboard.close();
	}

	/**
	 * Helper function that move the page of a percent.
	 * @private
	 * @version 2.0.0
	 * @param {integer} percent - Number from 0 to 100 that rapresents the percentage of the animation.
	 * @param {string} direction - Movement direction, it can be: BarView.PUSH, BarView.DETACH, BarView.RESTORE, BarView.POP
	 * @param {boolean} animated - True if the view must move with an animation.
	 */
	move(percent, direction, animated) {
		if (!this.options.animated) return this;
		switch (this.options.pageAnimation) {
			case ANIMATION_PUSH_LEFT:
				this.movePushLeft(percent, direction, animated);
				break;
			case ANIMATION_ZOOM_IN:
				this.moveZoomIn(percent, direction, animated);
				break;
		}
		return this;
	}

	/**
	 * Animate the view using ANIMATION_PUSH_LEFT effect.
	 * Never call it directly, always pass through move() method.
	 * @private
	 * @version 2.0.0
	 * @param {integer} percent - Number from 0 to 100 that rapresents the percentage of the animation.
	 * @param {string} direction - Movement direction, it can be: BarView.PUSH, BarView.DETACH, BarView.RESTORE, BarView.POP
	 * @param {boolean} animated - True if the view must move with an animation.
	 */
	movePushLeft(percent, direction, animated) {
		let self          = this;
		let transform     = '';
		let initTransform = '';

		switch (direction) {
			case BarView.PUSH:
				initTransform = 'translate3d(100%, 0, 0)';
				transform = 'translate3d(0,0,0)';
				break;
			case BarView.DETACH:
				initTransform = 'translate3d(0, 0, 0)';
				transform = 'translate3d('+(-50*(percent/100))+'%, 0, 0)';
				break;
			break;
			case BarView.RESTORE:
				initTransform = 'translate3d(-8.33%, 0, 0)';
				transform = 'translate3d('+((percent-100)/12)+'%, 0, 0)';
				break;
			case BarView.POP:
				initTransform = null;
				transform = 'translate3d(100%, 0, 0)';
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
	}

	/**
	 * Animate the view using ANIMATION_ZOOM_IN effect.
	 * Never call it directly, always pass through move() method.
	 * @private
	 * @version 2.0.0
	 * @param {integer} percent - Number from 0 to 100 that rapresents the percentage of the animation.
	 * @param {string} direction - Movement direction, it can be: BarView.PUSH, BarView.DETACH, BarView.RESTORE, BarView.POP
	 * @param {boolean} animated - True if the view must move with an animation.
	 */
	moveZoomIn(percent, direction, animated) {
		let self          = this;
		let transform     = '';
		let opacity       = 1;
		let initTransform = '';
		let initOpacity   = 0;

		// let easingIn  = BezierEasing(.01,.69,.36,1);
		let easingOut = BezierEasing(.81,.09,.1,.6);

		switch (direction) {
			case BarView.PUSH:
				initTransform = 'scale(0.9)';
				transform     = 'scale(1)';
				initOpacity   = 0;
				opacity       = 1;
				break;
			case BarView.DETACH:
				initTransform = 'scale(1)';
				transform     = 'scale(0.9)';
				initOpacity   = 1;
				opacity       = 0;
				break;
			case BarView.RESTORE:
				initTransform = 'scale(0.9)';
				transform = 'scale(1)';
				initOpacity   = 0;
				opacity       = 1;
				break;
			case BarView.POP:
				initTransform = 'scale(1)';
				transform = 'scale(0.8)';
				initOpacity   = 1;
				opacity       = 0;
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
					'transform': initTransform,
					'opacity': initOpacity
				},
				end: {
					'transform': transform,
					'opacity': opacity
				}
			});

		} else {
			this._oldPercent = percent;
			el.style.opacity = easingOut(percent / 100);
			el.style[ getVendorStyle('transform') ] = transform;
		}
	}

	//
	// Events
	//

	/**
	 * Viewstack method called before the push. It initialize the animation state
	 * and bind the touch events for the swipe back gesture.
	 * @private
	 * @version 2.0.0
	 */
	onBeforePush() {
		// Animation start
		switch (this.options.pageAnimation) {
			case ANIMATION_PUSH_LEFT:
				if (this.options.animated) {
					this.el.style[ getVendorStyle('backfaceVisibility') ]  = 'hidden';
					translate3d(this.el, '100%', 0, 0, true); // if you put pixels the transform does not work
				}
				break;
			case ANIMATION_ZOOM_IN:
				this.options.swipeBack = false;
				if (this.options.animated) {
					this.el.style[ getVendorStyle('backfaceVisibility') ]  = 'hidden';
					scaleAndTranslate3d(this.el, 0.8, 0, 0, 0, true);
					this.el.style.opacity = 0;
				}
				break;
		}

		// Swipe back
		this._swipeBackStop = false;
		if ( this.options.swipeBack === true ){

			this.onSwipeBackTouchStart = _.bind(this.onSwipeBackTouchStart, this);
			this.onSwipeBackTouchMove  = _.bind(this.onSwipeBackTouchMove, this);
			this.onSwipeBackTouchEnd   = _.bind(this.onSwipeBackTouchEnd, this);

			this.el.addEventListener( 'touchstart', this.onSwipeBackTouchStart );
		}
	}

	/**
	 * Called by viewstack before the page becomes active.
	 * @private
	 * @version 2.0.0
	 */
	onBeforeActivate(firstTime, animated) {
		this.closeKeyboard();
		if ( !firstTime && animated && this.options.animated )
			this.move(100, BarView.RESTORE, true);
	}

	/**
	 * Called by viewstack when the page becomes active. A CSS class is added to
	 * the view.
	 * @private
	 * @version 2.0.0
	 * @param {bool} firstTime - Indicates if it's the first activation of the page
	 */
	onActivate(firstTime) {
		this.closeKeyboard();
		this.$el.removeClass('deactivate');
		this.isActive = true;
		let state = this.getState();
		if (state) state.trigger('activated');
	}

	/**
	 * Called by viewstack before the deactivation of the page.
	 * @private
	 * @version 2.0.0
	 */
	onBeforeDeactivate(options) {
		options = _.defaults(options||{},{ closeKeyboard: true });
		if ( options.closeKeyboard )
			this.closeKeyboard(options);
	}

	/**
	 * Called by viewstack when the page becomes deactivated. A CSS class is
	 * added to the view.
	 * @private
	 * @param {Object} options
	 * @param {Boolean} options.closeKeyboard [true] - Force close phisical keyboard on mobile device
	 * @version 2.0.0
	 */
	onDeactivate(options) {
		options = _.defaults(options||{},{ closeKeyboard: true });
		if ( options.closeKeyboard )
			this.closeKeyboard(options);
		this.$el.addClass('deactivate');
		this.isActive = false;
		let state = this.getState();
		if (state) state.trigger('deactivated');
	}

	/**
	 * Called by viewstack before the view destroy
	 * @private
	 * @version 2.0.0
	 */
	onBeforePop() {
		this.pageStatus = STATUS_MOVING;
		if (this.options.animated === true) {
			window.requestAnimationFrame(()=>{
				this.move(0, 4, true);
			});
		}
	}

	/**
	 * Called when a user touch the page. It checks if the finger is inside
	 * the touchable area and start the swipe back gesture
	 * @private
	 * @version 2.0.0
	 * @param {Object} ev - 'touchstart' DOM event
	 */
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

			this.pageStatus = STATUS_MOVING;

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

	/**
	 * Called when a user end the page touch.
	 * @private
	 * @version 2.0.0
	 * @param {Object} ev - 'touchend' DOM event
	 */
	onSwipeBackTouchEnd(ev){
		if (!ev || !ev.timeStamp || !this.isActive ) return;

		this.pageStatus = STATUS_NORMAL;

		let ctx               = context;
		let navigation        = this.getNavigationView();
		let pageX             = getPageX(ev);
		let pageY             = getPageY(ev);
		let pop               = false;
		let currentDirection  = this._swipeBackMoveDirection;
		let viewstack         = this.viewstack;
		let removeTouchEvents = () => {
			document.removeEventListener('touchmove',   this.onSwipeBackTouchMove );
			document.removeEventListener('touchend',    this.onSwipeBackTouchEnd  );
			document.removeEventListener('touchcancel', this.onSwipeBackTouchEnd  );
		};

		this._swipeBackMoveDirection = null;

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

		removeTouchEvents();

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

	/**
	 * Called when a user move the finger on the page.
	 * @private
	 * @version 2.0.0
	 * @param {Object} ev - 'touchmove' DOM event
	 */
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
		// ev.preventDefault();

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

	/**
	 * Destroy event
	 * @private
	 * @version 2.0.0
	 */
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

};

PageView.ANIMATION_PUSH_LEFT = ANIMATION_PUSH_LEFT;
PageView.ANIMATION_ZOOM_IN   = ANIMATION_ZOOM_IN;
