import _ from "underscore";
import context from "context-utils";
import { capitalize } from "underscore.string";
import $ from "jquery";
import BaseView from '../BaseView';

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

		// this.optionsDefaults({
		// 	viewstack: state ? state.get('viewstack') : context.viewstack
		// });

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		this.template = require('../../templates/dialogs/modal.html');

		var defaultButtons = {
			cancel: 'Cancel',
			confirm: 'Ok'
		};

		this.addEvents({
			'click .toolbar button': 'onButtonClick',
			'click .overlay':        'cancel',
			'touchmove .overlay':    'onOverlayTouchMove'
		});

		this.options = _.defaults(this.options, {
			buttons: defaultButtons,
			scroll: true
		});

		this.buttons = this.options.buttons;
		this.enables = {
			confirm: true,
			cancel: true
		};

	}

	onRender(rendered) {
		if ( rendered ) return this;

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

	renderToolbar() {
		if (!_.isEmpty(this.buttons)) {
			let $toolbar = this.cache.$toolbar;

			if (!this.rendered) {
				$toolbar = this.cache.$toolbar = $('<div>').addClass('toolbar');
			}

			_(this.buttons).each((label, buttonName) => {
				if ( _.isString(label) && !_.isEmpty(label) ){
					this.cache['button-' + buttonName] = $('<button>')
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

	cancel(e) {
		if (e) e.preventDefault();
		if (this.onCancel)
			this.onCancel();
		this.trigger('cancel');
	}

	setButtonEnabled(buttonName, enabled) {
		this.enables[buttonName] = enabled;
		if (this.enables[buttonName])
			this.$el.find('[data-button-name="' + buttonName + '"]').removeAttr('disabled');
		else
			this.$el.find('[data-button-name="' + buttonName + '"]').attr('disabled', 'disabled');
	}

	isButtonEnabled(buttonName) {
		return this.enabled[buttonName];
	}

	onClose(e) {
		if ( e )
			e.preventDefault();
		this.close();
	}

	close() {
		$(':focus').blur();
		if (this.viewstack) {
			this.viewstack.popView(this, { animated: true });
		}
	}

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


	onOverlayTouchMove(e) {
		e.preventDefault();
	}

};
