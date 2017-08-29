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
			collection: this.collection
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
		for (var i = 0; i < 30; i++) {
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
				image: getImage(size)
			}));
		}

		const differentSizeCollection = new Collection(models);
		this.collection = differentSizeCollection;
	}

}
