var _              = require('underscore');
var fs             = require('fs');
var utilsStyle     = require('../utils/style');
var BaseView       = require('../BaseView');
var NavigationView = require('./NavigationView');


var BarView = module.exports = BaseView.extend({

	className: 'navigation-bar',

	initialize: function initialize(options) {
		BarView.__super__.initialize.apply(this, arguments);
		this.options = _.defaults(options||{}, { duration: 300 });
	},

	move: function move(percent, direction){
		// 
		return this;
	}

},{
	PUSH    : 0, // Push      | |<-
	DETACH  : 1, // Detach  <-| |
	RESTORE : 2, // Restore ->| |
	POP     : 4  // Pop       | |->
});
