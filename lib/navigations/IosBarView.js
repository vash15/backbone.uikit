var _          = require('underscore');
var Backbone   = require('backbone');
var fs         = require('fs');
var BarView    = require('./BarView');
var utilsStyle = require('../utils/style');

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

		this.$el.append( left, center, right );

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
		var delta = 80;
		var transform = '';
		switch(direction){
			case IosBarView.PUSH:
				transform = 'translate3d(0%, 0, 0)';
			break;
			case IosBarView.DETACH:
				transform = 'translate3d('+(-delta*(100-percent)/100)+'%, 0, 0)';
			break;
			case IosBarView.RESTORE:
				transform = 'translate3d('+(-delta*(100-percent)/100)+'%, 0, 0)';
			break;
			case IosBarView.POP:
				transform = 'translate3d('+(delta*(100-percent)/100)+'%, 0, 0)';
			break;
		}

		var self   = this;
		var left   = this.cache.left;
		var center = this.cache.center;
		var right  = this.cache.right;

		left.style[ utilsStyle.transition ]   = '';
		center.style[ utilsStyle.transition ] = '';
		right.style[ utilsStyle.transition ]  = '';

		if ( animated ){

			if (this._oldPercent === -1) {
				if ( direction == IosBarView.PUSH ){
					center.style[utilsStyle.transform] = 'translate3d('+delta+'%, 0, 0)';
				}else if ( direction == IosBarView.POP ){
					center.style[utilsStyle.transform] = 'translate3d(0, 0, 0)';
				}else if ( direction == IosBarView.RESTORE ){
					center.style[utilsStyle.transform] = 'translate3d('+(-delta)+'%, 0, 0)';
				}else if ( direction == IosBarView.DETACH ){
					center.style[utilsStyle.transform] = 'translate3d(0, 0, 0)';
				}

				window.getComputedStyle(center)[utilsStyle.transform];
			}

			left.style[ utilsStyle.transition ]   = 'opacity '+this.options.duration+'ms';
			center.style[ utilsStyle.transition ] = 'opacity '+this.options.duration+'ms, transform '+this.options.duration+'ms';
			right.style[ utilsStyle.transition ]  = 'opacity '+this.options.duration+'ms';

			// Serve per evitare che l'ottimizzatore del browser ignori gli stili modificati
			// nel momento che questa view viene aggiunta al DOM
			utilsStyle.requestNextAnimationFrame(function(){
				self._oldPercent = -1;
				left.style.opacity   = percent/100;
				center.style.opacity = percent/100;
				right.style.opacity  = percent/100;
				center.style[ utilsStyle.transform ] = transform;
			});

		}else{
			this._oldPercent = percent;

			left.style.opacity   = percent/100;
			center.style.opacity = percent/100;
			right.style.opacity  = percent/100;

			center.style[ utilsStyle.transform ] = transform;

		}

		return this;
	}

});
