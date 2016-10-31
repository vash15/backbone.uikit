import _ from "underscore";
import BaseView from "./BaseView";

let callbackIdGenerator = 0;
let emptyImage = 'empty.gif';
let cache = [];
let timeout;

export default class ImageView extends BaseView {

	tagName() {
		return 'figure';
	}

	constructor(options) {
		super(options);

		this._loaded = false;
		this._loadDebounce = null;
		this._appended = false;

		this.src     = '';

		this.setDefaultsOptions({
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
		this.bufferImage.onerror = (err) => {
			this._loaded = false;
			// this.trigger('error', err);
		};
		this.bufferImage.onload = () => {
			this._loaded = true;
			this.requestAnimationFrame(() => {
				this.image.src = this.src;
				// this.image.style.visiblity = 'visible';
				this.requestAnimationFrame(() => {
					this.render();
					this.trigger('loaded');
				});
			});
		};

		this.setSource(this.options.src)
	}

	load() {
		this._loaded = false;
		if (this._loadDebounce)
			this.cancelAnimationFrame(this._loadDebounce);
		this._loadDebounce = this.requestAnimationFrame(() => {
			this.bufferImage.src = this.src;
		});
	}

	setSource(src) {
		if (this.src == src) return;
		if (this._loadDebounce)
			this.cancelAnimationFrame(this._loadDebounce);
		this.src = src;
		if (this.options.autoload) {
			this.load();
			return;
		}
		// this.image.style.visiblity = 'hidden';
		this.image.style.opacity = 0;
		this.image.src = emptyImage;
	}

	onRender(rendered) {
		if (!this._loaded) return;

		let bufferImage = this.bufferImage;
		let width       = bufferImage.width;
		let height      = bufferImage.height;

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
		this.requestAnimationFrame(() => {
			cssText += 'opacity: 1;';
			this.image.style.cssText = cssText;
			if (!this._appended) {
				this.$el.append(this.image);
				this._appended = true;
			}
		});
	}

	width(val) {
		if (typeof val !== "undefined")
			return this.image.width = val;
		return this.image.width || 0;
	}

	height(val) {
		if (typeof val !== "undefined")
			return this.image.height = val;
		return this.image.height || 0;
	}

	destroy() {
		cache.push(this.image);
		this.image.src = emptyImage;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(function(){ cache = [] }, 60000);
		super.destroy();
	}

}
