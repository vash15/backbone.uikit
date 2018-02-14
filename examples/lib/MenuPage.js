import _ from 'underscore';
import $ from 'jquery';
import context from 'context-utils';
import BaseView from '../../lib/BaseView';
import PageView from '../../lib/PageView';
import OsBarView from '../../lib/navigations/OsBarView';
import ListView from '../../lib/listviews/ListView';
import DifferentSizeListViewPage from './DifferentSizeListViewPage';
import SwipeListViewPage from './SwipeListViewPage';
import Card3DPage from './Card3DPage';


class HeaderView extends BaseView {
	constructor(options) {
		super(options);
		this.height = options && options.height ? options.height : '100%';
		this.width  = options && options.width  ? options.width  : '100%';
	}
	onRender() {
		this.$el.text('Header')
			.css('display', 'inline-block')
			.css('height', this.height)
			.css('width', this.width);
	}
}

class FooterView extends BaseView {
	onRender() {
		this.height = 300;
		this.$el.text('Footer').css({
			background: 'red',
			height: this.height
		});
		// setInterval(() => {
		// 	this.height += 100;
		// 	this.$el.height(this.height);
		// }, 2000);
	}
}


export default class MenuPage extends PageView {

	addClass() {
		return 'menu-page';
	}

	constructor(options) {
		super(options);

		this.template = require('../templates/menu.html');

		this.addEvents({
			'click .js-card3d': 'onCard3DClick',
			'click .js-swipe-list-item': 'onSwipeListItemClick',
			'click .js-different-size': 'onDifferentSizeClick',
			'click .js-different-size-with-header': 'onDifferentSizeWithHeaderClick',
			'click .js-different-size-with-2-columns': 'onDifferentSizeWith2ColumnsClick',
			'click .js-different-size-with-3-columns': 'onDifferentSizeWith3ColumnsClick',
			'click .js-different-size-with-4-columns': 'onDifferentSizeWith4ColumnsClick',
			'click .js-horizontal-different-size': 'onHorizontalDifferentSizeClick',
			'click .js-horizontal-different-size-with-header': 'onHorizontalDifferentSizeWithHeaderClick',
			'click .js-horizontal-different-size-with-2-columns': 'onHorizontalDifferentSizeWith2ColumnsClick',
			'click .js-horizontal-different-size-with-3-columns': 'onHorizontalDifferentSizeWith3ColumnsClick',
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

	onCard3DClick() {
		const card3DPage = new Card3DPage();
		context.viewstack.pushView(card3DPage);
	}

	onSwipeListItemClick() {
		const swipeListViewPage = new SwipeListViewPage({
			listview: {
				// headerView: new HeaderView(),
				// headerSize: 40,
				// footerView: new FooterView()
			}
		});
		context.viewstack.pushView(swipeListViewPage);
	}

	onDifferentSizeClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage();
		context.viewstack.pushView(differentSizeListViewPage);
	}

	onDifferentSizeWithHeaderClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				headerView: new HeaderView({ height: 150 }),
				footerView: new FooterView()
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

	onDifferentSizeWith4ColumnsClick() {
		const differentSizeListViewPage = new DifferentSizeListViewPage({
			listview: {
				itemsPerRow: 4,
				placeholders: 30
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
				headerView: new HeaderView({ width: 200 })
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
