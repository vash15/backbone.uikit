import _ from 'underscore';
import $ from 'jquery';
import ListView from '../../lib/listviews/ListView';
import SwipeListItemView from '../../lib/listviews/SwipeListItemView';

class MySwipeListItemView extends SwipeListItemView {

	constructor(options) {
		super(options);
	}

	onRender(rendered) {
		super.onRender(rendered);
		this.cache.$drawer.html('<p>Title</p><p>Description description description</p><p>Short description</p>');
	}

}

export default class SwipeListView extends ListView {

	getListItemViewAtIndexWithOptions(index, options) {
		return new MySwipeListItemView(options);
	}

	onSelectItem(item, done) {
		if (item) {
			console.log(item.element);
		}
		return done();
	}

}
