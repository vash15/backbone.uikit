import _ from "underscore";
import BaseView from "./BaseView";
import getContextOptions from "./utils/getContextOptions";

let callbackIdGenerator = 0;
let emptyImage = 'empty.gif';
let cache = [];
let timeout;

/**
 * Class rappresenting an image. It support placeholder, resize and positioning.
 * Always use this class to prevent memory leaks.
 * @version 2.0.0
 * @param {Object} options - Page options.
 * @param {string} options.url - Specifies the URL of an image.
 * @param {string} [options.placeholder] ['empty.gif'] - Temporary image, default is a transparent one pixel image named 'empty.gif' that should be placed on the root of the build dir.
 * @param {bool} [options.autoload] [true] - Load image immediatly. If false the method load() must be called manually.
 * @param {string} [options.size] ['auto'] - Specify how to resize the image based on the container.<br />
 *   `normal`: the image is not resized.<br />
 *   `contain`: the image is scaled by the longest side.<br />
 *   `cover`: the image is scaled by the shortest side.<br />
 *   `auto`: if the image is vertical applies the `cover` style, if horizontal it applies the `contain` style.
 * @param {string} [options.className] ['image'] - Name of CSS class added to the image
 * @param {string} [options.position] ['center'] - It indicates how to place the image. It will be used as `className`. The values are `center` or `top-left`.
 * @param {Object} [options.viewport] - It's the size of the image container. If not provided it will be calculated but with performance issue, try to always fulfill 'viewport'.
 * @param {integer} options.viewport.width - Width of the container.
 * @param {integer} options.viewport.height - Height of the container.
 * @param {integer} [options.orientation] [0] - Orientation in degrees of the image.
 * @param {string} [options.empty] [empty.gif] - Empty image to use when loaded image fails.
 *
 * @fires ImageView#loaded
 * @fires ImageView#error
 *
 * @example
 * import { BaseView, ImageView } from 'backbone.uikit';
 * export default class MyView extends BaseView {
 *   constructor(options) {
 *     super(options);
 *     this.addSubView('coverImage', new ImageView({
 *       src: 'http://placehold.it/350x150',
 *       placeholder: 'img/placeholder-cover-image.png',
 *       size: 'auto',
 *       viewport: { width: 250, height: 100 }
 *     });
 *   }
 *
 *   onRender(rendered) {
 *     if (rendered)
 *       return this;
 *     let coverImage = this.getSubView('coverImage');
 *     this.$el.append(coverImage.el);
 *     coverImage.render();
 *     return this;
 *   }
 * }
 * @example <caption>HTML Output</caption>
 * <div class="my-view">
 *   <figure class="ui-base-view ui-image">
 *     <img src="http://placehold.it/350x150" style="position: absolute; top: 50%; left: 50%; width: 250; height: 100px; margin-top: -50px; margin-left: -125px; opacity: 1;">
 *   </figure>
 * </div>
 */
export default class ImageView extends BaseView {

	/**
	 * Triggered when an image is successfully loaded.
	 * @event ImageView#loaded
	 */

	/**
	 * Triggered when an image fail to load.
	 * @event ImageView#error
	 * @property {string} src - Source of the image
	 */

	/**
	 * Define the HTML tag of the view.
	 * @private
	 * @version 2.0.0
	 */
	tagName() {
		return 'figure';
	}

	constructor(options) {
		super(options);

		this._loaded = false;
		this._loadDebounce = null;
		this._appended = false;

		this.src = '';

		this.setDefaultsOptions(getContextOptions('ImageView'), {
			src: null,
			autoload: true,
			placeholder: null,
			size: 'auto', // auto, normal, contain, cover. Scale the image to its container
			worker: false,
			viewport: null,
			className: 'ui-image',
			position: 'center', // top-left, top, top-right, center-left, center, center-right, bottom-left, bottom, bottom-right
			orientation: 0,
			empty: emptyImage
		});

		this.$el.addClass(_.result(this.options, 'className') || '');

		if (this.options.size !== 'normal')
			this.$el.addClass(' ' + _.result(this.options, 'position') || '');

		this.image = new Image();
		this.image.style.opacity = 0;

		// Placeholder
		this.placeholderImage = new Image();
		this.placeholderImage.onload = () => {
			this._placeholderLoaded = true;
			if (!this._loaded) {
				this.requestAnimationFrame(() => {
					this.image.src = this.placeholderImage.src;
					this.requestAnimationFrame(() => {
						if ( this.rendered )
							this.render();
					});
				});
			}
		};

		if (this.options.placeholder) {
			this.placeholderImage.src = this.options.placeholder;
		}

		this.bufferImage = new Image();

		// Normal
		this.bufferImage.onerror = (err) => {
			this._loaded = false;
			this.requestAnimationFrame(() => {
				this.trigger('error', this.image.src);
				this.image.src = this.options.placeholder || this.options.empty;
			});
		};
		this.bufferImage.onload = () => {
			this._loaded = true;
			this.requestAnimationFrame(() => {
				this.image.src = this.src;
				this.requestAnimationFrame(() => {
					if ( this.rendered )
						this.render();
					this.trigger('loaded');
				});
			});
		};

		this.setSource(this.options.src);
	}

