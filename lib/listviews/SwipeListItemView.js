import _ from "underscore";
import $ from "jquery";
import ListItemView from "./ListItemView";
import getContextOptions from "../utils/getContextOptions";
import { getVendorStyle, translate3d, scaleAndTranslate3d } from "../utils/style";

const STATUS_NORMAL       = 'normal';
const STATUS_LEFT_ACTIVE  = 'left_active';
const STATUS_RIGHT_ACTIVE = 'right_active';
const STATUS_DRAGGING     = 'dragging';

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

/**
 * Class rapresent a list item with left and right swipe effect.
 * It's composed by a swipeable drawer and two actions panels positioned behind
 * the drawer.
 * @extends ListItemView
 * @version 2.1.0
 * @param {Object} options - Page options
 * @param {ListView} options.parentList - Parent ListView, it's mandatory
 * @param {bool} [options.left] [true] - Support left swipe
 * @param {bool} [options.right] [true] - Support right swipe
 * @param {integer} [options.leftWidth] [64] - Size in pixels to activate the left action
 * @param {integer} [options.rightWidth] [64] - Size in pixels to activate the right action
 * @param {bool} [options.toggleLeft] [true] - If true the drawer remains opened after a swipe left
 * @param {bool} [options.toggleRight] [true] - If true the drawer remains opened after a swipe right
 * @param {integer} [options.toggleLeftWidth] [88] - Size in pixels of the left action, used when the drawer is open
 * @param {integer} [options.toggleRightWidth] [88] - Size in pixels of the right action, used when the drawer is open
 * @param {integer} [options.duration] [300] - Animation duration in ms
 * @param {bool} [options.friction] [true] - Adds a friction to the drawer
 * @param {integer} [options.frictionStartAt] [80] - The amount of swipe, in pixels, before friction start
 * @param {string} [options.transition] [cubic-bezier(0.690, 0.535, 0.665, 1.580)] - Timing function for animation. The default animation has a bounce effect
 * @param {function} [options.vibrateCallback] [null] - Called when it's the time for a vibration
 * @param {string} [options.activeClassName] [action-active] - Class added to the list item view when the drawer is swiped enought to activate an action
 * @param {string} [options.leftClassName] [null] - Class added to the left action
 * @param {string} [options.rightClassName] [null] - Class added to the right action
 * @param {string} [options.drawerClassName] [null] - Class added to the drawer
 * @example
 * class MySwipeListItemView extends SwipeListItemView {
 *   onRender(rendered) {
 *     super.onRender(rendered);
 *     this.cache.$drawer.text('Sample text');
 *   }
 * }
 *
 * export default class MyListView extends ListView {
 *   getListItemViewAtIndexWithOptions(index, options) {
 *     return new MySwipeListItemView(options);
 *   }
 *   onSelectItem(item, done) {
 *     if (item) {
 *       // Element clicked, you should check if it is the left, or right,
 *       // action button and ignore the drawer
 *       console.log(item.element);
 *     }
 *     return done();
 *   }
 * }
 */
export default class SwipeListItemView extends ListItemView {

	/**
	 * Triggered when the user stop dragging the drawer with the left action
	 * active
	 * @event SwipeListItemView#swipe:left
	 * @version 2.1.0
	 * @property {SwipeListItemView} item - Self
	 */

	/**
	 * Triggered when the user stop dragging the drawer with the right action
	 * active
	 * @event SwipeListItemView#swipe:right
	 * @version 2.1.0
	 * @property {SwipeListItemView} item - Self
	 */

	/**
	 * Triggered when the user end dragging
	 * @event SwipeListItemView#dragging:end
	 * @version 2.1.0
	 * @property {SwipeListItemView} item - Self
	 */

	/**
	 * Triggered when the user stop dragging
	 * @event SwipeListItemView#dragging:start
	 * @version 2.1.0
	 * @property {SwipeListItemView} item - Self
	 */

