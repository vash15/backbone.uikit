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

		this.loaded = false;

		this.options = _.defaults(options || {}, {
			src: null,
			placeholder: emptyImage,
			size: 'auto', // auto, normal, contain, cover. Adatta l'immagine al suo contenitore
			worker: false,
			viewport: null,
			className: 'image',
			position: 'center'
		});

		this.$el.addClass( _.result(this.options, 'className') || '' );
		this.$el.addClass( ' ' + _.result(this.options, 'position') || '');

		var self       = this;
		var ctx        = this.getContext();
		var callbackId = ++callbackIdGenerator;

		this.image = new Image();

		if ( ctx.workers && ctx.workers.imageLoader && this.options.src && this.options.worker) {
			// Web Worker
			var event = function (ev) {
				var data = JSON.parse(ev.data);
				if (data.callbackId !== callbackId) return;
				ctx.workers.imageLoader.removeEventListener('message', event);
				if (data.err) return;
				self.loaded = true;
				self.image.onload = function () {
					self.image.onload = null;
					self.trigger('loaded', self.options.src);
					self.render();
				};
				self.image.src = data.img64;
			};
			ctx.workers.imageLoader.addEventListener('message', event);

			var data = {
				callbackId: callbackId,
				src: this.options.src
			};
			ctx.workers.imageLoader.postMessage(JSON.stringify(data));
		} else {
			// Normal
			this.image.onload = function () {
				self.image.onload = null;
				self.loaded = true;
				self.trigger('loaded', self.options.src);
				self.render();
			};
			if (this.options.src)
				this.image.src = this.options.src;
		}

		// this.placeholderImage = new Image();
		// this.placeholderImage.src = this.options.placeholder;
	},

	render: function render() {
		var self = this;
		var image;
		var width;
		var height;

		if (!this.loaded) return;

		if (this.loaded) {
			image  = this.image;
			width  = image.width;
			height = image.height;
		}
		else {
			image  = this.placeholderImage;
			width  = 1;
			height = 1;
		}

		var viewport = this.options.viewport ? this.options.viewport : this.viewport;
		if (!viewport)
			viewport = this.viewport = { width: this.$el.width(), height: this.$el.height() };

		var size = this.options.size;
		if (size !== 'normal') {

			var resized  = {};
			var cover    = size === 'cover';

			if ( size === 'auto')
				cover = width < height;

			var rapViewport = viewport.width / viewport.height;
			var rapImage    = width / height;

			if ( (cover === true && rapImage >= rapViewport) || (cover === false && rapImage <= rapViewport) ) {
				resized.width = width * viewport.height / height;
				image.style.height = viewport.height + 'px';
				image.style.width = resized.width + 'px';
				image.style.marginTop = viewport.height/-2 + 'px';
				image.style.marginLeft = resized.width/-2 + 'px';
			} else if ( (cover === true && rapImage < rapViewport) || (cover === false && rapImage > rapViewport) ) {
				resized.height = height * viewport.width / width;
				image.style.height = resized.height + 'px';
				image.style.width = viewport.width + 'px';
				image.style.marginTop = resized.height/-2 + 'px';
				image.style.marginLeft = viewport.width/-2 + 'px';
			}
		}

		if (this.loaded) {
			this.$el.append(this.image);
		}
		else {
			this.$el.append(this.placeholderImage);
		}

		return this;
	},

	width: function width( val ){
		if ( typeof val !== "undefined" )
			return this.image.width = val;
		return this.image.width || 0;
	},

	height: function height( val ){
		if ( typeof val !== "undefined" )
			return this.image.height = val;
		return this.image.height || 0;
	},

	destroy: function () {
		cache.push(this.image);
		this.image.src = emptyImage;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(function(){ cache = [] }, 60000);
		ImageView.__super__.destroy.call(this);
	}

});
