import _            from "underscore";
import $            from "jquery";
import context      from "context-utils";
import { View }     from "backbone";
import OsBarView    from "./OsBarView";
import * as style   from "../utils/style";
import BezierEasing from "../utils/BezierEasing";
import ImageView    from "../ImageView";

const STATUS_SCROLL_UP         = 'scroll_up';
const STATUS_SCROLL_DOWN       = 'scroll_down';
const STATUS_SCROLL_INCOMPLETE = 'scroll_incomplete';

const RESIZE_RIGHT = 'right';
const RESIZE_LEFT  = 'left';
const RESIZE_RESET = 'reset';
const RESIZE_ALL   = 'all';

export default class ScrollBarView extends OsBarView {

	className() {
		return 'ui-navigation-bar ui-scroll-navigation-bar'
	}

	constructor(options) {
		super(options);
		let state = this.getState();

		this.setDefaultsOptions({
			resize:               RESIZE_ALL,    // resize width based on left-side and/or right-side. Default is "all", false for disabled
			scroll:               true,     // make the bottom-side scroll over the nav-bar
			scrollElement:        null,     // element to listen for scroll events
			scrollUpHeight:       44,       // bottom-side height when scrolled up
			scrollDownHeight:     44,       // bottom-side height when scrolled down
			scrollBounceRange:    120,      // when scroll falls in this range trigger scroll bounce animation
			initialStatus:        STATUS_SCROLL_DOWN, // bottom-side initial position
			bottom:               null,	    // View, el, $
			fadeBottomBackground: false,    // bottom-side-background fading animation
			inverseBottomFading:  false,    // fade bottom-side-background when scrolling down (false) or up (true)
			bounce:               "auto"    // "auto": bounce only when status change from SCROLL_DOWN to SCROLL_UP
											// "on":   bounce also when status is already SCROLL_UP
											// "off";  never bounce
		});

		this.onScroll     = _.bind(this.onScroll, this);
		this.onScrollStop = _.bind(_.debounce(this.onScrollStop, 50), this);
		this.onTouchStart = _.bind(this.onTouchStart, this);
		this.onTouchEnd   = _.bind(this.onTouchEnd, this);	// this.onTouchEnd = this.onTouchEnd.bind(this)

		this.setScroller(this.options.scrollElement);

		// Bezier easing
		if (this.options.resize)
			this.resizeEasing = BezierEasing(.0,.5,.5,.5);
		this.easingIn  = BezierEasing(.01,.69,.36,1);
		this.easingOut = BezierEasing(.81,.09,.1,.6);

		// Initial status
		this.touchActive  = false;
		this.scrollActive = false;
		if (this.options.initialStatus == STATUS_SCROLL_UP)
			this.status = STATUS_SCROLL_UP;
		else
			this.status = STATUS_SCROLL_DOWN;
	}

	onRender(rendered) {
		super.onRender(rendered);
		if (!rendered) {
			let bottom = this.cache.bottom = $("<div class='bottom-side'></div>").get(0);
			this.cache.bottomBackground    = $("<div class='bottom-side-background'></div>").get(0);

			if ( this.options.bottom ) {
				if ( this.options.bottom instanceof View )
					this.cache.bottomInner = this.options.bottom.el;
				else if ( this.options.bottom instanceof $ )
					this.cache.bottomInner = this.options.bottom.get(0);
				else
					this.cache.bottomInner = this.options.bottom;
				this.cache.bottomInner.classList.add('bottom-side-inner');
			} else {
				this.cache.bottomInner     = $("<div class='bottom-side-inner'></div>").get(0);
			}

			$(bottom).append(
				this.cache.bottomBackground,
				this.cache.bottomInner
			);

			this.$el.append(bottom);

			// Initialize status
			if (this.options.scroll && this.options.initialStatus == STATUS_SCROLL_UP) {
				// IMPORTANT: The scroller element has to be scrollable before setScroller() is called
				this.$scroller.get(0).scrollTop = this.options.scrollDownHeight;
			}
			// if (this.options.fadeBottomBackground && this.options.inverseBottomFading)
			// 	this.cache.bottomBackground.style.opacity = 0;


			// NOTA BENE: Da fissare l'altezza del Bottom Inner sul CSS
			const adjustButtonInnser = ()=>{
				let bottomInnerHeight = this.cache.bottomInner.offsetHeight;
				let scrollUpHeight    = this.options.scrollUpHeight;
				let scrollDownHeight  = this.options.scrollDownHeight;
				this.cache.bottomInnerTranslateUp   = (scrollUpHeight-bottomInnerHeight)/2+(scrollDownHeight-scrollUpHeight);
				this.cache.bottomInnerTranslateDown = (scrollDownHeight-bottomInnerHeight)/2;
				style.translate3d(this.cache.bottomInner, 0, this.cache.bottomInnerTranslateDown, 0);
			}

			// Controllo se ho del contenuto al suo interno e se è già stato rendereizzato
			if ( this.cache.bottomInner && this.cache.bottomInner.childNodes ){

				if ( this.cache.bottomInner.childNodes.length > 0 ){
					adjustButtonInnser();
				}else{
					// Altrimenti aspetto due "tick" per agiustare la sua posizione
					window.requestNextAnimationFrame(()=>{
						adjustButtonInnser();
					});
				}

			}

		}
	}

