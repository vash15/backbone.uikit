
var _              = require('underscore');
var fs             = require('fs');
var NavigationView = require('./NavigationView');

var template = _.template(fs.readFileSync(__dirname+'/../../templates/navigations/ios_navigation_view.html', 'utf8'));

var IosNavigationView = module.exports = NavigationView.extend({

	className: 'navigation-view ios-navigation-view',

	template: template,

	initialize: function initialize(options) {
		IosNavigationView.__super__.initialize.apply(this, arguments);
	},

	render: function render(){
		this.$el.html( this.template() );
		return this;
	},

	setLeftSide: function setLeftSide(view){
		return this.appendAndRenderToPlaceholder('leftSide',view);
	},

	setCenterSide: function setCenterSide(){
		return this.appendAndRenderToPlaceholder('centerSide',view);
	},

	setRightSide: function setRightSide(){
		return this.appendAndRenderToPlaceholder('rightSide',view);
	},

	onSwipeBack: function onSwipeBack(percent){
		IosNavigationView.__super__.onSwipeBack.apply(this, arguments);
	}

});