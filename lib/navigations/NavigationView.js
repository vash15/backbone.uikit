var _        = require('underscore');
var BaseView = require('../BaseView');
var BarView  = require('./BarView');

function isView(view){
	return _.isObject(view) && view.render;
};

var NavigationView = module.exports = BaseView.extend({

	addClass: 'navigation-view',

	initialize: function initialize(options) {
		NavigationView.__super__.initialize.apply(this, arguments);
		if ( !options ) options = {};
		var ctx = this.getContext();
		this._stack = [];

		this.listenTo( ctx.viewstack, "pushed", this.onPushedView );
		this.listenTo( ctx.viewstack, "popped", this.onPoppedView );
	},

	render: function render(){
		this.$el.empty();
		return this;
	},

	push: function push( newBarView, animated ){
		var activeBarView = this.getActiveBarView();
		if ( activeBarView === newBarView )
			return this;

		this._stack.unshift(newBarView);

		if ( this._stack.length > 2 ){
			var popView = this._stack.pop();
			if ( isView(popView) ){
				popView.$el.detach();
			}
		}

		if ( isView(newBarView) ){
			newBarView.setZindex(10);
			this.$el.append( newBarView.el );
			newBarView.render();
			newBarView.move(100, BarView.PUSH, animated === undefined || animated );
		}

		var oldBarView = this.getOldBarView();
		if ( isView(oldBarView) ){
			oldBarView.setZindex(0);
			oldBarView.move(0, BarView.DETACH, true);
		}

		return this;
	},

	pop: function pop(popBarView){
		var activeBarView = this.getActiveBarView();
		var oldBarView    = this.getOldBarView();

		// Ensure we doesn't pop the same bar view
		if ( oldBarView === popBarView )
			return this;

		if ( isView(activeBarView) ){
			activeBarView.setZindex(0);
			activeBarView.move(0, BarView.POP, true);
		}

		if ( isView(oldBarView) ){
			oldBarView.setZindex(10);
			oldBarView.move(100, BarView.RESTORE, true);
		}

		var self      = this;
		var ctx       = this.getContext();
		var viewstack = ctx.viewstack;
		setTimeout(function () {
			if ( isView(activeBarView) )
				activeBarView.$el.detach();
			self._stack.shift();

			// Retrieve the bar view from the last PageView of viewstack
			var pageView = viewstack.getViewAtIndex( viewstack.size() - 2  );
			if ( isView(pageView) && pageView.getNavigationBar ){
				var newBarView = pageView.getNavigationBar();
				if ( isView(newBarView) ){
					newBarView.setZindex(0);
					self.$el.append( newBarView.el );
					self._stack.push( newBarView );
				}
			}

		}, activeBarView.options.duration );
	},

	getActiveBarView: function getActiveBarView(){
		return this._stack[0];
	},
	getOldBarView: function getOldBarView(){
		return this._stack[1];
	},

	onPushedView: function onPushedView(view){
		if ( !view || !view.getNavigationBar )
			return;
		var barView = view.getNavigationBar();
		this.push( barView, view.options.animated );
	},

	onPoppedView: function onPoppedView(view){
		if ( !view || !view.getNavigationBar )
			return;
		var barView = view.getNavigationBar();
		this.pop(barView);
	},

	onSwipeBack: function onSwipeBack(percent, animated){
		var activeBar = this.getActiveBarView();
		var oldBar    = this.getOldBarView();

		if ( isView(activeBar) )
			activeBar.move(percent, BarView.POP, animated);
		if ( isView(oldBar) )
			oldBar.move( 100-percent, BarView.RESTORE, animated);

	}

});
