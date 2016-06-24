
import _ from "underscore";
import { capitalize } from "underscore.string";
import $ from "jquery";
import ModalView from "./ModalView";
import ImageView from "../ImageView";
// var Hammer    = require('hammerjs');

// @todo: Implementare la chiusura della modale con il PAN DOWN
export default class ImageViewModalView extends ModalView {

	className(){ return 'ui-modal ui-modal-image' }

	initialize(options) {
		if (_.isUndefined(options)) options = {};
		if ( _.isUndefined(options.src) )
			throw new Error("Url image does not found");

		const defaultOptions = { buttons: { cancel: 'A' } };
		this.options = _.defaults(options, defaultOptions);
		super.initialize(this.options);

		this.views.image = new ImageView({
			src: options.src, // 'https://public.dm2302.livefilestore.com/y3pTiD2fb9CL3rhz9Y6D6T3w5gWRLCr5uxot89n_Bf4cVloetZtw77ZqhKlhfPcXXOCea6zD8ZKeKkBHcAAjr3Pnn8QTLlEaKSiKNOpW_1lrSE/CM_BD_3D_Pack.jpg?psid=1&rdrts=113827827',
			placeholder: 'assets/img/product-placeholder.png',
			size: 'normal'
		});
		this.listenTo( this.views.image, "loaded ", this.onLoadImage);

		//
		// Hammer

		// this.hammerManager = new Hammer.Manager( this.el );
		// this.hammerManager.add(
		// 	new Hammer.Pan({
		// 		direction: Hammer.DIRECTION_DOWN,
		// 		threshold: 50
		// 	})
		// );
		//
		// this.hammerManager.on("panstart",  _.bind(this.onPan, this) );

	}

	onRender(rendered) {
		if (rendered) return this;

		this.findPlaceholder('content').append( this.views.image.el );
		this.views.image.render();
		if (window.StatusBar)
			window.StatusBar.styleDefault();

		return this;
	}

	close(){
		super.close();
		if (window.StatusBar)
			window.StatusBar.styleLightContent();
	}

	onDestroy(){
		// this.hammerManager.off("panstart",  _.bind(this.onPan, this) );
		// this.hammerManager.destroy();
		super.destroy();
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

	onPan(ev){
		this.views.image.$el.find('img').css({
			'-webkit-transform': 'translate3d(0px, 60px, 0px)',
			'transform': 'translate3d(0px, 60px, 0px)'
		});
		return this.close();
	}

};
