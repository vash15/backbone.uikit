import _ from "underscore";
import $ from "jquery";
import context from "context-utils";
import { Collection } from "backbone";
import BaseView from "../BaseView";
import ListItemView from "./ListItemView";
import ListGroupView from "./ListGroupView";
import getContextOptions from "../utils/getContextOptions";
import { translate3d, overflowScrolling, getVendorStyle, transition } from "../utils/style";

const TOP_DOWN               = 1;
const DOWN_TOP               = 2;
const LEFT_RIGHT             = 4;
const RIGHT_LEFT             = 8;
const ORIENTATION_VERTICAL   = 'vertical';
const ORIENTATION_HORIZONTAL = 'horizontal';

var ticking = false;
let requestTick = function requestTick(callback) {
	if (!ticking) {
		window.requestAnimationFrame(() => {
			ticking = false;
			callback();
		});
	}
	ticking = true;
}

export default class ListView extends BaseView {

	className() {
		return 'ui-list-view ' + ( _.result(this, "addClass") || '' );
	}

	constructor(options) {
		super(options);

		this.addEvents({
			'click': 'onClick',
			'scroll': 'onScroll',
			'touchstart': 'onTouchStart',
			'touchmove': 'onTouchMove',
			'touchend': 'onTouchEnd',
			'mousedown': 'onTouchStart',
			'mousemove': 'onTouchMove',
			'mouseup': 'onTouchEnd'
		});

		this.setDefaultsOptions(getContextOptions('ListView'), {
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
			pullToRefreshWithOverscroll: false,
			pullToRefreshSize: 60,
			pullToRefreshContent: 'Pull to refresh...',
			pullToRefreshClass: 'ui-pull-to-refresh',
			touchActiveClassName: 'touch-active',
			emptyText: '',
			emptyView: null,
			delayedRender: 0,
			headerView: null, // view to print on the header
			headerSize: 0, // height of the header in a vertical listview or width in an horizontal listview
			footerView: null,
			changeDirectionPan: 50,
			groupBy: null, // enable group
			groupWidth: 50, // used on horizontal list view
			groupHeight: 30 // used on vertical list view
		});

		this.items = []; // store the placeholders
		this.positionAtIndex = {}; // store item position per index
		this.rowItems = []; // used to retrieve row information
		this.rows = []; // used to retrieve the start and end item per row
		this.groups = []; // contains group position, margin and order
		this.groupViews = {}; // cache all the group views
		this.x = 0; // current horizontal scroll
		this.y = 0; // current vertical scroll
		this.previousX = 0;
		this.previousY = 0;
		this.overscrollX = 0;
		this.overscrollY = 0;
		this.isOverscrolling = false;
		this.offsetCalculated = false;
		this.offsetX = 0;
		this.offsetY = 0;
		this.listWidth = 0;
		this.listHeight = 0;
		this.containerSize = 0;
		this.rendered = false;
		this.renderTries = 5;
		this.isLoadingMore = false;
		this.isRefreshing = false;
		this.isClicking = false;
		this.activeItem = null;
		this.touchX = 0;
		this.touchY = 0;
		this.touchStartedAtScollX = 0;
		this.touchStartedAtScollY = 0;
		this.direction = null;
		this.previousDirection = null;
		this.startChangeDirectionAt = null;
		this.headerSize = 0;

		this.setCollection(this.collection);

		this.onMove = _.bind(this.onMove, this);
		// this.resizeContainer = _.debounce(_.bind(this.resizeContainer, this), 10);
		// this.updateAllContents = _.debounce(_.bind(this.updateAllContents, this), 10);
	}

	//
	// Methods
	//

	render() {
		if (this.onRender) {
			if ( this.timeoutId )
				clearTimeout(this.timeoutId);

			this.timeoutId = setTimeout(() => {
				this.timeoutId = null;
				this.requestRender();
			}, this.options.delayedRender);
		}
		else {
			this.rendered = true;
		}
		return this;
	}

	requestRender() {
		if ( this.rafId )
			this.cancelAnimationFrame(this.rafId);

		this.rafId = this.requestAnimationFrame(() => {
			this.rafId = null;
			// Pass to the onRender callback if the view is already rendered
			let result = this.onRender(this.rendered);
			this.delegateEvents();
			this.rendered = (result !== false);
		});
	}

