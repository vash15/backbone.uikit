var _         = require('underscore');
var fs        = require('fs');
var Backbone  = require('backbone');
var Hammer    = require('hammer');
var ModalView = require('./ModalView');
var ImageView = require('../ImageView');


var ImageViewModalView = module.exports = ModalView.extend({

	className: 'modal imageView',

	initialize: function initialize(options) {
		if (_.isUndefined(options)) options = {};
		if ( _.isUndefined(options.src) )  
			throw new Error("Url image does not found");

		var defaultOptions = {
			buttons: {
				cancel: 'A'
			}
		};
		_.defaults(options, defaultOptions);
		this.options = options;
		ImageViewModalView.__super__.initialize.apply(this, arguments);

		this.views.image = new ImageView({
			src: options.src, // 'https://public.dm2302.livefilestore.com/y3pTiD2fb9CL3rhz9Y6D6T3w5gWRLCr5uxot89n_Bf4cVloetZtw77ZqhKlhfPcXXOCea6zD8ZKeKkBHcAAjr3Pnn8QTLlEaKSiKNOpW_1lrSE/CM_BD_3D_Pack.jpg?psid=1&rdrts=113827827',
			placeholder: 'assets/img/product-placeholder.png',
			size: 'normal'
		});
		this.listenTo( this.views.image, "loaded ", this.onLoadImage);

		// 
		// Hammer 
		// 
		this.hammerManager = new Hammer.Manager( this.el );
		this.hammerManager.add( 
			new Hammer.Pan({ 
				direction: Hammer.DIRECTION_DOWN, 
				threshold: 50
			})
		);

		this.hammerManager.on("panstart",  _.bind(this.onPan, this) );

	},

	render: function render() {
		ImageViewModalView.__super__.render.apply(this, arguments);
		this.findPlaceholder('content').append( this.views.image.el );
		this.views.image.render();
		if (window.StatusBar)
			window.StatusBar.styleDefault();
		return this;
	},

	close: function close(){
		ImageViewModalView.__super__.close.apply(this, arguments);
		if (window.StatusBar)
			window.StatusBar.styleLightContent();
	},

	onDestroy: function onDestroy(){
		this.hammerManager.off("panstart",  _.bind(this.onPan, this) );
		this.hammerManager.destroy();
		ImageViewModalView.__super__.onDestroy.apply(this, arguments);
	},

	onCancel: function onCancel() {
		this.close();
	},

	onNone: function onNone() {
		this.trigger('none');
		this.close();
	},

	onLoadImage: function onLoadImage(){
		var ctx      = this.getContext();
		var device   = ctx.device;
		var viewport = device.getViewport();
		var height   = this.views.image.height();
		var width    = this.views.image.width();

		if ( viewport.width > width &&  viewport.height > height  )
			return;

		var rapViewport = viewport.width / viewport.height;
		var rapImage    = width / height;

		if ( rapImage > rapViewport)
			this.views.image.width( viewport.width );
		else
			this.views.image.height( viewport.height );

	},

	onPan: function onPan(ev){
		this.views.image.$el.find('img').css({
			'-webkit-transform': 'translate3d(0px, 60px, 0px)',
			'transform': 'translate3d(0px, 60px, 0px)'
		});	
		return this.close();
	}

});

