
import _ from "underscore";
import { capitalize } from "underscore.string";
import $ from "jquery";
import BaseView from '../BaseView';

export default class ModalView extends View {

	className() {
		return 'ui-modal ' + _.result( this, 'addClass', '');
	}

	constructor(options) {
		super(options);

		let state = this.getState();

		this.options   = _.defaults(options||{}, { viewstack: state.viewstack || context.viewstack });
		this.viewstack = this.options.viewstack;
		this.template  = require('../../templates/dialogs/modal.html');

		delete this.options.viewstack;

		var defaultButtons = {
			cancel: 'Cancel',
			confirm: 'Ok'
		};

		this.addEvents({
			'click .toolbar button'  : 'onButtonClick',
			'click .overlay'         : 'cancel',
			'touchmove .overlay'     : 'onOverlayTouchMove'
		});

		options = _.defaults(options || {}, {
			buttons: defaultButtons
		});

		this.buttons = options.buttons;
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

		this.cache.$container = this.findPlaceholder('container');

		if (this.getTitle()) {
			let title = $('<h1>').addClass('title').text(this.getTitle());
			this.cache.$container.addClass('withTitle').prepend(title);
		}

		this.renderToolbar();

		this.cache.height = this.$el.height();
		this.cache.scrollHeight = this.el.scrollHeight;

		return this;
	}

	renderToolbar() {
		// Toolbar
		if (!_.isEmpty(this.buttons)) {
			let $toolbar = this.cache.$toolbar = $('<div>').addClass('toolbar');
			let $button;

			_(this.buttons).each((label, buttonName) => {
				if ( _.isString(label) && !_.isEmpty(label) ){
					$button = $('<button>')
								.attr({'data-button-name': buttonName })
								.addClass('button')
								.addClass(buttonName)
								.text(label)
								.appendTo($toolbar);

					if (this.enables[buttonName] === false)
						$button.attr('disabled', 'disabled');
				}
			});

			this.$el.find('.container').append($toolbar);
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

		if ( this._rendered )
			this.renderToolbar();
	}

	cancel(e) {
		if (e) e.preventDefault();
		if (this.onCancel)
			this.onCancel();
		this.trigger('cancel');
	}

	onButtonClick(e) {
		if (e) e.preventDefault();
		let $target = $(e.target);
		let buttonName = $target.attr('data-button-name');
		if (this.cache[buttonName]) return;

		this.cache[buttonName] = true;

		let callbackFunction = 'on' + _s.capitalize(buttonName);
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

	getTitle() {
		return this.title;
	}

	setTitle(newValue) {
		this.title = newValue;
	}

	close() {
		if (thi.viewstack){
			thi.viewstack.popView(this, { animated: true });
		}
	}

	onOverlayTouchMove(e) {
		e.preventDefault();
	}

};