	onRender(rendered) {
		if (rendered) return this;

		// Check list dimensions in order to render correctly
		this.listWidth  = this.$el.width();
		this.listHeight = this.$el.height();
		// if (this.listWidth === 0 && this.listHeight === 0 && this.renderTries > 0) {
		// 	this.renderTries--;
		// 	this.requestRender();
		// 	return false;
		// }

		// Prepare the content
		this.$el
			.addClass('overflow-scroll')
			.addClass(this.options.orientation);

		if (this.options.orientation === ORIENTATION_HORIZONTAL) {
			this.$el.css('white-space', 'nowrap');
		}

		// For Android and WKWebView
		overflowScrolling(this.el, true, this.options.orientation);

		// Empty text
		this.cache.$emptyText = $('<div class="listview-empty empty"></div>').text(this.options.emptyText).hide();

		// Empty view
		if (this.options.emptyView) {
			this.cache.$emptyText.append(this.options.emptyView.el);
			this.options.emptyView.render();
		}

		if (!this.collection.fetching) {
			this.sync();
		}
		this.$el.append(this.cache.$emptyText);

		// Container
		let $scrollContainer = this.cache.$scrollContainer = $('<div class="listview-container">').css({
			position: 'relative',
			overflow: 'visible',
			display: 'inline-block'
		});
		let $groupsContainer = this.cache.$groupsContainer = $('<div class="listview-groups-container">').css({
			position: 'relative',
			display: 'inline-block',
			overflow: 'visible'
		});
		let $placeholderContainer = this.cache.$placeholderContainer = $('<div class="listview-placeholder-container">').css({
			position: 'absolute',
			display: 'inline-block',
			overflow: 'hidden',
			top: 0,
			left: 0
		});
		$scrollContainer.append($groupsContainer);
		$scrollContainer.append($placeholderContainer);
		this.resizeContainer();

		this.requestAnimationFrame(() => {
			this.$el.removeClass('overflow-scroll');
			this.requestAnimationFrame(() => {
				this.$el.addClass('overflow-scroll');
			});
		});

		// Prepare placeholders
		var anElement, anItem, aPosition, aXY;
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

			aXY = this.getXYFromIndex(i);
			if (aXY) {
				anItem.x = aXY.x;
				anItem.y = aXY.y;
			}

			if (this.options.orientation === ORIENTATION_VERTICAL) {
				itemStyle.width = (100 / this.options.itemsPerRow) + '%';
			} else {
				itemStyle.height = (100 / this.options.itemsPerRow) + '%';
			}

			anElement.css(itemStyle);

			this.updateContent(anItem, true);
			this.items.push(anItem);
			$placeholderContainer.append(anElement);
		}

		// Groups
		this.renderGroups();

		// Container
		this.$el.append($scrollContainer);

		// Header
		if (this.options.headerView && this.options.headerView instanceof BaseView) {
			this.options.headerView.$el.css('vertical-align', 'top');
			this.$el.prepend(this.options.headerView.el);
			this.options.headerView.render();
		}

		// Footer
		if (this.options.footerView && this.options.footerView instanceof BaseView) {
			this.$el.append(this.options.footerView.el);
			this.options.footerView.render();
		}

