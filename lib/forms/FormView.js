var $                 = require('jquery');
var _                 = require('underscore');
var moment            = require('moment');
var context           = require('context');
var getVendorStyle    = require('../utils/style').getVendorStyle;
var translate3d       = require('../utils/style').translate3d;
var overflowScrolling = require('../utils/style').overflowScrolling;
var BaseView          = require('../BaseView');



var FormView = module.exports = BaseView.extend({

	tagName: 'form',

	initialize: function initialize(options) {
		FormView.__super__.initialize.apply(this, arguments);

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
		this.listenTo(this.model, 'invalid', this.onInvalid);

		this.el.style[getVendorStyle('transition')] = 'transform 300ms';

		if (context.device)
			this.isAndroid = context.device.isAndroid();
	},

	getFieldsValue: function getFieldsValue() {
		var self    = this;
		var fields  = this.$el.find('[data-field]');
		var results = {};
		var aValue;
		var anInputType;
		var aName;
		var $aField;

		if (typeof this.onBeforeGetFieldsValue === 'function')
			this.onBeforeGetFieldsValue();

		_(fields).each(function(aField){
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

		if (typeof this.onAfterGetFieldsValue === 'function')
			results = this.onAfterGetFieldsValue(results);

		return results;
	},

	getTypeFromInputField: function getTypeFromInputField(field) {
		var type;
		var $field;

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
	},

	fillFields: function fillFields( forceChange ) {
		var self   = this;
		var fields = this.$el.find('[data-field]');
		var aName;
		var anInputType;
		var aValue;
		var $aField;
		_(fields).each(function(aField){
			$aField     = $(aField);
			aName       = $aField.attr('data-field');
			anInputType = self.getTypeFromInputField(aField);
			aValue      = self.model.get(aName);
			switch (anInputType) {
				case 'date':
					if (moment(aValue).isValid())
						$aField.val(moment(aValue).format('YYYY-MM-DD'));
					break;
				case 'checkbox':
					var trueValue = true;
					var falseValue = false;

					if (!!$aField.attr('data-true-value'))
						trueValue = $aField.attr('data-true-value');
					if (!!$aField.attr('data-false-value'))
						falseValue = $aField.attr('data-false-value');

					if (aValue == trueValue){
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
	},

	findField: function findField(name) {
		return this.$el.find('[data-field="' + name + '"]');
	},

	invalidateField: function invalidateField(field) {
		this.findField(field).addClass('ui-form-invalid');
	},

	scrollToInvalidField: function scrollToInvalidField($target) {
		var $scroller = this.cache.$scroller;

		if (!$scroller)
			return;

		// Stop scrolling
		var scroller = $scroller.get(0);
		overflowScrolling(scroller, false);

		// Reset the shift if necessary
		if (this.shift > 0) {
			this.el.style[getVendorStyle('transform')] = '';
			this.shift = 0;
		}

		var positionTop   = parseInt($target.position().top);
		var oldScroll     = $scroller.scrollTop();
		var newScroll     = oldScroll + positionTop - this.options.scrollPan;
		var currentDevice = context.device.getOS();
		var nameDevice    = currentDevice.name.toLowerCase();

		// For old devices we scroll without the animation
		if ((nameDevice == 'android' && currentDevice.version < 5) || nameDevice == 'windows phone') {
			requestAnimationFrame(function(){
				$scroller.scrollTop(newScroll);
				overflowScrolling(scroller, true);
			});
		}
		else {
			requestAnimationFrame(function(){
				$scroller.animate({
					scrollTop: newScroll
				}, 200, () => {
					overflowScrolling(scroller, true);
				});
			});
		}
	},

	onInvalid: function onInvalid(model) {
		this.cache.invalidateFields = [];
		var self = this;
		var errors = model.validationError;
		if (!_.isArray(errors)) errors = [ errors ];
		_.forEach(errors, function(anValidationError){
			self.invalidateField(anValidationError.field);
			self.$el.find('[data-invalid-field="' + anValidationError.field + '"]')
				.text(anValidationError.message);
			self.$el.find('[for="' + anValidationError.field + '"]')
				.addClass('ui-form-label-invalid');
			self.cache.invalidateFields.push(anValidationError.field);
		});
		// Scroll to the first invalid field
		$(':focus').blur();
		var $firstInvalidField = this.findField(errors[0].field);
		this.scrollToInvalidField($firstInvalidField);
	},

	onInputChange: function onInputChange(e) {
		var $target = $(e.target);
		var field   = $target.attr('data-field');

		if (_.contains(this.cache.invalidateFields, field)) {
			$target.removeClass('ui-form-invalid');
			this.$el.find('[data-invalid-field="' + field + '"]').text('');
			this.$el.find('[for="' + field + '"]').removeClass('ui-form-label-invalid');
			this.cache.invalidateFields = _.without(this.cache.invalidateFields, field);
		}
	},

	submit: function submit(e) {
		e.preventDefault();
		e.stopPropagation();
		if ( this.onSubmit )
			this.onSubmit( this.getFieldsValue() );
		return false;
	},

	onFocus: function onFocus(e) {
		var $target   = $(e.currentTarget);
		var $scroller = this.cache.$scroller;

		if ($target.is(':checkbox'))
			return;

		if (this.isAndroid) {
			var targetType = this.getTypeFromInputField($target);
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

		var scroller = $scroller.get(0);

		// FIX: stop the possible momentun before moving to the first invalid field.
		//      That prevent an horrible bounce effect.
		if (e.stopScroll) {
			overflowScrolling(scroller, false);
		}

		this.$focusedField = $target;

		var positionTop    = parseInt($target.position().top);
		var formHeight     = this.$el.height();
		var scrollerHeight = $scroller.innerHeight();
		var oldScroll      = $scroller.scrollTop();
		var newScroll      = oldScroll + positionTop - this.options.scrollPan;
		var currentDevice  = context.device.getOS();
		var nameDevice     = currentDevice.name.toLowerCase();

		// If the input is positioned at the bottom of the view, we have to add
		// some padding-bottom
		if (formHeight - (positionTop + oldScroll) < scrollerHeight) {
			var oldShift = this.shift;
			this.shift = positionTop + this.shift - this.options.scrollPan;
			translate3d(this.el, 0, -this.shift, 0);
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
				requestAnimationFrame(function (){
					$scroller.scrollTop(newScroll);
					if (e.stopScroll) {
						overflowScrolling(scroller, true);
					}
				});
			}
			else {
				requestAnimationFrame(function (){
					$scroller.animate({
						scrollTop: newScroll
					}, 200, () => {
						// FIX: force redraw of the input's carret to fix an iOS glitch
						$target.toggleClass('force-redraw');
						if (e.stopScroll) {
							overflowScrolling(scroller, true);
						}
					});
				});
			}
		}
	},

	onBlur: function onBlur(e) {
		this.$focusedField = null;
		if (this.shift > 0) {
			// If there is a shift due to the keyboard, we wait 100ms
			// and then remove the shift. If a focus event occur during this
			// time span, the setTimeout is cleard.
			var self = this;
			this.blurTimeoutHandler = setTimeout(() => {
				self.el.style[getVendorStyle('transform')] = '';
				self.shift = 0;
			}, 100);
		}
	},

	onTouchMove: function onTouchMove(e) {
		if (this.$focusedField && this.$focusedField.length > 0 && this.$focusedField.is(':focus') ) {
			this.$focusedField.blur();
		}
	}

});
