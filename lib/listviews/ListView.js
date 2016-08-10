import _ from "underscore";
import $ from "jquery";
import { Collection } from "backbone";
import BaseView from "../BaseView";
import ListItemView from "./ListItemView";
import { requestAnimationFrame, requestNextAnimationFrame } from '../utils/requestAnimationFrame';
import { translate3d, overflowScrolling } from "../utils/style";

const TOP_DOWN               = 1;
const DOWN_TOP               = 2;
const LEFT_RIGHT             = 4;
const RIGHT_LEFT             = 8;
const ORIENTATION_VERTICAL   = 'vertical';
const ORIENTATION_HORIZONTAL = 'horizontal';

var ticking = false;
let requestTick = function requestTick(callback) {
	if (!ticking) {
		requestAnimationFrame(() => {
			ticking = false;
			callback();
		});
	}
	ticking = true;
}

export default class ListView extends BaseView {

	className() {
		return 'ui-list-view';
	}

	constructor(options) {
		super(options);

		this.addEvents({
			'click': 'onClick', // _.debounce(this.onClick, 500, true),
			'scroll': 'onScroll',
			'touchstart': 'onTouchStart',
			'touchmove': 'onTouchMove',
			'touchend': 'onTouchEnd',
			'mousedown': 'onTouchStart',
			'mousemove': 'onTouchMove',
			'mouseup': 'onTouchEnd'
		});

		this.setDefaultsOptions({
			itemClass: 'ui-list-item',
			itemHeight: 120,
			itemWidth: 120,
			itemsPerRow: 1,
			placeholders: 20, // Number of items
			placeholderCache: 2,
			orientation: ORIENTATION_VERTICAL,
			infinite: false,
			infiniteLoadingSize: 44,
			distance: 100,
			pullToRefresh: false,
			pullToRefreshClass: 'ui-pull-to-refresh',
			touchActiveClassName: 'touch-active'
		});

		this.items = [];
		this.x = 0;
		this.y = 0;
		this.previousX = 0;
		this.previousY = 0;
		this.offsetCalculated = false;
		this.offsetX = 0;
		this.offsetY = 0;
		this.listWidth = 0;
		this.listHeight = 0;
		this.containerSize = 0;
		this.rendered = false;
		this.isLoadingMore = false;
		this.isRefreshing = false;
		this.isClicking = false;
		this.activeItem = null;
		this.touchX = 0;
		this.touchY = 0;

		this.setCollection(this.collection);

		this.onMove = _.bind(this.onMove, this);
	}

	//
	// Methods
	//

	onRender(rendered) {
		if (rendered) return this;
		// Prepare the content
		this.$el
			.addClass('overflow-scroll')
			.addClass(this.options.orientation);
		this.listWidth  = this.$el.width();
		this.listHeight = this.$el.height();

		if (this.$el.is(':visible')) {
			var offset            = this.$el.offset();
			this.offsetX          = offset.left;
			this.offsetY          = offset.top;
			this.offsetCalculated = true;
		}

		overflowScrolling(this.el, true); // Per Android e WK

		// Container
		let $scrollContainer = this.cache.$scrollContainer = $('<div>');
		this.resizeContainer();

		// Preparo gli elementi vuoti
		var anElement, anItem, aPosition;
		var itemStyle = {
			position: 'absolute',
			top: 0,
			left: 0
		};
		for (var i = 0; i < this.options.placeholders; i++) {
			anElement = $('<div>').addClass(this.options.itemClass);
			anItem = {
				index: i,
				$el: anElement
			};
			aPosition = this.getPositionAtIndex(i);

			if (this.options.orientation === ORIENTATION_VERTICAL) {
				anItem.x = aPosition.column * Math.floor(this.listWidth / this.options.itemsPerRow);
				anItem.y = aPosition.row * this.options.itemHeight;
				itemStyle.width = ((this.listWidth / this.options.itemsPerRow) / this.listWidth) * 100 + '%';
			}
			else {
				anItem.x = aPosition.row * this.options.itemWidth;
				anItem.y = aPosition.column * Math.floor(this.listHeight / this.options.itemsPerRow);
				itemStyle.height = ((this.listHeight / this.options.itemsPerRow) / this.listHeight) * 100 + '%';
			}

			anElement.css(itemStyle);

			this.updateContent(anItem, true);
			this.items.push(anItem);
			$scrollContainer.append(anElement);
		}

		this.$el.append($scrollContainer);

		// Pull to refresh
		if (this.options.pullToRefresh) {
			let $pullToRefresh = this.cache.$pullToRefresh = $('<div>').addClass(this.options.pullToRefreshClass);
			$pullToRefresh.css({
				position: 'absolute',
				top: 0,
				left: 0,
				'margin-top': '-60px',
			});
			$pullToRefresh.append($('<span>').text('Pull to refresh...'));
			this.$el.prepend($pullToRefresh);
		}
	}

