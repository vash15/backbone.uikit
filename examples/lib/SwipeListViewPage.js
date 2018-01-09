import _ from 'underscore';
import $ from 'jquery';
import context from 'context-utils';
import { Collection } from 'backbone';
import PageView from '../../lib/PageView';
import OsBarView from '../../lib/navigations/OsBarView';
import SwipeListView from './SwipeListView';
import ModelA from './models/ModelA';

export default class SwipeListViewPage extends PageView {

	addClass() {
		return 'swipe-list-view';
	}

	constructor(options) {
		super(options);

		const state = this.getState();
		const navigationBarView = new OsBarView({
			state: state,
			addClass: 'back-bar',
			left: '<span>Back</span>',
			center: $('<span class="title"></span>').text('Swipe list view'),
			popViewOnBackButton: true
		});
		this.addSubView('navigationBarView', navigationBarView);

		this.initCollection();

		const listView = new SwipeListView(_.extend(this.options.listview || {}, {
			collection: this.collection,
			itemClass: 'ui-swipe-list-item'
		}));
		this.addSubView('listView', listView);

		this.listenTo(listView, 'swipe:left', (view) => { console.log(view) });
		this.listenTo(listView, 'swipe:right', (view) => { console.log(view) });

		// For debug
		window.__listView = listView;
	}

	getNavigationBar() {
		return this.getSubView('navigationBarView');
	}

	onRender(rendered) {
		if (!rendered) {
			const listView = this.getSubView('listView');
			this.$el.append(listView.el);
			listView.render();
		}
	}

	//
	// Utils
	//

	initCollection() {
		const models = [];
		let aModelClass;
		for (var i = 0; i < 30; i++) {
			models.push(new ModelA({
				id: i
			}));
		}

		const collection = new Collection(models);
		this.collection = collection;
	}

}
