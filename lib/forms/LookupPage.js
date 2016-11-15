import _ from "underscore";
import $ from "jquery";
import PageView from "../PageView";
import LookupListView from "../listviews/LookupListView";
import SearchFilterView from "../forms/SearchFilterView";
import IosBarView from "../navigations/IosBarView";
import search from "../utils/search";

export default class LookupPage extends PageView {

	className() { return 'ui-page ui-lookup-page' }

	constructor(options) {
		super(options);

		this.setDefaultsOptions({
			title: 'Lookup',
			searchPlaceholder: 'Search...',
			searchCancelText: 'Cancel'
		});

		let state = this.getState();
		let navigationBar = new IosBarView({
			state:    state,
			addClass: 'products-page-bar back-bar',
			left:     '<i class="icon-arrow-left"></i>',
			center:   $('<span class="title"></span>').text(this.options.title)
		});
		this.addSubView('navigationBar', navigationBar);
		// this.listenTo(navigationBar, 'leftClick', this.onNavigationLeftSideClick);

		// If the number of elements is bigger than 10
		if (this.collection.length > 10) {
			// Hide the keyboard on touch move
			this.addEvents({
				'touchmove': 'onTouchMove'
			});
			this.onTouchMove = _.throttle(_.bind(this.onTouchMove, this), 10);

			// Filter view
			let searchFilterView = new SearchFilterView({
				placeholder: this.options.searchPlaceholder,
				cancelText: this.options.searchCancelText
			});
			this.addSubView('searchFilter', searchFilterView);
			this.listenTo(searchFilterView, 'filter', this.onSearchFilter);
			this.cache.isSearchFilterVisible = true;
		}
		else {
			this.cache.isSearchFilterVisible = false;
		}

		let lookupListView = new LookupListView({
			collection: this.collection,
			itemHeight: 44
		});
		this.addSubView('lookupListView', lookupListView);
	}

	getNavigationBar() {
		return this.getSubView('navigationBar');
	}

	onRender(rendered) {
		if (!rendered) {
			let searchFilterView = this.getSubView('searchFilter');
			if (searchFilterView) {
				this.$el.addClass('filtered');
				this.$el.append(searchFilterView.el);
				searchFilterView.render();
			}
			let lookupListView = this.getSubView('lookupListView');
			this.$el.append(lookupListView.el);
			lookupListView.render();
		}
	}

	onSearchFilter(filter) {
		if (filter == '') {
			this.getSubView('lookupListView').setCollection(this.collection);
		}
		else {
			this.filterCollection = this.collection.filter((model) => {
				return search.words(filter, typeof model.toSearchString === 'function' ? model.toSearchString() : model.toString());
			});
			this.getSubView('lookupListView').setCollection(this.filterCollection);
		}
	}

	onTouchMove(e) {
		$(':focus').blur();
		// if (this.cache.isSearchFilterVisible && this.getSubView('searchFilter').hasFocus()) {
		// 	this.getSubView('searchFilter').blur();
		// }
	}

}
