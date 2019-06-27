import _ from "underscore";
import $ from "jquery";
import BaseView from "../BaseView";

export default class RadioButtonsField extends BaseView {

	className() {
		return 'ui-input ui–radio-buttons '+ ( _.result(this, 'addClass') || '' );
	}

	constructor(options) {
		super(options);

		this.selectedValue;

		this.options = _.defaults(this.options || {}, {
			selectedValue:    null,
			field:            'radio',
			fieldIdPrefix:    'radio-button-',
			label:            null,
			disabled:         false,
			invalid:          false,
			addClass:         null,
			radioButtonClass: 'radio-button',
			radioButtons: [
				{ label: 'Yes', value: 1 },
				{ label: 'No', value: 0 }
			]
		});

		this.addEvents({
			['click .' + this.options.radioButtonClass]: 'onRadioButtonClick'
		});
	}

	onRender(rendered) {
		if (!rendered) {
			if (this.options.addClass) this.$el.addClass( this.options.addClass );

			if (this.options.label instanceof $) {
				this.cache.$label = this.options.label;
				this.cache.$label.addClass('ui-radio-label');
			} else {
				this.cache.$label = $('<div class="ui-radio-label"></div>');
				this.cache.$label.text( this.options.label );
			}

			this.cache.$radioWrapper = $('<div class="ui-radio-wrapper"></div>');

			this.$el.append(
				this.cache.$label,
				this.cache.$radioWrapper
			);

			this.renderRadioButtons();

			if (this.options.invalid) {
				this.$el.append(
					$('<div>').addClass('ui-input-invalid').attr('data-invalid-field', this.options.field)
				);
			}
			if (this.options.disabled) this.setEnabled(false);
		};

		// Seleziono il valore predefinito o quello precedente
		if (!this.getValue() && (this.selectedValue || !_.isNull(this.options.selectedValue))) {
			let selectedValue = this.selectedValue || this.options.selectedValue;
			let $selectedRadio = this.cache.$radioWrapper.find(`input[type="radio"][value="${selectedValue}"]`);
			$selectedRadio.prop('checked', true);
		}
	}

	renderRadioButtons() {
		this.options.radioButtons.forEach((radioButton, i) => {
			let value = radioButton.value;
			let label = radioButton.label;
			let id    = this.options.fieldIdPrefix + value;

			let $radioButton = $(`<div class="ui-radio-button ${this.options.radioButtonClass}"></div>`);
			let $input = $(`<input type="radio" id="${id}" data-field="${this.options.field}" name="${this.options.field}" value="${value}">`);

			$radioButton.append(
				$input,
				$(`<label for="${id}"></label>`).text( label )
			);
			this.cache.$radioWrapper.append($radioButton);
		});
	}

	onRadioButtonClick(e) {
		e.preventDefault();
		e.stopPropagation(); // Consider the event only one time

		if (!e.currentTarget || this.disabled) return;

		let $input = $(e.currentTarget).find('input');
		$input.prop('checked', true);

		this.setValue($input.val(), { setRadioButton: false }); // Radio button value already set
	}

	setValue(value, options) {
		options = _.defaults(options || {}, {
			setRadioButton: true,
			silent: false
		});

		this.selectedValue = value;

		if (options.setRadioButton && this.cache.$radioWrapper) {
			let $input = this.cache.$radioWrapper.find(`input[value="${value}"]`);
			if ($input) $input.prop('checked', true);
		}

		if (!options.silent) this.trigger('change', value);
	}

	getValue() {
		return this.selectedValue;
	}

	setEnabled(enabled) {
		// Enable
		if (enabled && this.disabled && this.cache.$radioWrapper) {
			this.$el.removeClass('disabled');
			this.disabled = false;
			let $inputs = this.cache.$radioWrapper.find('input');
			if ($inputs) $inputs.removeAttr('disabled');
		}
		// Disable
		if (!enabled && !this.disabled && this.cache.$radioWrapper) {
			this.$el.addClass('disabled');
			this.disabled = true;
			let $inputs = this.cache.$radioWrapper.find('input');
			if ($inputs) $inputs.attr('disabled', 'disabled');
		}
	}
}
