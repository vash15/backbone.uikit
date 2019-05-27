import _ from "underscore";
import context from "context-utils";
import { capitalize } from "underscore.string";
import $ from "jquery";
import BaseView from '../BaseView';

/**
 * Modal view with overlay, toolbar and container for custom views.
 * If you define `options.buttons = { pay: 'Pay' }` you have to create a callback
 * function named `onPay` that will be called on relative button click.
 * A smart way to use a ModalView is to create a static method (`showModal` for
 * convention) that creates and push a new ModalView instance and return the result
 * on a callback function.
 * @extends Backbone.View
 * @param {Object} options - Options object
 * @param {Object} [options.buttons] [{ cancel: 'Cancel', confirm: 'Ok' }] - Object that describe toolbar buttons, use key as event name and value as label. `{}` if no buttons are wanted.
 * @param {Object} [options.enables] - Object that describe which button should be enabled or not. If `undefined` all buttons will be enabled.
 * @example
 * import _ from "underscore";
 * import context from "context-utils";
 * import { NavigationModalView } from "backbone.uikit";
 * import SignInPage from "./SignInPage";
 *
 * export default class SignInModalView extends NavigationModalView {
 *   static showModal(done) {
 *     // If the user is already logged in call done immediatly
 *     if (context.auth.isLoggedIn()) {
 *       _.defer(() => {
 *         return done(true);
 *       });
 *       return;
 *     }
 *     let signInModalView = new SignInModalView({
 *       viewstack: context.viewstack
 *     });
 *     signInModalView.once('login', function() {
 *       signInModalView.close();
 *       return done(true);
 *     });
 *     signInModalView.once('cancel', function() {
 *       signInModalView.close();
 *       return done(false);
 *     });
 *     context.viewstack.pushView(signInModalView, { animated: true });
 *     return signInModalView;
 *   }
 *
 *   addClass() {
 *     return 'sign-in';
 *   }
 *
 *   constructor(options) {
 *     super(options);
 *     // Create the first page of the navigation modal
 *     let signInPage = new SignInPage({
 *       state: this.getState(),
 *       animated: false,
 *       swipeBack: false
 *     });
 *     this.addSubView('signIn', signInPage);
 *     this.listenTo(signInPage, 'cancel', this.onLoginCancel);
 *     this.listenTo(signInPage, 'login', this.onLogin);
 *   }
 *
 *   onRender(rendered) {
 *     super.onRender(rendered);
 *     if (!rendered) {
 *       this.getSubView('viewstack').pushView(this.getSubView('signIn'));
 *     }
 *   }
 *
 *   onLogin() {
 *     this.trigger('login', true);
 *   }
 *
 *   onLoginCancel() {
 *     this.trigger('cancel');
 *   }
 * }
 * @example <caption>HTML Output</caption>
 * <div class="ui-modal ui-navigation-modal sign-in" style="z-index: 400;">
 *   <div class="js-overlay overlay new-modal"></div>
 *   <div class="js-container container">
 *     <div class="ui-navigation negate-text-color" style="background-color: rgb(80, 71, 94);">
 *       ...
 *     </div>
 *     <div class="viewstack">
 *       <div class="ui-page signin-page overflow-scroll" style="z-index: 100;">
 *         ...
 *       </div>
 *     </div>
 *   </div>
 * </div>
 */
export default class ModalView extends BaseView {

	className() {
		return 'ui-modal ' + _.result( this, 'addClass', '');
	}

