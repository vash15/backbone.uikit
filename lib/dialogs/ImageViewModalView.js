
import _ from "underscore";
import { capitalize } from "underscore.string";
import $ from "jquery";
import ModalView from "./ModalView";
import ImageView from "../ImageView";
import context from "context-utils";


// @todo: Implementare la chiusura della modale con il PAN DOWN
export default class ImageViewModalView extends ModalView {

	className(){ return 'ui-modal ui-modal-image' }

	constructor(options) {
		if (_.isUndefined(options)) options = {};
		if ( _.isUndefined(options.src) )
			throw new Error("Url image does not found");

		const defaultOptions = { buttons: { cancel: 'A' } };
		options = _.defaults(options, defaultOptions);
		super(options);

		this.addEvents({
			"swipedown": "onSwipeDown"
			// "touchstart": "onTouchStart",
			// "touchmove": "onTouchMove",
			// "touchend": "onTouchEnd"
		});

		this.$el.addClass( _.result(this.options, 'addClass') || '' );

		this.views.image = new ImageView({
			src: options.src, // 'https://public.dm2302.livefilestore.com/y3pTiD2fb9CL3rhz9Y6D6T3w5gWRLCr5uxot89n_Bf4cVloetZtw77ZqhKlhfPcXXOCea6zD8ZKeKkBHcAAjr3Pnn8QTLlEaKSiKNOpW_1lrSE/CM_BD_3D_Pack.jpg?psid=1&rdrts=113827827',
			placeholder: 'assets/img/product-placeholder.png',
			size: 'normal'
		});
		this.listenTo( this.views.image, "loaded", this.onLoadImage);

	}

	onRender(rendered) {
		super.onRender(rendered);
		if (rendered) return this;

		this.$el.find('.js-content').append( this.views.image.el );
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

	onSwipeDown(e){
		console.log("onSwipeDown", e);

		this.views.image.$el.find('img').css({
			'-webkit-transform': 'translate3d(0px, 60px, 0px)',
			'transform': 'translate3d(0px, 60px, 0px)'
		});
		
		return this.close();
	}

	// onTouchStart(e){
	// 	console.log("Touch Start", e);
	// }
	//
	// onTouchMove(e){
	// 	console.log("Touch Move", e);
	// }
	//
	// onTouchEnd(e){
	// 	console.log("Touch Move", e);
	// }


};
