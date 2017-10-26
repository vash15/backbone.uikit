import _ from "underscore";
import context from "context-utils";
import { View } from "backbone";
import $ from "jquery";
import {overflowScrolling} from "./utils/style";

/**
 * BaseView extends Backbone.View to add a destroy chain, defer the rendering
 * using requestAnimationFrame and add helper methods.
 * Every view in the project should extends BaseView to preserve the destroy
 * chain and prevent memory leaks.
 * It's also important to bind DOM events through addEvents() that prevents
 * a Backbone.View issue on extending views.
 * @extends Backbone.View
 * @example
 * import { BaseView } from 'backbone.uikit';
 * export default class MyView extends BaseView {
 *   addClass() {
 *     return 'my-view';
 *   }
 *
 *   constructor(options) {
 *     super(options);
 *
 *     this.setDefaultsOptions({
 *       message: '42!'
 *     });
 *
 *    this.addEvents({
 *      'click': 'onClick'
 *    });
 *
 *     // Adding a sub view width state
 *     this.addSubView('label', new LabelView({ message: this.options.message }), this.getState());
 *   }
 *
 *   onRender(rendered) {
 *     if (rendered)
 *       return this;
 *
 *     let labelView = this.getSubView('label');
 *     this.$el.empty().append(labelView.el);
 *     labelView.render();
 *
 *     return this;
 *   }
 *
 *   onClick() {
 *     console.log('click');
 *   }
 *
 *   onDestroy(options) {
 *     console.log('on destroy My View!');
 *     super.onDestroy(options);
 *   }
 * }
 * @example <caption>HTML Output</caption>
 * <div class="ui-base-view my-view">
 *   <label>41!</label>
 * </div>
 */
export default class BaseView extends View {

	constructor(options) {
		super(options);
		// Initialize view options
		this.options = options || {};

		// Set de default options
		this.setDefaultsOptions({ state: null, removeOnDestroy: true });

		// State [optional]
		this.state = this.options.state;
		delete this.options.state;
		this.cache = {};
		// Store sub views
		this.views = {};
		// Check if the view is rendered
		this.rendered = false;
		// Alias
		this.rAF = function () {
			console.warn('method rAF deprecated');
		} // this.requestAnimationFrame;
		this.cAF = function () {
			console.warn('method cAF deprecated');
		} // this.cancelAnimationFrame;
		// Backbone touch active class
		this.touchActiveClassName = 'touch-active';
	}

	/**
	 * Override this method to change the default class applied to the view
	 * @public
	 * @version 2.0.0
	 * @return {string} The complete CSS class property
	 */
	className() {
		return 'ui-base-view ' + (_.result(this, 'addClass') || '');
	}

	/**
	 * Helper method to set default view options. Use it in the constructor.
	 * @public
	 * @version 2.0.0
	 * @param {Object} defaults - JSON object with the view options.
	 * @param {Object} [moreDefaults] - Another object used for the options.
	 * @return {BaseView} Returns this.
	 * @example
	 * constructor(options) {
	 *   this.setDefaultsOptions(options, {
	 *     foo: 'Bar'
	 *   });
	 * }
	 */
	setDefaultsOptions(defaults, moreDefaults){
		_.defaults( this.options, defaults, moreDefaults );
		return this;
	}

	/**
	 * Set the state object to the view.
	 * @public
	 * @version 2.0.0
	 * @param {Object} state - State object.
	 * @return {BaseView} Returns this.
	 */
	setState(state) {
		this.state = state;
		return this;
	}

	/**
	 * Get the state object.
	 * @public
	 * @version 2.0.0
	 * @return {State} State object.
	 */
	getState() {
		return this.state;
	}

	/**
	 * Attach events to the DOM.
	 * It's important to bind DOM events through addEvents() that prevents a
	 * Backbone.View issue on extending views.
	 * @public
	 * @version 2.0.0
	 * @return {BaseView} Returns this.
	 */
	addEvents(events) {
		this.events = _.defaults(events, this.events || {});
		this.delegateEvents();
		return this;
	}

