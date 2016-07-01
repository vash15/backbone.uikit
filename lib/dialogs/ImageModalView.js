
import _ from "underscore";
import context from "context-utils";
import $ from "jquery";
import { capitalize } from "underscore.string";
import ImgTouchCanvas from "img-touch-canvas";

import ModalView from "./ModalView";
import ImageView from "../ImageView";


export default class ImageModalView extends ModalView {

	className(){ return 'ui-modal ui-modal-image' }

	constructor(options) {
		if (_.isUndefined(options)) options = {};
		if ( _.isUndefined(options.src) )
			throw new Error("Url image does not found");

		options = _.defaults(options, {
			buttons: { cancel: 'A' },
			zoom: false
		});
		super(options);

		this.imageZoomed = false;
		this.options = options;

		this.addEvents({
			"swipedown": "onSwipeDown"

			// "touchstart": "onTouchStart",
			// "touchmove": "onTouchMove",
			// "touchend": "onTouchEnd"
		});

		this.$el.addClass( _.result(this.options, 'addClass') || '' );

		if ( this.options.zoom ){
			this.cache.$canvas  = $('<canvas class="ui-image-zoom-modal" />');
		}else{
			this.views.image = new ImageView({
				src: options.src, // 'https://public.dm2302.livefilestore.com/y3pTiD2fb9CL3rhz9Y6D6T3w5gWRLCr5uxot89n_Bf4cVloetZtw77ZqhKlhfPcXXOCea6zD8ZKeKkBHcAAjr3Pnn8QTLlEaKSiKNOpW_1lrSE/CM_BD_3D_Pack.jpg?psid=1&rdrts=113827827',
				placeholder: 'assets/img/product-placeholder.png',
				size: 'normal'
			});
			this.listenTo( this.views.image, "loaded", this.onLoadImage);
		}

	}

	onRender(rendered) {
		super.onRender(rendered);
		if (rendered) return this;

		if ( this.options.zoom ){
			this.$el.find('.js-content').append( this.cache.$canvas );

			if ( !this.imgTouchCanvas ){
				this.imgTouchCanvas = new ImgTouchCanvas({
					canvas: this.cache.$canvas.get(0),
					path: this.options.src,
					momentum: true,
					onZoomEnd: (zoom, zoomed) => {
						this.imageZoomed = zoomed;
					},
					onZoom: (zoom, zoomed) => {
						this.imageZoomed = zoomed;
					}
				});
			}

		}else{
			this.$el.find('.js-content').append( this.views.image.el );
			this.views.image.render();
		}

		if (window.StatusBar)
			window.StatusBar.styleDefault();

		return this;
	}

	close(){
		super.close();
		if (window.StatusBar)
			window.StatusBar.styleLightContent();
	}

	onDestroy(options){
		if ( this.imgTouchCanvas )
			this.imgTouchCanvas.destroy();
		return super.onDestroy(options);
	}

	onCancel() {
		this.close();
	}

	onNone() {
		this.trigger('none');
		this.close();
	}

	onLoadImage(){
		let device   = context.device;
		let viewport = device.getViewport();
		let height   = this.views.image.height();
		let width    = this.views.image.width();

		if ( viewport.width > width &&  viewport.height > height  )
			return;

		let rapViewport = viewport.width / viewport.height;
		let rapImage    = width / height;

		if ( rapImage > rapViewport)
			this.views.image.width( viewport.width );
		else
			this.views.image.height( viewport.height );

	}

	onSwipeDown(e){
		if ( this.imageZoomed )
			return this;

		var css = {
			'-webkit-transform': 'translate3d(0px, 60px, 0px)',
			'transform': 'translate3d(0px, 60px, 0px)'
		};
		if ( this.options.zoom ){
			this.cache.$canvas.css(css);
		}else{
			this.views.image.$el.find('img').css(css);
		}

		this.close();
	}


};
