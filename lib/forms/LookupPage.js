import _ from "underscore";
import $ from "jquery";
import context  from "context-utils";
import PageView from "../PageView";
import LookupListView from "../listviews/LookupListView";
import SearchFilterView from "../forms/SearchFilterView";
import IosBarView from "../navigations/IosBarView";
import search from "../utils/search";

export default class LookupPage extends PageView {

	className() { return 'ui-page ui-lookup-page' }

	constructor(options) {
		super(options);

		let state = this.getState();
		this.setDefaultsOptions({
			title: 'Lookup',
			searchPlaceholder: 'Search...',
			searchCancelText: 'Cancel',
			placeholders: null,
			listItemHeight: 44,
			addClass: null,
			addClassNavigationBar: 'ui-lookup-page-navigation-bar back-bar',
			autoClose: false,
			viewstack: state ? state.get('viewstack') : context.viewstack,
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;


		let navigationBar = new IosBarView({
			state:    state,
			addClass: this.options.addClassNavigationBar,
			left:     '<i class="icon-arrow-left"></i>',
			center:   $('<span class="title"></span>').text(this.options.title)
		});
		this.addSubView('navigationBar', navigationBar);
		// this.listenTo(navigationBar, 'leftClick', this.onNavigationLeftSideClick);

		if ( _.isString(this.options.addClass) )
			this.$el.addClass( this.options.addClass );

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
			originalCollection: this.collection,
			collection: this.collection,
			itemHeight: this.options.listItemHeight,
			placeholders: this.options.placeholders,
			multiselect: this.options.multiselect
		});
		this.addSubView('lookupListView', lookupListView);

		this.listenTo(lookupListView, 'selected', this.onSelectedItem );
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

	onSelectedItem(item){
		if ( this.options.autoClose )
			this.viewstack.popView(this, {animated: true});
	}

}
