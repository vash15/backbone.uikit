
import _              from "underscore";
import $              from "jquery";
import context        from "context-utils";
import { Collection } from "backbone";
import { capitalize } from "underscore.string";
import Swiper         from "swiper";
import BaseView       from "../BaseView";

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
			navigationOptions: {}, // Options for SwiperJS
			onBeforeClose: ()=>{
				// Retro-compability
				if (window.StatusBar)
					window.StatusBar.styleLightContent();
			}
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

	/**
	 *
	 */
	close(animated){
		if ( _.isUndefined(animated) )
			animated = true;

		if ( this.viewstack )
			this.viewstack.popView(this, { animated: animated });

		if ( _.isFunction(this.options.onBeforeClose) ){
			this.options.onBeforeClose();
		}

		return this;
	}

	onRender(rendered) {
		if ( rendered ) return this;

		this.$el.html( this.template() );
		this.$el.find('.js-close').html( this.options.iconCancel );

		this.cache.$container           = this.$el.find('.js-container ');
		this.cache.$wrapper             = this.cache.$container.find('.js-wrapper');
		this.cache.$pagination          = this.cache.$container.find('.js-pagination');
		this.cache.$navigationContainer = this.$el.find('.js-navigation-container');
		this.cache.$navigationWrapper   = this.cache.$navigationContainer.find('.js-navigation-wrapper');

		const getUrl         = this.options.getUrl;
		const imagePreloader = this.options.imagePreloader
		let   cache          = this.cache;
		_(this.images).each((item, index) => {
			let url = getUrl(item);
			let key = 'zoom'+index;
			if ( !cache['$'+key] ){
				cache['$'+key]  = $(`<img data-src="${url}" class="swiper-lazy" />`);

				let $swiperSlide = $('<div class="swiper-slide" />').append( $('<div class="swiper-zoom-container" />').append(cache['$'+key]) );
				let $preloader   = $('<div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>');
				if ( imagePreloader ){
					if ( this.options.classPreloader )
						$preloader.addClass(this.options.classPreloader);
					$swiperSlide.append($preloader);
				}

				this.cache.$wrapper.append( $swiperSlide );
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
				lazy: true,
				zoom: {
					maxRatio: 3,
					minRatio: 1,
					toggle: true
				}
			});

			// Normalize options Pagination
			if ( options.pagination && _.isString(options.pagination)){
				options.pagination = {
					el: options.pagination
				};
			}

			// Important!
			options.initialSlide = this.options.startAt;

			if ( !this.hasThumbPagination && this.images.length > 1 ){
				options.pagination   =  {
					el: this.cache.$pagination.get(0)
				};
			}


			let customOnSlideMove       = options.onSliderMove;
			let customOnTransitionStart = options.onTransitionStart;
			let customOnTransitionEnd   = options.onTransitionEnd;
			let customOnInit            = options.onInit;

			options.on = {
				sliderMove: ()=> {
					if ( _.isFunction(customOnSlideMove) )
						customOnSlideMove();
				},
				transitionStart: ()=>{
					if ( _.isFunction(customOnTransitionStart) )
						customOnTransitionStart();
				},
				transitionEnd: ()=>{
					if ( _.isFunction(customOnTransitionEnd) )
						customOnTransitionEnd();
				},
				zoomChange: (scale, imageEl, slideEl)=>{
					this.imageZoomed = scale > 1;
					this.requestAnimationFrame(()=>{
						if (this.imageZoomed){
							this.cache.$navigationContainer.hide();
						}else{
							this.cache.$navigationContainer.show();
						}
					});
				},
				init: ()=>{
					if ( _.isFunction(customOnInit) )
						customOnInit();
				}
			}

			// Initialize Swiper
			this.carousel = new Swiper( this.cache.$container.get(0), options );

		}

		if ( this.hasThumbPagination && !this.navigation ){
			let options = _.defaults( this.options.navigationOptions,{
				direction: 'horizontal',
				centeredSlides: true,
				slidesPerView: 'auto',
				touchRatio: 0.2,
				controller: {
					control: this.carousel
				}
			});

			// Important!
			options.initialSlide = this.options.startAt;
			options.slideToClickedSlide = true;

			this.navigation = new Swiper( this.cache.$navigationContainer.get(0), options );

			if ( this.carousel ){
				this.carousel.controller.control = this.navigation;
			}

		}

		if (window.StatusBar)
			window.StatusBar.styleDefault();

		return this;
	}

	onClose(){
		this.close(false);
	}

	onDestroy(options){
		if ( this.carousel )
			this.carousel.destroy();
		if ( this.navigation )
			this.navigation.destroy();

		return super.onDestroy(options);
	}


};