	/**
	 * Load image.
	 * @public
	 * @version 2.0.0
	 */
	load() {
		if (this.src == this.bufferImage.src)
			return;
		this._loaded = false;
		if (this._loadDebounce)
			this.cancelAnimationFrame(this._loadDebounce);
		this._loadDebounce = this.requestAnimationFrame(() => {
			this.bufferImage.src = this.src;
		});
	}

	/**
	 * Set a new image with orientation.
	 * @public
	 * @version 2.0.0
	 * @param {string} src - URL of the new image.
	 * @param {integer} orientation [options.orientation] - Orientation of the new image. Default use options.orientation.
	 */
	setSource(src, orientation) {
		if (this.src == src) return;
		if (typeof orientation !== 'undefined') {
			this.options.orientation = orientation;
		}
		if (this._loadDebounce) {
			this.cancelAnimationFrame(this._loadDebounce);
			this._loadDebounce = null;
		}
		this.src = src;
		this.image.style.opacity = 0;
		this.image.src = this.options.empty;
		this.bufferImage.src = this.options.empty;
		if (this.options.autoload) {
			this.load();
			return;
		}
	}

	/**
	 * Set a new placeholder with orientation.
	 * @public
	 * @version 2.0.0
	 * @param {string} src - URL of the new image.
	 * @param {integer} orientation [options.orientation] - Orientation of the new image. Default use options.orientation.
	 */
	setPlaceholder(src, orientation) {
		if (this.placeholderImage.src == src) return;
		if (typeof orientation !== 'undefined') {
			this.options.orientation = orientation;
		}
		if (this._loadDebounce)
			this.cancelAnimationFrame(this._loadDebounce);
		this.placeholderImage.src = src;
		this.image.style.opacity = 0;
		this.image.src = this.options.empty;
	}

	/**
	 * Called by BaseView when the image should render.
	 * @private
	 * @version 2.0.0
	 * @param {bool} rendered - Indicates if it's the view first render.
	 */
	onRender(rendered) {
		if (!this._loaded && !this._placeholderLoaded)
			return;

		let bufferImage = this.bufferImage;
		let orientation = this.options.orientation;

		if (!this._loaded && this._placeholderLoaded) {
			bufferImage = this.placeholderImage;
			orientation = 0;
		}

		let width       = bufferImage.width;
		let height      = bufferImage.height;

		var viewport = this.options.viewport ? this.options.viewport : this.viewport;
		if (!viewport) {
			// CAUTION: Always specify viewport dimensions to improve the performance!
			viewport = this.viewport = { width: this.$el.width(), height: this.$el.height() };
		}

		if (Math.abs(orientation) === 90) {
			viewport = {
				width:  viewport.height,
				height: viewport.width
			};
		}

		var cssText = '';

		var size = this.options.size;
		if (size !== 'normal') {
			var resized = {};
			var cover   = size === 'cover';

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
				case 'top-left':
					top        = 0;
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

		if (orientation !== 0) {
			cssText += '-webkit-transform: rotate(' + orientation + 'deg);';
			cssText += 'transform: rotate(' + orientation + 'deg);';
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

	/**
	 * Force an image refresh.
	 * @public
	 * @version 2.0.0
	 */
	refresh() {
		this.viewport = null;
		this.render();
	}

	/**
	 * Change the image width.
	 * @public
	 * @version 2.0.0
	 * @param {integer} val - The new width of the image
	 */
	width(val) {
		if (typeof val !== "undefined")
			return this.image.width = val;
		return this.image.width || 0;
	}

	/**
	 * Change the image height.
	 * @public
	 * @version 2.0.0
	 * @param {integer} val - The new height of the image
	 */
	height(val) {
		if (typeof val !== "undefined")
			return this.image.height = val;
		return this.image.height || 0;
	}

	/**
	 * Destroy the image and prevent memory leak. Doesn't call
	 * @private
	 * @version 2.0.0
	 * @param {integer} val - The new width of the image
	 */
	destroy() {
		cache.push(this.image);
		this.image.src = this.options.empty;
		if (this.placeholderImage.src) {
			cache.push(this.placeholderImage);
			this.placeholderImage.src = this.options.empty;
		}
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(function(){ cache = [] }, 60000);
		super.destroy();
	}

}
