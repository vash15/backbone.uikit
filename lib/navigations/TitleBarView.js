import _ from "underscore";
import BezierEasing from "../utils/BezierEasing";
import BarView from "./BarView";
import { getVendorStyle } from "../utils/style";
import { requestNextAnimationFrame } from "../utils/requestAnimationFrame";


export default class TitleBarView extends BarView {

	className(){ return 'ui-navigation-bar ui-title-navigation-bar' }

	constructor(options) {
		super(options);

		this.template = require('../../templates/navigations/bar_view.html');
		this.setDefaultsOptions({ title: '' });
		this.el.style.opacity = 0;

		this.easingIn  = BezierEasing(.01,.69,.36,1);
		this.easingOut = BezierEasing(.81,.09,.1,.6);
	}

	onRender(rendered) {
		if (rendered) return this;
		this.$el.html( this.template({title: this.options.title}) );
		return this;
	}

	move(percent, direction){

		percent = percent / 100;

		switch (direction) {
			case IosBarView.PUSH:
			case IosBarView.RESTORE:
				percent = this.easingIn(percent);
			break;
			case IosBarView.POP:
			case IosBarView.DETACH:
				percent = this.easingOut(percent);
			break;
		}

		var style = this.el.style;
		if (percent === 0 || percent === 1) {
			this.el.style[getVendorStyle('transition')] = 'opacity ' + this.options.duration + 'ms';
			// Serve per evitare che l'ottimizzatore del browser ignori gli stili modificati
			// nel momento che questa view viene aggiunta al DOM
			window.requestNextAnimationFrame(() => {
				style.opacity = percent;
			});
		} else {
			this.el.style[ getVendorStyle('transition') ] = '';
			style.opacity = percent;
		}

		return this;
	}

};
