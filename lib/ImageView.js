var _        = require('underscore');
var $        = require('jquery');
var BaseView = require('./BaseView');

var callbackIdGenerator = 0;
var emptyImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
var cache = [];
var timeout;
//
// setInterval(function () {
// 	context.imageCacheRef = [];
// 	var anImage;
// 	for (var i = 0, n = context.imageCache.length; i < n; i++) {
// 		anImage = context.imageCache.shift();
// 		anImage.src = emptyImage;
// 		context.imageCacheRef.push(anImage);
// 	}
// }, 60 * 1000);

var ImageView = module.exports = BaseView.extend({

	tagName: 'figure',

	initialize: function initialize(options) {
		ImageView.__super__.initialize.apply(this, arguments);

		var self = this;

		this._loaded       = false;
		this._loadDebounce = null;
		this._appended     = false;

		this.src     = '';


		this.options = _.defaults(options || {}, {
			src: null,
			autoload: true,
			placeholder: emptyImage,
			size: 'auto', // auto, normal, contain, cover. Scale the image to its container
			worker: false,
			viewport: null,
			className: 'ui-image',
			position: 'center' // top-left, top, top-right, center-left, center, center-right, bottom-left, bottom, bottom-right
		});

		this.$el.addClass( _.result(this.options, 'className') || '' );

		if ( this.options.size !== 'normal' )
			this.$el.addClass( ' ' + _.result(this.options, 'position') || '');

		this.image = new Image();
		this.image.style.opacity = 0;
		// this.image.style.position = 'absolute';
		// this.image.style.top = '50%';
		// this.image.style.left = '50%';
		// this.image.style.transform = 'translate3d(0,0,0)';

		this.bufferImage = new Image();

		// Normal
		this.bufferImage.onerror = function(err){
			self._loaded = false;
			// this.trigger('error', err);
		};
		this.bufferImage.onload = function(){
			self._loaded = true;
			requestAnimationFrame(function(){
				self.image.src = self.src;
				// self.image.style.visiblity = 'visible';
				requestAnimationFrame(function(){
					self.render();
					self.trigger('loaded');
				});
			});
		};

		this.setSource(this.options.src);
	},

	load: function load() {
		var self = this;
		if (this.src == this.bufferImage.src)
			return;
		this._loaded = false;
		if (this._loadDebounce)
			cancelAnimationFrame(this._loadDebounce);
		this._loadDebounce = requestAnimationFrame( function(){
			self.bufferImage.src = self.src;
		});
	},

	setSource: function setSource(src) {
		if (this.src == src) return;
		if (this._loadDebounce)
			cancelAnimationFrame(this._loadDebounce);
		this.src = src;
		if (this.options.autoload) {
			this.load();
			return;
		}
		// this.image.style.visiblity = 'hidden';
		this.image.style.opacity = 0;
		this.image.src = emptyImage;
	},

	render: function render() {
		if (!this._loaded) return;
		
		var self = this;
		var bufferImage = this.bufferImage;
		var width       = bufferImage.width;
		var height      = bufferImage.height;

		var viewport = this.options.viewport ? this.options.viewport : this.viewport;
		if (!viewport) {
			// CAUTION: Always specify viewport dimensions to improve the performance!
			viewport = this.viewport = { width: this.$el.width(), height: this.$el.height() };
		}

		var size = this.options.size;
		if (size !== 'normal') {
			var resized = {};
			var cover   = size === 'cover';
			var cssText = '';

			if (size === 'auto')
				cover = width < height;

			var viewportRatio = viewport.width / viewport.height;
			var imageRatio    = width / height;
			var position      = this.options.position;

			var top;
			var left;
			var displayWidth;
			var displayHeight;
			var marginTop;
			var marginLeft;

			if ((cover === true && imageRatio >= viewportRatio) || (cover === false && imageRatio <= viewportRatio)) {
				resized.width = width * viewport.height / height;
				displayWidth  = resized.width;
				displayHeight = viewport.height;
			} else if ((cover === true && imageRatio < viewportRatio) || (cover === false && imageRatio > viewportRatio)) {
				resized.height = height * viewport.width / width;
				displayWidth  = viewport.width;
				displayHeight = resized.height;
			}

			switch (position) {
				case 'top':
					top        = 0;
					left       = 50;
					marginTop  = 0;
					marginLeft = displayWidth/-2;
					break;
				case 'bottom-left':
					bottom     = 0;
					left       = 0;
					marginTop  = 0;
					marginLeft = displayWidth/-2;
					break;
				case 'center':
				default:
					top        = 50;
					left       = 50;
					marginTop  = displayHeight/-2;
					marginLeft = displayWidth/-2;
					break;
			}

			cssText =
				'position: absolute;' +
				'top: ' + top + '%;' +
				'left: ' + left + '%;' +
				'height: ' + displayHeight + 'px;' +
				'width: ' + displayWidth + 'px;' +
				'margin-top: ' + marginTop + 'px;' +
				'margin-left: ' + marginLeft + 'px;';
		}
		requestAnimationFrame(function(){
			cssText += 'opacity: 1;';
			self.image.style.cssText = cssText;
			if (!self._appended) {
				self.$el.append(self.image);
				self._appended = true;
			}
		});
	},

	refresh: function refresh() {
		this.viewport = null;
		this.render();
	},

	width: function width(val) {
		if (typeof val !== "undefined")
			return this.image.width = val;
		return this.image.width || 0;
	},

	height: function height(val) {
		if (typeof val !== "undefined")
			return this.image.height = val;
		return this.image.height || 0;
	},

	destroy: function destroy() {
		cache.push(this.image);
		this.image.src = emptyImage;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(function(){ cache = [] }, 60000);
		ImageView.__super__.destroy.apply(this, arguments);
	}

});
