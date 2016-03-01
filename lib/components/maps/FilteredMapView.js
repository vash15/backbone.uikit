
var _       = require('underscore');
var MapView = require('./MapView');

var FilteredMapView = module.exports = MapView.extend({

	initialize: function initialize(options) {
		FilteredMapView.__super__.initialize.apply(this, arguments);
		this.filteredCollection = null;
	},

	getCollection: function getCollection() {
		return this.filteredCollection || this.collection;
	},

	filter: function filter(filterFunction) {
		if (!filterFunction)
			return this.cancelFilter();

		if (typeof filterFunction === 'object') {
			this.filteredCollection = filterFunction;
			this.renderMarkers(this.filteredCollection);
			return this.filteredCollection;
		}

		var filteredCollection = this.filteredCollection = this.collection.filter(filterFunction);
		this.renderMarkers(filteredCollection);
		return this.filteredCollection;
	},

	cancelFilter: function cancelFilter() {
		this.renderMarkers(this.collection);
		this.filteredCollection = null;
		return this.collection;
	}

});

