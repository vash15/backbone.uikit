import _        from "underscore";
import $        from "jquery";
import BaseView from "../BaseView";

export default class CheckboxField extends BaseView {

	className() {
		return 'ui-input ui-input-checkbox '+ ( _.result(this, 'addClass') || '' );
	}

	constructor(options) {
		super(options);

		this.setDefaultsOptions({
			type:      'checkbox', // checkbox or radio
			fieldId:    null,
			field:      null,
			fieldName:  null,
			label:      null,
			trueValue:  'true',
			falseValue: 'false',
			disabled:   false,
			checked:    false,
			invalid:    null,
			addClass:   null
		});

		if (!this.options.field) {
			throw new Error('CheckboxField field option is required');
		}

		if (!this.options.fieldId && this.options.field) {
			this.options.fieldId = this.options.field;
		}

		if (this.options.addClass) {
			this.$el.addClass(this.options.addClass);
		}

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

		let attrs = {
			'type':             this.options.type,
			'id':               this.options.fieldId,
			'data-field':       this.options.field,
			'data-true-value':  this.options.trueValue,
			'data-false-value': this.options.falseValue
		};

		if ( this.options.fieldName )
			attrs.name = this.options.fieldName;

		this.$el.empty();
		this.cache.$check    = $('<div />').addClass('check');
		this.cache.$checkbox = $('<input />').attr(attrs);


		this.cache.$checkLabel = $('<label>').attr({
			'for': this.options.fieldId
		});
		this.cache.$label = $('<label class="checkbox-label">').attr({
			'for': this.options.fieldId
		});

		if (_.isFunction(this.options.label)) {
			this.cache.$label.html(this.options.label());
		} else {
			this.cache.$label.text(this.options.label);
		}

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

		if (this.options.checked) {
			this.setValue(this.options.trueValue);
		}

		if (this.options.disabled) this.setEnabled(false);

		return this;
	}

	toggle() {
		let newValue = '';
		if (this.cache.$checkbox.is(':checked')) {
			newValue = this.options.trueValue;
		} else {
			newValue = this.options.falseValue;
		}
		this.setValue(newValue);
	}

	setValue(newValue, options) {
		options = _.defaults(options || {}, {
			silent: false
		});
		this.options.checked = newValue;
		let isActive = this.options.checked === this.options.trueValue;
		this.cache.$checkbox.prop('checked', isActive );
		if (isActive) {
			this.$el.addClass('active');
		} else {
			this.$el.removeClass('active');
		}
		if (!options.silent) this.trigger('change', this.options.checked, this);
	}

	getFieldId(){
		return this.options.fieldId;
	}

	getValue() {
		return this.options.checked;
	}

	onChange($ev, newValue) {
		this.toggle();
	}

	setEnabled(enabled) {
		// Enable
		if (enabled && this.disabled) {
			this.$el.removeClass('disabled');
			this.disabled = false;
			if (this.cache.$checkbox) this.cache.$checkbox.removeAttr('disabled');

		}
		// Disable
		if (!enabled && !this.disabled) {
			this.$el.addClass('disabled');
			this.disabled = true;
			if (this.cache.$checkbox) this.cache.$checkbox.attr('disabled', 'disabled');
		}
	}
}
