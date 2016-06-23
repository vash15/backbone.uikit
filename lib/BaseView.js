import _ from "underscore";
import { View } from "backbone";

export default class BaseView extends View {

	constructor(options) {
		super(options)
		// Initialize view options
		this.options = _.defaults(options || {}, {
			state: null,
			removeOnDestroy: true
		});
		// State [optional]
		this._state = this.options.state;
		delete this.options.state;
		this.cache = {};
		// Store sub views
		this._views = {};
		// Check if the view is rendered
		this._rendered = false;
		// Alias
		this.rAF = this.requestAnimationFrame;
		this.cAF = this.cancelAnimationFrame;
	}

	// Set the view state
	setState(state) {
		this._state = state;
		return this;
	}

	// Return the view state
	getState() {
		return this._state;
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
			if (this._state) view.setState(this._state);
		}
		this._views[name] = view;
		return this;
	}

	// Get a subview
	getSubView(name) {
		return this._views[name];
	}

	// Wrapper for Request Animation Frame
	requestAnimationFrame(callback) {
		return window.requestAnimationFrame(callback);
	}

	// Wrapper for Cancel Animation Frame
	cancelAnimationFrame(id) {
		return window.cancelAnimationFrame(id);
	}

	// Wrap render event inside requestAnimationFrame and delgate subviews
	// to be rendered
	render() {
		if (this.onRender) {
			this.requestAnimationFrame(() => {
				// Pass to the onRender callback if the view is already rendered
				this.onRender(this._rendered);
				this._rendered = true;
			});
		}
		else {
			this._rendered = true;
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
		_.forEach(this._views, (aView) => {
			if (aView instanceof BaseView)
				aView.destroy();
		});
	}

}
