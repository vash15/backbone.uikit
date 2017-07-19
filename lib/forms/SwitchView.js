import _        from "underscore";
import $        from "jquery";
import BaseView from "../BaseView";

export default class SwitchView extends BaseView {

	className() { return 'ui-switch'; }

	constructor(options) {
		super(options);

		this.addEvents({
			'click button': 'onSwitch'
		});

		if (!options.buttons)
			throw new Error('Cannot initialize SwitchView without buttons');

		this.buttons = options.buttons;
		this.selectButton(options.selected || this.buttons[0].value);
	}

	onRender(rendered) {
		if ( rendered ) return this;

		this.undelegateEvents();
		this.$el.empty();
		_(this.buttons).each((aButton) => {
			this.addButton(aButton);
		});
		this.delegateEvents();

		return this;
	}

	addButton(button) {
		let $button = $('<button>').addClass('button').attr({ 'data-value': button.value });

		if (button.label instanceof BaseView) {
			this.addSubView(`button-${button.value}-label`, button.label);
			$button.append(button.label.el);
			button.label.render();
		}
		else if (button.label) {
			$button.append(button.label);
		}

		if (button.icon)
			$button.append($('<i>').addClass(button.icon));

		if (this.selectedButton.value == button.value)
			$button.addClass('active');

		this.cache[button.value] = $button;

		this.$el.append($button);

		return this;
	}

	// changeButton(value, buttonChanges) {
	// 	const $button = this.cache[button.value];
	//
	// 	if (!$button)
	// 		return this;
	//
	// 	if (!buttonChanges)
	// 		return this;
	//
	// 	if (buttonChanges.label instanceof BaseView) {
	// 		this.removeSubView(`button-${button.value}-label`);
	// 		$button.append(buttonChanges.label.el);
	// 		buttonChanges.label.render();
	// 	}
	// 	else if (buttonChanges.label) {
	// 		$button
	// 			.empty()
	// 			.append(buttonChanges.label);
	// 	}
	//
	// 	if (buttonChanges.icon)
	// 		$button.append($('<i>').addClass(buttonChanges.icon));
	// }

	selectButton(value) {
		if (this.selectedButton && this.cache[this.selectedButton.value])
			this.cache[this.selectedButton.value].removeClass('active');

		this.selectedButton = _.find(this.buttons, function (aButton) {
			return aButton.value == value;
		}, this);

		if (this.cache[value])
			this.cache[value].addClass('active');

		this.cache.$input = $('<input type="hidden" />').val(value).trigger('change');

		this.trigger('select', value, this.selectedButton);
	}

	onSwitch(e) {
		e.preventDefault();
		let $target = $(e.target);
		let value = $target.attr('data-value');
		if (!value)
			value = $target.parent().attr('data-value');
		this.selectButton(value);
	}

	getValue(){
		return this.selectedButton.value;
	}

};
