import _        from "underscore";
import $        from "jquery";
import BaseView from "../BaseView";

export default class CheckboxField extends BaseView {

	className() {
		return 'input checkbox';
	}

	constructor(options) {
		super(options);

		this.options = _.defaults(this.options, {
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
			'click': 'onClick'
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
		this.options.checked = !this.options.checked;
		this.cache.$checkbox.prop('checked', this.options.checked);
		if (this.options.checked)
			this.$el.addClass('active');
		else
			this.$el.removeClass('active');
		this.trigger('change', this.options.checked);
	}

	onClick(e) {
		e.preventDefault();
		this.toggle();
	}

}
