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
	invalid:       false,
	firstOptionEmpty: false,
	groupBy:       function
});
*/
/**
 * It rapresents an HTML select field
 * @extends BaseView
 * @version 2.0.0
 * @example
 * const argumentSelectField = new SelectField({
 *   field: 'argument',
 *   fieldId: 'argument',
 *   label: 'Argument',
 *   collection: context.collections.arguments,
 *   firstOptionEmpty: true,
 *   autoFocus: false,
 *   selectedValue: this.model.get('argument')
 * });
 * @example
 * const argumentSelectField = new SelectField({
 *   field: 'argument',
 *   fieldId: 'argument',
 *   label: 'Argument',
 *   collection: [
 *     { value: 'arg1', label: 'Foo' },
 *     { value: 'arg2', label: 'Bar' }
 *   ],
 *   firstOptionEmpty: false,
 *   selectedValue: this.model.get('argument')
 * });
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

		this.setDefaultsOptions({
			empty:            null,
			selectedValue:    null,
			disabled:         null,
			autoFocus:        false,
			label:            null,
			invalid:          false,
			accessoryBar:     true,
			addClass:         null,
			firstOptionEmpty: false,
			groupBy:          null
		});

		this.fieldAttributes = {
			'data-field': options.field
		};

		if (!this.options.fieldId && this.options.field) {
			this.options.fieldId = this.options.field;
		}

		if (options.fieldId) {
			this.fieldAttributes['id'] = options.fieldId;
		}

		if (this.options.addClass) {
			this.$el.addClass(this.options.addClass);
		}
	}

	setCollection(newCollection, newSelectedValue) {
		this.collection = newCollection;
		this.options.selectedValue = newSelectedValue;
		this.render();
	}

	onRender(rendered) {
		this.undelegateEvents();
		if ( !rendered ){
			this.$el.empty();

			if(this.options.label)
				this.$el.append($('<label>').attr('for',this.fieldAttributes['id']).append(this.options.label));

			this.cache.$field = $('<select>').attr(this.fieldAttributes);
			this.$el.append(this.cache.$field);

			if (this.options.invalid)
				this.$el.append($('<div>').addClass('ui-input-invalid').attr('data-invalid-field', this.options.field));
		}

		let $field = this.cache.$field;
		$field.empty();

		if (this.options.empty) {
			this.cache.$field.append($('<option value="">').addClass('empty').text(this.options.empty));
		}

		if ( this.options.firstOptionEmpty ){
			let labelEmpty = '';
			if ( _.isString(this.options.firstOptionEmpty) )
				labelEmpty = this.options.firstOptionEmpty;
			$field.append( $('<option>').attr('value', '').text( labelEmpty ) );
		}

		if (this.collection instanceof Collection) {
			this.renderCollection()
		} else {
			this.renderArray();
		}

		setTimeout(() => {
			if (this.options.selectedValue)
				$field.val(this.options.selectedValue);
		}, 100);


		this.rendered = true;
		this.disabled(this.options.disabled);
		this.delegateEvents();
		return this;
	}

	renderCollection() {
		let $field = this.cache.$field;
		let lastGroupBy = null;
		let aGroupBy;
		let $aGroupByElement;
		this.collection.forEach((anElement, index) => {
			if (this.options.groupBy) {
				if (typeof this.options.groupBy === 'function') {
					aGroupBy = this.options.groupBy(anElement);
				} else {
					aGroupBy = anElement.get(this.options.groupBy);
				}
				if (aGroupBy != lastGroupBy) {
					$aGroupByElement = $('<optgroup>').attr('label', aGroupBy);
					$field.append($aGroupByElement);
				}
			}

			let disabled  = _.result(anElement, 'isDisabled') || false;
			let $anOption = $('<option>').attr('value', anElement.id).text(anElement.toString());
			if (this.options.selectedValue != void 0 && this.options.selectedValue == anElement.id) {
				$anOption.attr('selected', 'selected');
			}
			if (disabled) {
				$anOption.attr('disabled', 'disabled');
			}

			if (this.options.groupBy) {
				$aGroupByElement.append($anOption);
				lastGroupBy = aGroupBy;
			} else {
				$field.append($anOption);
			}
		});
	}

	renderArray() {
		let $field = this.cache.$field;
		let lastGroupBy = null;
		let aGroupBy;
		let $aGroupByElement;
		this.collection.forEach((anElement) => {
			if (this.options.groupBy) {
				if (typeof this.options.groupBy === 'function') {
					aGroupBy = this.options.groupBy(anElement);
				} else {
					aGroupBy = anElement[this.options.groupBy];
				}
				if (aGroupBy != lastGroupBy) {
					$aGroupByElement = $('<optgroup>').attr('label', aGroupBy);
					$field.append($aGroupByElement);
				}
			}

			let $anOption;
			if (_.isObject(anElement)) {
				$anOption = $('<option>').attr('value', anElement.value).text(anElement.label);
				if (this.options.selectedValue != void 0 && this.options.selectedValue == anElement.value) {
					$anOption.attr('selected', 'selected');
				}
			}
			else {
				$anOption = $('<option>').attr('value', anElement).text(anElement);
				if (this.options.selectedValue != void 0 && this.options.selectedValue == anElement) {
					$anOption.attr('selected', 'selected');
				}
			}

			if (this.options.groupBy) {
				$aGroupByElement.append($anOption);
				lastGroupBy = aGroupBy;
			} else {
				$field.append($anOption);
			}
		});
	}

	onChange(e) {
		let model = this.getValue();
		if (!model) model = null;
		this.trigger('change', model);
	}

	disabled(value) {
		this.options.disabled = value;
		if (this.rendered) {
			if (value) {
				this.$el.addClass('disabled');
				this.cache.$field.attr('disabled', 'disabled');
			} else {
				this.$el.removeClass('disabled');
				this.cache.$field.removeAttr('disabled');
			}
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
		let hideFormAccessoryBar;
		if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard && cordova.plugins.Keyboard.hideKeyboardAccessoryBar ) {
			hideFormAccessoryBar = cordova.plugins.Keyboard.hideKeyboardAccessoryBar;
		}else if ( window.Keyboard && window.Keyboard.hideFormAccessoryBar ){
			hideFormAccessoryBar = window.Keyboard.hideFormAccessoryBar;
		}
		if (!_.isFunction(hideFormAccessoryBar))
			hideFormAccessoryBar = ()=>{};
		hideFormAccessoryBar(!this.options.accessoryBar);
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
