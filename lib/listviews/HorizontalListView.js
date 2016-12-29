var _                 = require('underscore');
var InfiniteListView  = require('./InfiniteListView');

var HorizontalListView = module.exports = InfiniteListView.extend({

	initialize: function initialize(options) {

		options = _.defaults(options || {}, {
			itemHeight: 304,
			itemWidth: 155,
			itemClass: 'horizontal-list-item',
			placeholders: 7,
			orientation: 'horizontal',
			friction: 0.94,
			multiplier: 1.1
		});

		HorizontalListView.__super__.initialize.call(this, options);
	}

});
