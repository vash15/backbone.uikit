import _        from "underscore";
import $        from "jquery";
import context  from "context-utils";
import moment   from "moment";
import BaseView from "../BaseView";
import { getVendorStyle, translate3d, overflowScrolling } from "../utils/style";

export default class FormView extends BaseView {

	tagName() { return 'form' }

	constructor(options) {
		super(options);

		this.addEvents({
			'submit':             'submit',
			'change input[type="checkbox"],select': 'onInputChange',
			'input input':        'onInputChange',
			'focus input,select': 'onFocus',
			'blur input,select':  'onBlur',
			'touchmove':          'onTouchMove'
		});

		this.cache.invalidateFields = [];
		this.$focusedField = null;
		this.shift = 0;
		this.blurTimeoutHandler = null;

		this.onTouchMove = _.throttle(_.bind(this.onTouchMove, this), 10);

		if ( this.model )
			this.listenTo(this.model, 'invalid', this.onInvalid);

		this.el.style[getVendorStyle('transition')] = 'transform 300ms';

		if (context.device)
			this.isAndroid = context.device.isAndroid();
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
			$aField = $(aField);

			// Checks if the field is disabled
			if ($aField.is(':disabled'))
				return;

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
		let type;
		let $field;

		if (field instanceof $)
			$field = field;
		else
			$field = $(field);

		switch ($field.prop('tagName')) {
			case 'INPUT':
				type = $field.attr('type').toLowerCase();
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

	fillFields(forceChange) {
		if ( !this.model )
			return this;
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
						$aField.val(moment(aValue).format('YYYY-MM-DD'));
					break;
				case 'checkbox':
					var trueValue  = "true";
					var falseValue = "false";

					if (!!$aField.attr('data-true-value'))
						trueValue = $aField.attr('data-true-value');
					if (!!$aField.attr('data-false-value'))
						falseValue = $aField.attr('data-false-value');

					if (aValue.toString() == trueValue){
						$aField.prop('checked', true).trigger('change', aValue);
					} else {
						$aField.prop('checked', false).trigger('change', aValue);
					}

					break;
				case 'radio':
					if (aValue == $aField.attr('value'))
						$aField.attr('checked', 'checked');
					else
						$aField.removeAttr('checked');
					break;
				default:
					$aField.val(aValue);
			}

			if ( forceChange )
				$aField.trigger('change');
		});
		return this;
	}

	findField(name) {
		return this.$el.find('[data-field="' + name + '"]');
	}

	invalidateField(field, message) {
		this.findField(field).addClass('ui-form-invalid');
		this.$el
			.find('[data-invalid-field="' + field + '"]')
			.text(message);
		this.$el
			.find('[for="' + field + '"]')
			.addClass('ui-form-label-invalid');
		this.cache.invalidateFields.push(field);
	}

	onInvalid(model) {
		this.$el.find('.ui-input-invalid').text('');
		this.$el.find('.ui-form-label-invalid').removeClass('ui-form-label-invalid');
		this.cache.invalidateFields = [];
		var errors = model.validationError;
		if (!_.isArray(errors)) errors = [ errors ];
		_.forEach(errors, (anValidationError) => {
			this.invalidateField(anValidationError.field, anValidationError.message);
		});
		// Scroll to the first invalid field
		this.scrollToFirstInvalidField(errors[0].field);
	}

	scrollToFirstInvalidField(invalidField) {
		if (!invalidField) {
			invalidField = this.cache.invalidateFields[0];
		}
		$(':focus').blur();
		let $firstInvalidField = this.findField(invalidField);
		this.scrollToInvalidField($firstInvalidField);
	}

	scrollToInvalidField($target) {
		if (!$target || !$target.position()) {
			return;
		}

		let $scroller = this.cache.$scroller;

		if (!$scroller || ($scroller instanceof $ && $scroller.length == 0) ) {
			$scroller = this.cache.$scroller = $target.parents('.overflow-scroll');
		}

		if (!$scroller || ($scroller instanceof $ && $scroller.length == 0) )
			return;

		// Stop scrolling
		let scroller = $scroller.get(0);
		overflowScrolling(scroller, false);

		// Reset the shift if necessary
		if (this.shift > 0) {
			this.el.style[getVendorStyle('transform')] = '';
			this.shift = 0;
		}

		let positionTop   = parseInt($target.position().top);
		let oldScroll     = $scroller.scrollTop();
		let newScroll     = oldScroll + positionTop - this.options.scrollPan;
		let currentDevice = context.device.getOS();
		let nameDevice    = currentDevice.name.toLowerCase();

		// For old devices we scroll without the animation
		if ((nameDevice == 'android' && currentDevice.version < 5) || nameDevice == 'windows phone') {
			this.requestAnimationFrame(() => {
				$scroller.scrollTop(newScroll);
				overflowScrolling(scroller, true);
			});
		}
		else {
			this.requestAnimationFrame(() => {
				$scroller.animate({
					scrollTop: newScroll
				}, 200, () => {
					overflowScrolling(scroller, true);
				});
			});
		}
	}

	onFocus(e) {
		if (_.isNull(this.options.scrollPan) || _.isUndefined(this.options.scrollPan)) {
			return;
		}

		let $target   = $(e.currentTarget);
		let $scroller = this.cache.$scroller;

		if ($target.is(':checkbox'))
			return;

		if (this.isAndroid) {
			let targetType = this.getTypeFromInputField($target);
			if (targetType == 'select' || targetType == 'date')
				return;
		}

		if (!$scroller) {
			$scroller = this.cache.$scroller = $target.parents('.overflow-scroll');
		}

		if (this.blurTimeoutHandler) {
			clearTimeout(this.blurTimeoutHandler);
			this.blurTimeoutHandler = null;
		}

		// If no parent with .overflow-scoll class was found then we can stop
		// the scroll process
		if (!$scroller)
			return;

		let scroller = $scroller.get(0);

		// FIX: stop the possible momentun before moving to the first invalid field.
		//      That prevent an horrible bounce effect.
		if (e.stopScroll) {
			overflowScrolling(scroller, false);
		}

		this.$focusedField = $target;

		let positionTop    = parseInt($target.offset().top);
		let formHeight     = this.$el.height();
		let scrollerHeight = $scroller.innerHeight();
		let oldScroll      = $scroller.scrollTop();
		let newScroll      = oldScroll + positionTop - this.options.scrollPan;
		let currentDevice  = context.device.getOS();
		let nameDevice     = currentDevice.name.toLowerCase();
		let isTablet       = context.device.isTablet();
		let inputType      = this.getTypeFromInputField($target);

		// For tablet I dont want a scroll if the component is a select or a date picker
		if (isTablet && (inputType == 'select' || inputType == 'date'))
			return;

		// If the input is positioned at the bottom of the view, we have to add
		// some padding-bottom
		if (formHeight - (positionTop + oldScroll) < scrollerHeight) {
			let oldShift = this.shift;
			this.shift = positionTop + this.shift - this.options.scrollPan;
			translate3d(this.el, 0, -this.shift, 0);
			if (nameDevice == 'ios') {
				this.forceCarretRedraw($target);
			}
			if (e.stopScroll) {
				overflowScrolling(scroller, true);
			}
		}
		else {
			// Reset the shift if necessary
			if (this.shift > 0) {
				this.el.style[getVendorStyle('transform')] = '';
				this.shift = 0;
			}

			// For old devices we scroll without the animation
			if ((nameDevice == 'android' && currentDevice.version < 5) || nameDevice == 'windows phone') {
				this.requestAnimationFrame(() => {
					$scroller.scrollTop(newScroll);
					if (e.stopScroll) {
						overflowScrolling(scroller, true);
					}
				});
			}
			else {
				this.requestAnimationFrame(() => {
					if (nameDevice == 'ios') {
						this.forceCarretRedraw($target);
					}
					$scroller.animate({
						scrollTop: newScroll
					}, 200, () => {
						if (e.stopScroll) {
							overflowScrolling(scroller, true);
						}
					});
				});
			}
		}
	}

	onBlur(e) {
		this.$focusedField = null;
		if (this.shift > 0) {
			// If there is a shift due to the keyboard, we wait 100ms
			// and then remove the shift. If a focus event occur during this
			// time span, the setTimeout is cleard.
			this.blurTimeoutHandler = setTimeout(() => {
				this.el.style[getVendorStyle('transform')] = '';
				this.shift = 0;
			}, 100);
		}
	}

	onInputChange(e) {
		let $target = $(e.target);
		let field   = $target.attr('data-field');

		if (_.contains(this.cache.invalidateFields, field)) {
			$target.removeClass('ui-form-invalid');
			this.$el.find('[data-invalid-field="' + field + '"]').text('');
			this.$el.find('[for="' + field + '"]').removeClass('ui-form-label-invalid');
			this.cache.invalidateFields = _.without(this.cache.invalidateFields, field);
		}

		this.trigger('change', field);
	}

	onTouchMove(e) {
		if (this.$focusedField && this.$focusedField.length > 0 && this.$focusedField.is(':focus')) {
			this.$focusedField.blur();
		}
	}

	submit(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.onSubmit)
			this.onSubmit(this.getFieldsValue());
		return false;
	}

	// FIX: force redraw of the input's carret to fix an iOS glitch
	forceCarretRedraw($target) {
		this.forceRedrawIntervalCounter = 7;
		this.forceRedrawIntervalHandler = setInterval(() => {
			this.forceRedrawIntervalCounter--;
			this.requestAnimationFrame(() => {
				$target.toggleClass('force-redraw');
			});
			if (this.forceRedrawIntervalCounter === 0) {
				clearInterval(this.forceRedrawIntervalHandler);
			}
		}, 50);
	}

};
