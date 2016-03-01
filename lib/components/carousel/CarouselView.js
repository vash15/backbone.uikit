var _        = require('underscore');
var $        = require('jquery');
var Hammer   = require('hammer');

var BaseView       = require('../../BaseView');
var BreadcrumbView = require('./BreadcrumbView');
var ImageView      = require('../ImageView');

var CarouselView = module.exports = BaseView.extend({

	className: 'carousel',

	initialize: function initialize(options) {
		CarouselView.__super__.initialize.apply(this, arguments);
		this.addEvents({
			'click .pane': 'onClickItem'
		});
		var ctx    = this.getContext();
		var device = ctx.device;

		this.options = options = _.defaults(options || {}, { 
			direction: "horizontal",
			startAt: 0,
			getItemFromModel: function (model) {
				return new ImageView({ 
					src: model.get("url"),
					size: 'contain'
				});
			}
		});

		if ( options.direction == "vertical" || options.direction == Hammer.DIRECTION_VERTICAL )
			this.direction = Hammer.DIRECTION_VERTICAL;
		else 
			this.direction = Hammer.DIRECTION_HORIZONTAL;

		this.views.breadcurmb = new BreadcrumbView();

		this._enable         = true;
		this.isFirstActivate = true;
		this.viewport        = device.getViewport();
		this.currentIndex    = options.startAt;
		this.containerSize   = 0;
		this.panes           = [];

		//
		// Init Hammerjs
		//

		this.hammerEvents  = {
			panEvent: new Hammer.Pan({ 
				direction: this.direction, 
				threshold: 10 
			})
		};
		this.hammerManager = new Hammer.Manager( this.el );
		this.hammerManager.add( 
			this.hammerEvents.panEvent
		);

		//
		// Events
		//

		this.hammerManager.on("panstart panmove panend pancancel",  _.bind(this.onPan, this) );

	},

	render: function render() {
		this.undelegateEvents();
		var self = this;
		this.cache.$panes = $("<div />").addClass("panes");
		this.$el
			.empty()
			.append(
				this.cache.$panes,
				this.views.breadcurmb.el
			);

		// Controllo se il containerSize è vuoto o nullo
		if ( !this.containerSize || this.containerSize == 0 ){
			if (this.direction == Hammer.DIRECTION_VERTICAL )
				this.containerSize = this.$el.outerHeight();
			else
				this.containerSize = this.$el.outerWidth();
		}
		
		this.renderItems();

		this.animations = {};
		this.pauseAnimation = false;
		this.positions = {};
		this.panes =  this.cache.$panes.find(".pane").toArray();
		this.views.breadcurmb.setTotal( this.panes.length );

		this.show( this.currentIndex );

		this.delegateEvents();
		return this;
	},

	renderItems: function renderItems() {
		if (!this.collection)
			return;

		var self = this;
		var aView;
		this.collection.each(function(aModel){
			self.views[ "image-" + aModel.cid ] = self.options.getItemFromModel(aModel); // , placeholder: null
			self.cache.$panes.append(
				$("<div />")
					.addClass("pane")
					.data("model", aModel)
					.append( self.views[ "image-"+aModel.cid ].el )
			);
			self.views[ "image-"+aModel.cid ].render();
		});
	},

	/**
	 * show a pane
	 * @param {Number} showIndex
	 * @param {Number} [percent] percentage visible
	 * @param {Boolean} [animate]
	 */
	show: function show(showIndex, percent, animate){
		showIndex = Math.max(0, Math.min(showIndex, this.panes.length - 1));
		percent = percent || 0;

		var paneIndex, pos, translate;
		for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
			pos = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);
			
			if(this.direction & Hammer.DIRECTION_HORIZONTAL) {
				translate = 'translate3d(' + pos + 'px, 0, 0)';
			}else{
				translate = 'translate3d(0, ' + pos + 'px, 0)';
			}

			if (animate) {
				this.animate(paneIndex, this.positions[paneIndex] || 0, pos);
			}
			else {
				this.stopAnimate();
				$(this.panes[paneIndex]).css({
					"-webkit-transform": translate,
					"transform": translate
				});
			}

			this.positions[paneIndex] = pos;
		}

		this.currentIndex = showIndex;
		this.trigger('change', this.currentIndex);
	},

	animate: function animate(paneIndex, from, to) {
		var self            = this;
		var percent         = 0;
		var timeLapse       = 0.5;
		var interval        = 1/60 * 1000 * timeLapse;
		var animationLength = 150; // ms
		
		self.animations[paneIndex] = setInterval(function() {
			percent += interval / animationLength;
			var translate;
			var pos = from + (to - from) * percent;
			if (percent >= 1)
				pos = to;
			if (self.direction & Hammer.DIRECTION_HORIZONTAL) {
				translate = 'translate3d(' + pos + 'px, 0, 0)';
			} else {
				translate = 'translate3d(0, ' + pos + 'px, 0)';
			}
			$(self.panes[paneIndex]).css({
				'-webkit-transform': translate,
				'transform': translate
			});
			if (percent >= 1) {
				clearInterval(self.animations[paneIndex]);
			}
		}, interval);
	},

	stopAnimate: function stopAnimate() {
		for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
			clearInterval(this.animations[paneIndex]);
		}
	},

	disable: function disable() {
		this._enable = false;
	},

	enable: function enable() {
		this._enable = true;
	},

	onDestroy: function onDestroy(){
		this.hammerManager.off("panstart panmove panend pancancel",  _.bind(this.onPan, this) );
		this.hammerManager.destroy();
		CarouselView.__super__.onDestroy.apply(this, arguments);
	},

	onPan: function onPan(ev){
		if (!this._enable) {
			this.show(this.currentIndex, 0, false);
			return;
		}

		if (ev.pointers[0].pageX < 40 && (ev.type == 'panstart'))
			return;

		var delta   = 0;
		var percent = 0;
		var animate = false;
		var ctx = this.getContext();

		if ( this.direction == Hammer.DIRECTION_VERTICAL ){
			delta = ev.deltaY;
		} else {
			delta = ev.deltaX;
		}

		percent = (100 / this.containerSize) * delta;

		if (ev.type == 'panend' || ev.type == 'pancancel') {
			if (Math.abs(percent) > 20 && ev.type == 'panend') {
				this.currentIndex += (percent < 0) ? 1 : -1;
				if ( this.currentIndex > -1 && this.currentIndex < this.panes.length ) {
					this.views.breadcurmb.current( this.currentIndex+1 );
				}
			}
			percent = 0;
			animate = true;
		}

		this.show(this.currentIndex, percent, animate);
	},

	onClickItem: function onClickItem(ev){
		var el = $(ev.currentTarget);
		if ( el && el.length > 0 ){
			var model = el.data("model");
			this.trigger("selectItem", model);
		}
	}

});
