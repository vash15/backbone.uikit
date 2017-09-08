
import _ from "underscore";
import context from "context-utils";
import { Collection } from "backbone";
import $ from "jquery";
import { capitalize } from "underscore.string";
import Swiper from "swiper";
import PinchZoomCanvas from "pinch-zoom-canvas";

import BaseView from "../BaseView";
import ImageView from "../ImageView";


export default class ImagesModalView extends BaseView {

	className(){ return 'ui-images-modal'; }

	constructor(options) {
		super(options);

		let state = this.getState();

		this.setDefaultsOptions({
			viewstack: state ? state.get('viewstack') : context.viewstack,
			images: [],
			thumbnails: [],
			iconCancel: 'Z',
			zoom: false,
			startAt: 0,
			getUrl: null,
			imagePreloader: true,
			classPreloader: null,
			carouselOptions: {}, // Options for SwiperJS
			navigationOptions: {} // Options for SwiperJS
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

		let pauseZoom = _.bind(function(index){
			this.cache['zoom'+index].pause();
		}, this);
		let resumeZoom = _.bind(function(index){
			this.cache['zoom'+index].resume();
		}, this);

		const getUrl         = this.options.getUrl;
		const imagePreloader = this.options.imagePreloader
		let   cache          = this.cache;
		_(this.images).each((item, index) => {
			let url = getUrl(item);
			let key = 'zoom'+index;
			if ( !cache[key] ){
				cache['$'+key]  = $('<canvas class="ui-image-zoom-modal" />');

				let $swiperSlide = $('<div class="swiper-slide" />').append( cache['$'+key] );
				let $preloader   = $('<div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>');
				if ( imagePreloader ){
					if ( this.options.classPreloader )
						$preloader.addClass(this.options.classPreloader);
					$swiperSlide.append($preloader);
				}

				this.cache.$wrapper.append( $swiperSlide );

				cache[key] = new PinchZoomCanvas({
					canvas: cache['$'+key].get(0),
					path: url,
					momentum: true,
					doubletap: true,
					onReady: ()=>{
						// Per ritardare la rimozione di qualche ms
						setTimeout(()=>{
							this.requestAnimationFrame(()=>{
								if ( imagePreloader ){
									$preloader.remove();
								}
							});
						}, 250);
					},
					onZoomEnd: (zoom, zoomed) => {
						this.imageZoomed = zoomed;
						if (!this.carousel)
							return;
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


		if ( this.images.length > 1 && !this.carousel ){

			let options = _.defaults( this.options.carouselOptions,{
				direction: 'horizontal',
				simulateTouch: false,
				speed: 400,
				preloadImages: false,
				lazyLoading: true,
				lazyLoadingInPrevNext: false,
				lazyLoadingInPrevNextAmount: 1,
				lazyLoadingOnTransitionStart: false
			});

			// Important!
			options.initialSlide = this.options.startAt;
			options.pagination   = !this.hasThumbPagination && this.images.lenght > 1 ? this.cache.$pagination.get(0) : null;

			let customOnSlideMove       = options.onSliderMove;
			let customOnTransitionStart = options.onTransitionStart;
			let customOnTransitionEnd   = options.onTransitionEnd;
			let customOnInit            = options.onInit;

			options.onSliderMove = _.bind(function (swiper, event) {
				if ( this.carouselAnimating )
					return;
				this.carouselAnimating = true;
				pauseZoom(swiper.activeIndex);
				if ( _.isFunction(customOnSlideMove) )
					customOnSlideMove();
			}, this);

			options.onTransitionStart = _.bind(function(swiper){
				if ( this.carouselAnimating )
					return;
				this.carouselAnimating = true;
				pauseZoom(swiper.activeIndex);
				if ( _.isFunction(customOnTransitionStart) )
					customOnTransitionStart();
			}, this);

			options.onTransitionEnd = _.bind(function(swiper){
				this.carouselAnimating = false;
				resumeZoom(swiper.activeIndex);
				if ( _.isFunction(customOnTransitionEnd) )
					customOnTransitionEnd();
			}, this);

			options.onInit = _.bind(function(swiper){
				this.carouselAnimating = false;
				resumeZoom(swiper.activeIndex);
				if ( _.isFunction(customOnInit) )
					customOnInit();
			}, this);

			// Initialize Swiper
			this.carousel = new Swiper( this.cache.$container.get(0), options );
		}else{
			// This case I have 1 image
			resumeZoom(0);
		}

		if ( this.hasThumbPagination && !this.navigation ){
			let options = _.defaults( this.options.navigationOptions,{
				direction: 'horizontal',
				centeredSlides: true,
				slidesPerView: 'auto',
				touchRatio: 0.2
			});

			// Important!
			options.initialSlide = this.options.startAt;
			options.slideToClickedSlide = true;

			this.navigation = new Swiper( this.cache.$navigationContainer.get(0), options );

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