	updateContent(item, immediate) {
		// Aggiorna il contenuto
		var model = this.collection.at(item.index);
		if (!item.view && model) {

			// if (!('getListItemViewAtIndexWithOptions' in this))
			// 	throw new Error('Method getListItemViewAtIndexWithOptions not implemented');

			item.view = this.getListItemViewAtIndexWithOptions(item.index, {
				el: item.$el.get(0),
				model: model,
				state: this.getState(),
				parentList: this,
				removeOnDestroy: true
			});
		}

		// Render
		if (item.view) {
			item.view.setModel(model);
			item.view.render();
		}

		// Riposiziona l'elemento
		let position = this.getPositionAtIndex(item.index);
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			item.x = position.column * Math.floor(this.listWidth / this.options.itemsPerRow);
			item.y = position.row * this.options.itemHeight;
		}
		else {
			item.x = position.row * this.options.itemWidth;
			item.y = position.column * Math.floor(this.listHeight / this.options.itemsPerRow);
		}
		this.requestAnimationFrame(() => {
			item.$el.addClass('col-' + position.column);
		});
		translate3d(item.$el, item.x, item.y, 0, immediate);
	}

	updateRangeContents(startIndex, endIndex, forceUpdate) {
		var anItem;

		startIndex = startIndex - this.options.placeholderCache;
		if (startIndex < 0) startIndex = 0;

		endIndex = endIndex + this.options.placeholderCache;
		if (endIndex > this.getItemsCount()) endIndex = this.getItemsCount();

		for (var i = startIndex; i < endIndex; i++) {
			anItem = this.getItemAtIndex(i);
			if (anItem.index !== i || forceUpdate) {
				anItem.index = i;
				this.updateContent(anItem);
			}
		}
	}

	updateAllContents() {
		var anItem;

		for (var i = 0; i < this.options.placeholders; i++) {
			anItem = this.items[i];
			this.updateContent(anItem);
		}
	}

	resizeContainer() {
		this.listWidth   = this.$el.width();
		this.listHeight  = this.$el.height();

		if (this.cache.$scrollContainer) {
			let containerStyle = {
				position: 'relative',
				overflow: 'visible'
			};
			this.containerSize = this.getContainerSize();

			// Check if the number of elements is less then then amount of
			// placeholder. This prevent the list from scrolling more then
			// then real number of items.
			if (this.getCollection().length < this.options.placeholders) {
				containerStyle.overflow = 'hidden';
			}

			if (this.options.orientation === ORIENTATION_VERTICAL) {
				containerStyle.height = this.containerSize + 'px';
				containerStyle.width = '100%';
			}
			else {
				containerStyle.height = '100%';
				containerStyle.width = this.containerSize + 'px';
			}

			this.cache.$scrollContainer.css(containerStyle);
		}
	}

	pause() {
		overflowScrolling(this.el, false);
		return this;
	}

	resume() {
		overflowScrolling(this.el, true);
		return this;
	}

	reset() {
		if (this.rendered) {
			// Reset item indexes
			for (var i = 0, n = this.items.length; i < n; i++) {
				this.items[i].index = i;
			}
			requestAnimationFrame(() => {
				// Reset scroll
				this.x = 0;
				this.y = 0;
				this.el.scrollTop = 0;
				this.el.scrollLeft = 0;
				// Update container and content
				this.resizeContainer();
				this.updateAllContents();
				this.pause();
				requestAnimationFrame(() => {
					this.resume();
				});
			});
		}
	}

	sort() {
		if (this.rendered) {
			this.updateAllContents();
		}
	}

	getListItemViewAtIndexWithOptions(index, options) {
		return new ListItemView(options);
	}

	setCollection(collection) {
		if (this.collection) {
			this.stopListening(this.collection);
		}

		if (!collection) {
			this.collection = null;
			return;
		}

		if (!(collection instanceof Collection))
			collection = new Collection(collection);

		this.collection = collection;

		this.listenTo(this.collection, 'reset', this.reset);
		this.listenTo(this.collection, 'sort',  this.sort);
		this.listenTo(this.collection, 'add',   _.debounce(_.bind(this.add, this)));

		// Reset
		this.reset();
	}

	add(model) {
		if (this.rendered) {
			this.resizeContainer();
			let modelIndex = this.getCollection().indexOf(model);
			let startIndex = this.getStartIndex();
			let endIndex   = this.getEndIndex();
			this.updateRangeContents(startIndex, endIndex);
		}
	}

	refresh() {
		if (this.isRefreshing) return;
		if (typeof this.onRefresh == 'function') {
			this.isRefreshing = true;
			translate3d(this.cache.$pullToRefresh, 0, 60, 0);
			translate3d(this.cache.$scrollContainer, 0, 60, 0);
			this.onRefresh(() => {
				this.isRefreshing = false;
				translate3d(this.cache.$pullToRefresh, 0, 0, 0);
				translate3d(this.cache.$scrollContainer, 0, 0, 0);
			});
		}
	}

	setItemsPerRow(newItemsPerRow) {
		if (newItemsPerRow != this.options.itemsPerRow) {
			setTimeout(() => {
				let oldItemsPerRow = this.options.itemsPerRow;
				let startIndex;
				let newStartItemPosition;
				let oldStartItemPosition;
				let scrollDelta;
				let scrollTo;
				let itemStyle = {};

				startIndex = this.getStartIndex();
				// Calculate current/old position
				oldStartItemPosition = this.getPositionAtIndex(startIndex);
				// Change itemsPerRow option
				this.options.itemsPerRow = newItemsPerRow;
				// Resize the container
				this.resizeContainer();
				// Calculate new position
				newStartItemPosition = this.getPositionAtIndex(startIndex);

				if (this.options.orientation === ORIENTATION_VERTICAL) {
					itemStyle.width = ((this.listWidth / this.options.itemsPerRow) / this.listWidth) * 100 + '%';
					scrollDelta = oldStartItemPosition.row * this.options.itemHeight + this.y;
					scrollTo = newStartItemPosition.row * this.options.itemHeight - scrollDelta;
					this.el.scrollTop = scrollTo;
				}
				else {
					itemStyle.height = ((this.listHeight / this.options.itemsPerRow) / this.listHeight) * 100 + '%';
					scrollDelta = oldStartItemPosition.row * this.options.itemWidth + this.x;
					scrollTo = newStartItemPosition.row * this.options.itemWidth - scrollDelta;
					this.el.scrollLeft = scrollTo;
				}

				// Resize all items
				for (var i = 0; i < this.items.length; i++) {
					this.items[i].$el.css(itemStyle);
				}

				this.updateAllContents();
			}, 100);
		}
	}

	getCollection() {
		return this.collection;
	}

	loadMore() {
		if (this.isLoadingMore) return;

		if ('onLoadMore' in this && this.shouldLoadMore()) {
			this.isLoadingMore = true;
			// TODO: mostrare lo spinner
			this.onLoadMore(() => {
				this.isLoadingMore = false;
			});
		}
	}

	shouldLoadMore() {
		return true;
	}

	scrollTop(animated) {
		// TODO: animate scroll
		this.el.scrollTop = 0;
	}

	//
	// Events
	//

	onScroll(ev) {
		requestTick(this.onMove);
	}

	onMove() {
		let startIndex;
		let endIndex;

		if (this.options.orientation === ORIENTATION_VERTICAL) {
			let y = this.y = -this.el.scrollTop;
			this.direction = y < this.previousY ? TOP_DOWN : DOWN_TOP;
			this.previousY = y;
			startIndex = this.getStartIndex();
			endIndex   = this.getEndIndex();

			if (this.options.infinite) {
				if (this.containerSize - this.listHeight - this.options.distance < -y) {
					this.loadMore();
				}
			}
		}
		else {
			let x = this.x = -this.el.scrollLeft;
			this.direction = x < this.previousX ? LEFT_RIGHT : RIGHT_LEFT;
			this.previousX = x;
			startIndex = this.getStartIndex();
			endIndex   = this.getEndIndex();

			if (this.options.infinite) {
				if (this.containerSize - this.listWidth - this.options.distance < -x) {
					this.loadMore();
				}
			}
		}

		this.updateRangeContents(startIndex, endIndex);
	}

	onTouchStart(e) {
		if (this.isClicking || this.activeItem) return;

		if ('onSelectItem' in this) {
			let event = this.normalizeEvent(e);
			let x     = -event.x + this.x;
			let y     = -event.y + this.y;
			let item  = this.getItemFromXY(x, y);
			this.touchX = event.x;
			this.touchY = event.y;
			if (item && item.view) {
				this.activeItem = item;
				requestAnimationFrame(() => {
					this.activeItem.view.$el.addClass(this.options.touchActiveClassName);
				});
			}
		}
	}

	onTouchMove(e) {
		let event = this.normalizeEvent(e);
		let deltaX = Math.abs(this.touchX - event.x);
		let deltaY = Math.abs(this.touchY - event.y);
		if (this.activeItem && (deltaX > 20 || deltaY > 20)) {
			requestAnimationFrame(() => {
				if (this.activeItem) {
					this.activeItem.view.$el.removeClass(this.options.touchActiveClassName);
					this.activeItem = null;
				}
			});
		}
	}

	onTouchEnd() {
		if (this.options.pullToRefresh) {
			if (this.y > 60) {
				this.refresh();
			}
		}

		if (this.activeItem) {
			requestNextAnimationFrame(() => {
				if (this.activeItem) {
					this.activeItem.view.$el.removeClass(this.options.touchActiveClassName);
					this.activeItem = null;
				}
			});
		}
	}

	onClick(e) {
		if (this.isClicking) return;

		if ('onSelectItem' in this) {
			let event = this.normalizeEvent(e);
			let x     = -event.x + this.x;
			let y     = -event.y + this.y;
			let item  = this.getItemFromXY(x, y);

			if (item && item.view) {
				this.isClicking = true;
				this.onSelectItem(item.view, () => {
					this.isClicking = false;
				});
			}
		}
	}

	onDestroy() {
		var anItem;
		for (var i = 0; i < this.options.placeholders; i++) {
			anItem = this.items[i];
			if (anItem.view)
				anItem.view.destroy();
		}
		super.onDestroy();
	}

	//
	// Helpers
	//

	wrapIndex(index) {
		var n = this.options.placeholders;
		return ((index % n) + n) % n;
	}

	normalizeEvent(e) {
		var x, y;
		if (!this.offsetCalculated) {
			var offset   = this.$el.offset();
			this.offsetX = offset.left;
			this.offsetY = offset.top;
		}
		if (e.type === 'click' || e.type === 'mouseup' || e.type === 'mousedown' || e.type === 'mousemove') {
			x = e.pageX - this.offsetX;
			y = e.pageY - this.offsetY;
		}
		else if (e.type === 'touchstart' || e.type === 'touchend' || e.type === 'touchmove') {
			x = e.originalEvent.changedTouches[0].pageX - this.offsetX;
			y = e.originalEvent.changedTouches[0].pageY - this.offsetY;
		}
		return { x: x, y: y };
	}

	getContainerSize() {
		let rows = this.getRowsCount();
		let infiniteLoadingSize = 0;
		let headerSize; // TODO: manage header padding

		if (this.options.infinite && this.shouldLoadMore()) {
			infiniteLoadingSize = this.options.infiniteLoadingSize;
		}

		if (this.options.orientation === ORIENTATION_VERTICAL) {
			return rows * this.options.itemHeight + infiniteLoadingSize;
		}
		else {
			return rows * this.options.itemWidth + infiniteLoadingSize;
		}
	}

	getStartIndex() {
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			return this.getIndexFromXY(0, this.y);
		}
		else {
			return this.getIndexFromXY(this.x, 0);
		}
	}

	getEndIndex() {
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			return this.getIndexFromXY(this.listWidth - 1, this.y - this.listHeight);
		}
		else {
			return this.getIndexFromXY(this.x - this.listWidth, this.listHeight - 1);
		}
	}

	getIndexFromXY(x, y) {
		var index;
		var row;
		var column;

		// Fix needed when you create a ListView with display: none;
		if (this.listWidth === 0)
			this.listWidth = this.$el.width();

		if (this.listHeight === 0)
			this.listHeight = this.$el.height();

		if (this.options.orientation === ORIENTATION_VERTICAL) {
			row    = Math.floor(Math.abs(y / this.options.itemHeight));
			column = Math.floor(Math.abs(x / (this.listWidth / this.options.itemsPerRow)));
			index  = row * this.options.itemsPerRow + column;
		}
		else {
			row    = Math.floor(Math.abs(x / this.options.itemWidth));
			column = Math.floor(Math.abs(y / (this.listHeight / this.options.itemsPerRow)));
			index  = row * this.options.itemsPerRow + column;
		}
		return index;
	}

	getItemFromXY(x, y) {
		let index = this.getIndexFromXY(x, y);
		return this.items[this.wrapIndex(index)];
	}

	getRowsCount() {
		let length = this.collection.length;
		return Math.ceil(length / (this.options.itemsPerRow || 1));
	}

	getPositionAtIndex(index) {
		// Vertical (R,C)
		//
		// |---|---|
		// |0,0|0,1|
		// |---|---|
		// |1,0|1,1|
		// |---|---|
		// |   |   |

		// Horizontal (R,C)
		// ------------
		// |0,0|1,0|
		// ------------
		// |0,1|1,1|
		// ------------
		return {
			row: Math.floor(index / this.options.itemsPerRow), // First row = 0
			column: index % this.options.itemsPerRow
		};
	}

	getItemAtIndex(index) {
		return this.items[this.wrapIndex(index)];
	}

	getItemsCount() {
		if (!this.collection) return 0;
		return this.collection.length;
	}

}

// Const
ListView.ORIENTATION_VERTICAL   = ORIENTATION_VERTICAL;
ListView.ORIENTATION_HORIZONTAL = ORIENTATION_HORIZONTAL
