import _ from "underscore";
import ListView from "./ListView";
import LookupListItemView from "./LookupListItemView";

export default class LookupListView extends ListView {

	className() {
		return 'ui-list-view ui-lookup-list-view';
	}

	constructor(options) {
		super(options);

		this.setDefaultsOptions({
			multiselect: true,
			selectedField: 'selected',
			originalCollection: null
		});
	}

	getListItemViewAtIndexWithOptions(index, options) {
		options.selectedField = this.options.selectedField;
		return new LookupListItemView(options);
	}

	onSelectItem(item, done) {
		if (!item || !item.view.model)
			return done();

		let oldSelection = item.view.model.get(this.options.selectedField);
		let newSelection;

		if (!this.options.multiselect) {
			let conditions = {};
			conditions[this.options.selectedField] = true;
			let collection = this.getCollection();
			if (this.options.originalCollection)
				collection = this.options.originalCollection;
			let selectedModel = collection.findWhere(conditions);
			if (selectedModel) {
				selectedModel.set(this.options.selectedField, false);
			}
			newSelection = true;
		}
		else {
			newSelection = !oldSelection;
		}

		item.view.model.set(this.options.selectedField, newSelection);

		this.trigger('selected', item );

		return done();
	}

}
