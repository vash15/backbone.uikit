var $          = require('jquery');
var _          = require('underscore');
var moment     = require('moment');
var BaseView   = require('../BaseView');

var FormView = module.exports = BaseView.extend({
	
	tagName: 'form',

	initialize: function initialize(options) {
		this.events = {
			'submit': 'onSubmit',
			'change input': 'onInputChange'
		};
		FormView.__super__.initialize.apply(this, arguments);
		this.listenTo(this.model, 'invalid', this.onInvalid);
	},

	render: function render() {
		FormView.__super__.render.apply(this, arguments);
		return this;
	},

	getFieldsValue: function getFieldsValue() {
		var self = this;
		var fields = this.$el.find('[data-field]');
		var results = {};
		var aValue;
		var anInputType;
		var aName;
		var $aField;

		if (typeof self.onBeforeGetFieldsValue === 'function')
			self.onBeforeGetFieldsValue();

		_.each(fields, function (aField) {
			$aField     = $(aField);
			aName       = $aField.attr('data-field');
			anInputType = self.getTypeFromInputField(aField);
			switch (anInputType) {
				case 'checkbox':
					var trueValue = true;
					var falseValue = false;

					if (!!$aField.attr('data-true-value'))
						trueValue = $aField.attr('data-true-value');
					if (!!$aField.attr('data-false-value'))
						falseValue = $aField.attr('data-false-value');

					aValue = $aField.is(':checked') ? trueValue : falseValue;
					break;
				case 'radio':
					aValue = $aField.is(':checked') ? $aField.val() : undefined;
					break;
				default:
					aValue = $aField.val();
			}

			if (aValue !== undefined)
				results[aName] = aValue;
		});

		if (typeof self.onAfterGetFieldsValue === 'function')
			results = self.onAfterGetFieldsValue(results);

		return results;
	},

	getTypeFromInputField: function getTypeFromInputField(field) {
		var $field = $(field);
		var type;
		switch ($field.prop('tagName')) {
			case 'INPUT':
				type = $field.attr('type');
				break;
			case 'SELECT':
				type = 'select';
				break;
			case 'TEXTAREA':
				type = 'textarea';
				break;
			case 'BUTTON':
				type = 'button';
				break;
		}
		return type;
	},

	fillFields: function fillFields( forceChange ) {
		var self = this;
		var fields = this.$el.find('[data-field]');
		var aName;
		var anInputType;
		var aValue;
		var $aField;
		_.each(fields, function (aField) {
			$aField     = $(aField);
			aName       = $aField.attr('data-field');
			anInputType = self.getTypeFromInputField(aField);
			aValue      = self.model.get(aName);
			switch (anInputType) {
				case 'date':
					if (moment(aValue).isValid())
						$aField.val(moment(aValue).format('YYYY-MM-DD')); // .trigger('change')
					break;
				case 'checkbox':
					var trueValue = true;
					var falseValue = false;

					if (!!$aField.attr('data-true-value'))
						trueValue = $aField.attr('data-true-value');
					if (!!$aField.attr('data-false-value'))
						falseValue = $aField.attr('data-false-value');

					if (aValue == trueValue)
						$aField.attr('checked', 'checked'); // .trigger('change')
					else
						$aField.removeAttr('checked'); // .trigger('change')

					break;
				case 'radio':
					if (aValue == $aField.attr('value'))
						$aField.attr('checked', 'checked'); // .trigger('change')
					else
						$aField.removeAttr('checked'); // .trigger('change')
					break;
				default:
					$aField.val(aValue); // .trigger('change');
			}

			if ( forceChange )
				$aField.trigger('change');
			
		});
	},

	findField: function findField(name) {
		return this.$el.find('[data-field="' + name + '"]');
	},

	invalidateField: function invalidateField(field) {
		var invalidField = this.findField(field).addClass('invalid');
	},

	onInvalid: function onInvalid(model) {
		this.invalidateField(model.validationError.field);
		var ctx = this.getContext();
		ctx.pubsub.trigger('error', model.validationError);
	},

	onInputChange: function onInputChange(e) {
		var $target = $(e.currentTarget);
		$target.removeClass('invalid');
	},

	onSubmit: function onSubmit(e) {
		e.preventDefault();
		e.stopPropagation();
	}

});