
import _        from "underscore";
import { replaceAll, trim } from "underscore.string";
import TextField from "./TextField";


export default class CreditCardField extends TextField {

	className() { return 'ui-input ui-input-text ui-input-credit-card'; }


	constructor(options) {
		super(options);

		this.events = _.extend({'keydown input': 'keyDown'}, this.events);
		this.textFieldAttributes.autocomplete = "off";
	}

	keyDown(e){
		// allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
		// home, end, period, and numpad decimal
		let key = e.charCode || e.keyCode || 0;
		if ( key == 8 )
			return true;
		if ( key == 9 || key == 13 || key == 46 || key == 110 || key == 190 || (key >= 35 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105) ){
			// Controllo se ho già raggiunto i 16 caratteri
			let str = _s.replaceAll( this.$textfield.val().toString(), " ", "");
			if ( str.length >= 0 && str.length < 16 ){
				return true;
			}
		}

		e.preventDefault();
		return false;
	}

	onChange() {
		try{
			let str = _s.replaceAll( this.$textfield.val().toString(), " ", "");
			this.$textfield.val( _s.trim(str.replace(/(\d{4})/g, "$1 ")) );
		}catch(err){}
		return super.onChange();
	}

};
