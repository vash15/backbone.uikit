Backbone UI Kit
===============

Backbone UI Kit is a collection of views and components to enrich an application.


## Demo

Look into `examples` directory, execute `npm install` and `bower install` then `npm start` to try **backbone.uikit**.

## Dependencies

- [jquery](https://jquery.com/)
- [underscore](http://underscorejs.org/)
- [underscore.string](https://epeli.github.io/underscore.string/)
- [backbone](http://backbonejs.org/)
- [backbone.pubsub](https://github.com/vash15/pubsub)
- [backbone.babysitter](https://github.com/marionettejs/backbone.babysitter)
- [backbone.touch](https://github.com/vash15/backbone.touch)
- [moment](http://momentjs.com/)
- [async](https://github.com/caolan/async)
- [impetus](http://chrisbateman.github.io/impetus/)
- [search-utils](https://github.com/vash15/search-utils)
- [context-utils](https://github.com/SonoIo/context-utils)
- [device-utils](https://github.com/SonoIo/device-utils)

## Installation

    $ bower install backbone.uikit --save

## Components

- [BaseView](./documentation/BaseView.md)
- [ImageView](./documentation/ImageView.md)
- [PageView](./documentation/PageView.md)
- RateView
- Card3DView
- Navigation
   - NavigationView
   - BarView
   - TitleBarView
   - OsBarView (Deprecated IosBarView)
   - [ScrollBarView](./documentation/ScrollBarView.md)
- Dialogs
   - ImagesModalView
   - ModalView
- List
   - ListView
   - ListItemView
   - SwipeListItemView
- Form
   - FormView
   - TextField
   - CheckboxField
   - CreditCardField
   - SearchFilterView
   - SelectField
   - SwitchView
   - LookupField
   - PasswordField
- Utils
   - style
   - animate
   - requestAnimationFrame
   - State
   - search
   - BezierEasing


## How to recall

#### Javascript

```javascript

import { BaseView, PageView, NavigationView, ... } from 'backbone.uikit';


```

#### SCSS

```scss
@import 'bower_components/backbone.uikit/styles/style';
```

## ListView

Event `change:direction` triggered when a user change the scroll direction. Top bounce doesn't trigger the event. Bottom bounce does.


## Licence

Released under MIT License (MIT) Copyright (c) 2016 Matteo Baggio & Michele Belluco
