
var $        = require('jquery');
var _        = require('underscore');
var BaseView = require('../BaseView');


var SwitchView = module.exports = BaseView.extend({

	className: 'switch',

	initialize: function initialize(options) {
		SwitchView.__super__.initialize.apply(this, arguments);

		this.addEvents({
			'click button': 'onSwitch'
		});

		if (!options.buttons) 
			throw new Error('Cannot initialize SwitchView without buttons');

		this.buttons = options.buttons;
		this.selectButton(options.selected || this.buttons[0].value);
	},

	render: function render() {
		var self = this;
		this.undelegateEvents();
		this.$el.empty();
		_.each(self.buttons, function (aButton) {
			self.addButton(aButton);
		});
		this.delegateEvents();
		return self;
	},

	addButton: function addButton(button) {
		var $button = $('<button>')
			.addClass('button')
			.attr({
				'data-value': button.value
			});

		if (button.label)
			$button.text(button.label);

		if (button.icon)
			$button.append($('<i>').addClass(button.icon));

		if (this.selectedButton.value == button.value)
			$button.addClass('active');

		this.cache[button.value] = $button;

		this.$el.append($button);
	},

	selectButton: function selectButton(value) {
		if (this.selectedButton && this.cache[this.selectedButton.value])
			this.cache[this.selectedButton.value].removeClass('active');

		this.selectedButton = _.find(this.buttons, function (aButton) {
			return aButton.value == value;
		}, this);

		if (this.cache[value])
			this.cache[value].addClass('active');

		this.trigger('select', value, this.selectedButton);
	},

	onSwitch: function onSwitch(e) {
		e.preventDefault();
		var $target = $(e.target);
		var value = $target.attr('data-value');
		if (!value)
			value = $target.parent().attr('data-value');
		this.selectButton(value);
	}

});

