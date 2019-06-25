
import _        from "underscore";
import BaseView from "../BaseView";

const PUSH    = 0; // Push      | |<-
const DETACH  = 1; // Detach  <-| |
const RESTORE = 2; // Restore ->| |
const POP     = 4; // Pop       | |->

export default class BarView extends BaseView {

	className() {
		return 'ui-navigation-bar ' + _.result(this, 'addClass', '');
	}

	constructor(options) {
		super(options);
		this.setDefaultsOptions({ duration: 300, className: '' });
	}

	move(percent, direction, animated){
		return this;
	}

};


BarView.PUSH    = PUSH;
BarView.DETACH  = DETACH;
BarView.RESTORE = RESTORE;
BarView.POP     = POP;
