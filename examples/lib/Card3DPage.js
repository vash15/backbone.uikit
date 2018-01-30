import _ from 'underscore';
import $ from 'jquery';
import context from 'context-utils';
import { Collection } from 'backbone';
import PageView from '../../lib/PageView';
import OsBarView from '../../lib/navigations/OsBarView';
import Card3DView from '../../lib/Card3DView';

export default class Card3DPage extends PageView {

	addClass() {
		return 'card3d-page overflow-scroll';
	}

	constructor(options) {
		super(options);

		const state = this.getState();
		const navigationBarView = new OsBarView({
			state: state,
			addClass: 'back-bar',
			left: '<span>Back</span>',
			center: $('<span class="title"></span>').text('Card 3D'),
			popViewOnBackButton: true
		});
		this.addSubView('navigationBarView', navigationBarView);

		const card3d = new Card3DView({
			state: state
		});
		this.addSubView('card3d', card3d);

		const card3d_2 = new Card3DView({
			state: state
		});
		this.addSubView('card3d_2', card3d_2);

		const card3d_3 = new Card3DView({
			state: state
		});
		this.addSubView('card3d_3', card3d_3);

		const card3d_4 = new Card3DView({
			state: state
		});
		this.addSubView('card3d_4', card3d_4);

		const card3d_5 = new Card3DView({
			state: state
		});
		this.addSubView('card3d_5', card3d_5);

		this.listenTo(card3d, 'click', this.onClick);
		this.listenTo(card3d_2, 'click', this.onClick);
		this.listenTo(card3d_3, 'click', this.onClick);
		this.listenTo(card3d_4, 'click', this.onClick);
		this.listenTo(card3d_5, 'click', this.onClick);

		// For debug
		window.__card3d = card3d;
	}

	getNavigationBar() {
		return this.getSubView('navigationBarView');
	}

	onRender(rendered) {
		if (!rendered) {
			const card3d = this.getSubView('card3d');
			this.$el.append(card3d.el);
			card3d.render();

			const card3d_2 = this.getSubView('card3d_2');
			this.$el.append(card3d_2.el);
			card3d_2.$el.addClass('big');
			card3d_2.render();

			const card3d_3 = this.getSubView('card3d_3');
			this.$el.append(card3d_3.el);
			card3d_3.render();

			const card3d_4 = this.getSubView('card3d_4');
			this.$el.append(card3d_4.el);
			card3d_4.render();

			const card3d_5 = this.getSubView('card3d_5');
			this.$el.append(card3d_5.el);
			card3d_5.render();
		}
	}

	onClick(sender) {
		// console.log('Click', sender);
	}

}
