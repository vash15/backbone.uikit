var $          = require('jquery');
var _          = require('underscore');
var Backbone   = require('backbone');
var BaseView   = require('./BaseView');
var utilsStyle = require('./utils/style');

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

function gePageX(ev){
	var pageX = 0;
	var touch = getTouch(ev);
	if ( touch && _.isNumber(touch.pageX) )
		pageX = touch.pageX;
	return pageX;
};
function getPageY(ev){
	var pageY = 0;
	var touch = getTouch(ev);
	if ( touch && _.isNumber(touch.pageY) )
		pageY = touch.pageY;
	return pageY;
};
function isInRect( x, y, top, left, width, height ) {
	return x >= left && x <= (left+width) && y >= top && y <= (top+height);
};

//
// Page View
//

var PageView = module.exports = BaseView.extend({

	className: function className() {
		return 'page ' + (this.addClass || '');
	},

	initialize: function initialize(options){
		PageView.__super__.initialize.apply(this, arguments);
		var ctx       = this.getContext();

		this.viewport = ctx.device && ctx.device.getViewport ? ctx.device.getViewport() : {width: 0, height: 0};

		this.options = _.defaults(options||{},
							{
								swipeBack               : true,
								animated                : true,
								duration                : 300,
								swipeBackClassName      : 'swipe-back',
								swipeBackBoundaryLeft   : 0,
								swipeBackBoundaryTop    : 0,
								swipeBackBoundaryWidth  : 40,
								swipeBackBoundaryHeight : this.viewport.height,
								swipeBackVelocityLimit  : 0.4 // Velocity limit to trigger viewstack.popView()
							}
						);

		// Set navigation controller
		this.setNavigationView( this.options.navigation );

		if ( this.options.animated === true ){
			this.el.style[ utilsStyle.backface ]  = 'hidden';
			this.el.style[ utilsStyle.transform ] = 'translate3d(100%, 0px, 0px)'; // if you put pixels the transform does not work
		}


		//
		// Swipe back
		//

		this._swipeBackStop = false;
		if ( this.options.swipeBack === true ){

			this.onSwipeBackTouchStart = _.bind(this.onSwipeBackTouchStart, this);
			this.onSwipeBackTouchMove  = _.bind(this.onSwipeBackTouchMove, this);
			this.onSwipeBackTouchEnd   = _.bind(this.onSwipeBackTouchEnd, this);

			this.el.addEventListener( 'touchstart', this.onSwipeBackTouchStart );
		}

	},

	// Render
	render: function render(){
		if ( this.options.animated === true ){
			var elementStyle = this.el.style;
			elementStyle[ utilsStyle.transition ] = 'transform '+this.options.duration+'ms';
			utilsStyle.requestNextAnimationFrame(function(time){
				elementStyle[ utilsStyle.transform ] = 'translate3d(0px, 0px, 0px)';
			});
		}
		return this;
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

	getNavigationBar: function getNavigationBar(){
		return null;
	},


	// Può assumere più valori.
	// @return Number millisecondi di durata dell'animazione
	// @return String nome dell'animazione CSS
	getAnimationPushDuration: function getAnimationPushDuration(){
		return this.options.animated ? this.options.duration : null;
	},

	// Può assumere più valori.
	// @return Number millisecondi di durata dell'animazione
	// @return String nome dell'animazione CSS
	getAnimationPopDuration: function getAnimationPopDuration(){
		return this.options.duration || null; // this.options.animated ?
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
		PageView.__super__.onDestroy.apply(this, arguments);
	},

	onBeforePop: function onBeforePop(){
		if ( this.options.animated === true ){
			var elementStyle = this.el.style;
			elementStyle[ utilsStyle.transition ] = 'transform '+this.options.duration+'ms';
			elementStyle[ utilsStyle.transform ]  = 'translate3d(100%, 0px, 0px)'; // if you put pixels the transform does not work
		}
	},

	// ToDo: cambiare il valore dei px da partire
	onSwipeBackTouchStart: function onSwipeBackTouchStart(ev){
		if (!ev || !ev.timeStamp ) return;

		var top     = this.options.swipeBackBoundaryTop;
		var left    = this.options.swipeBackBoundaryLeft;
		var width   = this.options.swipeBackBoundaryWidth;
		var height  = this.options.swipeBackBoundaryHeight;
		var pageX   = gePageX( ev );
		var pageY   = getPageY( ev );
		if ( isInRect( pageX, pageY, top, left, width, height ) && this.viewport.width > 0 && !this._swipeBackStop ){

			document.addEventListener('touchmove',   this.onSwipeBackTouchMove );
			document.addEventListener('touchend',    this.onSwipeBackTouchEnd );
			document.addEventListener('touchcancel', this.onSwipeBackTouchEnd );

			this.el.style[ utilsStyle.transition ] = '';
			this.$el.addClass( this.options.swipeBackClassName );

			this._swipeBackDeltaScreenX  = pageX;
			this._swipeBackStop          = true;
			this._swipeBackStartTime     = ev.timeStamp;

		}
	},

	onSwipeBackTouchEnd: function onSwipeBackTouchEnd(ev){
		if (!ev || !ev.timeStamp ) return;

		var navigation = this.getNavigationView();
		var pageX      = gePageX(ev);
		var pop        = false;

		var distance = pageX - this._swipeBackDeltaScreenX;
		var time     = ev.timeStamp - this._swipeBackStartTime;
		var speed    = Math.abs(distance) / time || 0.1;

		if ( speed >= this.options.swipeBackVelocityLimit || pageX > (this.viewport.width/2) ){
			pop        = true;
			navigationOnSwipeBack( 0 );
		}else{
			navigationOnSwipeBack( 100 );
			//
			this.el.style[ utilsStyle.transition ] = 'transform '+this.options.duration+'ms';
			this.el.style[ utilsStyle.transform ]  = 'translate3d(0, 0, 0)';
		}

		//
		document.removeEventListener('touchmove',   this.onSwipeBackTouchMove );
		document.removeEventListener('touchend',    this.onSwipeBackTouchEnd  );
		document.removeEventListener('touchcancel', this.onSwipeBackTouchEnd  );

		var ctx  = this.getContext();
		if ( pop &&  ctx && ctx.viewstack )
			ctx.viewstack.popView(this, {animated: true, delay: true});

		var self = this;
		setTimeout(function(){
			self.el.style[ utilsStyle.transition ] = '';
			self._swipeBackStop = false;
			self.$el.removeClass(self.options.swipeBackClassName);
		}, this.options.duration);


		function navigationOnSwipeBack(percent){
			if ( navigation && navigation.onSwipeBack )
				navigation.onSwipeBack( percent, true );
		};
	},

	onSwipeBackTouchMove: function onSwipeBackTouchMove(ev){
		ev.stopPropagation();
		ev.preventDefault();
		var navigation = this.getNavigationView();
		var pageX      = gePageX(ev) - this._swipeBackDeltaScreenX;
		var percent    = 0;
		if ( pageX < 0 )
			pageX = 0;
		else if ( pageX > this.viewport.width )
			pageX = this.viewport.width;

		if ( this.viewport.width > 0 )
			percent = 100 - Math.round(pageX*100/this.viewport.width);

		if ( navigation && navigation.onSwipeBack )
			navigation.onSwipeBack( percent, false );

		this.el.style[ utilsStyle.transform ]  = 'translate3d(' + pageX + 'px, 0, 0)';

		return false;
	}

});
