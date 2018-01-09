import _ from "underscore";
import $ from "jquery";
import BaseView from "../BaseView";

export default class ListItemView extends BaseView {

	constructor(options) {
		super(options);

		if (options && options.parentList) {
			this.parent = options.parentList;
		}

		this._visibility = false;

		this.listenTo(this.model, 'change', this.render);
	}

	setModel(newModel) {
		if (this.isNewModel(newModel))
			return this;
		if (this.model) {
			this.stopListening(this.model);
			this.model = null;
		}
		if (newModel) {
			this.model = newModel;
			this.listenTo(this.model, 'change', this.render);
		}
		return this;
	}

	isNewModel(newModel) {
		return this.model && newModel && newModel.cid == this.model.cid;
	}

	onRender(rendered) {
		if (!rendered) {
			this.cache.$title = $('<span>').text(this.model.toString());
			this.$el.append(this.cache.$title);
		}
		else if (this.model) {
			this.cache.$title.text(this.model.toString());
		}
		else {
			this.cache.$title.text('');
		}
		return this;
	}

}