		// Pull to refresh
		if (this.options.pullToRefresh) {
			let $pullToRefresh = this.cache.$pullToRefresh = $('<div>').addClass(this.options.pullToRefreshClass);
			$pullToRefresh.css({
				position: 'absolute',
				top: 0,
				left: 0,
				'margin-top': `-${this.options.pullToRefreshSize}px`,
			});

			// Check if this.options.pullToRefreshContent is a BaseView or not
			if (this.options.pullToRefreshContent instanceof BaseView) {
				$pullToRefresh.append(this.options.pullToRefreshContent.el);
				this.options.pullToRefreshContent.render();
			} else {
				$pullToRefresh.append(this.options.pullToRefreshContent);
			}

			this.$el.prepend($pullToRefresh);
		}
	}

	renderGroups() {
		if (!this.options.groupBy) return;
		let state = this.getState();
		let newGroupViews = {};

		let aListGroupView;
		_.forEach(this.groups, (aGroup, anIndex) => {
			if (!this.groupViews[aGroup.group]) {
				aListGroupView = newGroupViews[aGroup.group] = this.getListGroupViewWithOptions({
					group: aGroup.group,
					index: anIndex,
					state: state
				});
				aListGroupView.el.style.zIndex = 1;

				if (this.options.orientation === ORIENTATION_VERTICAL) {
					aListGroupView.el.style.width   = '100%';
					aListGroupView.el.style.display = 'block';
				} else {
					aListGroupView.el.style.height  = '100%';
					aListGroupView.el.style.display = 'inline-block';
				}
			} else {
				aListGroupView = newGroupViews[aGroup.group] = this.groupViews[aGroup.group];
			}

			// Ensure the order will be correct
			aListGroupView.$el.appendTo(this.cache.$groupsContainer);

			// Update parameters
			if (this.options.orientation === ORIENTATION_VERTICAL) {
				aListGroupView.el.style.height    = aGroup.size + 'px';
				aListGroupView.el.style.marginTop = aGroup.margin + 'px';
			} else {
				aListGroupView.el.style.width      = aGroup.size + 'px';
				aListGroupView.el.style.marginLeft = aGroup.margin + 'px';
			}

			// Render
			aListGroupView.render();
		});

		// Cleanup old ListGroupView
		_.forEach(this.groupViews, (aGroupView, aGroupName) => {
			if (!newGroupViews[aGroupName]) aGroupView.destroy();
		});
		this.groupViews = newGroupViews;
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

			// max 3 arguments
			this.listenTo(item.view, 'all', (eventName, arg0, arg1, arg2) => {
				this.trigger(eventName, arg0, arg1, arg2);
			});
		}

		// Render
		if (item.view) {
			item.view.setModel(model);
			item.view.render();
		}

		// Riposiziona l'elemento
		let position = this.getPositionAtIndex(item.index);
		let xy = this.getXYFromIndex(item.index);
		if (!xy) return;
		item.x = xy.x;
		item.y = xy.y;
		this.requestAnimationFrame(() => {
			// TODO: store old class in a variable and optimize remove/add class
			for (var c = 0; c < this.options.itemsPerRow; c++) {
				if (position.column !== c)
					item.$el.removeClass('col-' + c);
			}
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
		if (!this.rendered) return this;

		var anItem;

		for (var i = 0; i < this.options.placeholders; i++) {
			anItem = this.items[i];
			this.updateContent(anItem);
		}

		this.renderGroups();

		return this;
	}

	resizeContainer() {
		if (this.$el.width() > 0)  this.listWidth  = this.$el.width();
		if (this.$el.height() > 0) this.listHeight = this.$el.height();

		if (this.cache.$placeholderContainer) {
			let containerStyle = {};

			// Calculate the size of every item and get his position
			this.calculateRowPosition();

			if (this.options.orientation === ORIENTATION_VERTICAL) {
				containerStyle.height = this.containerSize + 'px';
				containerStyle.width = '100%';
			} else {
				containerStyle.height = '100%';
				containerStyle.width = this.containerSize + 'px';
			}

			this.cache.$scrollContainer.css(containerStyle);
			this.cache.$placeholderContainer.css(containerStyle);
			this.cache.$groupsContainer.css(containerStyle);
		}
		return this;
	}

	refresh() {
		this.requestAnimationFrame(() => {
			this.resizeContainer().updateAllContents();
		});
		return this;
	}

	pause() {
		overflowScrolling(this.el, false, this.options.orientation);
		return this;
	}

	resume() {
		overflowScrolling(this.el, true, this.options.orientation);
		return this;
	}

	reset() {
		this.onReset();
	}

	sync() {
		this.onSync();
	}

	getListItemViewAtIndexWithOptions(index, options) {
		return new ListItemView(options);
	}

	getListItemSizeAtIndexWithOptions(index) {
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			return this.options.itemHeight;
		} else {
			return this.options.itemWidth;
		}
	}

	getListGroupViewWithOptions(options) {
		return new ListGroupView(options);
	}

	getListGroupSizeWithOptions(index) {
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			return this.options.groupHeight;
		} else {
			return this.options.groupWidth;
		}
	}

	setCollection(collection) {
		let CollectionClass = Collection;
		if (this.collection) {
			this.stopListening(this.collection);
			CollectionClass = this.collection.constructor;
		}

		if (!collection) {
			this.collection = null;
			return;
		}

		if ( !(collection instanceof CollectionClass) ){
			collection = new CollectionClass(collection);
		}


		this.collection = collection;

		this.listenTo(this.collection, 'sync',   this.onSync);
		this.listenTo(this.collection, 'reset',  this.onReset);
		this.listenTo(this.collection, 'sort',   this.onSort);
		this.listenTo(this.collection, 'add',    _.debounce(_.bind(this.onAdd, this)));
		this.listenTo(this.collection, 'remove', _.debounce(_.bind(this.onRemove, this)));

		// Reset
		this.reset();
	}

	pullToRefresh() {
		if (this.isRefreshing) return;
		if (typeof this.onRefresh == 'function') {
			this.isRefreshing = true;

			this.showPullToRefresh();

			// Stops the scroll
			this.pause();

			if (this.options.pullToRefreshContent instanceof BaseView && 'onRefreshStart' in this.options.pullToRefreshContent) {
				this.options.pullToRefreshContent.onRefreshStart();
			}

			this.onRefresh((successfully) => {
				if (this.options.pullToRefreshContent instanceof BaseView && 'onRefreshComplete' in this.options.pullToRefreshContent) {
					this.options.pullToRefreshContent.onRefreshComplete(successfully || successfully === void 0);
				}
				this.isRefreshing = false;
				this.resume();
				this.hidePullToRefresh();
			});
		}
	}

	updatePullToRefreshOverscrollPosition() {
		this.cache.$pullToRefresh.get(0).style[getVendorStyle('transition')] = '';
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			let translateY = this.overscrollY;
			// Add some friction
			if (translateY > 100)
				translateY = Math.sqrt(100 * translateY);
				// translateY = 50 * Math.log10(translateY);
			translate3d(this.cache.$pullToRefresh, 0, translateY, 0);
		}
		else {
			let translateX = this.overscrollX;
			// Add some friction
			if (translateX > 100)
				translateX = Math.sqrt(100 * translateX);
				// translateX = 50 * Math.log10(translateX);
			translate3d(this.cache.$pullToRefresh, 0, this.overscrollX, 0);
		}
	}

	showPullToRefresh() {
		// If overscroll is disabled we don't want animation on pull to refresh view
		if (this.options.pullToRefreshWithOverscroll)
			transition(this.cache.$pullToRefresh, 'transform 300ms ease-out');
		else
			transition(this.cache.$pullToRefresh, '');

		translate3d(this.cache.$pullToRefresh, 0, this.options.pullToRefreshSize, 0);
		if (!this.options.pullToRefreshWithOverscroll) {
			transition(this.cache.$scrollContainer, '');
			translate3d(this.cache.$scrollContainer, 0, this.options.pullToRefreshSize, 0);
		}
	}

	hidePullToRefresh() {
		setTimeout(() => {
			transition(this.cache.$pullToRefresh, 'transform 300ms ease-out');
			translate3d(this.cache.$pullToRefresh, 0, 0, 0);
			if (!this.options.pullToRefreshWithOverscroll) {
				transition(this.cache.$scrollContainer, 'transform 300ms ease-out');
				translate3d(this.cache.$scrollContainer, 0, 0, 0);
			}
		}, 300);
	}

	setItemsPerRow(newItemsPerRow) {
		if (newItemsPerRow == this.options.itemsPerRow) return;
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
				itemStyle.width = (100 / this.options.itemsPerRow) + '%';
				scrollDelta = oldStartItemPosition.row * this.options.itemHeight + this.y;
				scrollTo = newStartItemPosition.row * this.options.itemHeight - scrollDelta;
				this.el.scrollTop = scrollTo;
			} else {
				itemStyle.height = (100 / this.options.itemsPerRow) + '%';
				scrollDelta = oldStartItemPosition.row * this.options.itemWidth + this.x;
				scrollTo = newStartItemPosition.row * this.options.itemWidth - scrollDelta;
				this.el.scrollLeft = scrollTo;
			}

			// Resize all items
			for (var i = 0; i < this.items.length; i++) {
				this.items[i].$el.css(itemStyle);
				for (var c = 0; c < oldItemsPerRow; c++) {
					this.items[i].$el.removeClass('col-' + c);
				}
			}

			this.updateAllContents();
		}, 100);
	}

	setEmptyText(text) {
		this.options.emptyText = text;
		if (this.cache.$emptyText)
			this.cache.$emptyText.text(text);
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
		this.pause();
		this.el.scrollTop = 0;
		// Trigger change:direction when user taps the status bar
		this.direction = DOWN_TOP;
		if (this.direction != this.previousDirection) {
			this.trigger('change:direction', this.direction);
			this.previousDirection = this.direction;
		}
		this.resume();
	}

	isVertical() {
		return this.options.orientation === ORIENTATION_VERTICAL;
	}

	//
	// Events
	//

	onScroll(ev) {
		requestTick(this.onMove);
	}

	onMove() {
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			let y = this.y = -this.el.scrollTop;
			this.direction = y < this.previousY ? TOP_DOWN : DOWN_TOP;
			if (this.direction != this.previousDirection && y < 0) {
				this.startChangeDirectionAt = y;
				this.previousDirection = this.direction;
			}

			if (this.startChangeDirectionAt !== null && Math.abs(this.startChangeDirectionAt - y) > this.options.changeDirectionPan) {
				this.startChangeDirectionAt = null;
				this.trigger('change:direction', this.direction);
			}

			this.previousY = y;

			if (this.options.infinite) {
				if (this.containerSize - this.listHeight - this.options.distance < -y) {
					this.loadMore();
				}
			}
		}
		else {
			let x = this.x = -this.el.scrollLeft;
			this.direction = x < this.previousX ? LEFT_RIGHT : RIGHT_LEFT;
			if (this.direction != this.previousDirection && x < 0) {
				this.trigger('change:direction', this.direction);
				this.previousDirection = this.direction;
			}

			this.previousX = x;

			if (this.options.infinite) {
				if (this.containerSize - this.listWidth - this.options.distance < -x) {
					this.loadMore();
				}
			}
		}

		let { startIndex, endIndex } = this.getStartEndIndex();
		this.updateRangeContents(startIndex, endIndex);
	}

	onTouchStart(e) {
		if ((this.isClicking || this.isRefreshing || this.activeItem) && e.editable)
			return;

		this.touchStartedAtScrollX = this.x;
		this.touchStartedAtScrollY = this.y;

		if ('onSelectItem' in this) {
			let event = this.normalizeEvent(e);
			let x     = -event.x + this.x;
			let y     = -event.y + this.y;
			let item  = this.getItemFromXY(x, y);
			this.touchX = event.x;
			this.touchY = event.y;
			if (item && item.view) {
				this.activeItem = item;
				window.requestAnimationFrame(() => {
					if (this.activeItem)
						this.activeItem.view.$el.addClass(this.options.touchActiveClassName);
				});
			}
		}
	}

	onTouchMove(e) {
		if ((this.isOverscrolling || this.isRefreshing) && e.cancelable) {
			e.preventDefault();
			e.stopPropagation();
		}
		let event  = this.normalizeEvent(e);
		let deltaX = Math.abs(this.touchX - event.x);
		let deltaY = Math.abs(this.touchY - event.y);
		if (this.activeItem && (deltaX > 20 || deltaY > 20)) {
			window.requestAnimationFrame(() => {
				if (this.activeItem) {
					this.activeItem.view.$el.removeClass(this.options.touchActiveClassName);
					this.activeItem = null;
				}
			});
		}
		// Overscroll
		if (this.options.pullToRefresh && this.options.pullToRefreshWithOverscroll && !this.isRefreshing) {
			if (this.y === 0) {
				this.overscrollY = event.y - this.touchY + this.touchStartedAtScrollY;
				this.updatePullToRefreshOverscrollPosition();
				if (this.overscrollY >= 10) {
					this.isOverscrolling = true;
				}
				// console.log('y:%s ty:%s oy:%s overscrolling:%s', this.y, this.touchY, this.overscrollY, this.isOverscrolling);
			}
			else if (this.x === 0) {
				this.overscrollX = event.x - this.touchX + this.touchStartedAtScrollX;
				this.updatePullToRefreshOverscrollPosition();
				if (this.overscrollX >= 10) {
					this.isOverscrolling = true;
				}
			}
		}
	}

	onTouchEnd(e) {
		this.isOverscrolling = false;

		// Trigger refresh due to pullToRefresh
		if (this.options.pullToRefresh && !this.isRefreshing) {
			if ((this.options.pullToRefreshWithOverscroll && this.overscrollY > this.options.pullToRefreshSize * 2)
				|| (!this.options.pullToRefreshWithOverscroll && this.y > this.options.pullToRefreshSize * 2)) {
				this.pullToRefresh();
			}
			else {
				this.hidePullToRefresh();
			}
		}

		if (this.activeItem) {
			window.requestNextAnimationFrame(() => {
				if (this.activeItem) {
					this.activeItem.view.$el.removeClass(this.options.touchActiveClassName);
					this.activeItem = null;
				}
			});
		}
	}

	onClick(e) {
		if (this.isClicking || this.isRefreshing) return;

		if ('onSelectItem' in this) {
			// Calculate the header size again to be sure that its dimension
			// isn't changed
			if (this.options.headerView && this.options.headerSize === 0) {
				this.headerSize = this.options.headerView.$el.height();
			}

			let event = this.normalizeEvent(e);
			let x     = -event.x + this.x;
			let y     = -event.y + this.y;
			let item  = this.getItemFromXY(x, y);

			// To retrieve an element from x,y
			let element = document.elementFromPoint(event.pageX, event.pageY);

			if (item && item.view) {
				this.isClicking = true;
				this.onSelectItem({ view: item.view, element: element }, () => {
					this.isClicking = false;
				});
			}
		}
	}

	onAdd(model) {
		if (this.rendered) {
			this.resizeContainer();
			this.updateAllContents();
		}
		if (this.cache.$emptyText) {
			// Empty state
			if (this.collection.length === 0) {
				this.cache.$emptyText.show();
			}
			else {
				this.cache.$emptyText.hide();
			}
		}
	}

	onRemove(model) {
		if (this.rendered) {
			this.resizeContainer();
			this.updateAllContents();
		}
		this.sync();
	}

	onSync() {
		if (this.cache.$emptyText) {
			// Empty state
			if (this.collection.length === 0) {
				this.cache.$emptyText.show();
			}
			else {
				this.cache.$emptyText.hide();
			}
		}
		if (this.rendered) {
			// Update container and content
			this.resizeContainer();
			this.updateAllContents();
			// this.pause();
			// window.requestAnimationFrame(() => {
			// 	this.resume();
			// });
		}
	}

	onSort() {
		if (this.rendered) {
			this.updateAllContents();
		}
	}

	onReset() {
		if (this.rendered) {
			// Reset item indexes
			for (var i = 0, n = this.items.length; i < n; i++) {
				this.items[i].index = i;
			}
			window.requestAnimationFrame(() => {
				// Reset scroll
				this.x = 0;
				this.y = 0;
				this.el.scrollTop = 0;
				this.el.scrollLeft = 0;
				this.sync();
			});
		}
	}

	onDestroy() {
		let anItem;
		for (let i = 0; i < this.options.placeholders; i++) {
			anItem = this.items[i];
			if (anItem && anItem.view) anItem.view.destroy();
		}
		let aGroup;
		for (let i = 0; i < this.groupViews.length; i++) {
			aGroup = this.groupViews[i];
			if (aGroup) aGroup.destroy();
		}
		super.onDestroy();
	}

	//
	// Helpers
	//

	wrapIndex(index) {
		if (index < 0) return index;
		var n = this.options.placeholders;
		return ((index % n) + n) % n;
	}

	normalizeEvent(e) {
		var x, y, pageX, pageY;
		if (!this.offsetCalculated) {
			var offset   = this.$el.offset();
			this.offsetX = offset.left;
			this.offsetY = offset.top;
		}
		if (e.type === 'click' || e.type === 'mouseup' || e.type === 'mousedown' || e.type === 'mousemove') {
			x     = e.pageX - this.offsetX;
			y     = e.pageY - this.offsetY;
			pageX = e.pageX;
			pageY = e.pageY;
		}
		else if (e.type === 'touchstart' || e.type === 'touchend' || e.type === 'touchmove') {
			x     = e.originalEvent.changedTouches[0].pageX - this.offsetX;
			y     = e.originalEvent.changedTouches[0].pageY - this.offsetY;
			pageX = e.originalEvent.changedTouches[0].pageX;
			pageY = e.originalEvent.changedTouches[0].pageY;
		}
		return { x: x, y: y, pageX: pageX, pageY: pageY };
	}

	getContainerSize() {
		let rows = this.getRowsCount();
		let infiniteLoadingSize = 0;

		if (this.options.infinite && this.shouldLoadMore()) {
			infiniteLoadingSize = this.options.infiniteLoadingSize;
		}

		return this.containerSize + this.options.headerSize;
	}

	calculateRowPosition() {
		if (!this.listWidth || !this.listHeight) {
			return;
		}

		const state          = this.getState();
		this.positionAtIndex = {};
		this.rows            = [];
		this.rowItems        = [];
		this.groups          = [];

		const headerSize  = this.options.headerSize;
		const itemsPerRow = this.options.itemsPerRow;
		const orientation = this.options.orientation;

		let aCumulativePosition = headerSize;
		let aCumulativeGroupSize = 0;
		let aContainterSize = aCumulativePosition;
		let aSize;
		let aRowMaxSize = 0;
		let aRow = 0;
		let aColumn;
		let aColumnWidth;
		let aColumnHeight;
		let collection = this.collection.toArray();

		// Add a null model to the collection array to positionate every
		// placeholder
		if (collection.length < this.options.placeholders) {
			for (var i = collection.length; i < this.options.placeholders; i++) {
				collection.push(null);
			}
		}

		let aColumnIndex = 0;
		let aGroupSize;
		let aGroupMargin;
		let aPreviousGroupPosition = 0;
		let aGroupBy;
		let aLastGroupBy;

		collection.forEach((aModel, anIndex) => {

			// Group by
			if (this.options.groupBy) {
				aGroupBy = aModel ? aModel.get(this.options.groupBy) : null;
				if (aGroupBy != null && (aGroupBy != aLastGroupBy || anIndex === 0)) {
					aGroupSize = this.getListGroupSizeWithOptions({
						group: aGroupBy,
						state: state
					});

					if (_.isNaN(aGroupSize) || _.isUndefined(aGroupSize) || _.isNull(aGroupSize)) {
						aGroupSize = this.options.orientation === ORIENTATION_VERTICAL ? this.options.groupHeight : this.options.groupWidth;
					}

					// Add a row to the list
					if (aColumnIndex !== 0) {
						aRow++;
						aCumulativePosition += aRowMaxSize;
						aContainterSize += aRowMaxSize;
					}

					// Calculate the margin between ListGroupView
					aGroupMargin = aCumulativePosition - aPreviousGroupPosition;

					// Cache ListGroupView informatioons
					this.groups.push({
						group:  aGroupBy,
						margin: aGroupMargin,
						size:   aGroupSize
					});

					aPreviousGroupPosition += aGroupMargin + aGroupSize;
					aCumulativePosition += aGroupSize;
					aCumulativeGroupSize += aGroupSize;
					aColumnIndex = 0;
					aRowMaxSize = 0;
					aLastGroupBy = aGroupBy;
				}
			}

			aSize = this.getListItemSizeAtIndexWithOptions(anIndex, {
				model: aModel,
				state: state
			});

			if (_.isNaN(aSize) || _.isUndefined(aSize) || _.isNull(aSize) ) {
				aSize = this.options.orientation === ORIENTATION_VERTICAL ? this.options.itemHeight : this.options.itemWidth;
			}

			aRowMaxSize = Math.max(aRowMaxSize, aSize);

			if (!this.rowItems[aRow]) {
				this.rowItems.push([]);
			}

			if (orientation === ORIENTATION_VERTICAL) {
				aColumn      = (aColumnIndex % itemsPerRow);
				aColumnWidth = (this.listWidth / itemsPerRow);
				this.positionAtIndex[anIndex] = {
					row: aRow,
					column: aColumn,
					index: anIndex,
					top: aCumulativePosition,
					right: (aColumn + 1) * aColumnWidth,
					bottom: aCumulativePosition + aSize,
					left: aColumn * aColumnWidth
				};
				this.rowItems[aRow].push(this.positionAtIndex[anIndex]);
			} else {
				aColumn       = (aColumnIndex % itemsPerRow);
				aColumnHeight = (this.listHeight / itemsPerRow);
				this.positionAtIndex[anIndex] = {
					row: aRow,
					column: aColumn,
					index: anIndex,
					top: aColumn * aColumnHeight,
					right: aCumulativePosition + aSize,
					bottom: (aColumn + 1) * aColumnHeight,
					left: aCumulativePosition
				};
				this.rowItems[aRow].push(this.positionAtIndex[anIndex]);
			}

			if (!this.rows[aRow]) {
				// Start and end will be updated at row change because we keep
				// a reference to the position object
				this.rows[aRow] = {
					start: this.positionAtIndex[anIndex],
					end:   this.positionAtIndex[anIndex]
				};
			} else {
				this.rows[aRow].end = this.positionAtIndex[anIndex];
			}

			if (aColumnIndex % itemsPerRow === itemsPerRow - 1 || anIndex === this.collection.length - 1) {
				aCumulativePosition += aRowMaxSize;
				if (aModel) {
					aContainterSize += aRowMaxSize;
				}

				// Change the bottom property of every column in row
				// only if itemsPerRow > 1
				if (itemsPerRow > 1) {
					for (let i = 0; i < this.rowItems[aRow].length; i++) {
						if (orientation === ORIENTATION_VERTICAL) {
							this.rowItems[aRow][i].bottom = this.rowItems[aRow][i].top + aRowMaxSize;
						}
						else {
							this.rowItems[aRow][i].right = this.rowItems[aRow][i].left + aRowMaxSize;
						}
					}
				}
				aRowMaxSize = 0;
				aRow++;
				aColumnIndex = 0;
			} else {
				aColumnIndex++;
			}
		});

		// If the number of elements is less than placeholders, the containterSize
		// will be scaled to aCumulativePosition
		this.containerSize = this.collection.length > this.options.placeholders ? aCumulativePosition : aContainterSize + aCumulativeGroupSize; // Math.max(aContainterSize, aCumulativePosition);
	}

	getStartEndIndex() {
		let startPosition;
		let endPosition;

		if (this.options.orientation === ORIENTATION_VERTICAL) {
			startPosition = Math.abs(this.y);
			endPosition   = startPosition + this.listHeight;
		} else {
			startPosition = Math.abs(this.x);
			endPosition   = startPosition + this.listWidth;
		}

		let startIndex = -1;
		let endIndex   = -1;
		let rowLength  = this.rows.length;
		let property   = this.options.orientation === ORIENTATION_VERTICAL ? 'top' : 'left';

		let aRow;
		let aPreviousRow = this.rows[0];
		for (let anIndex = 0; anIndex < rowLength && (startIndex === -1 || endIndex === -1); anIndex++) {
			aRow = this.rows[anIndex];

			if (aRow.start[property] > startPosition && startIndex === -1) {
				startIndex = aPreviousRow.start.index;
			}
			if ((aRow.start[property] > endPosition || anIndex === rowLength - 1) && endIndex === -1) {
				endIndex = aRow.end.index;
			}

			aPreviousRow = aRow;
		}

		return { startIndex, endIndex };
	}

	getStartIndex() {
		let { startIndex, endIndex } = this.getStartEndIndex();
		return startIndex;
	}

	getEndIndex() {
		let { startIndex, endIndex } = this.getStartEndIndex();
		return endIndex;
	}

	getXYFromIndex(index) {
		let aPosition = this.getPositionAtIndex(index);
		if (!aPosition) return null;
		let xy = {};
		if (this.options.orientation === ORIENTATION_VERTICAL) {
			xy = {
				x: aPosition.column * Math.floor(this.listWidth / this.options.itemsPerRow),
				y: aPosition.top
			};
		}
		else {
			xy = {
				x: aPosition.left,
				y: aPosition.column * Math.floor(this.listHeight / this.options.itemsPerRow)
			};
		}
		return xy;
	}

	binarySearch(rows, x, y) {

		x = Math.abs(x);
		y = Math.abs(y);

		const headerDeltaX = this.options.orientation === ORIENTATION_HORIZONTAL ? this.headerSize : 0;
		const headerDeltaY = this.options.orientation === ORIENTATION_VERTICAL   ? this.headerSize : 0;

		const inRect = (items, x, y) => {
			return _.find(items, (anItem) => {
				return x >= anItem.left + headerDeltaX && x <= anItem.right + headerDeltaX
					&& y >= anItem.top + headerDeltaY && y <= anItem.bottom + headerDeltaY;
			});
		};

		const isBeforeRect = (items, x, y) => {
			if (this.options.orientation === ORIENTATION_VERTICAL)
				return y < items[0].top + headerDeltaY;
			else
				return x < items[0].left + headerDeltaX;
		};

		const isAfterRect = (items, x, y) => {
			if (this.options.orientation === ORIENTATION_VERTICAL)
				return y > items[0].bottom + headerDeltaY;
			else
				return x > items[0].right + headerDeltaX;
		};

		var startIndex = 0,
			stopIndex  = rows.length - 1,
			middle     = Math.floor((stopIndex + startIndex)/2);

		while (!inRect(rows[middle], x, y) && startIndex < stopIndex) {

			//adjust search area
			if (isBeforeRect(rows[middle], x, y)) {
				stopIndex = middle - 1;
			} else { // else if (isAfterRect(rows[middle], x, y)) {
				startIndex = middle + 1;
			}

			//recalculate middle
			middle = Math.floor((stopIndex + startIndex)/2);
		}

		//make sure it's the right value
		let result = inRect(rows[middle], x, y);
		return result ? result.index : -1;
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

		// Calculate the header size again to be sure that its dimension
		// isn't changed
		if (this.options.headerView) {
			if (this.options.orientation === ORIENTATION_VERTICAL)
				this.headerSize = this.options.headerView.$el.outerHeight();
			else
				this.headerSize = this.options.headerView.$el.outerWidth();
		}

		index = this.binarySearch(this.rowItems, x, y);

		return index;
	}

	getItemFromXY(x, y) {
		let index = this.getIndexFromXY(x, y);
		return this.getItemAtIndex(index);
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

		return this.positionAtIndex[index];
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
ListView.ORIENTATION_HORIZONTAL = ORIENTATION_HORIZONTAL;
ListView.TOP_DOWN               = 1;
ListView.DOWN_TOP               = 2;
ListView.LEFT_RIGHT             = 4;
ListView.RIGHT_LEFT             = 8;
