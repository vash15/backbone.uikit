
var $ = require('jquery');
var _ = require('underscore');

var ListItemView = require('./ListItemView');

var OptionListItemView = module.exports = ListItemView.extend({

	initialize: function initialize(options) {
		OptionListItemView.__super__.initialize.apply(this, arguments);
		this.active = options.active || false;

		if ('unselectable' in options)
			this.options.unselectable = options.unselectable;
		else
			this.options.unselectable = true;
	},

	onSelect: function onSelect() {
		// Se l'elemento è attivo e la proprietà unselectable è a false
		// allora non posso deselezionarlo!
		if (this.isActive() && !this.options.unselectable)
			return;
		this.setActive(!this.isActive());
	},

	setActive: function setActive(newValue) {
		this.active = newValue;

		if (this.active)
			this.$el.addClass('active');
		else
			this.$el.removeClass('active');
	},

	isActive: function isActive() {
		return this.active;
	}

});
