var $        = require('jquery');
var _        = require('underscore');
var BaseView = require('./BaseView');

var RateView = module.exports = BaseView.extend({

	className: 'rate',

	initialize: function initialize(options) {
		RateView.__super__.initialize.apply(this, arguments);

		this.options = _.defaults(options||{}, 
									{ 
										min: 1,
										max: 5, 
										rate: 0, 
										chars: {
											empty: "",
											half: "",
											full: ""
										} 
									}
						);
	},

	render: function render() {
		
		this.$el.empty();
		
		var _char = this.options.chars.empty;
		var min   = parseInt( this.options.min );
		var max   = parseInt( this.options.max );
		var rate  = parseFloat( this.options.rate );

		for (var i = min; i <= max; i++) {
			_char = this.options.chars.empty;
			if ( rate >= i )
				_char = this.options.chars.full;
			else if ( rate < i && rate > (i-1)  ) {
				_char = this.options.chars.half;
			}
			this.$el.append( $('<span />').data("value", i).text( _char ) );
		};

		return this;
	},

	update: function update(rate){
		if ( _.isUndefined(rate) || _.isNull(rate) )
			return this;
		this.options.rate = parseFloat(rate);
		this.render();
		return this;
	}


});