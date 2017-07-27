import _ from 'underscore';
import $ from 'jquery';
import context from 'context-utils';
import PageView from '../../lib/PageView';
import OsBarView from '../../lib/navigations/OsBarView';
import ListView from '../../lib/listviews/ListView';
import DifferentSizeListViewPage from './DifferentSizeListViewPage';

export default class MenuPage extends PageView {

	addClass() {
		return 'menu-page';
	}

	constructor(options) {
		super(options);

		this.template = require('../templates/menu.html');

		this.addEvents({
			'click .js-different-size': 'onDifferentSizeClick',
			'click .js-different-size-with-header': 'onDifferentSizeWithHeaderClick',
			'click .js-different-size-with-2-columns': 'onDifferentSizeWith2ColumnsClick',
			'click .js-different-size-with-3-columns': 'onDifferentSizeWith3ColumnsClick',
			'click .js-horizontal-different-size': 'onHorizontalDifferentSizeClick',
			'click .js-horizontal-different-size-with-header': 'onHorizontalDifferentSizeWithHeaderClick',
			'click .js-horizontal-different-size-with-2-columns': 'onHorizontalDifferentSizeWith2ColumnsClick',
			'click .js-horizontal-different-size-with-3-columns': 'onHorizontalDifferentSizeWith3ColumnsClick'
		});

		let state = this.getState();
		let navigationBarView = new OsBarView({
			state: state,
			addClass: 'back-bar',
			center: $('<span class="title"></span>').text('Examples'),
			popViewOnBackButton: false
		});
		this.addSubView('navigationBarView', navigationBarView);
	}

	getNavigationBar() {
		return this.getSubView('navigationBarView');
	}

	onRender(rendered) {
		if (!rendered) {
			this.$el.html(this.template());
		}
	}

	//
	// Vertial list view
	//

	onDifferentSizeClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage();
		context.viewstack.pushView(differentSizeListViewPage);
	}

	onDifferentSizeWithHeaderClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				headerSize: 40
			}
		});
		context.viewstack.pushView(differentSizeListViewPage);
	}

	onDifferentSizeWith2ColumnsClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				itemsPerRow: 2
			}
		});
		context.viewstack.pushView(differentSizeListViewPage);
	}

	onDifferentSizeWith3ColumnsClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				itemsPerRow: 3
			}
		});
		context.viewstack.pushView(differentSizeListViewPage);
	}

	//
	// Horizontal list view
	//

	onHorizontalDifferentSizeClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				orientation: ListView.ORIENTATION_HORIZONTAL
			}
		});
		context.viewstack.pushView(differentSizeListViewPage);
	}

	onHorizontalDifferentSizeWithHeaderClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				orientation: ListView.ORIENTATION_HORIZONTAL,
				headerSize: 40
			}
		});
		context.viewstack.pushView(differentSizeListViewPage);
	}

	onHorizontalDifferentSizeWith2ColumnsClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				orientation: ListView.ORIENTATION_HORIZONTAL,
				itemsPerRow: 2
			}
		});
		context.viewstack.pushView(differentSizeListViewPage);
	}

	onHorizontalDifferentSizeWith3ColumnsClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				orientation: ListView.ORIENTATION_HORIZONTAL,
				itemsPerRow: 3
			}
		});
		context.viewstack.pushView(differentSizeListViewPage);
	}


}
