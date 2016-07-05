
import _ from "underscore";
import context from "context-utils";
import { Collection } from "backbone";
import $ from "jquery";
import { capitalize } from "underscore.string";
import Swiper from "Swiper";
import ImgTouchCanvas from "img-touch-canvas";

import BaseView from "../BaseView";
import ImageView from "../ImageView";


export default class ImagesModalView extends BaseView {

	className(){ return 'ui-images-modal'; }

	constructor(options) {
		super(options);

		let state = this.getState();

		this.options = _.defaults(options || {}, {
			viewstack: state ? state.get('viewstack') : context.viewstack,
			images: [],
			thumbnails: [],
			iconCancel: 'Z',
			zoom: false,
			startAt: 0,
			getUrl: null
		});

		this.viewstack = this.options.viewstack;
		this.template  = require('../../templates/dialogs/images_modal.html');
		this.$el.addClass( _.result(this.options, 'addClass') || '' );

		delete this.options.viewstack;

		if ( !this.options.getUrl )
			this.options.getUrl = function (item) { return item; };


		this.images              = this.options.images;
		this.thumbnails          = this.options.thumbnails;
		this.hasThumbPagination  = _.isArray(this.thumbnails) && this.thumbnails.length > 0;

		this.imageZoomed = false;
		this.navigation  = null;
		this.carousel    = null;

		if ( this.hasThumbPagination )
			this.$el.addClass( 'ui-images-modal-has-thumbnails' );


		this.addEvents({
			"click .js-close": "onClose"
		});

	}

	close(animated){
		if ( _.isUndefined(animated) )
			animated = true;

		if ( this.viewstack )
			this.viewstack.popView(this, { animated: animated });

		if (window.StatusBar)
			window.StatusBar.styleLightContent();

		return this;
	}

	onRender(rendered) {
		if ( rendered ) return this;

		this.$el.html( this.template() );
		this.$el.find('.js-close').html( this.options.iconCancel );

		this.cache.$container  = this.$el.find('.js-container ');
		this.cache.$wrapper    = this.cache.$container.find('.js-wrapper');
		this.cache.$pagination = this.cache.$container.find('.js-pagination');
		this.cache.$navigationContainer = this.$el.find('.js-navigation-container');
		this.cache.$navigationWrapper   = this.cache.$navigationContainer.find('.js-navigation-wrapper');

		let pauseZoom = (swiper) => {
			this.cache['zoom'+swiper.activeIndex].pause();
		};
		let resumeZoom = (swiper) => {
			this.cache['zoom'+swiper.activeIndex].resume();
		};
		var getUrl = this.options.getUrl;
		var cache  = this.cache;
		_(this.images).each((item, index) => {
			let url = getUrl(item);
			let key = 'zoom'+index;
			if ( !cache[key] ){
				cache['$'+key] = $('<canvas class="ui-image-zoom-modal" />');

				this.cache.$wrapper.append( $('<div class="swiper-slide" />').append( cache['$'+key] ) );

				cache[key] = new ImgTouchCanvas({
					canvas: cache['$'+key].get(0),
					path: url,
					momentum: true,
					onZoomEnd: (zoom, zoomed) => {
						this.imageZoomed = zoomed;
						if ( zoomed ){
							this.carousel.detachEvents();
							this.cache.$pagination.hide();
						}else{
							this.carousel.attachEvents();
							this.cache.$pagination.show();
						}
					},
					onZoom: (zoom, zoomed) => {
						this.imageZoomed = zoomed;
					}
				});
				cache[key].pause();

			}
		});

		// thumbnails
		_(this.thumbnails).each((item, index) => {
			let url = getUrl(item);
			let key = 'thumbnail'+index;
			if ( !cache[key] ){
				cache['$'+key] = $('<img src="'+url+'" alt="" />');
				this.cache.$navigationWrapper.append( $('<div class="swiper-slide" />').append( cache['$'+key] ) );
			}
		});


		if ( this.images.length > 0 && !this.carousel ){
			this.carousel = new Swiper(this.cache.$container.get(0), {
				direction: 'horizontal',
				initialSlide: this.options.startAt,
				simulateTouch: false,
				speed: 400,
				preloadImages: false,
				lazyLoading: true,
				lazyLoadingInPrevNext: false,
				lazyLoadingInPrevNextAmount: 1,
				lazyLoadingOnTransitionStart: false,
				pagination: !this.hasThumbPagination ? this.cache.$pagination.get(0) : null,
				onSliderMove: (swiper, event) => {
					if ( this.carouselAnimating )
						return;
					this.carouselAnimating = true;
					pauseZoom(swiper);

				},
				onTransitionStart: (swiper) => {
					if ( this.carouselAnimating )
						return;
					this.carouselAnimating = true;
					pauseZoom(swiper);
				},
				onTransitionEnd: (swiper) => {
					this.carouselAnimating = false;
					resumeZoom(swiper);
				},
				onInit: (swiper) => {
					this.carouselAnimating = false;
					resumeZoom(swiper);
				}
			});
		}

		if ( this.hasThumbPagination && !this.navigation ){
			this.navigation = new Swiper(this.cache.$navigationContainer.get(0), {
				direction: 'horizontal',
				initialSlide: this.options.startAt,
				centeredSlides: true,
				slidesPerView: 'auto',
				touchRatio: 0.2,
				slideToClickedSlide: true
			});

			if ( this.carousel )
				this.carousel.params.control = this.navigation;

			this.navigation.params.control = this.carousel;
		}

		if (window.StatusBar)
			window.StatusBar.styleDefault();

		return this;
	}

	onClose(){
		this.close(false);
	}

	onDestroy(options){

		_(this.cache).each(function(item, key) {
			if ( key.indexOf("zoom") > -1 && item.destroy )
				item.destroy();
		});

		if ( this.carousel )
			this.carousel.destroy();
		if ( this.navigation )
			this.navigation.destroy();

		return super.onDestroy(options);
	}


};
