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

	className(){ return 'ui-search-filter ' + (_.result(this, 'addClass') || ''); }

	constructor(options) {
		super(options);

		this.setDefaultsOptions({
			filter:           '',
			barcode:          false,
			placeholder:      'Search...',
			cancelText:       'Cancel',
			hideCancelOnBlur: true,
			accessoryBar:     false,
			sampleBarcode:    'barcode',
			searchClass:      'icon-search',
			clearClass:       'icon-delete',
			barcodeClass:     'icon-barcode',
			addClass:         null
		});

		this.addEvents({
			'touchstart':     'onTouchStart',
			'keyup input':    'onKeyup',
			'focus input':    'onFocus',
			'blur input':     'onBlur',
			'click .clear':   'onClearClick',
			'click .barcode': 'onBarcodeSearch',
			'click .cancel':  'onCancelClick',
			'submit form':    'onSubmit'
		});

		const addClass =  _.result(this.options, 'addClass');
		if (addClass )
			this.el.classList.add(addClass);

		this.status = STATUS_NORMAL;

		this._filter = this.options.filter || '';
		this.options = options;
		if (options.barcode)
			this.$el.toggleClass('barcode');

		this.debounce('onCancelClick');
		this.debounce('onClearClick');
		this.debounce('onBarcodeSearch');
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
		this.cache.$searchIcon     = $('<i>').addClass(this.options.searchClass);
		this.cache.$clear          = $('<i>').addClass(this.options.clearClass + ' clear');
		this.cache.$barcode        = $('<i>').addClass(this.options.barcodeClass + ' barcode');
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

		this._updateClear(true);

		return this;
	}

	onClearClick() {
		this.clear();
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
		this.requestAnimationFrame(()=>{
			this.el.classList.add('ui-search-active');
			this.trigger('active', this._filter);
		});
	}

	onBlur(e) {
		this.requestAnimationFrame(() => {
			if (this.options.hideCancelOnBlur) {
				this.el.classList.remove('ui-search-active');
			}
			this.trigger('blur', this);
		});
	}

	onCancelClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.cancel();
	}

	clear(){
		this.cache.$search.val('');
		this._filter = '';
		this.setFocus();
		setTimeout(() => {
			this.trigger('filter', '');
		}, 100);
		this._updateClear();
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
		this.requestAnimationFrame(()=>{
			this.blur();
			this.el.classList.remove('ui-search-active');
			this.trigger('cancel', this._filter);
		});
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
			if (!((window.cordova || {}).plugins || {}).barcodeScanner) {
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
		let hideFormAccessoryBar;
		if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard && cordova.plugins.Keyboard.hideKeyboardAccessoryBar ) {
			hideFormAccessoryBar = cordova.plugins.Keyboard.hideKeyboardAccessoryBar;
		}else if ( window.Keyboard && window.Keyboard.hideFormAccessoryBar ){
			hideFormAccessoryBar = window.Keyboard.hideFormAccessoryBar;
		}
		if (!_.isFunction(hideFormAccessoryBar))
			hideFormAccessoryBar = ()=>{};
		hideFormAccessoryBar(true);
	}

	onSubmit(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	getValue() {
		return this._filter;
	}

	_updateClear(immediate) {
		const run = ()=>{
			if(!this.cache.$clear)return;
			if (this._filter == '')
				this.cache.$clear.hide();
			else
				this.cache.$clear.show();
		}
		if(immediate)
			return run();
		this.requestAnimationFrame(()=>{
			run();
		});
	}

};
