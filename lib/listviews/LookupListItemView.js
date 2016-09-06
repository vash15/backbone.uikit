import _ from "underscore";
import $ from "jquery";
import BaseView from "../BaseView";
import ListItemView from "./ListItemView";

export default class LookupListItemView extends ListItemView {

	constructor(options) {
		super(options);
	}

	onRender(rendered) {
		if (!rendered) {
			this.cache.$title = $('<span>');
			this.$el.append(this.cache.$title);
		}

		if (this.model) {
			this.cache.$title.text(this.model.toString());
			this.$el.addClass('check');
		}
		else {
			this.cache.$title.text('');
			this.$el.removeClass('check');
		}

		if (this.model && this.model.get(this.options.selectedField)) {
			this.$el.addClass('selected');
		}
		else {
			this.$el.removeClass('selected');
		}

		return this;
	}

}
