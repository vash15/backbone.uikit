var $        = require('jquery');
var _        = require('underscore');
var _s       = require('underscore.string');
var BaseView = require('../BaseView');

var TextField = module.exports = BaseView.extend({

	className: 'input text',

	initialize: function initialize(options) {
		TextField.__super__.initialize.apply(this, arguments);

		this.addEvents({
			'focus input' :  'onFocus',
			'blur input'  :  'onBlur',
			'change input':  'onChange',
			'keyup input' :  'onChange'
		});

		if (!options || !_.isObject(options) )
			throw new Error('No options provided');

		if (!options.field)
			throw new Error('The field option is required');

		this.options = {
			'field': options.field,
			'multiline': options.multiline || false,
			'label': options.label,
			'maxLength': options.maxLength,
			'id': options.fieldId,
			'type': options.type || 'text',
			'className': options.className || '',
			'filled': options.filled || false ,
			'autocorrect': options.autocorrect || false,
			'inputmode': options.inputmode || null
		};

		var ctx = this.getContext();
		var os = ctx.device.getOS();
		if (os.name == 'Android' && os.version < 5)
			this.options.filled = true;

		this.textFieldAttributes = {
			'data-field': this.options.field
		};

		if (this.options.id)
			this.textFieldAttributes['id'] = this.options.id;

		if (this.options.maxLength)
			this.textFieldAttributes['maxlength'] = this.options.maxLength;

		if (this.options.className)
			this.className += this.options.className;

		if (this.options.autocorrect)
			this.textFieldAttributes['autocorrect'] = 'off';

		if (this.options.inputmode) {
			this.textFieldAttributes['inputmode'] = this.options.inputmode;
			if (this.options.inputmode == 'numeric')
				this.textFieldAttributes['pattern'] = '[0-9]*';
		}
	},

	render: function render() {
		this.$characterCount = null;
		this.$label = null;

		this.$el.empty();

		if (this.options.label) {
			this.$label = $("<label>").attr({ "for": this.options.id }).text(this.options.label);
			this.$el.append(this.$label);
		}

		if (this.options.multiline)
			this.$textfield = $('<textarea>').attr(this.textFieldAttributes);
		else
			this.$textfield = $('<input type="' + this.options.type + '">').attr(this.textFieldAttributes);

		this.$el.append(this.$textfield);

		if(this.options.maxLength) {
			this.$characterCount = $('<span>').addClass('characterCount');
			this.$el.append(this.$characterCount);
		}

		if (this.options.filled) {
			this.$el.addClass("filled");
		}

		return this;
	},

	onFocus: function onFocus() {
		this.$el.addClass('active');
		this.trigger('focus', this);
	},

	onBlur: function onBlur() {
		this.$el.removeClass("active");
		if ( this.textFieldLength() > 0 || this.options.filled)
			this.$el.addClass("filled");
		else
			this.$el.removeClass("filled");
	},

	onChange: function onChange(e) {
		var fieldLength = this.textFieldLength();
		if ( this.$characterCount && this.textFieldAttributes.maxlength) {
			this.$characterCount.text(this.textFieldAttributes.maxlength - fieldLength);
		}
		if ( fieldLength > 0 )
			this.$el.addClass('filled');
		else
			this.$el.removeClass('filled');
	},

	textFieldLength: function textFieldLength() {
		var str = this.$textfield.val();
		if (!str)
			return 0;
		var lns = str.match(/\n/g);
		if (lns)
			return str.length + lns.length;
		return str.length;
	},

	getValue: function getValue() {
		return this.$textfield.val();
	}

});
