import _        from "underscore";
import $        from "jquery";
import BaseView from "../BaseView";

/*
<!-- Markup -->
<div class="ui-search-filter barcode ui-search-active">
	<form>
		<i class="icon-barcode barcode"></i>
		<div class="input">
			<i class="icon-search"></i>
			<input type="search" placeholder="Cerca" data-field="filter" autocorrect="off" autocomplete="off" autocapitalize="none">
			<i class="icon-delete clear" style="display: none;"></i>
		</div>
		<span class="cancel">Cancel</span>
	</form>
</div>
*/

const STATUS_NORMAL  = 'normal';
const STATUS_BARCODE = 'barcode';

export default class SearchFilterView extends BaseView {

	className(){ return 'ui-search-filter' }

	constructor(options) {
		super(options);

		this.setDefaultsOptions({
			filter:        '',
			barcode:       false,
			placeholder:   'Search...',
			cancelText:    'Cancel',
			accessoryBar:  false,
			sampleBarcode: 'barcode'
		});

		this.addEvents({
			'touchstart':     'onTouchStart',
			'keyup input':    'onKeyup',
			'focus input':    'onFocus',
			'click .clear':   'onClearClick',
			'click .barcode': 'onBarcodeSearch',
			'click .cancel':  'onCancelClick',
			'submit form':    'onSubmit'
		});

		this.status = STATUS_NORMAL;

		this._filter = this.options.filter || '';
		this.options = options;
		if (options.barcode)
			this.$el.toggleClass('barcode');
	}

	onRender(rendered) {
		if (rendered) return this;

		let search = this.cache.$search = $('<input>').attr({
			'type':           'search',
			'placeholder':    this.options.placeholder,
			'data-field':     'filter',
			'autocorrect':    'off',
			'autocomplete':   'off',
			'autocapitalize': 'none'
		});
		search.val(this._filter);

		this.cache.search          = this.cache.$search.get(0); // DOM element
		this.cache.$form           = $('<form action="">');
		this.cache.$searchIcon     = $('<i>').addClass('icon-search');
		this.cache.$clear          = $('<i>').addClass('icon-delete clear');
		this.cache.$barcode        = $('<i>').addClass('icon-barcode barcode');
		this.cache.$cancel         = $('<span>').addClass('cancel').text(this.options.cancelText);
		this.cache.$inputContainer = $('<div>').addClass('input')
			.append(this.cache.$searchIcon)
			.append(search)
			.append(this.cache.$clear);

		this.$el.append(
			this.cache.$form.append(
				this.cache.$barcode,
				this.cache.$inputContainer,
				this.cache.$cancel
			)
		);

		this._updateClear();

		return this;
	}

	onClearClick() {
		this.cache.$search.val('');
		this._filter = '';
		this.setFocus();
		setTimeout(() => {
			this.trigger('filter', '');
		}, 100);
		this._updateClear();
	}

	onKeyup(e) {
		this._filter = this.cache.$search.val();
		if (e.which == 13) {
			this.cache.$search.blur();
			this.trigger('filter', this._filter);
		}
		else {
			this.trigger('digit', this._filter);
		}
		this._updateClear();
	}

	onFocus(e) {
		this.$el.addClass('ui-search-active');
		this.trigger('active', this._filter);
	}

	onCancelClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.cancel();
	}

	blur() {
		if (this.cache.$search) {
			this.cache.$search.blur();
		}
	}

	setFocus(to) {
		if (!to) to = 0;
		if (!this.cache.search) return;
		return setTimeout(() => {
			this.cache.search.focus();
		}, to);
	}

	hasFocus() {
		if (this.cache.$search)
			return this.cache.$search.is(':focus');
		return false;
	}

	cancel() {
		this.blur();
		this.$el.removeClass('ui-search-active');
		this.trigger('cancel', this._filter);
	}

	setFilter(filter) {
		this._filter = filter;
		if (this.cache.$search)
			this.cache.$search.val(filter);
		this.trigger('filter', filter);
		this._updateClear();
	}

	onBarcodeSearch(e) {
		e.preventDefault();
		e.stopPropagation();

		if (this.options.barcode) {
			if (typeof cordova === 'undefined') {
				this.trigger('barcode', this.options.sampleBarcode);
				return;
			}

			if (this.status === STATUS_BARCODE)
				return;

			this.status = STATUS_BARCODE;

			cordova.plugins.barcodeScanner.scan(
				(result) => {
					if (result && result.text) {
						this.trigger('barcode', result.text);
					}
					this.status = STATUS_NORMAL;
				},
				(error) => {
					this.status = STATUS_NORMAL;
				}
			);
		}
	}

	onTouchStart() {
		if (this.options.accessoryBar == false && typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
	}

	onSubmit(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	getValue() {
		return this._filter;
	}

	_updateClear() {
		if (this._filter == '')
			this.cache.$clear.hide();
		else
			this.cache.$clear.show();
	}

};
