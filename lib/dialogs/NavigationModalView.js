import _ from "underscore";
import $ from "jquery";
import context from "context-utils";
import Viewstack from "backbone.viewstack"; // ???
import ModalView from "./ModalView";
import NavigationView from "../navigations/NavigationView";
import State from "../utils/State";

/**
 * NavigationModalView is a modal view with a viewstack and a navigation bar.
 * @extends ModalView
 * @param {Object} options - Options object
 * @param {Object} [options.navigationViewClass] [NavigationView] - Class definition of the NavigationView instantiated in the constructor.
 * @example
 * import _ from "underscore";
 * import { ModalView } from "backbone.uikit";
 * export default class NewModal extends ModalView {
 *   static showModal(done) {
 *     const construtor = this;
 *     const newModal = new construtor();
 *     newModal.once('pay', (success) => {
 *       return done(null, success);
 *     });
 *     newModal.once('close', () => {
 *       return done(false);
 *     });
 *     context.viewstack.pushView(newModal, { animated: true });
 *   }
 *
 *   addClass() {
 *     return 'new-modal';
 *   }
 *
 *   constructor(options) {
 *     options = _.defaults(options || {}, {
 *       buttons: {
 *         cancel: 'Cancel',
 *         pay: 'Pay'
 *       }
 *     });
 *     super(options);
 *   }
 *
 *   onRender(rendered) {
 *     super.onRender(rendered);
 *     if (!rendered) {
 *       // this.cache.$container
 *       // this.cache.$content
 *     }
 *   }
 *
 *   onClose(e) {
 *     this.trigger('close');
 *     return super.onClose(e);
 *   }
 *
 *   onPay() {
 *     this.trigger('pay');
 *     this.close();
 *   }
 * }
 * @example <caption>HTML Output</caption>
 * <div class="ui-modal has-toolbar">
 *   <div class="js-overlay overlay"></div>
 *   <div class="js-container container">
 *     <div class="js-content content"></div>
 *     <div class="toolbar">
 *       <button class="button pay">Pay</button>
 *       <button class="button close">Cancel</button>
 *     </div>
 *   </div>
 * </div>
 */
export default class NavigationModalView extends ModalView {

	className() {
		return 'ui-modal ui-navigation-modal ' + _.result( this, 'addClass', '');
	}

	constructor(options) {
		options = _.defaults(options || {}, {
			buttons: {},
			scroll: false,
			navigationViewClass: NavigationView
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

		if (options.navigationViewClass) {
			let navigation = new this.options.navigationViewClass({
				state: state,
				viewstack: viewstack
			});
			this.addSubView('navigation', navigation);
			state.set('navigation', navigation);
			this.$el.addClass('has-navigation');
		}
	}

	onRender(rendered) {
		super.onRender(rendered);
		if (!rendered) {
			let navigation = this.getSubView('navigation');
			if (navigation) {
				this.cache.$container.prepend(navigation.el);
				navigation.render();
			}

			let viewstack  = this.getSubView('viewstack');
			this.cache.$container.append(viewstack.el);
			viewstack.render();
		}
	}

};
