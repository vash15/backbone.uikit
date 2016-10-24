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
			'checked':    false
		});

		if (!this.options.field)
			throw new Error('CheckboxField field option is required');

		this.addEvents({
			'click': 'onClick',
			'click input':  'onClickInput',
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
			'for': this.options.id
		});
		this.cache.$label = $('<label>').attr({
			'for': this.options.id
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
	}

	toggle() {
		let newValue = '';
		if ( this.options.checked === this.options.trueValue ){
			newValue  = this.options.falseValue;
		}else{
			newValue  = this.options.trueValue;
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

	onClick(e) {
		this.toggle();
	}

	onClickInput(ev){
		ev.preventDefault();
		this.toggle();
		return false;
	}

	onChange($ev, newValue){
		if (_.isUndefined(newValue)|| _.isNull(newValue))
			return this;
		this.setValue(newValue);
		return this;
	}


}
