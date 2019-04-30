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
			field:                        '',
			selectedValues:               null,
			disabled:                     null,
			autoFocus:                    false,
			label:                        'Lookup field',
			title:                        null,
			multiselect:                  true,
			selectField:                  'selected',
			lookupPageClass:              LookupPage,
			lookupListItemHeight:         44,
			lookupPageClassName:          null,
			lookupNavigationBarClassName: null,
			lookupNavigationBarLeft:      null,
			lookupNavigationBarRight:     null,
			enabledFilter:                true,
			viewstack:                    state ? state.get('viewstack') : context.viewstack,
			searchPlaceholder:            null,
			searchCancelText:             null,
			placeholders:                 null,
			addClass:                     null,
			autoClose:                    false,
			swipeBack:                    true,
			lookupPageItemsPerRow:        1,
			animatePreviousView:          true
		});

		this.viewstack = this.options.viewstack;
		delete this.options.viewstack;

		if ( _.isString(this.options.addClass) )
			this.$el.addClass( this.options.addClass );

		this.fieldAttributes = {
			'data-field': this.options.field
		};

		this.listenTo(this.collection, 'change:' + this.options.selectField, this.onSelectChange);

		this.debounce('onClick');
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
			if (this.cache.$value)
				this.cache.$value.text(valuesString.join(', '));
			this.$el.addClass('selected');
		}
		else {
			if (this.cache.$value)
				this.cache.$value.text('');
			this.$el.removeClass('selected');
		}
	}

	onChange(e) {
	}

	onSelectChange(model) {
		this.renderSelectedValues();
		this.trigger('change', model);
	}

	setSelectedValues(values) {
		this.options.selectedValues = values;
	}

	onClick(e) {
		let state = this.getState();
		let options = {
			state: state,
			collection: this.collection,
			swipeBack: this.options.swipeBack,
			title: this.options.title || this.options.label,
			navigationBarLeft: this.options.lookupNavigationBarLeft,
			navigationBarRight: this.options.lookupNavigationBarRight,
			searchPlaceholder: this.options.searchPlaceholder,
			searchCancelText: this.options.searchCancelText,
			placeholders: this.options.placeholders,
			listItemHeight: this.options.lookupListItemHeight,
			multiselect: this.options.multiselect,
			autoClose: this.options.autoClose,
			viewstack: this.viewstack,
			itemsPerRow: this.options.lookupPageItemsPerRow,
			enabledFilter: this.options.enabledFilter
		};

		if ( _.isString(this.options.lookupPageClassName) )
			options.addClass = this.options.lookupPageClassName;
		if ( _.isString(this.options.lookupNavigationBarClassName) )
			options.addClassNavigationBar = this.options.lookupNavigationBarClassName;

		let lookupPage = new this.options.lookupPageClass(options);
		this.listenTo(lookupPage, 'rightClick', (e, page) => { this.trigger('rightClick', e, page) });
		this.viewstack.pushView(lookupPage, { animated: true, animatePreviousView: this.options.animatePreviousView });
	}

	getValue() {
		let value;
		let query = {};
		query[this.options.selectField] = true;
		let selectedModels = this.collection.where(query);

		if (selectedModels.length > 0) {
			let valuesString = _.map(selectedModels, (aModel) => { return aModel.toString(false) });
			if (this.cache.$value)
				value = valuesString.join(', ');
		}

		return value;
	}

};