	constructor(options) {
		super(options);

		this.setDefaultsOptions(getContextOptions('SwipeListItemView'), {
			left: true,
			right: true,
			leftWidth: 64,
			rightWidth: 64,
			toggleLeft: true,
			toggleRight: true,
			toggleLeftWidth: 88,
			toggleRightWidth: 88,
			duration: 300,
			friction: true,
			frictionStartAt: 80,
			transition: 'cubic-bezier(0.690, 0.535, 0.665, 1.580)',
			vibrateCallback: null, // function called on vibrate
			activeClassName: 'action-active',
			leftClassName: null,
			rightClassName: null,
			drawerClassName: null
		});

		if (!this.options.parentList) {
			throw new Error('Parent list view is required for SwipeListItemView');
		}

		this.addEvents({
			'touchstart': 'onTouchStart'
		});

		this.status = STATUS_NORMAL;
		this.startX = 0;
		this.startY = 0;
		this.origianlStartX = 0;
		this.origianlStartY = 0;
		this.width  = 0;
		this.hasActiveClass = false;

		this.onCheckDirectionTouchMove = _.bind(this.onCheckDirectionTouchMove, this);
		this.onTouchMove               = _.bind(this.onTouchMove, this);
		this.onTouchEnd                = _.bind(this.onTouchEnd, this);

		this.listenTo(this.parent, 'dragging:start', this.onListItemDraggingStart);
	}

	/**
	 * Render the view
	 * @version 2.1.0
	 * @private
	 * @param {bool} rendered - Indicate if the view was already rendered
	 * @return {SwipeListItemView} - Self
	 */
	onRender(rendered) {
		if (!rendered) {
			this.cache.$leftAction = $('<div class="ui-swipe-list-item-actions ui-swipe-list-item-actions-left js-ui-swipe-list-item-actions-left">').addClass(this.options.leftClassName);
			this.cache.$rightAction = $('<div class="ui-swipe-list-item-actions ui-swipe-list-item-actions-right js-ui-swipe-list-item-actions-right">').addClass(this.options.rightClassName);
			this.cache.$drawer = $('<div class="ui-swipe-list-item-drawer js-ui-swipe-list-item-drawer">').addClass(this.options.drawerClassName);
			this.cache.drawer = this.cache.$drawer.get(0);
			this.cache.$title = $('<span>').text(this.model.toString());
			this.$el.append(
				this.cache.$leftAction,
				this.cache.$rightAction,
				this.cache.$drawer.append(this.cache.$title)
			);
		} else if (this.model) {
			this.cache.$title.text(this.model.toString());
		} else {
			this.cache.$title.text('');
		}
		return this;
	}

	/**
	 * Called when the user touch the view
	 * @version 2.1.0
	 * @private
	 * @param  {object} e - jQuery touch event
	 */
	onTouchStart(e) {
		if (this.status === STATUS_DRAGGING) return;

		this.startX = getPageX(e);
		this.startY = getPageY(e);
		this.origianlStartX = this.startX;
		this.origianlStartY = this.startY;

		if (this.status === STATUS_LEFT_ACTIVE) {
			this.startX -= this.options.toggleLeftWidth;
		} else if (this.status === STATUS_RIGHT_ACTIVE) {
			this.startX += this.options.toggleRightWidth;
		}

		this.deltaX = 0;
		this.width  = this.$el.width();

		document.addEventListener('touchmove', this.onCheckDirectionTouchMove, { passive: true });

		this.trigger('dragging:start', this);
	}

