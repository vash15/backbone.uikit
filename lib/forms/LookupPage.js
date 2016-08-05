import _ from "underscore";
import $ from "jquery";
import PageView from "../PageView";
import LookupListView from "../listviews/LookupListView";
import IosBarView from "../navigations/IosBarView";

export default class LookupPage extends PageView {

	className() { return 'ui-page ui-lookup-page' }

	constructor(options) {
		super(options);

		this.options = _.defaults(this.options, {
			title: 'Lookup'
		});

		let state = this.getState();
		let navigationBar = new IosBarView({
			state:    state,
			addClass: 'products-page-bar back-bar',
			left:     '<i class="icon-arrow-left"></i>',
			center:   $('<span class="title"></span>').text(this.options.title)
		});
		this.addSubView('navigationBar', navigationBar);
		this.listenTo(navigationBar, 'leftClick', this.onNavigationLeftSideClick);

		// TODO: create a search field if the number of elements is
		//       bigger than 10

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
			let lookupListView = this.getSubView('lookupListView');
			this.$el.append(lookupListView.el);
			lookupListView.render();
		}
	}

}
