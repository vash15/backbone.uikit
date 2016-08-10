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
		this.rAF = this.requestAnimationFrame;
		this.cAF = this.cancelAnimationFrame;
		// Backbone touch active class
		this.touchActiveClassName = 'touch-active';
	}

	className() {
		return 'ui-base-view ' + ( _.result(this, "addClass") || '' );
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

	setDefaultsOptions(defaults){
		_.defaults( this.options, defaults );
		return this;
	}

	// Get a subview
	getSubView(name) {
		return this.views[name];
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
			this._zIndex = zIndex;
			this.el.style.zIndex = zIndex;
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
			this.requestAnimationFrame(() => {
				// Pass to the onRender callback if the view is already rendered
				this.onRender(this.rendered);
				this.delegateEvents();
				this.rendered = true;
			});
		}
		else {
			this.rendered = true;
		}
		return this;
	}

	// Destroy of view
	// reference: http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
	destroy() {
		if (this.options.removeOnDestroy)
			this.remove();
		else {
			this.undelegateEvents();
		}
		this.off();
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
