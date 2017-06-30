import _ from "underscore";
import { View } from "backbone";

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

	className() {
		return 'ui-base-view ' + ( _.result(this, "addClass") || '' );
	}

	// Set defaults options
	setDefaultsOptions(defaults){
		_.defaults( this.options, defaults );
		return this;
	}

	// Set the view state
	setState(state) {
		this.state = state;
		return this;
	}

	// Return the view state
	getState() {
		return this.state;
	}

	// Add events to the current view
	addEvents(events) {
		this.events = _.defaults(events, this.events || {});
		this.delegateEvents();
		return this;
	}

	// Add a new subview
	addSubView(name, view, state) {
		// When adding a subview inject the state
		if (view instanceof BaseView) {
			if (state) view.setState(state);
			if (this.state) view.setState(this.state);
		}
		this.views[name] = view;
		return this;
	}

	// Get a subview
	getSubView(name) {
		return this.views[name];
	}

	// Remove a subview
	removeSubView(name){
		let view = this.getSubView(name);
		if (view instanceof BaseView) {
			this.stopListening(view);
			view.destroy();
		}
		delete this.views[name];
		return this;
	}

	// Wrapper for Request Animation Frame
	requestAnimationFrame(callback) {
		return window.requestAnimationFrame(callback);
	}

	// Wrapper for Cancel Animation Frame
	cancelAnimationFrame(id) {
		return window.cancelAnimationFrame(id);
	}

	// Manipulate z-index of the view
	setZindex(zIndex) {
		if ( _.isNumber(zIndex) ){
			window.requestAnimationFrame(()=>{
				this._zIndex = zIndex;
				this.el.style.zIndex = zIndex;
			});
		}
		return this;
	}

	// Obtain z-index of the view
	getZindex() {
		return this._zIndex;
	}

	// Debounce a method
	debounce(method, delay) {
		if (!delay) delay = 500;
		this[method] = _.debounce(_.bind(this[method], this), delay, true);
	}

	// Wrap render event inside requestAnimationFrame and delgate subviews
	// to be rendered
	render() {
		if (this.onRender) {
			if ( this.rafId )
				this.cancelAnimationFrame(this.rafId);
			this.rafId = this.requestAnimationFrame(() => {
				// Pass to the onRender callback if the view is already rendered
				this.onRender(this.rendered);
				this.delegateEvents();
				this.rendered = true;
				this.rafId    = null;
			});
		}
		else {
			this.rendered = true;
		}
		return this;
	}

	// Scrolla la view fino all'elemento oppure ad una posizione precisa.
	// el può essere un elemento del DOM, un elemento jQuery oppure un intero.
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

		// Normalizza lo scroller
		if (scroller instanceof $) {
			scroller = scroller.get(0);
		}

		// Porta in alto lo scroll della pagina
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
			// Per i vecchi dispositivi non viene fatta nessuna animazione
			if (!animated || (nameDevice == 'android' && currentDevice.version < 5) || nameDevice == 'windows phone') {
				style.overflowScrolling(scroller, true);
				// Blocca lo scroll dell'utente
				scroller.scrollTop = newScroll;
			}
			else {
				$(scroller).animate({
					scrollTop: newScroll
				}, 200, () => {
					// Blocca lo scroll dell'utente
					style.overflowScrolling(scroller, true);
				});
			}
		});
	}

	// Destroy of view
	// reference: http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
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

	// Propagates the command to destroy all the subview
	onDestroy() {
		_.forEach(this.views, (aView) => {
			if (aView instanceof BaseView)
				aView.destroy();
		});
	}

}
