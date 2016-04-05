Page View
===========


## API

### Property

### Method

### Events



## Usage

```javascript

var PageView = require('backbone.uikit').PageView;

var HomePageView = PageView.extend({

	addClass: 'home-page',

	template: '<h1>Home page</h1>',

	initialize: function initialize(options) {
		HomePageView.__super__.initialize.apply(this, arguments);
	},

	render: function render() {
		HomePageView.__super__.render.apply(this, arguments);
		this.$el.empty().append(this.template() );
		return this;
	},


	//
	// Events / Hook
	//

	onBeforePush: function() {
		console.log("HomePage: onBeforePush");
	},

	onPush: function() {
		console.log("HomePage: onPush");
	},

	onBeforeActivate: function() {
		console.log("HomePage: onBeforeActivate");
	},

	onActivate: function() {
		console.log("HomePage: onActivate");
	},

	onBeforeDeactivate: function() {
		console.log("HomePage: onBeforeDeactivate");
	},

	onDeactivate: function() {
		console.log("HomePage: onDeactivate");
	}


});


```
