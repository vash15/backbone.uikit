import _ from 'underscore';
import $ from 'jquery';
import context from 'context-utils';
import { Collection } from 'backbone';
import PageView from '../../lib/PageView';
import OsBarView from '../../lib/navigations/OsBarView';
import DifferentSizeListView from './DifferentSizeListView';
import ModelA from './models/ModelA';
import ModelB from './models/ModelB';
import ModelC from './models/ModelC';


class SortedCollection extends Collection {

	comparator(itemA, itemB) {
		if (itemA.get('group') < itemB.get('group')) {
			return -1;
		} else if (itemA.get('group') > itemB.get('group')) {
			return 1;
		} else {
			return 1;
		}
	}

}

export default class DifferentSizeListViewPage extends PageView {

	addClass() {
		return 'different-size-list-view';
	}

	constructor(options) {
		super(options);

		const state = this.getState();
		const navigationBarView = new OsBarView({
			state: state,
			addClass: 'back-bar',
			left: '<span>Back</span>',
			center: $('<span class="title"></span>').text('Different size list view'),
			popViewOnBackButton: true
		});
		this.addSubView('navigationBarView', navigationBarView);

		this.initCollection();

		const differentSizeListView = new DifferentSizeListView(_.extend(this.options.listview || {}, {
			collection: this.collection,
			groupBy: 'group', // Comment this line to disable the group functionality
			groupHeight: 50,
			groupWidth: 50
		}));
		this.addSubView('differentSizeListView', differentSizeListView);

		// For debug
		window.__listView = differentSizeListView;
	}

	getNavigationBar() {
		return this.getSubView('navigationBarView');
	}

	onRender(rendered) {
		if (!rendered) {
			const differentSizeListView = this.getSubView('differentSizeListView');
			this.$el.append(differentSizeListView.el);
			differentSizeListView.render();
		}
	}

	//
	// Utils
	//

	initCollection() {
		const colors = [
			'rgb(156, 221, 174)',
			'rgb(219, 204, 126)',
			'rgb(126, 177, 219)'
		];

		const getImage = (size) => {
			return 'http://via.placeholder.com/200x200'; //?_=' + Math.floor(Math.random() * 1000000);
		};

		const models = [];
		let aModelClass;
		let aGroupBy;
		for (var i = 0; i < 200; i++) { // 30
			let size = (i % 3 + 1) * 100;
			switch (i%3) {
				case 0: aModelClass = ModelA; break;
				case 1: aModelClass = ModelB; break;
				case 2: aModelClass = ModelC; break;
			}
			models.push(new aModelClass({
				id: i,
				size: size,
				color: colors[i % 3],
				image: getImage(size),
				group: Math.floor(i / 5) + 1
			}));
		}

		const differentSizeCollection = new SortedCollection(models);
		this.collection = differentSizeCollection;

		window.ModelA = ModelA;
		window._collection = this.collection;
	}

}