	/**
	 * Called when the user move the finger on the view for the first time.
	 * It's used to check if the movement is horizontal or vertical. If it's
	 * horizontal it attaches a touchmove and touchend event to the document,
	 * stops the parentList scroll and start move the drawer. If it's vertical
	 * ignore the event.
	 * @version 2.1.0
	 * @private
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	onCheckDirectionTouchMove(e) {
		const x = getPageX(e);
		const y = getPageY(e);

		const deltaX = x - this.origianlStartX;
		const deltaY = y - this.origianlStartY;

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			this.status = STATUS_DRAGGING;
			this.parent.pause();

			document.addEventListener('touchmove',   this.onTouchMove, { passive: true });
			document.addEventListener('touchend',    this.onTouchEnd, { passive: true });
			document.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
		} else {
			this.closeDrawer();
			this.parent.resume();
		}

		document.removeEventListener('touchmove', this.onCheckDirectionTouchMove);
	}

	/**
	 * Called when the user removes the finger from the screen. It check the
	 * position of the drawer and react to toggleLeft, toggleRight options.
	 * It also trigger swipe:left, swipe:right, dragging:end events.
	 * @version 2.1.0
	 * @private
	 * @param {object} e - DOM touch event
	 */
	onTouchEnd(e) {
		this.parent.resume();
		document.removeEventListener('touchmove',   this.onTouchMove);
		document.removeEventListener('touchend',    this.onTouchEnd);
		document.removeEventListener('touchcancel', this.onTouchEnd);
		this.cache.drawer.style[ getVendorStyle('transition') ] = `transform ${this.options.duration}ms ${this.options.transition}`;

		// Point of close
		const deltaX = this.deltaX;
		let endX = 0;
		let endStatus = STATUS_NORMAL;

		if (this.options.left && deltaX >= this.options.leftWidth) {
			if (this.options.toggleLeft) {
				endX = this.options.toggleLeftWidth;
				endStatus = STATUS_LEFT_ACTIVE;
				this.addActiveClass();
			}
			this.trigger('swipe:left', this);
		}

		if (this.options.right && deltaX <= -this.options.rightWidth) {
			if (this.options.toggleRight) {
				endX = -this.options.toggleRightWidth;
				endStatus = STATUS_RIGHT_ACTIVE;
				this.addActiveClass();
			}
			this.trigger('swipe:right', this);
		}

		this.status = endStatus;

		translate3d(this.cache.$drawer, endX, 0, 0);
		setTimeout(() => {
			this.cache.drawer.style[ getVendorStyle('transition') ] = '';
		}, this.options.duration);

		this.trigger('dragging:end', this);
	}

	/**
	 * Called when the user moves a finger on the screen. It handles the
	 * drawer movement and also adds the options.activeClassName to the view.
	 * @param {object} e - DOM touch event
	 * @version 2.1.0
	 * @private
	 */
	onTouchMove(e) {
		const x = getPageX(e);
		let deltaX = this.deltaX = x - this.startX;
		const sign = (deltaX / Math.abs(deltaX));

		if (sign > 0) {
			this.cache.$leftAction.show();
			this.cache.$rightAction.hide();
		} else {
			this.cache.$leftAction.hide();
			this.cache.$rightAction.show();
		}

		// Left action disabled
		if (!this.options.left && deltaX > 0) {
			this.startX = x;
			deltaX = 0;
		}

		// Right action disabled
		if (!this.options.right && deltaX < 0) {
			this.startX = x;
			deltaX = 0;
		}

		// Adds extra friction
		if (this.options.friction && Math.abs(deltaX) > this.options.frictionStartAt) {
			deltaX = sign * Math.sqrt(this.options.frictionStartAt * Math.abs(deltaX));
		}

		// Block the scroll at 50% of the width if left and right actions are
		// enabled
		if (this.options.left && this.options.right && Math.abs(deltaX) > Math.floor(this.width / 2)) {
			deltaX = sign * Math.floor(this.width / 2);
		}

		// Adds a class to indicate if the action is active
		if (this.options.left && deltaX > 0) {
			if (deltaX >= this.options.leftWidth && !this.hasActiveClass) {
				this.addActiveClass();
				this.vibrate();
			} else if (deltaX < this.options.leftWidth && this.hasActiveClass) {
				this.removeActiveClass();
				this.vibrate();
			}
		}

		// Adds a class to indicate if the action is active
		if (this.options.right && deltaX < 0) {
			if (deltaX <= -this.options.rightWidth && !this.hasActiveClass) {
				this.addActiveClass();
				this.vibrate();
			} else if (deltaX > -this.options.rightWidth && this.hasActiveClass) {
				this.removeActiveClass();
				this.vibrate();
			}
		}

		translate3d(this.cache.$drawer, deltaX, 0, 0);
	}

