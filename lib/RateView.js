
import _        from "underscore";
import $        from "jquery";
import BaseView from "./BaseView";

const CLASS_NAME_EMPTY = 'empty';
const CLASS_NAME_HALF  = 'half';
const CLASS_NAME_FULL  = 'full';

export default class RateView extends BaseView {

	className() { return  'ui-rate'; }

	constructor(options){
		super(options);

		this.options = _.defaults(options||{},
									{
										min: 1,
										max: 5,
										rate: 0,
										edit: false,
										chars: {
											empty: "",
											half: "",
											full: ""
										}
									}
						);

		this.cache.chars   = {};
		this.options.min   = parseInt( this.options.min );
		this.options.max   = parseInt( this.options.max );
		this.options.rate  = parseFloat( this.options.rate );

		if ( this.options.edit ){
			this.addEvents({
				'click span': 'onClick'
			});
		}
	}

	onRender(rendered){
		const min     = this.options.min;
		const max     = this.options.max;
		const rate    = this.options.rate;
		const prefix  = '$star-';
		let _char     = this.options.chars.empty;
		let cache     = this.cache;
		let chars     = cache.chars;
		let className;

		for (var i = min; i <= max; i++) {
			_char = this.options.chars.empty;
			if ( rate >= i )
				_char = this.options.chars.full;
			else if ( rate < i && rate > (i-1)  ) {
				_char = this.options.chars.half;
			}

			switch (_char) {
				case this.options.chars.empty:
					className = CLASS_NAME_EMPTY;
					break;
				case this.options.chars.half:
					className = CLASS_NAME_HALF;
					break;
				case this.options.chars.full:
					className = CLASS_NAME_FULL;
					break;
			}

			if ( rendered ){
				if ( chars[i] !== _char ){
					cache[prefix+i].attr('class', className).text( _char );
					chars[i] = _char;
				}
			}else{
				cache[prefix+i]   = $('<span />').data("value", i).attr('class', className).text( _char );
				chars[i] = _char;
				this.$el.append( cache[prefix+i] );
			}

		};

		return this;
	}

	update(rate){
		if ( _.isUndefined(rate) || _.isNull(rate) )
			return this;
		this.options.rate = parseFloat(rate);
		this.render();
		return this;
	}

	value() {
		return this.options.rate;
	}

	onClick(ev) {
		let $el = $(ev.currentTarget);
		this.update( $el.data('value') );
	}

};
