Backbone UI Kit
===============

Backbone UI Kit is a collection of views and components to enrich an application.


## Demo

Coming soon...

## Dependencies

- [jquery](https://jquery.com/)
- [underscore](http://underscorejs.org/)
- [underscore.string](https://epeli.github.io/underscore.string/)
- [backbone](http://backbonejs.org/)
- [backbone.pubsub](https://github.com/vash15/pubsub)
- [backbone.babysitter](https://github.com/marionettejs/backbone.babysitter)
- [backbone.touch](https://github.com/vash15/backbone.touch)
- [hammerjs](http://hammerjs.github.io/)
- [moment](http://momentjs.com/)
- [async](https://github.com/caolan/async)
- [impetus](http://chrisbateman.github.io/impetus/)
- [leaflet](http://leafletjs.com/)
- [search-utils](https://github.com/vash15/search-utils)
- [context-utils](https://github.com/SonoIo/context-utils)
- [device-utils](https://github.com/SonoIo/device-utils)

## Installation

    $ bower install backbone.uikit --save

## Components

- [BaseView](./documentation/BaseView.md)
- [ImageView](./documentation/ImageView.md)
- PageView
- RateView
- Navigation
   - NavigationView
   - BarView
   - TitleBarView
   - IosBarView
- Dialogs
   - ImageViewModalView
   - LookupListView
   - LookupModalView
   - ModalView
- List
   - ListView
   - FilteredListView
   - GroupListView
   - HorizontalListView
   - InfiniteListView
   - RemoteListView
   - SnapListView
   - PaginatedListView
   - ListItemView
   - GroupListItemView
   - OptionListItemView
   - OptionListView
- Form
   - FormView
   - TextField
   - CheckboxField
   - CreditCardField
   - SearchFilterView
   - SelectField
   - SwitchView
- Carousel
   - CarouselView
   - BreadcrumbView
- Loading
   - LoadingBarView
   - LoadingScreenView
- Map
   - FilteredMapView
   - MapView
- Utils
   - style
   - animate


## How to recall

#### Javascript

```javascript

// Ex.
var BaseView  = require('backbone.uikit').BaseView;
var PageView  = require('backbone.uikit').PageView;

// Ex sub component
var NavigationView = require('backbone.uikit').navigations.NavigationView;
var IosBarView     = require('backbone.uikit').navigations.IosBarView;

```

#### SCSS

```scss
@import 'bower_components/backbone.uikit/styles/style';
```

## Licence

Released under MIT License (MIT) Copyright (c) 2016 Matteo Baggio & Michele Belluco
