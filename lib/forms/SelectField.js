import _            from "underscore";
import $            from "jquery";
import {Collection} from "backbone"
import context      from "context-utils";
import BaseView     from "../BaseView";

/*
new SelectField({
	fieldId:       'colorField',
	field:         'color',
	collection:    Colors,
	selectedValue: 'blue',
	empty:         'No color',
	disabled:      false,
	invalid:       false
});
*/
export default class SelectField extends BaseView {

	className() { return 'ui-select-field' }

	constructor(options) {
		super(options);

		this.addEvents({
			'touchstart':    'onTouchStart',
			'focus select':  'onFocus',
			'blur select':   'onBlur',
			'change select': 'onChange',
			'click':         'onClick'
		});

		if (!options)
			throw new Error('No options provided');

		if (!options.field)
			throw new Error('The field option is required');

		this.options = _.defaults(this.options, {
			empty:         null,
			selectedValue: null,
			disabled:      null,
			autoFocus:     false,
			label:         null,
			invalid:       false,
			accessoryBar:  true
		});

		this.fieldAttributes = {
			'data-field': options.field
		};

		if (options.fieldId)
			this.fieldAttributes['id'] = options.fieldId;
	}

	setCollection(newCollection, newSelectedValue) {
		this.collection = newCollection;
		this.options.selectedValue = newSelectedValue;
		this.render();
	}

	onRender(rendered) {
		if ( rendered ) return this;

		this.undelegateEvents();

		this.$el.empty();

		if(this.options.label)
			this.$el.append($('<label>').attr('for',this.fieldAttributes['id']).append(this.options.label));

		let $field = this.cache.$field = $('<select>').attr(this.fieldAttributes);

		if (this.options.empty) {
			$field.append($('<option value="">').addClass('empty').text(this.options.empty));
		}

		this.$el.append(this.cache.$field);

		if (this.collection instanceof Collection) {
			this.collection.forEach((anElement) => {
				let $anOption = $('<option>').attr('value', anElement.id).text(anElement.toString());
				if (this.options.selectedValue == anElement.id) $anOption.attr('selected', 'selected');
				$field.append($anOption);
			});
		}
		else {
			this.collection.forEach((anElement) => {
				let $anOption;
				if (_.isObject(anElement)) {
					$anOption = $('<option>').attr('value', anElement.value).text(anElement.label);
					if (this.options.selectedValue == anElement.value) $anOption.attr('selected', 'selected');
				}
				else {
					$anOption = $('<option>').attr('value', anElement).text(anElement);
					if (this.options.selectedValue == anElement) $anOption.attr('selected', 'selected');
				}
				$field.append($anOption);
			});
		}

		setTimeout(() => {
			if (this.options.selectedValue)
				$field.val(this.options.selectedValue);
		}, 100);

		this.disabled(this.options.disabled);

		if (this.options.invalid)
			this.$el.append($('<div>').addClass('ui-input-invalid').attr('data-invalid-field', this.options.field));

		this.delegateEvents();
		return this;
	}

	onChange(e) {
		let model = this.getValue();
		if (!model) model = null;
		this.trigger('change', model);
	}

	disabled(value) {
		this.options.disabled = value;
		if (this._rendered) {
			if (value)
				this.cache.$field.attr('disabled', 'disabled');
			else
				this.cache.$field.removeAttr('disabled');
		}
	}

	setSelectedValue(value) {
		this.options.selectedValue = value;
	}

	onClick(e) {
		if (this.options.autoFocus)
			this.cache.$field.focus();
	}

	getValue() {
		let value;
		if (this.collection instanceof Collection )
			value = this.collection.get(this.cache.$field.val());
		else
			value = this.cache.$field.val();
		return value;
	}

	onTouchStart() {
		if (this.options.accessoryBar == false && typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
		}
	}

	onFocus() {
		this.trigger('focus', this);
	}

	onBlur() {
		if (this.options.accessoryBar == false && typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		this.trigger('focus', this);
	}

};
