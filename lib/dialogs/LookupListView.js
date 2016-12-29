var _              = require('underscore');
var fs             = require('fs');
var OptionListView = require('../listviews/OptionListView');

var template       = _.template(fs.readFileSync(__dirname+'/../../templates/listviews/lookup_list_view.html', 'utf8'));

var LookupListView = module.exports = OptionListView.extend({

	template: template,

	initialize: function initialize(options) {
		options.multiselect  = false;
		options.itemsPerPage = 30;
		options.loadOnScroll = true;

		LookupListView.__super__.initialize.apply(this, arguments);

		this.options.listItemViewClass = options.listItemViewClass;
	},

	getItemViewAtIndexWithOptions: function getItemViewAtIndexWithOptions(index, options) {
		if (this.options.listItemViewClass)
			return new this.options.listItemViewClass(options);
		else
			return LookupListView.__super__.getItemViewAtIndexWithOptions.apply(this, arguments);
	}

});
