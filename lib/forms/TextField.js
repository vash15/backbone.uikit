import _        from "underscore";
import $        from "jquery";
import context  from "context-utils";
import BaseView from "../BaseView";

export default class TextField extends BaseView {

	className(){
		return 'ui-input ui-input-text ' + ( _.result(this, "addClass") || '' );
	}

	constructor(options) {
		super(options);

		this.addEvents({
			'touchstart':    'onTouchStart',
			'focus input':   'onFocus',
			'blur input':    'onBlur',
			'change input':  'onChange',
			'keyup input':   'onChange'
		});

		if (!options || !_.isObject(options) )
			throw new Error('No options provided');

		if (!options.field)
			throw new Error('The field option is required');

		this.options = _.defaults(this.options, {
			field:                null,
			multiline:            false,
			label:                '',
			maxLength:            null,
			id:                   null,
			type:                 'text',
			addClass:             null,
			filled:               false ,
			autocorrect:          false,
			inputmode:            null,
			invalid:              null,
			formatCharacterCount: null,
			accessoryBar:         true,
			placeholder:          null,
			value:                null,
			disabled:             false
		});

		this.isAndroid = false;
		this.enableCharacterCount = false;
		this.textFieldAttributes = {
			'data-field': this.options.field
		};

		let os = context.device.getOS();
		if (os.name == 'Android' ){
			this.isAndroid = true;
			if ( os.version < 5 )
				this.options.filled = true;
		}

		if (this.options.id)
			this.textFieldAttributes['id'] = this.options.id;

		if (this.options.maxLength)
			this.textFieldAttributes['maxlength'] = this.options.maxLength;

		if ( _.isFunction(this.options.formatCharacterCount) ){
			var cbFormatCharacterCount = _.bind(this.options.formatCharacterCount, this);
			this.formatCharacterCount = _.bind(function (fieldLength) {
				if ( this.formatCharacterCount )
					cbFormatCharacterCount(fieldLength);
			}, this);
		}

		if ( this.options.addClass )
			this.$el.addClass( this.options.addClass );

		if (this.options.autocorrect)
			this.textFieldAttributes['autocorrect'] = 'off';

		if (this.options.inputmode) {
			this.textFieldAttributes['inputmode'] = this.options.inputmode;
			if (this.options.inputmode == 'numeric')
				this.textFieldAttributes['pattern'] = '[0-9]*';
		}

	}

	onRender(rendered) {
		if ( rendered ) return this;
		this.$characterCount = null;
		this.$label = null;

		// this.$el.empty();

		if (this.options.label) {
			this.$label = $("<label>").attr({ "for": this.options.id }).text(this.options.label);
			this.$el.append(this.$label);
		}

		if (this.options.multiline)
			this.$textfield = $('<textarea>').attr(this.textFieldAttributes);
		else
			this.$textfield = $('<input type="' + this.options.type + '">').attr(this.textFieldAttributes);

		if (this.options.placeholder)
			this.$textfield.attr('placeholder', this.options.placeholder);

		if ( this.options.disabled )
			this.$textfield.attr( 'disabled', 'disabled' );

		this.$el.append(this.$textfield);

		if(this.options.maxLength) {
			this.enableCharacterCount = true;
			this.$characterCount = $('<span>').addClass('ui-input-character-count');
			this.$el.addClass('ui-input-character-count-enabled').append(this.$characterCount);
			this.formatCharacterCount(0);
		}

		if(this.options.invalid)
			this.$el.append($('<div>').addClass('ui-input-invalid').attr('data-invalid-field', this.options.field));

		if (this.options.filled) {
			this.$el.addClass("filled");
		}

		this.setValue( this.options.value );

		return this;
	}

	onTouchStart() {
		if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard) {
			if (this.options.accessoryBar == false)
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			else
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
		}
	}

	onFocus() {
		this.$el.addClass('active');
		this.trigger('focus', this);
	}

	onBlur() {
		this.$el.removeClass('active');
		if ( this.textFieldLength() > 0 || this.options.filled)
			this.$el.addClass('filled');
		else
			this.$el.removeClass('filled');
		this.trigger('blur', this);
	}

	onChange(e) {
		let fieldLength = this.textFieldLength();
		this.formatCharacterCount( this.textFieldLength() );

		if ( fieldLength > 0 )
			this.$el.addClass('filled');
		else
			this.$el.removeClass('filled');

		// FIX: Android non interpreta maxlength pertanto lo controllo via javascript
		if ( this.isAndroid && _.isNumber(this.options.maxLength) ) {
			let max = this.options.maxLength;
			if (this.$textfield.val().length > max) {
				this.$textfield.val(this.$textfield.val().substr(0, max));
			}
		}

		this.trigger('change', e );
	}

	focus(delay){
		if ( !delay )
			delay = 0;
		if ( this.cache.focusTO )
			clearTimeout(this.cache.focusTO);
		this.cache.focusTO =
			setTimeout(() => {
				this.$textfield.focus();
				this.cache.focusTO = null;
			}, delay);
		return this;
	}

	formatCharacterCount(fieldLength) {
		if ( this.enableCharacterCount )
			this.$characterCount.text(this.textFieldAttributes.maxlength - fieldLength);
	}

	textFieldLength() {
		let str = this.$textfield.val();
		if (!str)
			return 0;
		let lns = str.match(/\n/g);
		if (lns)
			return str.length + lns.length;
		return str.length;
	}

	setValue(value){
		this.$textfield.val( value );
		let event = document.createEvent("KeyboardEvent");
		event.initKeyboardEvent("keypress", true, true, null, false, false, false, false, 115, 0);
		this.onChange(event);
		return this;
	}

	getValue() {
		return this.$textfield.val();
	}

};
