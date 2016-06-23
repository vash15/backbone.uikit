import _ from "underscore";
import $ from "jquery";
import BaseView from "../BaseView";
import ImageView from "../ImageView";

export default class ListItemView extends BaseView {

	constructor(options) {
		super(options);

		if (!options.parentList)
			throw new Error('Cannot create ListItemView without a parentList');

		this._parentList = options.parentList;
		this._visibility = false;

		this.addSubView('thumb', new ImageView({
			src: this.model.get('image'),
			viewport: { width: 100, height: 100 },
			autoload: false
		}));

		this.listenTo(this.model, 'change', this.render);
	}

	setModel(newModel) {
		if (this.model) {
			// this.getSubView('thumb').setSource(null);
			this.stopListening(this.model);
			this.model = null;
		}
		if (newModel) {
			this.model = newModel;
			// this.getSubView('thumb').setSource(this.model.get('image'));
			this.listenTo(this.model, 'change', this.render);
		}
	}

	isVisible() {
		return this._visibility;
	}

	setVisibility(newValue) {
		this.onVisiblilityChange(newValue);
	}

	onVisiblilityChange(isVisible) {
		// Abstract method
	}

	onRender(rendered) {
		if (!rendered) {
			this.cache.$title = $('<span>').text(this.model.toString());
			this.$el.append(this.cache.$title);
			this.$el.prepend(this.getSubView('thumb').el);
			this.getSubView('thumb').render();
			this.getSubView('thumb').load();
		}
		else if (this.model) {
			this.cache.$title.text(this.model.toString());
			this.getSubView('thumb').load();
		}
		else {
			this.cache.$title.text('');
		}
		return this;
	}

}
