import _ from "underscore";
import $ from "jquery";
import context from "context-utils";
import Viewstack from "backbone.viewstack"; // ???
import ModalView from "./ModalView";
import NavigationView from "../navigations/NavigationView";
import State from "../utils/State";

export default class NavigationModalView extends ModalView {

	className() {
		return 'ui-modal ui-navigation-modal' + _.result( this, 'addClass', '');
	}

	constructor(options) {
		options = _.extend(options || {}, {
			buttons: {},
			scroll: false
		});

		super(options);

		this.template = require('../../templates/dialogs/navigation_modal.html');

		// Initialize a separated state
		let state = new State();
		this.setState(state);

		let viewstack = new Viewstack({
			className: 'viewstack'
		});
		this.addSubView('viewstack', viewstack);
		state.set('viewstack', viewstack);

		let navigation = new NavigationView({
			viewstack: viewstack
		});
		this.addSubView('navigation', navigation);
		state.set('navigation', navigation);
	}

	onRender(rendered) {
		super.onRender(rendered);
		if (!rendered) {
			let navigation = this.getSubView('navigation');
			this.cache.$container.prepend(navigation.el);
			navigation.render();

			let viewstack  = this.getSubView('viewstack');
			this.cache.$container.append(viewstack.el);
			viewstack.render();
		}
	}

};