	setScroller(scrollElement) {
		if (!this.options.scroll)
			return;

		if (this.$scroller) {
			// Detach events on last scroll element
			this.$scroller.off('scroll', this.onScroll);
			this.$scroller.off('scroll', this.onScrollStop);
			this.$scroller.off('touchstart', this.onTouchStart);
		}

		// Set the new scroll element
		if (scrollElement) {
			if ( scrollElement instanceof View )
				this.$scroller = scrollElement.$el;
			else if ( scrollElement instanceof $ )
				this.$scroller = scrollElement;
			else
				this.$scroller = $(scrollElement);

			// Attach events on new scroll element
			this.$scroller.on('scroll', this.onScroll);
			this.$scroller.on('scroll', this.onScrollStop);
			this.$scroller.on('touchstart', this.onTouchStart);
		} else {
			this.$scroller = null;
		}
	}

	changeStatus(newStatus, options) {
		if (newStatus == this.status)
			return;

		options = _.defaults(options || {}, {
			silent: false,
			execute: true
		});

		this.status = newStatus;

		switch(this.status) {
			case STATUS_SCROLL_DOWN:
				this.$el.addClass('scrolled-down');
				this.$el.removeClass('scrolled-up');
				if (options.execute)
					this.update(0, true);
				break;
			case STATUS_SCROLL_UP:
				this.$el.removeClass('scrolled-down');
				this.$el.addClass('scrolled-up');
				if (options.execute)
					this.update(this.options.scrollDownHeight, true);
				break;
		}

		if (!options.silent)
			this.trigger('change:status', this.status);
	}

	onScroll(e) {
		e.preventDefault();

		this.scrollActive = true;

		if (!this.$scroller)
			return;

		let y = -this.$scroller.get(0).scrollTop;
		this.update(y);
	}

	onScrollStop() {
		this.scrollActive = false;

		if (!this.touchActive)
			this.adjustPostition();
	}

	onTouchStart(e) {
		this.touchActive = true;
		$(document).on('touchend', this.onTouchEnd);
	}

	onTouchEnd(e) {
		this.touchActive = false;
		$(document).off('touchend', this.onTouchEnd);

		if (!this.scrollActive)
			this.adjustPostition();
	}

	adjustPostition() {
		let y = this.$scroller.get(0).scrollTop;

		if (y == 0 || y == this.options.scrollDownHeight)
			return;

		if (this.previousUpdatePercent != 0 && this.previousUpdatePercent != 1)
			this.changeStatus(STATUS_SCROLL_INCOMPLETE, { silent: true });

		if (Math.abs(y) < this.options.scrollDownHeight / 2) {
			this.changeStatus(STATUS_SCROLL_DOWN);
		} else {
			if (this.status == STATUS_SCROLL_INCOMPLETE) {
				// Incomplete scroll
				this.changeStatus(STATUS_SCROLL_UP);
			} else if (this.options.bounce != "off" && this.status == STATUS_SCROLL_DOWN && y < this.options.scrollBounceRange) {
				// Bounce "auto": when status change from SCROLL_DOWN to SCROLL_UP and scroll falls in "scrollBounceRange"
				this.changeStatus(STATUS_SCROLL_UP);
			} else if (this.options.bounce == "on" && this.status == STATUS_SCROLL_UP && y < this.options.scrollBounceRange) {
				// Bounce "on": when status is already SCROLL_UP and scroll falls in "scrollBounceRange"
				this.update(this.options.scrollDownHeight, true); // Force bounce animation without changing status
			}
		}
	}

