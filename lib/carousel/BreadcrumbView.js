
var _        = require('underscore');
var $        = require('jquery');
var BaseView = require('../BaseView');

var BreadcrumbView = module.exports = BaseView.extend({

	className: 'breadcrumbs',

	initialize: function initialize(options) {
		BreadcrumbView.__super__.initialize.apply(this, arguments);
		if ( typeof options == "undefined" )
			options = {};

		options = _.defaults(options,{
			total: 0,
			startAt: 1
		});

		this.total = options.total;
		this.currentIndex = options.startAt;

	},

	render: function render() {
		
		this.$el.empty();
		var className = "";
		for (var i = 0; i < this.total; i++ ) {
			className = "bullet";
			if ( i == this.currentIndex-1 )
				className += " active";
			this.$el.append(
				$("<span>").addClass(className)
			);
		};



		return this;
	},

	setTotal: function setTotal(num){
		num = parseInt(num);
		if ( _.isNaN(num) )
			num = 0;

		this.total = num;
		return this.render();
	},

	current: function current(index){
		index = parseInt(index);
		if ( _.isNaN(index) )
			index = 1;

		this.currentIndex = index;
		this.$el.find(".bullet").removeClass("active");
		this.$el.find(".bullet:nth-child("+(index)+")").addClass("active");

		return this;
	}

});