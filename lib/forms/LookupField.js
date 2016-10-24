import _            from "underscore";
import $            from "jquery";
import {Collection} from "backbone"
import context      from "context-utils";
import BaseView     from "../BaseView";
import LookupPage   from "./LookupPage";

export default class LookupField extends BaseView {

	className() { return 'ui-lookup-field' }

	constructor(options) {
		super(options);

		this.addEvents({
			'click': 'onClick',
			'change input[type="hidden"]': 'onChange'
		});

		if (!options)
			throw new Error('No options provided');

		if (!options.field)
			throw new Error('The field option is required');

		let state = this.getState();
		this.setDefaultsOptions({
			field:             '',
			selectedValues:    null,
			// collection:     null,
			disabled:          null,
			autoFocus:         false,
			label:             'Lookup field',
			title:             null,
			multiselect:       false,
			selectField:       'selected',
			lookupPageClass:   LookupPage,
			viewstack:         state ? state.get('viewstack') : context.viewstack,
			searchPlaceholder: null,
			searchCancelText:  null
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		this.fieldAttributes = {
			'data-field': this.options.field
		};

		this.listenTo(this.collection, 'change:' + this.options.selectField, this.onSelectChange);
	}

	setCollection(newCollection, newSelectedValue) {
		this.collection = newCollection;
		this.options.selectedValue = newSelectedValue;
		this.render();
	}

	onRender(rendered) {
		if (!rendered) {
			this.cache.$input = $('<input type="hidden">').attr(this.fieldAttributes);
			this.cache.$label = $('<span class="label">').text(this.options.label);
			this.cache.$value = $('<span class="value">');
			this.renderSelectedValues();
			this.$el.append(
				this.cache.$input,
				this.cache.$label,
				this.cache.$value
			);
		}
	}

	renderSelectedValues() {
		let query = {};
		query[this.options.selectField] = true;
		let selectedModels = this.collection.where(query);
		if (selectedModels.length > 0) {
			let valuesString = _.map(selectedModels, (aModel) => { return aModel.toString(false) });
			this.cache.$value.text(valuesString.join(', '));
			this.$el.addClass('selected');
		}
		else {
			this.cache.$value.text('');
			this.$el.removeClass('selected');
		}
	}

	onChange(e) {
	}

	onSelectChange(model) {
		this.renderSelectedValues();
	}

	setSelectedValues(values) {
		this.options.selectedValues = values;
	}

	onClick(e) {
		let state = this.getState();
		let lookupPage = new this.options.lookupPageClass({
			state: state,
			collection: this.collection,
			swipeBack: true,
			title: this.options.title || this.options.label,
			searchPlaceholder: this.options.searchPlaceholder,
			searchCancelText: this.options.searchCancelText
		});
		this.viewstack.pushView(lookupPage, { animated: true });
	}

	getValue() {
		let value;
		if (this.collection instanceof Collection)
			value = this.collection.get(this.cache.$field.val());
		else
			value = this.cache.$field.val();
		return value;
	}

};
