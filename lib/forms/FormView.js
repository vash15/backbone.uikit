import _        from "underscore";
import $        from "jquery";
import context  from "context-utils";
import moment   from "moment";
import BaseView from "../BaseView";

export default class FormView extends BaseView {

	tagName() { return 'form' }

	constructor(options) {
		super(options);

		this.addEvents({
			'submit': 'onSubmit',
			'input input': 'onInputChange'
		});

		this.listenTo(this.model, 'invalid', this.onInvalid);
	}

	getFieldsValue() {
		let fields  = this.$el.find('[data-field]');
		let results = {};
		let aValue;
		let anInputType;
		let aName;
		let $aField;

		if (typeof this.onBeforeGetFieldsValue === 'function')
			this.onBeforeGetFieldsValue();

		_(fields).each((aField) => {
			$aField     = $(aField);
			aName       = $aField.attr('data-field');
			anInputType = this.getTypeFromInputField(aField);
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

		if (typeof this.onAfterGetFieldsValue === 'function')
			results = this.onAfterGetFieldsValue(results);

		return results;
	}

	getTypeFromInputField(field) {
		let $field = $(field);
		let type;
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
	}

	fillFields( forceChange ) {
		var fields = this.$el.find('[data-field]');
		var aName;
		var anInputType;
		var aValue;
		var $aField;
		_(fields).each((aField) => {
			$aField     = $(aField);
			aName       = $aField.attr('data-field');
			anInputType = this.getTypeFromInputField(aField);
			aValue      = this.model.get(aName);
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
	}

	findField(name) {
		return this.$el.find('[data-field="' + name + '"]');
	}

	invalidateField(field) {
		this.findField(field).addClass('ui-form-invalid');
	}

	onInvalid(model) {
		this.invalidateField( model.validationError.field );
		if ( context.pubsub )
			context.pubsub.trigger('error', model.validationError);
	}

	onInputChange(e) {
		let $target = $(e.currentTarget);
		$target.removeClass('ui-form-invalid');
	}

	onSubmit(e) {
		e.preventDefault();
		e.stopPropagation();
	}

};
