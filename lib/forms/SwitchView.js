import _        from "underscore";
import $        from "jquery";
import BaseView from "../BaseView";

export default class SwitchView extends BaseView {

	className() { return 'ui-switch'; }

	constructor(options) {
		super(options);

		this.options = _.defaults(this.options || {},  {
			field:    null, // Set field name if SwitchView is wrapped into a form
			fieldId:  null,
			disabled: false,
			invalid:  false,
			selected: null,
			buttons:  []
		});

		if (!this.options.fieldId && this.options.field) {
			this.options.fieldId = this.options.field;
		}

		this.addEvents({
			'click button': 'onSwitch',
			'input input':  'onInputChange',
			'change input': 'onInputChange'
		});

		if (!options.buttons)
			throw new Error('Cannot initialize SwitchView without buttons');

		this.buttons = options.buttons;
		this.selectButton(options.selected || this.buttons[0].value);
	}

	onRender(rendered) {
		if ( rendered ) return this;

		this.undelegateEvents();
		this.$el.empty();
		_(this.buttons).each((aButton) => {
			this.addButton(aButton);
		});
		this.delegateEvents();

		// If SwitchView is wrappet into a form, then create input field
		if (this.options.field) {
			this.cache.$input = $('<input type="hidden" />').attr('data-field', this.options.field);
			this.cache.$input.val( this.selectedButton ? this.selectedButton.value : this.buttons[0].value);

			if (this.options.fieldId)
				this.cache.$input.attr('id', this.options.fieldId);

			this.$el.append( this.cache.$input );

			if (this.options.invalid)
				this.$el.append($('<div>').addClass('ui-input-invalid').attr('data-invalid-field', this.options.field));
		}

		if (this.options.disabled) this.setEnabled(false);

		return this;
	}

	addButton(button) {
		let $button = $('<button>').addClass('button').attr({ 'data-value': button.value });

		if (button.label instanceof BaseView) {
			this.addSubView(`button-${button.value}-label`, button.label);
			$button.append(button.label.el);
			button.label.render();
		} else if (button.label) {
			$button.append(button.label);
		}

		if (button.icon)
			$button.append( $('<i>').addClass(button.icon) );

		if (this.selectedButton && this.selectedButton.value == button.value)
			$button.addClass('active');

		this.cache[button.value] = $button;

		this.$el.append($button);

		return this;
	}

	// changeButton(value, buttonChanges) {
	// 	const $button = this.cache[button.value];
	//
	// 	if (!$button)
	// 		return this;
	//
	// 	if (!buttonChanges)
	// 		return this;
	//
	// 	if (buttonChanges.label instanceof BaseView) {
	// 		this.removeSubView(`button-${button.value}-label`);
	// 		$button.append(buttonChanges.label.el);
	// 		buttonChanges.label.render();
	// 	}
	// 	else if (buttonChanges.label) {
	// 		$button
	// 			.empty()
	// 			.append(buttonChanges.label);
	// 	}
	//
	// 	if (buttonChanges.icon)
	// 		$button.append($('<i>').addClass(buttonChanges.icon));
	// }

	selectButton(value, options) {
		options = _.defaults(options || {}, {
			silent: false
		});

		if (this.selectedButton && this.selectedButton.value == value) return;

		if (this.selectedButton && this.cache[this.selectedButton.value])
			this.cache[this.selectedButton.value].removeClass('active');

		this.selectedButton = _.find(this.buttons, (aButton) => aButton.value == value);

		if (this.cache[value])
			this.cache[value].addClass('active');

		if (this.options.field && this.cache.$input) {
			this.cache.$input.val(value);

			if (!options.silent)
				this.cache.$input.trigger('input').trigger('change');
		}

		if (!options.silent)
			this.trigger('select', value, this.selectedButton);
	}

	onSwitch(e) {
		e.preventDefault();

		if (this.disabled) return;

		let $target = $(e.target);
		let value = $target.attr('data-value');
		if (!value)
			value = $target.parent().attr('data-value');
		this.selectButton(value);
	}

	getValue() {
		return this.selectedButton.value;
	}

	setEnabled(enabled) {
		// Enable
		if (enabled && this.disabled) {
			this.$el.removeClass("disabled");
			this.disabled = false;
			if (this.cache.$input)
				this.cache.$input.removeAttr("disabled");
		}
		// Disable
		if (!enabled && !this.disabled) {
			this.$el.addClass("disabled");
			this.disabled = true;
			if (this.cache.$input)
				this.cache.$input.attr("disabled", "disabled");
		}
	}

	onInputChange() {
		if (this.cache.$input) {
			this.selectButton(this.cache.$input.val());
		}
	}

};
