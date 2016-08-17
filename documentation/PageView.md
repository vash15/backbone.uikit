Page View
===========


## API

### Property

### Method

### Events



## Usage

```javascript

import { PageView, IosBarView } from 'backbone.uikit';

export default class HomePage extends PageView {

	addClass(){
		return 'home-page';
	}

	constructor(){
		super(options);

		this.setSubView('navigationBar',new IosBarView({
			addClass: 'back-bar',
			left: 'f',
			center: null
		}) );

	}

	getNavigationBar() {
		return this.getSubView('navigationBar');
	}

	onRender(rendered) {
		if ( rendered )
			return this;

		// Do..

		return this;
	}

	//
	// Events / Hook
	//

	onBeforePush() {
		console.log("HomePage: onBeforePush");
	}

	onPush() {
		console.log("HomePage: onPush");
	}

	onBeforeActivate() {
		console.log("HomePage: onBeforeActivate");
	}

	onActivate() {
		super.onActivate(); // Important!
		console.log("HomePage: onActivate");
	}

	onBeforeDeactivate() {
		console.log("HomePage: onBeforeDeactivate");
	}

	onDeactivate() {
		super.onDeactivate(); // Important!
		console.log("HomePage: onDeactivate");
	}

	onBeforePop(){
		super.onBeforePop();
		console.log("HomePage: onBeforePop");
	}

}

```
