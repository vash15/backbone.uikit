var $        = require('jquery');
var _        = require('underscore');
var BaseView = require('../BaseView');

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

var STATUS_NORMAL  = 'normal';
var STATUS_BARCODE = 'barcode';

var SearchFilterView = module.exports = BaseView.extend({

	className: 'ui-search-filter',

	initialize: function initialize(options) {
		SearchFilterView.__super__.initialize.apply(this, arguments);

		this.options = _.defaults(options||{},{
			filter:        '',
			barcode:       false,
			placeholder:   'Search...',
			cancelText:    'Cancel',
			accessoryBar:  false,
			sampleBarcode: 'barcode',
			inputType:     'search'
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
	},

	render: function render(){

		var search = this.cache.$search = $('<input>').attr({
			'type':           this.options.inputType,
			'placeholder':    this.options.placeholder,
			'data-field':     'filter',
			'autocorrect':    'off',
			'autocomplete':   'off',
			'autocapitalize': 'none'
		});
		search.val(this._filter);

		this.cache.search          = this.cache.$search.get(0); // DOM element
		this.cache.$form           = $('<form />'); 
		this.$el.append( this.cache.$form ); // bugfix for Windows Phone
		
		this.cache.$searchIcon     = $('<i>').addClass('icon-search');
		this.cache.$clear          = $('<i>').addClass('icon-delete clear');
		this.cache.$barcode        = $('<i>').addClass('icon-barcode barcode');
		this.cache.$cancel         = $('<span>').addClass('cancel').text(this.options.cancelText);
		this.cache.$inputContainer = $('<div>').addClass('input')
			.append(this.cache.$searchIcon)
			.append(search)
			.append(this.cache.$clear);

		this.cache.$form.append(
			this.cache.$barcode,
			this.cache.$inputContainer,
			this.cache.$cancel
		);

		this._updateClear();

		return this;
	},

	onClearClick: function onClearClick() {
		this.cache.$search.val('');
		this._filter = '';
		this.setFocus();

		var self = this;
		setTimeout( function(){
			self.trigger('filter', '');
		}, 100);
		this._updateClear();
	},

	onKeyup: function onKeyup(e) {
		this._filter = this.cache.$search.val();
		if (e.which == 13) {
			this.cache.$search.blur();
			this.trigger('filter', this._filter);
		}
		else {
			this.trigger('digit', this._filter);
		}
		this._updateClear();
	},

	onFocus: function onFocus(e) {
		this.$el.addClass('ui-search-active');
		this.trigger('active', this._filter);
	},

	onCancelClick: function onCancelClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.cancel();
	},

	blur: function blur() {
		this.cache.$search.blur();
	},

	setFocus: function setFocus(to) {
		if ( !to ) to = 0;
		var self = this;
		return setTimeout( function(){
			self.cache.search.focus();
		}, to);
	},

	hasFocus: function hasFocus() {
		return this.cache.$search.is(':focus');
	},

	cancel: function cancel() {
		this.blur();
		this.$el.removeClass('ui-search-active');
		this.trigger('cancel', this._filter);
	},

	setFilter: function setFilter(filter) {
		this._filter = filter;
		if (this.cache.$search)
			this.cache.$search.val(filter);
		this.trigger('filter', filter);
		this._updateClear();
	},

	onBarcodeSearch: function onBarcodeSearch(e) {
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

			var self = this;
			cordova.plugins.barcodeScanner.scan(
				function (result) {
					if (result && result.text) {
						self.trigger('barcode', result.text);
					}
					self.status = STATUS_NORMAL;
				},
				function (error) {
					self.status = STATUS_NORMAL;
				}
			);
		}
	},

	onTouchStart: function onTouchStart() {
		if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard) {
			if (this.options.accessoryBar == false)
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			else
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
		}
	},

	onSubmit: function onSubmit(e) {
		e.preventDefault();
		e.stopPropagation();
	},

	getValue: function getValue() {
		return this._filter;
	},

	_updateClear: function _updateClear() {
		if (this._filter == ''){
			this.cache.$clear.hide();
			this.$el.removeClass('ui-search-filter-filled');
		}else{
			this.cache.$clear.show();
			this.$el.addClass('ui-search-filter-filled');
		}
	}

});
