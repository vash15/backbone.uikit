import _        from "underscore";
import $        from "jquery";
import context  from "context-utils";
import { View } from "backbone";
import BarView  from "./BarView";
import BezierEasing from "../utils/BezierEasing";
import animate  from "../utils/animate";
import { getVendorStyle } from "../utils/style";
import { requestNextAnimationFrame } from "../utils/requestAnimationFrame";


export default class IosBarView extends BarView {

	className() {
		return 'ui-navigation-bar ui-ios-navigation-bar'
	}

	constructor(options) {
		super(options);
		let state = this.getState();

		this.template = require('../../templates/navigations/ios_bar_view.html');
		this.setDefaultsOptions({
			addClass:            '',
			viewstack:           state ? state.get('viewstack') : context.viewstack,
			left:                null,
			center:              null,
			right:               null,
			hideBackButton:      false,
			popViewOnBackButton: true
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		if (_.result(this.options, 'addClass')) {
			this.$el.addClass( _.result( this.options, 'addClass' ) || '' );
		}

		this.addEvents({
			'click .left-side':   'onLeftSideClick',
			'click .center-side': 'onCenterSideClick',
			'click .right-side':  'onRightSideClick',
		});

		this._oldPercent = -1;
	}

	onLeftSideClick(e) {
		if (this.options.popViewOnBackButton) {
			this.viewstack.popView(null,{ animated: true, delay: true });
		}
		this.trigger('leftClick', e);
	}

	onCenterSideClick(e) {
		this.trigger('centerClick', e);
	}

	onRightSideClick(e) {
		this.trigger('rightClick', e);
	}

	showBackButton() {
		this.options.hideBackButton = false;
		if ( !this.rendered ) return;
		this.cache.left.display = '';
	}

	hideBackButton() {
		this.options.hideBackButton = true;
		if ( !this.rendered ) return;
		this.cache.left.display = 'none';
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


		if ( this.options.hideBackButton )
			left.style.display = 'none';

		this.$el.append( left, center, right );

		if ( this.options.left ) {
			if ( this.options.left instanceof View )
				left.appendChild( this.options.left.el );
			else if ( this.options.left instanceof $ )
				left.appendChild( this.options.left.get(0) );
			else
				left.innerHTML = this.options.left;
		}

		if ( this.options.center ) {
			if ( this.options.center instanceof View )
				center.appendChild( this.options.center.el );
			else if ( this.options.center instanceof $ )
				center.appendChild( this.options.center.get(0) );
			else
				center.innerHTML = this.options.center;
		}

		if ( this.options.right ) {
			if ( this.options.right instanceof View )
				right.appendChild( this.options.right.el );
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

		let easingIn  = BezierEasing(.01,.69,.36,1);
		let easingOut = BezierEasing(.81,.09,.1,.6);
		percent = percent / 100;

		const delta       = 40;
		let left          = this.cache.left;
		let center        = this.cache.center;
		let right         = this.cache.right;
		let transform     = '';
		let initTransform = '';

		switch (direction) {
			case IosBarView.PUSH:
				percent = easingIn(percent);
				transform = 'translate3d(0%, 0, 0)';
				initTransform = 'translate3d('+delta+'%, 0, 0)';
			break;
			case IosBarView.DETACH:
				percent = easingOut(percent);
				transform = 'translate3d('+(-delta*(1-percent))+'%, 0, 0)';
				initTransform = 'translate3d(0, 0, 0)';
			break;
			case IosBarView.RESTORE:
				percent = easingOut(percent);
				transform = 'translate3d('+(-delta*(1-percent))+'%, 0, 0)';
				initTransform = 'translate3d(-'+delta+'%, 0, 0)';
			break;
			case IosBarView.POP:
				percent = easingOut(percent);
				transform = 'translate3d('+(delta*(1-percent))+'%, 0, 0)';
				initTransform = 'translate3d(0, 0, 0)';
			break;
		}

		left.style[getVendorStyle('transition')]   = '';
		center.style[getVendorStyle('transition')] = '';
		right.style[getVendorStyle('transition')]  = '';

		if (animated) {
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
					'opacity': percent * percent
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
					'opacity': percent
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
					'opacity': percent * percent
				}
			});

		} else {
			this._oldPercent = percent;

			left.style.opacity   = percent * percent;
			center.style.opacity = percent;
			right.style.opacity  = percent * percent;

			left.style[ getVendorStyle( 'transform' ) ]   = transform;
			center.style[ getVendorStyle( 'transform' ) ] = transform;
			right.style[ getVendorStyle( 'transform' ) ]  = transform;
		}

		return this;
	}

};