	update(y, animated = false) {	// If animated is true allow any update
		if (!this.$scroller)
			return;

		if (y > 0 && !animated) y = 0;
		let percent = Math.abs(y / this.options.scrollDownHeight);
		if (percent > 1) percent = 1;

		if (percent === this.previousUpdatePercent && !animated)
			return;

		this.requestAnimationFrame(() => {
			if (animated) {
				// Lock user scroll
				// Fix: now it use a new class to disable the scroll, it is required
				//      because if the scroller contains another overflow-scrolling
				//      list it moves without any reason on mobile Safari.
				this.$scroller.get(0).classList.add('disable-scroll');

				// Bottom side scroll animation
				let currentDevice = context.device.getOS();
				let nameDevice    = currentDevice.name.toLowerCase();

				if ((nameDevice == 'android' && currentDevice.version < 5) || nameDevice == 'windows phone') {
					// Don't animate on old devices, scroll instantly
					scroller.scrollTop = y;
					// Allow user scroll
					this.$scroller.get(0).classList.remove('disable-scroll');
				} else {
					this.$scroller.animate({
						scrollTop: y
					}, 200, () => {
						// Allow user scroll
						this.$scroller.get(0).classList.remove('disable-scroll');
					});
				}
			} else {
				// Backround fading
				if (this.options.fadeBottomBackground)
					this.cache.bottomBackground.style.opacity = this.options.inverseBottomFading ? (1 - percent) : percent;

				// Resizing width
				this.resize(this.options.resize, percent, true);


				// Resizing height & top distance
				// let topDistance = Math.abs(this.options.scrollDownHeight - this.options.scrollUpHeight) * percent;

				// Bottom side scrolling
				style.translate3d(this.cache.bottom, 0, (-(Math.max(this.options.scrollDownHeight, this.options.scrollUpHeight)) * percent), 0);
				let topDistance = this.cache.bottomInnerTranslateDown +  Math.abs(this.cache.bottomInnerTranslateDown - this.cache.bottomInnerTranslateUp) * percent;

				// style.translate3d(this.cache.bottomBackground, 0, (topDistance/2 * percent), 0);	// Position bottomBackground centered over the navigation bar
				style.translate3d(this.cache.bottomInner, 0, (topDistance), 0);		// Position bottomInner centered over the navigation bar

				// Center side fading
				style.translate3d(this.cache.center, 0, (-this.options.scrollDownHeight * percent), 0);
				this.cache.center.style.opacity = (1 - percent);
			}
		});

		this.previousUpdatePercent = percent;

		// Update status
		if (Math.abs(y) == 0)
			this.changeStatus(STATUS_SCROLL_DOWN, { execute: false });
		if (Math.abs(y) >= this.options.scrollDownHeight)
			this.changeStatus(STATUS_SCROLL_UP, { execute: false });
	}

	move(percent, direction, animated) {
		super.move(percent, direction, animated);

		if (!this.rendered)
			return;

		percent = percent / 100;

		switch (direction) {
			case ScrollBarView.PUSH:
			case ScrollBarView.RESTORE:
				percent = this.easingIn(percent);
			break;
			case ScrollBarView.POP:
			case ScrollBarView.DETACH:
				percent = this.easingOut(percent);
			break;
		}

		if (percent === 0 || percent === 1) {
			this.cache.bottom.style[ style.getVendorStyle('transition') ] = 'opacity ' + this.options.duration + 'ms';
			// Ignore browser optimizations to force style changing when this view is appended to the DOM
			window.requestNextAnimationFrame(() => {
				this.cache.bottom.style.opacity = percent;
			});
		} else {
			this.cache.bottom.style[ style.getVendorStyle('transition') ] = '';
			this.cache.bottom.style.opacity = percent;
		}

		return this;
	}

	resize(resize = false, percent = 1, immediate = true){
		const exec = ()=>{
			if (!resize)
				return this;
			switch (resize) {
				case 'left':
					this.cache.bottom.style.left  = (this.cache.left.offsetWidth * this.resizeEasing(percent)) + "px";
					break;
				case 'right':
					this.cache.bottom.style.right  = (this.cache.right.offsetWidth * this.resizeEasing(percent)) + "px";
					break;
				case 'reset':
					this.cache.bottom.style.left  = 0;
					this.cache.bottom.style.right = 0;
					break;
				default:
					this.cache.bottom.style.left  = (this.cache.left.offsetWidth * this.resizeEasing(percent)) + "px";
					this.cache.bottom.style.right = (this.cache.right.offsetWidth * this.resizeEasing(percent)) + "px";
					break;
			}
		}

		if ( immediate ){
			exec();
		}else{
			this.requestAnimationFrame(exec);
		}

		return this;
	}

	onDestroy() {
		if (this.$scroller) {
			this.$scroller.off('scroll', this.onScroll);
			this.$scroller.off('scroll', this.onScrollStop);
			this.$scroller.off('touchstart', this.onTouchStart);
		}
		super.onDestroy();
	}

};

ScrollBarView.STATUS_SCROLL_UP         = STATUS_SCROLL_UP;
ScrollBarView.STATUS_SCROLL_DOWN       = STATUS_SCROLL_DOWN;
ScrollBarView.STATUS_SCROLL_INCOMPLETE = STATUS_SCROLL_INCOMPLETE;

ScrollBarView.RESIZE_RIGHT = RESIZE_RIGHT;
ScrollBarView.RESIZE_LEFT  = RESIZE_LEFT;
ScrollBarView.RESIZE_RESET = RESIZE_RESET;
ScrollBarView.RESIZE_ALL   = RESIZE_ALL;
