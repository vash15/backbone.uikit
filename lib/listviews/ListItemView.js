var $        = require('jquery');
var _        = require('underscore');
var BaseView = require('../BaseView');


var ListItemView = module.exports = BaseView.extend({

	className: 'listItem',

	initialize: function initialize(options) {
		ListItemView.__super__.initialize.apply(this, arguments);

		this.addEvents({
			'click': 'select'
		});

		if (!options.parentList)
			throw new Error('Cannot create ListItemView without a parentList');

		this.parentList = options.parentList;

		this.listenTo(this.model, 'change', this.render);
	},

	render: function render(){
		this.$el.empty();
		this.$el.append($('<p>').text(this.model.toString()));
		return this;
	},

	select: function select(e) {
		if (e) e.preventDefault();

		if (typeof this.onSelect === 'function')
			this.onSelect();

		this.trigger('select', this);
	}

});
