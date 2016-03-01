var _        = require('underscore');
var Backbone = require('backbone');
var ListView = require('./ListView');


var FilteredListView = module.exports = ListView.extend({

	initialize: function initialize(options) {
		FilteredListView.__super__.initialize.apply(this, arguments);
		this.filteredCollection = null;
		this.filterFunction = null;
	},

	getCollection: function getCollection() {
		return this.filteredCollection || this.collection;
	},

	filter: function filter(filterFunction) {
		this.filterFunction = filterFunction;

		if (!filterFunction)
			return this.cancelFilter();

		var CollectionConstructor = this.collection.constructor;
		var filteredCollection = this.filteredCollection = new CollectionConstructor(this.collection.filter(filterFunction));
		if (this.collection._comparatorType) {
			filteredCollection._comparatorType = this.collection._comparatorType;
			filteredCollection.sort();
		}

		if (this.rendered)
			this.renderItems(filteredCollection);

		return this.filteredCollection;
	},

	cancelFilter: function cancelFilter() {
		this.filteredCollection = null;
		this.filterFunction = null;
		this.renderItems(this.collection);
		return this.collection;
	},

	isFiltered: function isFiltered() {
		return !!this.filteredCollection;
	},

	addItem: function addItem(model, options) {
		if (this.filteredCollection && this.filterFunction && this.filterFunction(model)) {
			this.filteredCollection.add(model);
			return FilteredListView.__super__.addItem.apply(this, arguments);
		}
		else if (!this.filteredCollection) {
			return FilteredListView.__super__.addItem.apply(this, arguments);
		}
	}
	
});

