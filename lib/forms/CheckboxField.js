import _        from "underscore";
import $        from "jquery";
import BaseView from "../BaseView";

export default class CheckboxField extends BaseView {

	className() {
		return 'ui-input ui-input-checkbox';
	}

	constructor(options) {
		super(options);

		this.setDefaultsOptions({
			'fieldId':    null,
			'field':      null,
			'label':      null,
			'trueValue':  'true',
			'falseValue': 'false',
			'checked':    false,
			'invalid':    null
		});

		if (!this.options.field)
			throw new Error('CheckboxField field option is required');

		this.addEvents({
			'change input': 'onChange'
		});
	}

	onRender(rendered) {
		if (rendered) return;

		/*
		<!-- Example -->
		<div class="input checkbox">
			<div class="check">
				<input type="checkbox" id="newsletterSignup" data-field="newsletter" data-true-value="true" data-false-value="false" />
				<label for="newsletterSignup"></label>
			</div><label for="newsletterSignup"><%= __('Registrati alla newsletter') %></label>
		</div>
		*/

		this.$el.empty();
		this.cache.$check    = $('<div>').addClass('check');
		this.cache.$checkbox = $('<input>').attr({
			'type':             'checkbox',
			'id':               this.options.fieldId,
			'data-field':       this.options.field,
			'data-true-value':  this.options.trueValue,
			'data-false-value': this.options.falseValue
		});
		this.cache.$checkLabel = $('<label>').attr({
			'for': this.options.fieldId
		});
		this.cache.$label = $('<label>').attr({
			'for': this.options.fieldId
		}).text(this.options.label);

		if (this.options.checked)
			this.cache.$checkbox.prop('checked', true);

		this.cache.$check.append(
			this.cache.$checkbox,
			this.cache.$checkLabel
		);

		this.$el.append(
			this.cache.$check,
			this.cache.$label
		);

		if(this.options.invalid)
			this.$el.append($('<div>').addClass('ui-input-invalid').attr('data-invalid-field', this.options.field));

		return this;
	}

	toggle() {
		let newValue = '';
		if (this.cache.$checkbox.is(':checked')) {
			newValue  = this.options.trueValue;
		}
		else {
			newValue  = this.options.falseValue;
		}
		this.setValue(newValue);
	}

	setValue(newValue){
		this.options.checked = newValue;
		let isActive = this.options.checked === this.options.trueValue;
		this.cache.$checkbox.prop('checked', isActive );
		if ( isActive )
			this.$el.addClass('active');
		else
			this.$el.removeClass('active');
		this.trigger('change', this.options.checked);
	}

	getValue(){
		return this.options.checked;
	}

	onChange($ev, newValue){
		this.toggle();
	}


}
