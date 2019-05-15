import _ from "underscore";
import $ from "jquery";
import BaseView from "../BaseView";

export default class ListGroupView extends BaseView {

	addClass() {
		return 'ui-list-group';
	}

	constructor(options) {
		super(options);

		if (options && options.parentList) {
			this.parent = options.parentList;
		}

		if (options && _.isNumber(options.index)) {
			this.$el.addClass(`group-${options.index}`);
		}
	}

	onRender(rendered) {
		if (!rendered) {
			this.cache.$title = $('<span>').text(this.options.group);
			this.$el.append(this.cache.$title);
		}
		return this;
	}

}
