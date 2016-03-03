var _                = require('underscore');
var words            = require('search-utils').words;
var ModalView        = require('./ModalView');
var LookupListView   = require('./LookupListView');
var SearchFilterView = require('../forms/SearchFilterView');


var LookupModalView = module.exports = ModalView.extend({

	className: 'modal lookup',

	// Options:
	// {
	//    context 		        mandatory
	//    collection 	        mandatory
	//    buttons               object
	//    title                 string
	//    search                bool
	//    currentValue          id
	//    getStringFromModel    function that returns string
	//    listItemViewClass     List item class
	// }
	initialize: function initialize(options) {

		if (!options || !options.collection)
			throw new Error('Cannot initialize LookupView without a collection');

		var defaultOptions = {
			title: 'Lookup',
			currentValue: null,
			buttons: {
				cancel: 'Cancel',
				confirm: 'Confirm'
				// none: 'None'
			},
			getStringFromModel: function getStringFromModel(model) {
				return model.toSearchString();
			},
			search: true,
			listItemViewClass: null
		};
		this.options = options = _.defaults(options, defaultOptions);

		LookupModalView.__super__.initialize.call(this, options);

		// Controllo che non ci sia un bottone che come valore abbia
		// "select" perché in quel caso andrebbe in conflitto con l'evento
		// generato dal Lookup quando viene selezionato un item.
		_.each(this.buttons, function (aLabel, aValue) {
			if (aValue == 'select')
				throw new Error('Cannot use "select" as button value due to a conflict with Lookup\'s event');
		});

		var ctx = this.getContext();

		this.setTitle(options.title);

		// List
		this.views.list = new LookupListView({
			context: ctx,
			collection: this.collection,
			listItemViewClass: options.listItemViewClass
		});
		this.listenTo(this.views.list, 'selectItem', this.onSelectItem);

		// Search
		if (options.search) {
			var searchView = this.views.search = new SearchFilterView({
				context: ctx
			});
			this.listenTo(searchView, 'filter', this.onFilter);
		}

		// Current value
		this.setButtonEnabled('confirm', false);
		if (options.currentValue) {
			var selectedModel = this.collection.get(options.currentValue);
			if (selectedModel) {
				this.views.list.selectModels([selectedModel]);
				this.setButtonEnabled('confirm', true);
				// if (options.search) {
				// 	// Filtra la lista così che si veda solo l'elemento selezionato
				// 	var filter = options.getStringFromModel(selectedModel);
				// 	searchView.setFilter(filter);
				// }
			}
		}
	},

	render: function render() {
		var self = this;
		LookupModalView.__super__.render.apply(self, arguments);

		if (self.options.search) {
			self.$el.find('.container').addClass('withFilter');
			self.$el.find('.container h1').after(self.views.search.el);
			self.views.search.render();
		}

		self.findPlaceholder('content').append(self.views.list.el);
		self.views.list.render();

		return self;
	},

	onConfirm: function onConfirm() {
		var ctx = this.getContext();
		var agent;
		var selectedModels = this.views.list.getSelectedModels();
		if (selectedModels.length === 0)
			return;
		this.trigger('select', selectedModels[0]);
		this.close();
	},

	onCancel: function onCancel() {
		this.close();
	},

	onNone: function onNone() {
		this.trigger('none');
		this.close();
	},

	onSelectItem: function onSelectItem() {
		this.setButtonEnabled('confirm', this.views.list.isAnItemSelected());
	},

	onFilter: function onFilter(search) {
		if (search == '')
			return this.views.list.cancelFilter();
		var self = this;
		search = search.toLowerCase();
		this.views.list.filter(function (aModel) {
			return !!words(search, self.options.getStringFromModel(aModel));
		});
	}

});