	/**
	 * Called when another SwipeListItemView start dragging. It closes the
	 * drawer to prevent multiple drawers opened on the same list.
	 * NOTE: This method receives his dragging:start event.
	 * @private
	 * @version 2.1.0
	 * @param {SwipeListItemView} item - Item that triggered the event
	 */
	onListItemDraggingStart(item) {
		if (item === this) return;
		this.closeDrawer();
	}

	/**
	 * Open the drawer
	 * @public
	 * @version 2.1.3
	 * @param {bool} [animated] [true] - Open the drawer with an animation
	 */
	openDrawer(newStatus, animated = true) {
		if (newStatus != STATUS_LEFT_ACTIVE && newStatus != STATUS_RIGHT_ACTIVE) return;

		let endX = 0;

		if (newStatus === STATUS_LEFT_ACTIVE && this.options.left) {
			if (this.options.toggleLeft) {
				endX = this.options.toggleLeftWidth;
				this.addActiveClass();
			}
			this.trigger('open:left', this);
		}

		if (newStatus === STATUS_RIGHT_ACTIVE && this.options.right) {
			if (this.options.toggleRight) {
				endX = -this.options.toggleRightWidth;
				this.addActiveClass();
			}
			this.trigger('open:right', this);
		}

		if (animated) {
			this.cache.drawer.style[ getVendorStyle('transition') ] = `transform ${this.options.duration}ms`;
			setTimeout(() => {
				this.cache.drawer.style[ getVendorStyle('transition') ] = '';
			}, this.options.duration);
		}
		translate3d(this.cache.$drawer, endX, 0, 0);
		this.status = newStatus;
	}

	/**
	 * Close the drawer
	 * @public
	 * @version 2.1.0
	 * @param {bool} [animated] [true] - Close the drawer with an animation
	 */
	closeDrawer(animated = true) {
		if (this.status === STATUS_NORMAL) return;
		if (animated) {
			this.cache.drawer.style[ getVendorStyle('transition') ] = `transform ${this.options.duration}ms`;
			setTimeout(() => {
				this.cache.drawer.style[ getVendorStyle('transition') ] = '';
			}, this.options.duration);
		}
		translate3d(this.cache.$drawer, 0, 0, 0);
		this.removeActiveClass();
		this.status = STATUS_NORMAL;
	}

	/**
	 * Ensure that a model sostitution closes the drawer (without animation)
	 * @private
	 * @version 2.1.0
	 * @param {Model} newModel - The new model
	 */
	setModel(newModel) {
		this.closeDrawer(false);
		return super.setModel(newModel);
	}

	/**
	 * Helper method used to add the activeClassName only when necessary
	 * @private
	 * @version 2.1.0
	 */
	addActiveClass() {
		if (!this.hasActiveClass) {
			this.$el.addClass(this.options.activeClassName);
			this.hasActiveClass = true;
		}
	}

	/**
	 * Returns the current view status. It could be:
	 * - STATUS_NORMAL
	 * - STATUS_LEFT_ACTIVE
	 * - STATUS_RIGHT_ACTIVE
	 * - STATUS_DRAGGING
	 * @public
	 * @version 2.1.1
	 * @return {String} - Current status
	 */
	getStatus() {
		return this.status;
	}

	/**
	 * Helper method used to remove the activeClassName only when necessary
	 * @private
	 * @version 2.1.0
	 */
	removeActiveClass() {
		if (this.hasActiveClass) {
			this.$el.removeClass(this.options.activeClassName);
			this.hasActiveClass = false;
		}
	}

	/**
	 * Helper method called when it's the time to launch a vibration
	 * @private
	 * @version 2.1.0
	 */
	vibrate() {
		if (this.options.vibrateCallback) {
			this.options.vibrateCallback();
		}
	}

}

SwipeListItemView.STATUS_NORMAL       = STATUS_NORMAL;
SwipeListItemView.STATUS_LEFT_ACTIVE  = STATUS_LEFT_ACTIVE;
SwipeListItemView.STATUS_RIGHT_ACTIVE = STATUS_RIGHT_ACTIVE;
SwipeListItemView.STATUS_DRAGGING     = STATUS_DRAGGING;
