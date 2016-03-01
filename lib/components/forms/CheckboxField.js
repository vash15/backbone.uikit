var $        = require('jquery');
var _        = require('underscore');
var BaseView = require('../../BaseView');

var CheckboxField = module.exports = BaseView.extend({

	className: 'input checkbox',

	events: {
		'click': 'onClick'
	},

	initialize: function initialize(options) {
		CheckboxField.__super__.initialize.apply(this, arguments);

		this.options = {
			'fieldId':    options.fieldId,
			'field':      options.field,
			'label':      options.label,
			'trueValue':  options.trueValue  || 'true',
			'falseValue': options.falseValue || 'false',
			'checked':    options.checked || false
		};
	},

	render: function render() {
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

		return this;
	},

	toggle: function toggle() {
		this.options.checked = !this.options.checked;
		this.cache.$checkbox.prop('checked', this.options.checked);
		if (this.options.checked)
			this.$el.addClass('active');
		else
			this.$el.removeClass('active');
		this.trigger('change', this.options.checked);
	},

	onClick: function onClick(e) {
		e.preventDefault();
		this.toggle();
	}

});
