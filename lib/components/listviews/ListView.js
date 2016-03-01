var $                  = require('jquery');
var _                  = require('underscore');
var fs                 = require('fs');
var Backbone           = require('backbone');
var ChildViewContainer = require('backbone.babysitter');
var eachSeries         = require('async').eachSeries;
var FixOverflowScroll  = require('./FixOverflowScroll');

var template           = _.template(fs.readFileSync('templates/components/listviews/list_view.html', 'utf8'));

var BaseView           = require('../../BaseView');
var ListItemView       = require('./ListItemView');

var ListView = module.exports = BaseView.extend({

	className: 'list',

	stopEvents: false,

	template: template,

	initialize: function initialize(options) {
		ListView.__super__.initialize.apply(this, arguments);

		this.addEvents({
			'touchmove' : 'onTouchMove',
			'touchstart': 'onTouchStart',
			'touchend'  : 'onTouchEnd'
		});

		this.rendered           = false;
		this.renderingItems     = false;
		this.stopItemsRendering = false;

		this.options = _.defaults(options || {}, {
			emptyText: __('Nessun elemento'),
			scroll: true,
			hscroll: false,
			preserveScroll: true
		});

		this.items = new ChildViewContainer();
		this._fixOverlowScroll = new FixOverflowScroll(this.$el);

		this.setCollection(options.collection);
	},

	setCollection: function setCollection(collection) {
		if (this.collection) {
			this.stopListening(this.collection);
		}

		if (!collection) {
			this.collection = null;
			return;
		}

		if (!(collection instanceof Backbone.Collection))
			collection = new Backbone.Collection(collection);

		this.collection = collection;

		this.listenTo(this.collection, 'add',    this.addItem);
		// this.listenTo(this.collection, 'change', this.changeItem);
		this.listenTo(this.collection, 'remove', this.removeItem);
		this.listenTo(this.collection, 'reset',  this.reset);
		this.listenTo(this.collection, 'sort',   this.sort);
	},

	getCollection: function getCollection() {
		return this.collection;
	},

	render: function render() {
		var self = this;

		self.rendered = true;

		// Reimposto lo scroll
		self._oldScrollTop = self.$el.scrollTop();

		self.$el.html(self.template({
			emptyText: self.options.emptyText
		}));
		self.cache.$header = self.findPlaceholder('header');
		self.cache.$items  = self.findPlaceholder('items');
		self.cache.$footer = self.findPlaceholder('footer');

		_.each(['header', 'footer'], function (aViewName) {
			if (self.views[aViewName]) {
				self.cache['$' + aViewName].append(self.views[aViewName].el);
				self.views[aViewName].undelegateEvents();
				self.views[aViewName].render();
				self.views[aViewName].delegateEvents();
			}
		});

		self.renderItems(self.getCollection());
		self.renderEmptyState();

		// Valori di cache usati per impedire di scrollare
		// le liste che si trovano sotto a questa
		self.cache.height = self.$el.height();

		return self;
	},

	renderItems: function renderItems(collection) {
		var self = this;

		// Se sto già renderizzando con addItems aspetto un po'
		// e poi riprovo
		if (this.renderingItems) {
			this.stopItemsRendering = true;
			setTimeout(function() {
				self.renderItems(collection);
			});
			return;
		}

		self.items.each(function (anItem) {
			anItem.destroy();
			self.items.remove(anItem);
		});

		if (collection.length > 0) {
			// Sync
			// collection.forEach(function (aModel) {
			// 	self.addItem(aModel, { silent: true });
			// });

			// Async
			this.addItems(collection.models, function() {
				if (self.options.preserveScroll)
					self.$el.scrollTop(self._oldScrollTop);
				self.trigger('items:render');
			});
		}
		else {
			self.renderEmptyState();
			this._scrollTop();
			this._fixOverlowScroll.fix();
		}
	},

	sortItems: function sortItems(collection) {
		var self = this;
		var visibleItems = self.items.length;
		var item;

		if (collection instanceof Backbone.Collection)
			collection.each(moveItem);
		else
			_.each(collection, moveItem);

		this._fixOverlowScroll.fix();

		function moveItem(aModel) {
			item = self.items.findByModel(aModel);
			if (visibleItems > 0) {
				if (item) {
					self.cache.$items.append(item.el);
				}
				else {
					self.addItem(aModel, { silent: true, force: true });
				}
				visibleItems--;
			}
			else if (item) {
				item.destroy();
				self.items.remove(item);
			}
		}
	},

	renderEmptyState: function renderEmptyState() {
		if (this.items.length > 0) {
			this.findPlaceholder('empty').hide();
			return false;
		}
		else {
			this.findPlaceholder('empty').show();
			return true;
		}
	},

	addHeader: function addHeader(view) {
		if (this.views.header)
			this.views.header.destroy();

		this.views.header = view;

		if (this.rendered) {
			this.cache.$header.append(this.views.header.el);
			this.views.header.render();
			this._fixOverlowScroll.fix();
		}
	},

	addFooter: function addFooter(view) {
		if (this.views.footer)
			this.views.footer.destroy();

		this.views.footer = view;

		if (this.rendered) {
			this.cache.$footer.append(this.views.footer.el);
			this.views.footer.render();
			this._fixOverlowScroll.fix();
		}
	},

	addItems: function addItems(models, done) {
		var self = this;
		this.renderingItems = true;

		var firstItem  = this.items.findByIndex(0);
		var itemHeight = firstItem ? firstItem.$el.outerHeight() : 100;

		this.cache.$items.css('height', this.cache.$items.height() + models.length * itemHeight);

		var anAddItemResult;
		eachSeries(models, function (aModel, next) {
			setTimeout(function() {
				anAddItemResult = self.addItem(aModel, { silent: true });
				next(self.stopItemsRendering ? true : undefined);
			}, 0);
		}, function (stop) {
			// La lista è stata renderizzata, se un addItem restituisce false
			// allora viene interrotto il render
			self.renderingItems     = false;
			self.stopItemsRendering = false;
			self.cache.$items.css('height', '');
			self.cache.scrollHeight = self.el.scrollHeight;
			self._fixOverlowScroll.fix();
			if (done) done();
		});
	},

	addItem: function addItem(model, options) {
		if (!this.rendered) return;

		if (!options)
			options = {};

		_.defaults(options, {
			silent: false
		});

		var collection = this.getCollection();

		var indexOfModel = collection.indexOf(model);
		var previousItem = collection.at(indexOfModel - 1);
		var nextItem     = collection.at(indexOfModel + 1);

		var newItemOptions = this.options;
		_.extend(newItemOptions, options, {
			context: this.getContext(),
			model: model,
			parentList: this
		});

		var newItemView = this.getItemViewAtIndexWithOptions(indexOfModel, newItemOptions);

		this.listenTo(newItemView, 'select', this.selectItem);

		this.items.add(newItemView, indexOfModel);

		if (previousItem && this.items.findByModel(previousItem)) {
			var previousItemView = this.items.findByModel(previousItem);
			previousItemView.$el.after(newItemView.el);
		}
		else if (nextItem && this.items.findByModel(nextItem)) {
			var nextItemViewView = this.items.findByModel(nextItem);
			nextItemViewView.$el.before(newItemView.el);
		}
		else {
			this.cache.$items.append(newItemView.el);
		}

		if (typeof this.onAddItem === 'function')
			this.onAddItem(newItemView);

		newItemView.render();
		this.renderEmptyState();

		if (!options.silent)
			this._fixOverlowScroll.fix();

		// Aggiorno la cache della dimensione degli items
		this.cache.scrollHeight = this.el.scrollHeight;

		return newItemView;
	},

	changeItem: function changeItem(model) {
		if (this.items.findByModel(model))
			this.items.findByModel(model).render();
	},

	removeItem: function removeItem(model) {
		var item = this.items.findByModel(model);
		if (item) {
			if (typeof this.onRemove === 'function')
				this.onRemove(item);
			item.destroy();
			this.items.remove(item);
			this._fixOverlowScroll.fix();
		}
		this.renderEmptyState();
	},

	reset: function reset() {
		this.render();
	},

	sort: function sort() {
		this.sortItems(this.getCollection());
	},

	getItemViewAtIndexWithOptions: function getItemViewAtIndexWithOptions(index, options) {
		return new ListItemView(options);
	},

	selectItem: function selectItem(itemView) {
		if (this.stopEvents) return;

		if (typeof this.onSelectItem === 'function')
			this.onSelectItem(itemView);

		this.trigger('selectItem', itemView);
	},

	_scrollTop: function _scrollTop() {
		this.$el.scrollTop(0);
	},

	onSelectItem: function onSelectItem(itemView) {
		// Override this method
	},

	onAddItem: function onAddItem(itemView) {
		// Override this method
	},

	onBeforeLoadMore: function onBeforeLoadMore(options) {
		// Override this method
		// options = {
		//   data: ...,
		//   limit: ...
		// }
		return options;
	},

	// Impedisce a liste sottostanti di ricevere l'evento touchmove
	// nel caso in cui questa lista non possegga realmente uno scroll attivo.
	onTouchMove: function onTouchMove(e) {
		if (this.options.hscroll)
			return true;
		if (this.cache.scrollHeight <= this.cache.height && this.options.scroll)
			e.preventDefault();
	},

	onTouchStart: function onTouchStart(e) {
		this._isTouchActive = true;
	},

	onTouchEnd: function onTouchEnd(e) {
		this._isTouchActive = false;
	},

	onDestroy: function onDestroy() {
		ListView.__super__.onDestroy.call(this);
		this.items.call('destroy');
	}

});