	constructor(options) {
		super(options);

		let state = this.getState();

		this.setDefaultsOptions({
			viewstack: state ? state.get('viewstack') : context.viewstack
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		this.template = require('../../templates/dialogs/modal.html');

		const defaultButtons = {
			cancel: 'Cancel',
			confirm: 'Ok'
		};

		const defaultEnables = {
			confirm: true,
			cancel: true
		};

		this.addEvents({
			'click .toolbar button': 'onButtonClick',
			'click .overlay':        'cancel',
			'touchmove .overlay':    'onOverlayTouchMove'
		});

		this.options = _.defaults(this.options, {
			buttons: defaultButtons,
			enables: defaultEnables,
			scroll: true
		});

		this.buttons = this.options.buttons;
		this.enables = this.options.enables;
	}

	/**
	 * Render the view content. If overwritter the super.onRender(rendered) should
	 * be called.
	 * @public
	 * @version 2.0.0
	 * @param {bool} rendered - Indicates if it's the view first render.
	 * @example
	 * onRender(rendered) {
	 *   super.onRender(rendered);
	 *   if (!rendered) {
	 *     // Add here your additional rendering logic using cached elements:
	 *     // this.cache.$container
	 *     // this.cache.$content
	 *   }
	 * }
	 */
	onRender(rendered) {
		if (rendered) return this;

		this.closed = false;
		this.$el.removeClass('closed');
		this.$el.html(this.template());

		this.cache.$container = this.$el.find('.js-container');
		this.cache.$content   = this.$el.find('.js-content');

		if (this.options.scroll)
			this.cache.$content.addClass('overflow-scroll');

		this.renderToolbar();

		return this;
	}

	/**
	 * Render the toolbar.
	 * @private
	 * @version 2.0.0
	 */
	renderToolbar() {
		if (!_.isEmpty(this.buttons)) {
			let $toolbar = this.cache.$toolbar;

			if (!this.rendered) {
				$toolbar = this.cache.$toolbar = $('<div>').addClass('toolbar');
			}

			let $button;
			_(this.buttons).each((label, buttonName) => {
				if ( _.isString(label) && !_.isEmpty(label) ){
					$button = this.cache['button-' + buttonName] = $('<button>')
						.attr({'data-button-name': buttonName })
						.addClass('button')
						.addClass(buttonName)
						.text(label)
						.appendTo($toolbar);

					if (this.enables[buttonName] === false)
						$button.attr('disabled', 'disabled');
				}
			});

			if (!this.rendered) {
				this.cache.$container.append($toolbar);
				this.$el.addClass('has-toolbar');
			}
		}
	}

	/**
	 * Set new buttons.
	 * @public
	 * @version 2.0.0
	 * @param {Object} buttons - Object that describe toolbar buttons, use key as event name and value as label. `{}` if no buttons are wanted.
	 * @param {Object} [enables] - Object that describe which button should be enabled or not. If `undefined` all buttons will be enabled.
	 * @example
	 * const buttons = {
	 *   pay: 'Pay',
	 *   cancel: 'Cancel'
	 * };
	 * const enableButtons = {
	 *   pay: false,
	 *   cancel: true
	 * };
	 * modalView.setButtons(buttons, enableButtons);
	 */
	setButtons(buttons, enables) {
		this.buttons = buttons;
		if (typeof enables === 'undefined') {
			let enables = {};
			let buttonCodes = _.keys(buttons);
			_(buttonCodes).forEach(function (aButtonCode) {
				enables[aButtonCode] = true;
			});
		}
		else {
			this.enables = enables;
		}

		if ( this.rendered )
			this.renderToolbar();
	}

	/**
	 * Enable or disable a single button.
	 * @public
	 * @version 2.0.0
	 * @param {string} buttonName - Button key to enable or disable.
	 * @param {bool} enabled -
	 */
	setButtonEnabled(buttonName, enabled) {
		this.enables[buttonName] = enabled;
		if (this.enables[buttonName])
			this.$el.find('[data-button-name="' + buttonName + '"]').removeAttr('disabled');
		else
			this.$el.find('[data-button-name="' + buttonName + '"]').attr('disabled', 'disabled');
	}

	/**
	 * Check if a button is enabled.
	 * @public
	 * @version 2.0.0
	 * @param {string} buttonName - Button key.
	 */
	isButtonEnabled(buttonName) {
		return this.enabled[buttonName];
	}

	/**
	 * Cancel method called when the overlay is tapped.
	 * @private
	 * @version 2.0.0
	 * @fires ModalView#cancel
	 * @param {Object} buttons - Object that describe toolbar buttons, use key as event name and value as label. `{}` if no buttons are wanted.
	 * @param {Object} [enables] - Object that describe which button should be enabled or not. If `undefined` all buttons will be enabled.
	 */
	cancel(e) {
		if (e) e.preventDefault();
		if (this.onCancel)
			this.onCancel();
		this.trigger('cancel');
	}

	/**
	 * Close event method.
	 * @private
	 * @version 2.0.0
	 */
	onClose(e) {
		if (e)
			e.preventDefault();
		this.close();
	}

	/**
	 * Close the modal view.
	 * @public
	 * @version 2.0.0
	 */
	close() {
		$(':focus').blur();
		if (this.viewstack) {
			this.viewstack.popView(this, { animated: true });
		}
	}

	/**
	 * Called when a button is clicked.
	 * @private
	 * @version 2.0.0
	 * @fires ModalView#buttonNameEvent
	 */
	onButtonClick(e) {
		if (e) e.preventDefault();
		let $target = $(e.target);
		let buttonName = $target.attr('data-button-name');
		if (this.cache[buttonName]) return;

		this.cache[buttonName] = true;

		let callbackFunction = 'on' + capitalize(buttonName);
		let triggerEvent = true;

		if (callbackFunction in this) {
			triggerEvent = this[callbackFunction]() !== false;
		}

		if (triggerEvent)
			this.trigger(buttonName);

		setTimeout(() => {
			this.cache[buttonName] = false;
		}, 300);
	}

	/**
	 * Stop touch moves on the overlay and prevent the touch to pass through.
	 * @private
	 * @version 2.0.0
	 */
	onOverlayTouchMove(e) {
		e.preventDefault();
	}

};
