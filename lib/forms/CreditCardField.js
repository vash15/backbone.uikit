var _  = require('underscore');
var _s = require('underscore.string');
var TextField = require('./TextField');

var CreditCardField = module.exports = TextField.extend({

	className: 'input text credit-card',


	initialize: function initialize(options) {
		CreditCardField.__super__.initialize.apply(this, arguments);
		this.events = _.extend({'keydown input': 'keyDown'}, this.events);
		this.textFieldAttributes.autocomplete = "off";
	},

	keyDown: function keyDown(e){
		// allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
		// home, end, period, and numpad decimal
		var key = e.charCode || e.keyCode || 0;
		if ( key == 8 )
			return true;
		if ( key == 9 || key == 13 || key == 46 || key == 110 || key == 190 || (key >= 35 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105) ){
			// Controllo se ho già raggiunto i 16 caratteri
			var str = _s.replaceAll( this.$textfield.val().toString(), " ", "");
			if ( str.length >= 0 && str.length < 16 ){
				return true;
			}
		}


		e.preventDefault();
		return false;
	},

	onChange: function onChange() {
		try{
			var str = _s.replaceAll( this.$textfield.val().toString(), " ", "");
			this.$textfield.val( _s.trim(str.replace(/(\d{4})/g, "$1 ")) );
		}catch(err){}
		CreditCardField.__super__.onChange.apply(this, arguments);
		return this;
	}

});
