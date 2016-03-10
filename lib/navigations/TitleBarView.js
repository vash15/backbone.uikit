var _          = require('underscore');
var fs         = require('fs');
var BarView    = require('./BarView');
var utilsStyle = require('../utils/style');

var template = _.template(fs.readFileSync(__dirname+'/../../templates/navigations/bar_view.html', 'utf8'));

var TitleBarView = module.exports = BarView.extend({

	className: 'navigation-bar title-navigation-bar',

	template: template,

	initialize: function initialize(options) {
		TitleBarView.__super__.initialize.apply(this, arguments);
		this.options = _.defaults( this.options, {title: ''} );
		this.el.style.opacity = 0;
	},

	render: function render() {
		this.$el.html( this.template({title: this.options.title}) );
		return this;
	},

	move: function move(percent, direction){

		var style = this.el.style;
		if ( percent === 0 || percent === 100 ){
			this.el.style[ utilsStyle.transition ] = 'opacity '+this.options.duration+'ms';
			// Serve per evitare che l'ottimizzatore del browser ignori gli stili modificati 
			// nel momento che questa view viene aggiunta al DOM
			utilsStyle.requestNextAnimationFrame(function(){
				style.opacity = percent/100;
			});

		}else{
			this.el.style[ utilsStyle.transition ] = '';
			style.opacity = percent/100;
		}

		return this;
	}

});
