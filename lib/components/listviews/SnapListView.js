var $            = require('jquery');
var _            = require('underscore');
var _s           = require('underscore.string');

var ListView     = require('./ListView');

var SnapListView = module.exports = ListView.extend({

	className: 'snapListView',

	initialize: function initialize(options) {
		this.options = _.defaults(options || {}, {
			minPanStartX: 70
		});

		SnapListView.__super__.initialize.call(this, this.options);

		this.addEvents({
			'touchstart': 'onPan',
			'touchmove' : 'onPan',
			'touchend'  : 'onPan'
		});

		
		this.startX      = 0;
		this.startY      = 0;
		this.lastTime    = null;
		this.lastDeltaX  = null;
		this.lastDeltaY  = null;
		this.canPan      = false;
		this.isScrolling = false;
		this.cache.pos   = 0;
	},

	onPan: function onPan(e) {
		var self         = this;
		var ctx          = this.getContext();
		var minPanStartX = this.options.minPanStartX;
		var deltaX       = 0;
		var deltaY       = 0;
		var now          = Date.now();
		var velocity     = { x: 0, y: 0 };
		var animate      = false;
		var $items       = this.cache.$items;
		var oldPos       = this.cache.pos;
		var pos          = this.cache.pos;

		deltaX = e.originalEvent.changedTouches[0].pageX - this.startX;
		deltaY = e.originalEvent.changedTouches[0].pageY - this.startY;
		pos    = pos + deltaX;

		if (this.lastDeltaTime)
			velocity = getVelocity(now - this.lastDeltaTime, deltaX - this.lastDeltaX, deltaY - this.lastDeltaY);

		this.lastDeltaTime = now;
		this.lastDeltaX    = deltaX;
		this.lastDeltaY    = deltaY;

		if (e.type == 'panstart' || e.type == 'touchstart') {
			this.startX = e.originalEvent.changedTouches[0].pageX;
			this.startY = e.originalEvent.changedTouches[0].pageY;
		}
		else if (e.type == 'touchmove') {
			if (Math.abs(deltaX) > Math.abs(deltaY) || this.canPan)
				e.preventDefault();
			else if (Math.abs(deltaX) < Math.abs(deltaY))
				this.isScrolling = true;

			if (minPanStartX < this.startX && Math.abs(deltaX) > Math.abs(deltaY) && !this.isScrolling) {
				this.canPan = true;
			}
		}
		else if (e.type == 'panend' || e.type == 'pancancel' || e.type == 'touchend') {
			if (this.canPan)
				end();
			this.canPan = false;
			this.isScrolling = false;
		}

		if (this.canPan) {
			move();
		}

		function end() {
			// Calcola la posizione in cui fare lo snap sovrascrivendo pos
			oldPos = pos;
			var itemWidth = self.items.length > 0 ? self.items.findByIndex(0).$el.outerWidth(true) : 150;
			var index     = Math.floor(pos / itemWidth) + 1;
			if (Math.abs(pos) % itemWidth > itemWidth * 0.2) index += deltaX > 0 ? 2 : -2;
			// if (Math.abs(velocity.x) > 0.1) index += deltaX > 0 ? 1 : -1;
			// if (Math.abs(velocity.x) > 0.3) index += deltaX > 0 ? 1 : -1;
			if (index > 0) index = 0;
			pos = index * itemWidth;
			if (pos > 0) pos = 0;
			if (pos < self.$el.width() - $items.get(0).scrollWidth) pos = self.$el.width() - $items.get(0).scrollWidth;
			self.cache.pos = pos;
			animate = true;
			move();
		}

		function move() {
			if ( animate ){
				doAnimate($items, oldPos, pos);
			}else{
				var translate = 'translate3d(' + pos + 'px, 0, 0)';
				$items.css({
					'-webkit-transform': translate,
					'transform': translate
				});
				stopAnimate();
			}
		}

		function doAnimate($element, from, to) {
			var percent         = 0;
			var interval        = 1/120 * 1000;
			var animationLength = 150; // ms
			self._animationHandler = setInterval(function() {
				percent += interval / animationLength;
				var pos = from + (to - from) * percent;
				if (percent >= 1)
					pos = to;
				var translate = 'translate3d(' + pos + 'px, 0, 0)';
				$element.css({
					'-webkit-transform': translate,
					'transform': translate
				});
				if (percent >= 1) {
					clearInterval(self._animationHandler);
				}
			}, interval);
		}

		function stopAnimate() {
			clearInterval(self._animationHandler);
		}

		function getVelocity(deltaTime, x, y) {
			return {
				x: x / deltaTime || 0,
				y: y / deltaTime || 0
			};
		}
	}

});

