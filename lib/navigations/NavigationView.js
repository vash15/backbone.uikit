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

	push: function push( newBarView ){
		
		this._stack.unshift(newBarView);
		
		if ( this._stack.length > 2 ){
			var popView = this._stack.pop();
			if ( isView(popView) )
				popView.destroy();
		}

		if ( isView(newBarView) ){
			newBarView.setZindex(10);
			this.$el.append( newBarView.el );
			newBarView.render();
			newBarView.move(100, BarView.PUSH );
		}

		// Ottengo quella precende per farla andare via
		var oldBarView = this.getOldBarView();
		if ( isView(oldBarView) ){
			oldBarView.setZindex(0);
			oldBarView.move(0, BarView.DETACH );
		}

		return this;
	},

	pop: function pop(){
		var activeBarView = this.getActiveBarView();
		var oldBarView    = this.getOldBarView();
		
		if ( isView(activeBarView) ){
			activeBarView.setZindex(0);
			activeBarView.move(0, BarView.POP);
		}

		if ( isView(oldBarView) ){
			oldBarView.setZindex(10);
			oldBarView.move(100, BarView.RESTORE );
		}

		var ctx       = this.getContext();
		var viewstack = ctx.viewstack;
		var self      = this;
		setTimeout(function(){
			if ( isView(activeBarView) )
				activeBarView.destroy();
			self._stack.shift();
			
			// Recupero dal viewstack la barview dell'ultima PageView
			var pageView = viewstack.getViewAtIndex( viewstack.size() - 2  );
			if ( isView(pageView) && pageView.getNavigationBar ){
				var newBarView = pageView.getNavigationBar();
				if ( isView(newBarView) ){
					newBarView.setZindex(0);
					self.$el.append( newBarView.el );
					newBarView.render();
					self._stack.push( newBarView );
				}
			}
		}, 300);

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
		this.push( barView );
	},

	onPoppedView: function onPoppedView(view){
		this.pop();
	},

	onSwipeBack: function onSwipeBack(percent){
		// console.log("onSwipeBack %s", percent);
		var activeBar = this.getActiveBarView();
		var oldBar    = this.getOldBarView();

		if ( isView(activeBar) )
			activeBar.move(percent, BarView.POP)
		if ( isView(oldBar) )
			oldBar.move( 100-percent, BarView.RESTORE );

	}

});

