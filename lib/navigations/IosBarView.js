var _          = require('underscore');
var Backbone   = require('backbone');
var fs         = require('fs');
var BarView    = require('./BarView');
var utilsStyle = require('../utils/style');
var animate    = require('../utils/animate');

var template = _.template(fs.readFileSync(__dirname+'/../../templates/navigations/ios_bar_view.html', 'utf8'));

var IosBarView = module.exports = BarView.extend({

	className: 'navigation-bar ios-navigation-bar',

	template: template,

	initialize: function initialize(options) {
		IosBarView.__super__.initialize.apply(this, arguments);
		this.options = _.defaults( this.options, {
			left   : null,
			center : null,
			right  : null
		});

		this.addEvents({
			'click .left-side': 'onClickLeftSide'
		});

		this._oldPercent = -1;
	},

	onClickLeftSide: function onClickLeftSide(){
		var ctx = this.getContext();
		ctx.viewstack.popView(null,{ animated: true, delay: true });
	},

	render: function render() {

		var left   = this.cache.left    = document.createElement('div');
		var center = this.cache.center  = document.createElement('div');
		var right  = this.cache.right   = document.createElement('div');

		left.className   = 'left-side';
		center.className = 'center-side';
		right.className  = 'right-side';

		left.style.opacity   = 0;
		center.style.opacity = 0;
		right.style.opacity  = 0;

		this.$el.empty().append( left, center, right );

		if ( this.options.left ){
			if ( this.options.left instanceof Backbone.View )
				left.appendChild( this.options.left );
			else
				left.innerHTML = this.options.left;
		}

		if ( this.options.center ){
			if ( this.options.center instanceof Backbone.View )
				center.appendChild( this.options.center );
			else
				center.innerHTML = this.options.center;
		}

		if ( this.options.right ){
			if ( this.options.right instanceof Backbone.View )
				right.appendChild( this.options.right );
			else
				right.innerHTML = this.options.right;
		}

		return this;
	},

	move: function move(percent, direction, animated){
		var delta         = 100;
		var self          = this;
		var left          = this.cache.left;
		var center        = this.cache.center;
		var right         = this.cache.right;
		var transform     = '';
		var initTransform = '';

		switch (direction) {
			case IosBarView.PUSH:
				transform = 'translate3d(0%, 0, 0)';
				initTransform = 'translate3d('+delta+'%, 0, 0)';
			break;
			case IosBarView.DETACH:
				transform = 'translate3d('+(-delta*(100-percent)/100)+'%, 0, 0)';
				initTransform = 'translate3d(0, 0, 0)';
			break;
			case IosBarView.RESTORE:
				transform = 'translate3d('+(-delta*(100-percent)/100)+'%, 0, 0)';
				initTransform = 'translate3d(-'+delta+'%, 0, 0)';
			break;
			case IosBarView.POP:
				transform = 'translate3d('+(delta*(100-percent)/100)+'%, 0, 0)';
				initTransform = 'translate3d(0, 0, 0)';
			break;
		}

		left.style[ utilsStyle.transition ]   = '';
		center.style[ utilsStyle.transition ] = '';
		right.style[ utilsStyle.transition ]  = '';

		if ( animated ){
			if (this._oldPercent !== -1) {
				initTransform = null;
			}

			animate.run(left, {
				duration: this.options.duration + 'ms',
				timing: 'ease-out',
				start: {
					'transform': initTransform,
					'opacity': null
				},
				end: {
					'transform': transform,
					'opacity': (percent/100) * (percent/100)
				}
			});

			animate.run(center, {
				duration: this.options.duration + 'ms',
				start: {
					'transform': initTransform,
					'opacity': null
				},
				end: {
					'transform': transform,
					'opacity': percent/100
				}
			}, function() {
				// end
				self._oldPercent = -1;
			});

			animate.run(right, {
				duration: this.options.duration + 'ms',
				timing: 'ease-out',
				start: {
					'transform': initTransform,
					'opacity': null
				},
				end: {
					'transform': transform,
					'opacity': (percent/100) * (percent/100)
				}
			});

		} else {
			this._oldPercent = percent;

			left.style.opacity   = (percent/100) * (percent/100);
			center.style.opacity = percent/100;
			right.style.opacity  = (percent/100) * (percent/100);

			left.style[ utilsStyle.transform ]   = transform;
			center.style[ utilsStyle.transform ] = transform;
			right.style[ utilsStyle.transform ]  = transform;

		}

		return this;
	}

});
