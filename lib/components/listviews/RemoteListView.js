var _                  = require('underscore');

var ListView           = require('./ListView');
var PaginatedListView  = require('./PaginatedListView');

var RemoteListView = module.exports = PaginatedListView.extend({

	loadMore: function loadMore(e) {
		if (e && e.preventDefault) e.preventDefault();

		this._shouldLoadMore = false;

		// Pagination over server
		var self = this;
		var collection = this.collection;

		if (typeof collection.loadMore !== 'function')
			throw new Error('Collection requires loadMore method to be used with RemoteListView');

		if (collection.length > this._itemsCount) {
			if (!e) e = {};
			e.showLoadMore = true;
			return RemoteListView.__super__.loadMore.call(this, e);
		}

		if (collection.fetching)
			return;

		var options = {
			limit:  this.options.itemsPerPage,
			silent: true
		};
		options = this.getFetchOptions(options);

		this._page++;

		collection.loadMore(options, function (err, loadMore, loadedModelsNumber) {
			if (err) {
				self._page--;
				return self.trigger('error', err);
			}

			var models = [];
			var i = collection.length - loadedModelsNumber;
			var length = collection.length;
			for (; i < length; i++) {
				models.push(collection.at(i));
			}
			self.addItems(models);

			if (!loadMore)
				self.cache.$loadMore.hide();
		});
	},

	// Override to set new options for loadMore event
	getFetchOptions: function getFetchOptions(options) {
		return options;
	} 

});

