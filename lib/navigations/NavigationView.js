var _        = require('underscore');
var BaseView = require('../BaseView');

var NavigationView = module.exports = BaseView.extend({

	addClass: 'navigation-view',

	initialize: function initialize(options) {
		NavigationView.__super__.initialize.apply(this, arguments);
	},

	onSwipeBack: function onSwipeBack(percent){}

});