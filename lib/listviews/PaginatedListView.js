var _                  = require('underscore');
var fs                 = require('fs');
var Backbone           = require('backbone');
var ChildViewContainer = require('backbone.babysitter');
var FilteredListView   = require('./FilteredListView');

var loadMoreTemplate   = _.template(fs.readFileSync(__dirname+'/../../templates/listviews/paginated_list_view_load_more.html', 'utf8'));


var PaginatedListView = module.exports = FilteredListView.extend({

	loadMoreTemplate: loadMoreTemplate,

	initialize: function initialize(options) {
		this.events = {
			'click .loadMore a': 'loadMore'
		};

		PaginatedListView.__super__.initialize.apply(this, arguments);
		this._itemsCount = 0;
		this._page = 1;
		this._loadedAll = false;
		if (!this.options)
			this.options = {};
		this.options.itemsPerPage = options.itemsPerPage || 20;
		this.options.loadOnScroll = options.loadOnScroll || false;

		if (this.options.loadOnScroll) {
			this.$el.on('scroll', _.throttle(_.bind(this.onScroll, this), 20));
		}
	},

	_resetPagination: function _resetPagination() {
		this._itemsCount = 0;
		this._page = 1;
	},

	render: function render() {
		PaginatedListView.__super__.render.call(this);
		this.$el.append(this.loadMoreTemplate());

		this.cache.$loadMore        = this.$el.find('.loadMore');
		this.cache.$loadMoreTrigger = this.$el.find('.loadMore a');
		this.cache.$loading         = this.$el.find('.loadMore .loader');

		this.renderEmptyState();

		return this;
	},

	renderItems: function renderItems(collection) {
		this._resetPagination();
		PaginatedListView.__super__.renderItems.call(this, collection);
	},

	renderEmptyState: function renderEmptyState() {
		var isEmpty = PaginatedListView.__super__.renderEmptyState.call(this);

		if (this.cache.$loadMore) {
			if (isEmpty || this.getCollection().length < this.options.itemsPerPage)
				this.cache.$loadMore.hide();
			else
				this.cache.$loadMore.show();
		}

		return isEmpty;
	},

	addItem: function addItem(model, options) {
		if (!options) options = {};
		if (this._itemsCount + 1 > this.options.itemsPerPage * this._page && options.force !== true)
			return;

		if (options.force !== true)
			this._itemsCount++;

		PaginatedListView.__super__.addItem.call(this, model, options);
	},

	loadMore: function loadMore(e) {
		if (e && e.preventDefault) e.preventDefault();

		var self = this;
		this._shouldLoadMore = false;

		// Pagination over loaded collection
		var collection = this.filteredCollection || this.collection;
		var i = this._page * this.options.itemsPerPage;
		var length = collection.length;

		if (i >= length) {
			// Niente più da caricare
			if (this.cache.$loadMore)
				this.cache.$loadMore.hide();
			return;
		}

		// this.cache.$loadMoreTrigger.hide();
		// this.cache.$loading.show();

		this._page++;
		var stop = this._page * this.options.itemsPerPage;

		// Sync
		// for (; i < stop && i < length; i++) {
		// 	if (collection instanceof Backbone.Collection)
		// 		this.addItem(collection.at(i));
		// 	else
		// 		this.addItem(collection[i]);
		// }

		// Async
		var models = [];
		for (; i < stop && i < length; i++) {
			if (collection instanceof Backbone.Collection)
				models.push(collection.at(i));
			else
				models.push(collection[i]);
		}
		this.addItems(models, function() {
			self.trigger('items:render');
		});

		if (i >= length) {
			this._loadedAll = true;
			if (this.cache.$loadMore)
				this.cache.$loadMore.hide();
		}

		// this.cache.$loadMoreTrigger.show();
		// this.cache.$loading.hide();
	},

	filter: function filter(filterFunction) {
		this._resetPagination();
		return PaginatedListView.__super__.filter.apply(this, arguments);
	},

	cancelFilter: function cancelFilter() {
		this._resetPagination();
		return PaginatedListView.__super__.cancelFilter.apply(this, arguments);
	},

	onScroll: function onScroll(e) {
		// PaginatedListView.__super__.onScroll.call(this, e);
		if (!this.options.loadOnScroll) return;
		var totalHeight = this.cache.$items.height() + this.cache.$header.height() + this.cache.$footer.height();
		var bottomOfThePage = totalHeight < this.$el.scrollTop() + this.cache.height;

		if (bottomOfThePage && !this.collection.fetching && !this.renderingItems) {
			var self = this;
			this._shouldLoadMore = true;
			if (this._delayedLoadMoreHandler)
				clearTimeout(this._delayedLoadMoreHandler);
			this._delayedLoadMoreHandler = setTimeout(function() {
				self._delayedLoadMoreHandler = null;
				if (!self._isTouchActive)
					self.loadMore();
			}, 300);
		}
	},

	onTouchEnd: function onTouchEnd(e) {
		PaginatedListView.__super__.onTouchEnd.call(this, e);
		if (this._shouldLoadMore && !this._delayedLoadMoreHandler)
			this.loadMore();
	},

	onDestroy: function onDestroy() {
		PaginatedListView.__super__.onDestroy.call(this);
		if (this.options.loadOnScroll) {
			this.$el.off('scroll');
		}
	}

});