	/**
	 * Add a subview to this.views object. Does not add it to the DOM or call render.
	 * On view destroy every subview.destroy() method is called automatically,
	 * it's useful to prevent memory leaks.
	 * @public
	 * @version 2.0.0
	 * @param {string} name - The name of the subview.
	 * @param {BaseView} view - An instance of a BaseView.
	 * @return {BaseView} Returns this.
	 */
	addSubView(name, view, state) {
		// When adding a subview inject the state
		if (view instanceof BaseView) {
			if (state) view.setState(state);
			if (this.state) view.setState(this.state);
		}
		this.views[name] = view;
		return this;
	}

	/**
	 * Return a sub view from it's name.
	 * @public
	 * @version 2.0.0
	 * @param {string} name - The name of the sub view.
	 * @return {BaseView} Returns this.
	 */
	getSubView(name) {
		return this.views[name];
	}

	/**
	 * Remove a subview. It also stop listening his events and remove it from
	 * the DOM.
	 * @public
	 * @version 2.0.0
	 * @param {string} name - The name of the sub view.
	 * @return {BaseView} Returns this.
	 */
	removeSubView(name){
		let view = this.getSubView(name);
		if (view instanceof BaseView) {
			this.stopListening(view);
			view.destroy();
		}
		delete this.views[name];
		return this;
	}

	/**
	 * Wrapper of window.requestAnimationFrame
	 * @public
	 * @version 2.0.0
	 * @param {function} callback - Function to call
	 * @return {integer} requestAnimationFrame handler id useful to cancel the animation
	 */
	requestAnimationFrame(callback) {
		return window.requestAnimationFrame(callback);
	}

	/**
	 * Wrapper of window.requestAnimationFrame
	 * @public
	 * @version 2.0.0
	 * @param {function} callback - Function to call
	 * @return {integer} cancelAnimationFrame
	 */
	cancelAnimationFrame(id) {
		return window.cancelAnimationFrame(id);
	}

	/**
	 * Helper function to set z-index
	 * @public
	 * @version 2.0.0
	 * @param {integer} zIndex - New z-index.
	 * @return {BaseView} Returns this.
	 */
	setZindex(zIndex) {
		if ( _.isNumber(zIndex) ){
			window.requestAnimationFrame(()=>{
				this._zIndex = zIndex;
				this.el.style.zIndex = zIndex;
			});
		}
		return this;
	}

	/**
	 * Get z-index
	 * @public
	 * @version 2.0.0
	 * @return {BaseView} Returns this.
	 */
	getZindex() {
		return this._zIndex;
	}

	/**
	 * Helper method to debounce a function
	 * @public
	 * @version 2.0.0
	 * @param {string} method - Method name.
	 * @param {integer} delay - Timeing for debounce.
	 * @return {BaseView} Returns this.
	 */
	debounce(method, delay) {
		if (!delay) delay = 500;
		this[method] = _.debounce(_.bind(this[method], this), delay, true);
	}

	/**
	 * Render the view. It use requestAnimationFrame to increase the performance.
	 * On the sub view override the method onRender to insert your code.
	 * @public
	 * @version 2.0.0
	 * @return {BaseView} Returns this.
	 */
	render() {
		const renderEnd = () => {
			this.delegateEvents();
			this.rendered = true;
			if (this.onAfterRender)
				this.onAfterRender();
		}

		if (this.onRender) {
			if ( this.rafId )
				this.cancelAnimationFrame(this.rafId);
			this.rafId = this.requestAnimationFrame(() => {
				this.rafId = null;
				// Pass to the onRender callback if the view is already rendered
				this.onRender(this.rendered, renderEnd);

				if (this.onRender.length === 1)
					renderEnd();
			});
		}
		else {
			this.rendered = true;
		}
		return this;
	}

