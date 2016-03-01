
var $        = require('jquery');
var _        = require('underscore');
var BaseView = require('../../BaseView');

var SearchFilterView = module.exports = BaseView.extend({

	className: 'searchFilter',

	initialize: function initialize(options) {
		if (!options) options = {};
		SearchFilterView.__super__.initialize.apply(this, arguments);

		this.addEvents({
			'keyup input':          'keyup',
			'focus input':          'focus',
			'blur input' :          'blur',
			'click .clear': 		'clear',
			'click .barcodeSearch': 'barcodeSearch'
		});

		this._filter = options.filter || '';
		this.options = options;
		if ( options.barcode )
			this.$el.toggleClass("barcode");
	},

	render: function render() {
		this.$el.empty();

		var search = this.cache.search = $('<input>').attr({
			'type':           'search',
			'placeholder':    this.options.placeholder || __('Cerca...'),
			'data-field':     'filter',
			'autocorrect':    'off',
			'autocomplete':   'off',
			'autocapitalize': 'none'
		});
		search.val(this._filter);

		var div = $('<div>').addClass('input').append(search);

		this.cache.$clear = $('<i>').addClass('icon-delete clear');

		this.$el.append(
			$('<i>').addClass('icon-search'),
			this.cache.$clear,
			$('<i>').addClass('icon-barcode barcodeSearch'),
			div
		);

		this._updateClear();

		return this;
	},

	clear: function clear() {
		this.cache.search.val('');
		// Focus only on PC not tablet
		var self = this;
		setTimeout(function() {
			self.trigger('filter', '');
		}, 100);
		this._updateClear();
	},

	keyup: function keyup(e) {
		var self = this;
		if (e.which == 13) {
			this.cache.search.blur();
			self.trigger('filter', self.cache.search.val());
		}
		this._filter = self.cache.search.val();
		this._updateClear();
	},

	focus: function focus(e) {
		this.$el.addClass('active');
	},

	blur: function blur(e) {
		this.$el.removeClass('active');
	},

	setFocus: function setFocus(){
		this.cache.search.focus();
	},

	setFilter: function setFilter(filter) {
		this._filter = filter;
		if (this.cache.search)
			this.cache.search.val(filter);
		this.trigger('filter', filter);
		this._updateClear();
	},

	barcodeSearch: function barcodeSearch(){
		if ( this.options.barcode )
			this.trigger('barcode');
	},

	getValue: function getValue() {
		if (this.cache.search)
			return this.cache.search.val();
		return '';
	},

	_updateClear: function _updateClear() {
		if (this._filter == '')
			this.cache.$clear.hide();
		else
			this.cache.$clear.show();
	}

});

