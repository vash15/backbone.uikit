var $                  = require('jquery');
var _                  = require('underscore');
var Backbone           = require('backbone');
var ChildViewContainer = require('backbone.babysitter');
var Impetus            = require('impetus');
var BaseView           = require('../../BaseView');
var ListItemView       = require('./ListItemView');


var TOP_DOWN               = 1;
var DOWN_TOP               = 2;
var LEFT_RIGHT             = 4;
var RIGHT_LEFT             = 8;
var ORIENTATION_VERTICAL   = 'vertical';
var ORIENTATION_HORIZONTAL = 'horizontal';


var translate3d = function translate3d($el, x, y) {
	var transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
	var el = $el.get(0);
	if ('webkitTransform' in el.style) el.style.webkitTransform = transform;
	else el.style.transform = transform;
};


var InfiniteListView = module.exports = BaseView.extend({

	className: 'list',

	initialize: function initialize(options) {
		InfiniteListView.__super__.initialize.apply(this, arguments);

		this.addEvents({
			'click': _.debounce(this.onClick, 500, true)
		});

		this.options = _.defaults(options || {}, {
			itemClass: 'listItem',
			itemHeight: 120,
			itemWidth: 120,
			placeholders: 10,
			orientation: ORIENTATION_VERTICAL,
			friction: 0.92,
			multiplier: 1
		});

		this.items = [];
		this.firstItemIndex = 0;
		this.scrollX = 0;
		this.scrollY = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.listWidth = 0;
		this.listHeight = 0;
		this.rendered = false;

		this.setCollection(this.collection);
	},

	//
	// Methods
	//

	render: function render() {
		var self = this;

		this.rendered = true;

		this.$el.empty();

		this.$el.addClass(this.options.orientation);

		this.listWidth  = this.$el.width();
		this.listHeight = this.$el.height();

		var offset   = this.$el.offset();
		this.offsetX = offset.left;
		this.offsetY = offset.top;

		// Preparo gli elementi vuoti
		var anElement, anItem;
		for (var i = 0; i < this.options.placeholders; i++) {
			anElement = $('<div class="' + this.options.itemClass + '"></div>');
			anElement.css({
				'position': 'absolute',
				'top': 0,
				'left': 0
			});
			anItem = {
				index: i,
				$el: anElement
			};

			if (this.options.orientation === ORIENTATION_VERTICAL) {
				anItem.x = 0;
				anItem.y = i * this.options.itemHeight;
			}
			else {
				anItem.x = i * this.options.itemWidth;
				anItem.y = 0;
			}

			translate3d(anElement, anItem.x, anItem.y);
			this.items.push(anItem);
			this.$el.append(anElement);
			this.updateContent(anItem);
		}

		// Scroll con momentum
		var impetusOptions = {
			source: this.el,
			update: _.bind(this.onMove, this),
			friction: this.options.friction,
			directionLock: this.options.orientation,
			multiplier: this.options.multiplier
		};

		if (this.options.orientation === ORIENTATION_VERTICAL) {
			impetusOptions.boundY = [-this.collection.length * this.options.itemHeight + this.$el.height(), 0];
		}
		else {
			impetusOptions.boundX = [-this.collection.length * this.options.itemWidth + this.$el.width(), 0];
		}
		this.impetus = new Impetus(impetusOptions);

		return this;
	},

	updateContent: function updateContent (item) {
		if (!this.rendered) return;

		var previousView = item.view;

		var model = this.collection.at(item.index);
		if (!model) {
			item.$el.empty();
			return;
		}

		item.view = this.getItemViewAtIndexWithOptions(-1, {
			el: item.$el.get(0),
			model: model,
			parentList: this,
			removeOnDestroy: false
		});

		item.view.render();

		if (previousView) {
			setTimeout(function() {
				previousView.destroy();
			});
		}
	},

	updateAllContents: function updateAllContents () {
		if (!this.rendered) return;
		var anItem;
		for (var i = 0; i < this.options.placeholders; i++) {
			anItem = this.items[i];
			this.updateContent(anItem);
		}
	},

	reset: function reset() {
		this.impetus.setValues(0, 0);
	},

	sort: function sort() {
		this.updateAllContent();
	},

	getItemViewAtIndexWithOptions: function getItemViewAtIndexWithOptions(index, options) {
		return new ListItemView(options);
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

		this.listenTo(this.collection, 'reset',  this.reset);
		this.listenTo(this.collection, 'sort',   this.sort);

		this.updateAllContents();
	},

	getCollection: function getCollection() {
		return this.collection;
	},

	getFirstItem: function getFirstItem() {
		return this.items[this.firstItemIndex];
	},

	getLastItem: function getLastItem() {
		var lastIndex = this.wrapIndex(this.firstItemIndex - 1);
		return this.items[lastIndex];
	},

	//
	// Events
	//

	onMove: function onMove(x, y) {
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			var direction = y < this.scrollY ? TOP_DOWN : DOWN_TOP;
			this.scrollY = y;

			// Swap
			var firstItem = this.getFirstItem();
			var lastItem  = this.getLastItem();

			if (direction === TOP_DOWN) {
				if ((firstItem.index + 1) * this.options.itemHeight < -y) {
					this.firstItemIndex = this.wrapIndex(this.firstItemIndex + 1);
					firstItem.index = lastItem.index + 1;
					this.updateContent(firstItem);
				}
			}
			else {
				if ((firstItem.index + 1) * this.options.itemHeight > -y) {
					this.firstItemIndex = this.wrapIndex(this.firstItemIndex - 1);
					lastItem.index = firstItem.index - 1;
					this.updateContent(lastItem);
				}
			}

			// Move every item
			var anItem;
			for (var i = 0; i < this.options.placeholders; i++) {
				anItem = this.items[i];
				anItem.y = anItem.index * this.options.itemHeight + y;
				translate3d(anItem.$el, anItem.x, anItem.y, 0);
			}
		}
		else {
			var direction = x < this.scrollX ? LEFT_RIGHT : RIGHT_LEFT;
			this.scrollX = x;

			// Swap
			var firstItem = this.getFirstItem();
			var lastItem  = this.getLastItem();

			if (direction === LEFT_RIGHT) {
				if ((firstItem.index + 1) * this.options.itemWidth < -x) {
					this.firstItemIndex = this.wrapIndex(this.firstItemIndex + 1);
					firstItem.index = lastItem.index + 1;
					this.updateContent(firstItem);
				}
			}
			else {
				if ((firstItem.index + 1) * this.options.itemWidth > -x) {
					this.firstItemIndex = this.wrapIndex(this.firstItemIndex - 1);
					lastItem.index = firstItem.index - 1;
					this.updateContent(lastItem);
				}
			}

			// Move every item
			var anItem;
			for (var i = 0; i < this.options.placeholders; i++) {
				anItem = this.items[i];
				anItem.x = anItem.index * this.options.itemWidth + x;
				translate3d(anItem.$el, anItem.x, anItem.y, 0);
			}
		}
	},

	getItemFromXY: function getItemFromXY(x, y) {
		var index;
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			index = Math.floor((y - this.scrollY) / this.options.itemHeight);
		}
		else {
			index = Math.floor((x - this.scrollX) / this.options.itemWidth);
		}

		var item = this.items[this.wrapIndex(index)];
		return item;
	},

	//
	// Helpers
	//

	wrapIndex: function wrapIndex(index) {
		var n = this.options.placeholders;
		return ((index % n) + n) % n;
	},

	normalizeEvent: function normalizeEvent(e) {
		var x, y;
		if (e.type === 'click') {
			x = e.pageX - this.offsetX;
			y = e.pageY - this.offsetY;
		}
		else if (e.type === 'touchend') {
			x = e.originalEvent.changedTouches[0].pageX - this.offsetX;
			y = e.originalEvent.changedTouches[0].pageY - this.offsetY;
		}
		return { x: x, y: y };
	},

	//
	// Events
	//

	onClick: function onClick(e) {
		var event = this.normalizeEvent(e);
		var item  = this.getItemFromXY(event.x, event.y);

		if (typeof this.onSelectItem === 'function')
			this.onSelectItem(item.view);

		this.trigger('selectItem', item.view);
	},

	onDestroy: function onDestroy() {
		InfiniteListView.__super__.onDestroy.call(this);

		this.impetus.destroy();

		var anItem;
		for (var i = 0; i < this.options.placeholders; i++) {
			anItem = this.items[i];
			if (anItem.view)
				anItem.view.destroy();
		}
	}

	// requestData: function requestData (start, count) {
	// 	console.log('Request %s, %s', start, start + count);
	// 	var self = this;
	// 	_.delay(function () {
	// 		// self.iscroll.updateCache(start, self.getRangeOfCollection(start, count));
	// 		console.log('<----- Request ended %s, %s', start, start + count);
	// 	});
	// },

});
