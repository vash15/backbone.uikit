var $        = require('jquery');
var _        = require('underscore');
var Backbone = require('backbone');
var BaseView = require('./BaseView');

// 
// Utils
// 

function getTouch(ev){
	var touch;
	if ( ev && ev.changedTouches ){
		var changedTouches = ev.changedTouches;
		if( changedTouches && changedTouches.length > 0 ){
			touch = changedTouches[0];
		}
	}
	return touch;
};

function getScreenX(ev){
	var screenX = 0;
	var touch   = getTouch(ev);
	if ( touch && _.isNumber(touch.screenX) )
		screenX = touch.screenX;
	return screenX;
};



var _elementStyle = document.createElement('div').style;
var _transition   = 'webkitTransition' in _elementStyle ? 'webkitTransition' : 'transition';
var _transform    = 'webkitTransform' in _elementStyle ? 'webkitTransform' : 'transform';

// 
// Page View
// 

var PageView = module.exports = BaseView.extend({

	className: function className() {
		return 'page ' + (this.addClass || '');
	},

	initialize: function initialize(options){
		PageView.__super__.initialize.apply(this, arguments);
		if ( _.isUndefined(options) )
			options = {};

		var ctx       = this.getContext();
		this.viewport = ctx.device && ctx.device.getViewport ? ctx.device.getViewport() : {width: 0, height: 0};

		// Set navigation controller
		this.setNavigationView( options.navigationController );

		this._swipeBackStop = false;
		if ( options.swipeBack === true ){

			this.swipeBackOptions = _.defaults(options.swipeBackOptions || {}, 
										{ 
											duration: 300, // Durata dell'animazione
											velocityLimit: 0.4 // Velocità limite per cui la pagina esce
										}
									);

			this.onSwipeBackTouchStart = _.bind(this.onSwipeBackTouchStart, this);
			this.onSwipeBackTouchMove  = _.bind(this.onSwipeBackTouchMove, this);
			this.onSwipeBackTouchEnd   = _.bind(this.onSwipeBackTouchEnd, this);

			this.el.addEventListener( 'touchstart', this.onSwipeBackTouchStart );

			this.el.style[ _transform ] = 'translate3d(0px, 0px, 0px)';

		}

	},

	// Navigation view
	setNavigationView: function setNavigationView(navigation){
		var ctx = this.getContext();
		if ( navigation instanceof Backbone.View ){
			this.navigation = navigation;
		}else if ( ctx && ctx.views && ctx.views.navigation ){
			this.navigation = ctx.views.navigation;
		}else{
			this.navigation = null;
		}
		return this;
	},
	getNavigationView: function getNavigationView(){
		return this.navigation;
	},

	// 
	// Events
	// 

	onDeactivate: function onDeactivate() {
		this.$el.addClass('deactivate');
	},

	onActivate: function onActivate(firstTime) {
		this.$el.removeClass('deactivate');
	},

	onDestroy: function onDestroy(){
		this.el.removeEventListener( 'touchstart', this.onSwipeBackTouchStart );
		PageView.__super__.onDestroy(this, arguments);
	},

	// ToDo: cambiare il valore dei px da partire
	onSwipeBackTouchStart: function onSwipeBackTouchStart(ev){
		if (!ev || !ev.timeStamp ) return;

		var screenX = getScreenX( ev );
		if ( screenX > 0 && screenX < 40 && this.viewport.width > 0 && !this._swipeBackStop ){
			
			document.addEventListener('touchmove', this.onSwipeBackTouchMove );
			document.addEventListener('touchend', this.onSwipeBackTouchEnd );
			document.addEventListener('touchcancel', this.onSwipeBackTouchEnd );

			this._swipeBackDeltaScreenX = screenX;
			this._swipeBackStop         = true;
			this._swipeBackStartTime    = ev.timeStamp;
			
		}
	},

	onSwipeBackTouchEnd: function onSwipeBackTouchEnd(ev){
		if (!ev || !ev.timeStamp ) return;

		var screenX               = getScreenX(ev);
		var navigation            = this.getNavigationView();
		var navigationOnSwipeBack = navigation && navigation.onSwipeBack ? navigation.onSwipeBack : function(){};
		var pop                   = false;
		var transform             = 'translate3d(0px, 0px, 0px)';
		var transition            = 'transform '+this.swipeBackOptions.duration+'ms, -webkit-transform '+this.swipeBackOptions.duration+'ms';

		var distance = screenX - this._swipeBackDeltaScreenX;
		var time     = ev.timeStamp - this._swipeBackStartTime;
		var speed    = Math.abs(distance) / time || 0.1;

		if ( speed >= this.swipeBackOptions.velocityLimit || screenX > (this.viewport.width/2) ){
			var translate = '100%';
			if ( this.viewport.width > 0)
				translate = (this.viewport.width+100)+'px';

			transform  = 'translate3d('+translate+', 0px, 0px)';
			pop        = true;
			navigationOnSwipeBack( 100 );
		}else{
			navigationOnSwipeBack( 0 );
		}

		// 
		this.el.style[ _transform ]  = transform;
		this.el.style[ _transition ] = transition;
		
		// 
		document.removeEventListener('touchmove',   this.onSwipeBackTouchMove );
		document.removeEventListener('touchend',    this.onSwipeBackTouchEnd  );
		document.removeEventListener('touchcancel', this.onSwipeBackTouchEnd  );

		var ctx  = this.getContext();
		var self = this;
		setTimeout(function(){
			self.el.style[ _transition ] = '';
			self._swipeBackStop = false;
			if ( pop )
				ctx.viewstack.popView(self);
		}, this.swipeBackOptions.duration);
	},

	onSwipeBackTouchMove: function onSwipeBackTouchMove(ev){
		ev.stopPropagation();
		ev.preventDefault();
		var navigation = this.getNavigationView();
		var screenX    = getScreenX(ev) - this._swipeBackDeltaScreenX;
		var percent    = 0;
		if ( screenX < 0 )
			screenX = 0;
		else if ( screenX > this.viewport.width )
			screenX = this.viewport.width;

		if ( this.viewport.width > 0 )
			percent = Math.round(screenX*100/this.viewport.width);

		if ( navigation && navigation.onSwipeBack )
			navigation.onSwipeBack( percent );

		this.el.style[ _transform ]  = 'translate3d(' + screenX + 'px, 0px, 0px)';
	}

});