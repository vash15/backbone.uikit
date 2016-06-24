import _                                  from "underscore";
import $                                  from "jquery";
import { Collection }                     from "backbone";
import BaseView                           from "../BaseView";
import ListItemView                       from "./ListItemView";
import { requestAnimationFrame }          from '../utils/requestAnimationFrame';
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

	constructor(options) {
		super(options);

		this.addEvents({
			'click': 'onClick', // _.debounce(this.onClick, 500, true),
			'scroll': 'onScroll',
			'touchend': 'onTouchEnd',
			'mouseup': 'onTouchEnd'
		});

		this.options = _.defaults(this.options, {
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
			pullToRefresh: true,
			pullToRefreshClass: 'ui-pull-to-refresh'
		});

		this.items = [];
		this.x = 0;
		this.y = 0;
		this.previousX = 0;
		this.previousY = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.listWidth = 0;
		this.listHeight = 0;
		this.containerSize = 0;
		this.rendered = false;
		this.isLoadingMore = false;
		this.isRefreshing = false;
		this.isClicking = false;

		this.setCollection(this.collection);

		this.onMove = _.bind(this.onMove, this);
	}

	//
	// Methods
	//

	onRender(rendered) {
		if (rendered) return this;
		// Prepare the content
		this.$el.addClass(this.options.orientation);
		this.listWidth  = this.$el.width();
		this.listHeight = this.$el.height();

		var offset   = this.$el.offset();
		this.offsetX = offset.left;
		this.offsetY = offset.top;

		overflowScrolling(this.$el, true); // Per Android e WK

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

	updateContent(item, immediate) {
		// Aggiorna il contenuto
		var model = this.collection.at(item.index);
		if (!item.view && model) {
			item.view = this.getItemViewAtIndexWithOptions(item.index, {
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
		translate3d(item.$el, item.x, item.y, 0, immediate);
	}

	updateRangeContents(startIndex, endIndex) {
		var anItem;

		startIndex = startIndex - this.options.placeholderCache;
		if (startIndex < 0) startIndex = 0;

		endIndex = endIndex + this.options.placeholderCache;
		if (endIndex > this.getItemsCount()) endIndex = this.getItemsCount();

		for (var i = startIndex; i < endIndex; i++) {
			anItem = this.getItemAtIndex(i);
			if (anItem.index !== i) {
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
				position: 'relative'
			};
			this.containerSize = this.getContainerSize();

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

	reset() {
		if (this._rendered) {
			// Reset item indexes
			for (var i = 0, n = this.items.length; i < n; i++) {
				this.items[i].index = i;
			}
			// Reset scroll
			this.el.scrollTop = 0;
			// Update container and content
			this.resizeContainer();
			this.updateAllContents();
		}
	}

	sort() {
		if (this._rendered) {
			this.updateAllContents();
		}
	}

	getItemViewAtIndexWithOptions(index, options) {
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

	add() {
		if (this._rendered) {
			this.resizeContainer();
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
		if (typeof this.onLoadMore === 'function' && this.shouldLoadMore()) {
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

	onTouchEnd() {
		if (this.options.pullToRefresh) {
			if (this.y > 60) {
				this.refresh();
			}
		}
	}

	onClick(e) {
		if (this.isClicking) return;

		var event = this.normalizeEvent(e);
		var x     = -event.x + this.x;
		var y     = -event.y + this.y;
		var item  = this.getItemFromXY(x, y);

		if (typeof this.onSelectItem === 'function') {
			this.isClicking = true;
			this.onSelectItem(item.view, () => {
				this.isClicking = false;
			});
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
		if (e.type === 'click') {
			x = e.pageX - this.offsetX;
			y = e.pageY - this.offsetY;
		}
		else if (e.type === 'touchend') {
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
