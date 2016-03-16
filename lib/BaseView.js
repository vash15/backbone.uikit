
var _             = require('underscore');
var Backbone      = require('backbone');
var BackboneTouch = require('backbone.touch');

var BaseView = module.exports = Backbone.View.extend({

	className: function className() {
		return 'view ' + ( _.result(this, "addClass") || '' );
	},

	initialize: function initialize(options) {
		if (typeof options !== 'undefined') {
			if ('context' in options)
				this.setContext(options.context);
		}

		if (this.getContext() === null)
			this.setContext(require('context'));

		var ctx = this.getContext();
		if ( _.isUndefined(ctx) || _.isNull(ctx) || !_.isObject(ctx) ){
			throw new Error('The context has not been set. Please include the context. Launch the comand: bower install --save context');
		}

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
			this.el.style.zIndex = zIndex;
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
		this.delegateEvents();
		return this;
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
	}

});
