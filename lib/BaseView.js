
var _             = require('underscore');
var Backbone      = require('backbone');
var BackboneTouch = require('backbone.touch');

var BaseView = module.exports = Backbone.View.extend({

	className: function className() {
		return 'view ' + (this.addClass || '');
	},

	initialize: function initialize(options) {
		if (typeof options !== 'undefined') {
			if ('context' in options)
				this.setContext(options.context);
			// Deprecated
			else if ('shared' in options) {
				console.warn('Deprecated: use context option instead shared');
				this.setContext(options.shared);
			}
		}

		if (this.getContext() === null)
			this.setContext(require('context'));

		var ctx = this.getContext();
		if ( _.isUndefined(ctx) || _.isNull(ctx) || !_.isObject(ctx) ){
			throw new Error('The context has not been set. Please include the context. Launch the comand: bower install --save context-utils');
		}

		// Modify threshold for `backbone.touch`
		this.touchThreshold = ctx.device.isIphone() || ctx.device.isIpad() ? 2 : 10;

		// Name of the class when the view is activated by a click / tap. This is rapresent a ":active" css's selector.
		// This class append and removed by `backbone.touch`
		this.touchActiveClassName = 'active-state';

		// Inizializzo l'oggetto che conterrà tutte le subview
		this.views = {};
		this.cache = {};

		this.options = _.defaults(options || {}, {
			removeOnDestroy: true
		});

	},

	// Context
	context: null,
	getContext: function getContext() {
		return this.context;
	},
	setContext: function setContext(newContext) {
		this.context = newContext;
	},

	// Deprecated
	getShared: function getShared() { return this.getContext(); },
	setShared: function setShared(newContext) { return this.setContext(newContext); },

	// Helper for select element into view
	findPlaceholder: function findPlaceholder(name) {
		return this.$el.find('[data-placeholder="' + name + '"]');
	},

	// Helper for append a sub view into element and render this
	appendAndRenderToPlaceholder: function appendAndRenderToPlaceholder(name, view) {
		this.findPlaceholder(name).append(view.el);
		view.render();
		return this;
	},

	// Destroy of view
	// reference: http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
	destroy: function destroy() {
		if (this.options.removeOnDestroy)
			this.remove();
		else {
			this.undelegateEvents();
		}
		this.off();
		if (this.onDestroy)
			this.onDestroy();
	},

	// Manipulate z-index of the view
	setZindex: function setZindex(zIndex) {
		if ( _.isNumber(zIndex) ){
			this._zIndex = zIndex;
			this.$el.css("z-index", zIndex);
		}
		return this;
	},

	// Obtain z-index of the view
	getZindex: function getZindex() {
		return this._zIndex;
	},

	// Add events to the current view
	addEvents: function addEvents(events) {
		this.events = _.defaults(events, this.events || {});
		return this;
	},

	// Change animation CSS
	// Events: oanimationend animationend webkitAnimationEnd
	changeAnimation: function changeAnimation( animationName, selector) {
		var el;
		if ( _.isUndefined(selector) || selector.length == 0 ){
			el = this.$el;
		}else{
			el = selector;
		}
		el.css("animation-name", animationName);
		el.css("-webkit-animation-name", animationName);
		el.css("-moz-animation-name", animationName);
		el.css("-o-animation-name", animationName);
		return this;
	},

	// Trigger error
	throwError: function throwError(err) {
		this.trigger('error', err);
	},

	// reference: http://ianstormtaylor.com/rendering-views-in-backbonejs-isnt-always-simple/
	assign: function assign(view, selector) {
		view.setElement(this.$(selector)).render();
	},

	//
	// Events
	// 

	// Propagates the command to destroy all the subview
	onDestroy: function onDestroy() {
		_.forEach(this.views, function (aView) {
			if (aView instanceof BaseView)
				aView.destroy();
		});
	},

	// Default behavior in case of failure of view.
	// Shows top the error so that the view father knows what to do.
	onError: function onError(err) {
		this.throwError(err);
	}

});
