
import _        from "underscore";
import $        from "jquery";
import context  from "context-utils";
import { View } from "backbone";
import BarView  from "./BarView";
import animate  from "../utils/animate";
import { getVendorStyle, requestNextAnimationFrame } from "../utils/style";


export default class IosBarView extends BarView {

	className() { return 'ui-navigation-bar ui-ios-navigation-bar' }

	constructor(options) {
		super(options);
		let state = this.getState();

		this.template = require('../../templates/navigations/ios_bar_view.html');
		this.options = _.defaults( this.options, {
			viewstack: state ? state.get('viewstack') : context.viewstack,
			left   : null,
			center : null,
			right  : null
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		this.$el.addClass( _.result( this.options, 'addClass' ) || '' );

		this.addEvents({
			'click .left-side': 'onClickLeftSide'
		});

		this._oldPercent = -1;
	}

	onClickLeftSide(){
		this.viewstack.popView(null,{ animated: true, delay: true });
	}

	onRender(rendered) {
		if ( rendered ) return this;

		let left   = this.cache.left    = document.createElement('div');
		let center = this.cache.center  = document.createElement('div');
		let right  = this.cache.right   = document.createElement('div');

		left.className   = 'left-side';
		center.className = 'center-side';
		right.className  = 'right-side';

		left.style.opacity   = 0;
		center.style.opacity = 0;
		right.style.opacity  = 0;

		this.$el.append( left, center, right );

		if ( this.options.left ){
			if ( this.options.left instanceof View )
				left.appendChild( this.options.left );
			else if ( this.options.left instanceof $ )
				left.appendChild( this.options.left.get(0) );
			else
				left.innerHTML = this.options.left;
		}

		if ( this.options.center ){
			if ( this.options.center instanceof View )
				center.appendChild( this.options.center );
			else if ( this.options.center instanceof $ )
				center.appendChild( this.options.center.get(0) );
			else
				center.innerHTML = this.options.center;
		}

		if ( this.options.right ){
			if ( this.options.right instanceof View )
				right.appendChild( this.options.right );
			else if ( this.options.right instanceof $ )
				right.appendChild( this.options.right.get(0) );
			else
				right.innerHTML = this.options.right;
		}

		return this;
	}

	move(percent, direction, animated){
		if (!this.rendered)
			return;

		const delta       = 100;
		let left          = this.cache.left;
		let center        = this.cache.center;
		let right         = this.cache.right;
		let transform     = '';
		let initTransform = '';

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

		left.style[ getVendorStyle( 'transition' ) ]   = '';
		center.style[ getVendorStyle( 'transition' ) ] = '';
		right.style[ getVendorStyle( 'transition' ) ]  = '';

		if ( animated ){
			if (this._oldPercent !== -1) {
				initTransform = null;
			}

			animate(left, {
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

			animate(center, {
				duration: this.options.duration + 'ms',
				start: {
					'transform': initTransform,
					'opacity': null
				},
				end: {
					'transform': transform,
					'opacity': percent/100
				}
			}, () => {
				// end
				this._oldPercent = -1;
			});

			animate(right, {
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

			left.style[ getVendorStyle( 'transform' ) ]   = transform;
			center.style[ getVendorStyle( 'transform' ) ] = transform;
			right.style[ getVendorStyle( 'transform' ) ]  = transform;

		}

		return this;
	}

};