	/**
	 * Override this method to insert your render logic.
	 * Optionally add a done callback to create an async rendering.
	 * Only when done() is called your BaseView calls onAfterRender.
	 * @public
	 * @version 2.0.0
	 * @example <caption>Syncronous rendering</caption>
	 * onRender(rendered) {
	 *   if (!rendered) {
	 *     this.$el.html(this.template({ model: this.model.toJSON() }));
	 *   }
	 * }
	 * @example <caption>Asyncronous rendering</caption>
	 * onRender(rendered, done) {
	 *   if (!rendered) {
	 *     this.$el.html(this.template({ model: this.model.toJSON() }));
	 *     new Swiper({
	 *       ...,
	 *       onInit: () => {
	 *         done();
	 *       }
	 *     });
	 *   }
	 * }
	 * onAfterRender() {
	 *   console.log('Swiper is ready!');
	 * }
	 */
	onRender(rendered) {
		// This method should be implemented on the subview
	}

	/**
	 * Override this method to insert your render logic after async onRender
	 * is happended. It's callend only if onRender has two parameters (rendered, done).
	 * @public
	 * @version 2.0.0
	 */
	onAfterRender() {
		// This method should be implemented on the subview
	}

	/**
	 * Helper function that scroll a view, or a div, to an element.
	 * @public
	 * @version 2.0.0
	 * @param {HTMLElement|jQuery} scroller [this] - Element that scroll.
	 * @param {HTMLElement|jQuery} el - Element to scroll to.
	 * @param {boolean} animated [false] - Indicates if the scroll should be enabled or not. Based on device performance it could be overwritten to false.
	 */
	scrollToElement(scroller, el, animated) {
		if (typeof animated === 'undefined') {
			animated = true;
		}

		if (typeof el === 'undefined') {
			el = scroller;
			scroller = this.el;
		}

		if (typeof scroller === 'undefined') {
			scroller = this.el;
		}

		let currentDevice = context.device.getOS();
		let nameDevice    = currentDevice.name.toLowerCase();

		// Cast jQuery object
		if (scroller instanceof $) {
			scroller = scroller.get(0);
		}

		// Calculate the scroll position
		let newScroll;
		if (el instanceof $) {
			newScroll = scroller.scrollTop + el.position().top;
		}
		else if (_.isNumber(el)) {
			newScroll = el;
		}
		else {
			newScroll = scroller.scrollTop + $(el).position().top;
		}

		this.requestAnimationFrame(() => {
			// Stop the scroll so the user cannot interferee with the user
			overflowScrolling(scroller, false);
			// For older devices the animation is skipped by default
			if (!animated || (nameDevice == 'android' && currentDevice.version < 5) || nameDevice == 'windows phone') {
				// Enable scroll
				overflowScrolling(scroller, true);
				scroller.scrollTop = newScroll;
			}
			else {
				$(scroller).animate({
					scrollTop: newScroll
				}, 200, () => {
					// Enable scroll
					overflowScrolling(scroller, true);
				});
			}
		});
	}

	/**
	 * Remove the view from the DOM and switch off all events.
	 * Calls onDestroy().
	 * @public
	 * @version 2.0.0
	 */
	destroy() {
		this.off();
		if (this.options.removeOnDestroy){
			this.requestAnimationFrame(()=>{
				this.remove();
			});
		}
		else {
			this.undelegateEvents();
		}
		if (this.onDestroy)
			this.onDestroy();
	}

	/**
	 * Propagates the command to destroy all the subview.
	 * Override this method to create custom destroy logic.
	 * When overwritten it's important to call super.onDestroy() after custom code.
	 * @public
	 * @version 2.0.0
	 * @example
	 * onDestroy() {
	 *   const swiper = this.cache.swiper;
	 *   if (swiper) {
	 *     swiper.destroy();
	 *   }
	 *   super.onDestroy();
	 * }
	 */
	onDestroy() {
		_.forEach(this.views, (aView) => {
			if (aView instanceof BaseView)
				aView.destroy();
		});
	}

}
