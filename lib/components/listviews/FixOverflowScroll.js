
var animationPrefix = 'fixWebkitOverflowScroll';

var FixOverflowScroll = module.exports = function($el) {
	if (!$el)
		throw new Error('Missing jQuery element to fix');
	this.index = 0;
	this.$el   = $el;
};

FixOverflowScroll.prototype.fix = function fix() {
	this.index = (this.index % 2) + 1;
	this.$el.css("animation-name", animationPrefix + this.index);
	this.$el.css("-webkit-animation-name", animationPrefix + this.index);
	this.$el.css("-moz-animation-name", animationPrefix + this.index);
	this.$el.css("-o-animation-name", animationPrefix + this.index);
};
