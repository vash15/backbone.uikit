
var BaseView = require('./BaseView');

var PageView = module.exports = BaseView.extend({

	className: function className() {
		return 'page ' + (this.addClass || '');
	},

	onDeactivate: function onDeactivate() {
		this.$el.addClass('deactivate');
	},

	onActivate: function onActivate(firstTime) {
		this.$el.removeClass('deactivate');
	}

});