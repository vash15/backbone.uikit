
import _        from "underscore";
import $        from "jquery";
import BaseView from "../BaseView";

export default class SearchFilterView extends BaseView {

	className(){ return 'ui-search-filter' }

	constructor(options) {
		super(options);

		this.options = _.defaults(options||{}, {filter: ''});

		this.addEvents({
			'keyup input':          'keyup',
			'focus input':          'focus',
			'blur input' :          'blur',
			'click .clear': 		'clear',
			'click .barcodeSearch': 'barcodeSearch'
		});

		this._filter = this.options.filter || '';
		this.options = options;
		if ( options.barcode )
			this.$el.toggleClass("barcode");
	}

	onRender(rendered) {
		if ( rendered ) return this;

		let search = this.cache.search = $('<input>').attr({
			'type':           'search',
			'placeholder':    this.options.placeholder || 'Search...',
			'data-field':     'filter',
			'autocorrect':    'off',
			'autocomplete':   'off',
			'autocapitalize': 'none'
		});
		search.val(this._filter);

		let div = $('<div>').addClass('input').append(search);

		this.cache.$clear = $('<i>').addClass('icon-delete clear');

		this.$el.append(
			$('<i>').addClass('icon-search'),
			this.cache.$clear,
			$('<i>').addClass('icon-barcode barcodeSearch'),
			div
		);

		this._updateClear();

		return this;
	}

	clear() {
		this.cache.search.val('');
		// Focus only on PC not tablet
		setTimeout(() => {
			this.trigger('filter', '');
		}, 100);
		this._updateClear();
	}

	keyup(e) {
		if (e.which == 13) {
			this.cache.search.blur();
			self.trigger('filter', this.cache.search.val());
		}
		this._filter = self.cache.search.val();
		this._updateClear();
	}

	focus(e) {
		this.$el.addClass('ui-search-active');
	}

	blur(e) {
		this.$el.removeClass('ui-search-active');
	}

	setFocus(){
		this.cache.search.focus();
	}

	setFilter(filter) {
		this._filter = filter;
		if (this.cache.search)
			this.cache.search.val(filter);
		this.trigger('filter', filter);
		this._updateClear();
	}

	barcodeSearch(){
		if ( this.options.barcode )
			this.trigger('barcode');
	}

	getValue() {
		if (this.cache.search)
			return this.cache.search.val();
		return '';
	}

	_updateClear() {
		if (this._filter == '')
			this.cache.$clear.hide();
		else
			this.cache.$clear.show();
	}

};
