require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({21:[function(require,module,exports){
'use strict';

var _contextUtils = require("./../bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _backbone = require("./../bower_components/backbone.viewstack/lib/viewstack.js");

var _backbone2 = _interopRequireDefault(_backbone);

var _NavigationView = require('../../lib/navigations/NavigationView');

var _NavigationView2 = _interopRequireDefault(_NavigationView);

var _MenuPage = require('./MenuPage');

var _MenuPage2 = _interopRequireDefault(_MenuPage);

var _requestAnimationFrame = require('../../lib/utils/requestAnimationFrame');

var _requestAnimationFrame2 = _interopRequireDefault(_requestAnimationFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var viewstack = _contextUtils2.default.viewstack = new _backbone2.default({ el: '#application' });
viewstack.render();

var navigationView = _contextUtils2.default.navigation = new _NavigationView2.default({
	viewstack: viewstack
});

viewstack.pushView(navigationView);

// Menu
var menuPage = new _MenuPage2.default({
	animated: false,
	swipeBack: false
});
viewstack.pushView(menuPage);

},{"../../lib/navigations/NavigationView":33,"../../lib/utils/requestAnimationFrame":38,"./../bower_components/backbone.viewstack/lib/viewstack.js":5,"./../bower_components/context-utils/lib/context.js":7,"./MenuPage":20}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license


var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
	window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
	var lastTime = 0;
	window.requestAnimationFrame = function (callback, element) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function () {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};
}

if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
	clearTimeout(id);
};

if (!window.requestNextAnimationFrame) window.requestNextAnimationFrame = function (callback) {
	window.requestAnimationFrame(function () {
		window.requestAnimationFrame(function (ts) {
			callback(ts);
		});
	});
};

exports.default = window.requestNextAnimationFrame;

},{}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _contextUtils = require("./../../examples/bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _BaseView2 = require("../BaseView");

var _BaseView3 = _interopRequireDefault(_BaseView2);

var _BarView = require("./BarView");

var _BarView2 = _interopRequireDefault(_BarView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import { requestNextAnimationFrame } from "../utils/requestAnimationFrame";

var isView = function isView(view) {
	return _underscore2.default.isObject(view) && view.render;
};

var NavigationView = function (_BaseView) {
	_inherits(NavigationView, _BaseView);

	_createClass(NavigationView, [{
		key: "className",
		value: function className() {
			return 'ui-navigation';
		}
	}]);

	function NavigationView(options) {
		_classCallCheck(this, NavigationView);

		var _this = _possibleConstructorReturn(this, (NavigationView.__proto__ || Object.getPrototypeOf(NavigationView)).call(this, options));

		var state = _this.getState();
		_this.setDefaultsOptions({
			viewstack: state ? state.get('viewstack') : _contextUtils2.default.viewstack,
			masterDetail: false
		});

		_this.visible = true;

		_this._stack = [];
		_this.viewstack = _this.options.viewstack;

		delete _this.options.viewstack;

		_this.listenTo(_this.viewstack, 'pushed', _this.onPushedView);
		_this.listenTo(_this.viewstack, 'popped', _this.onPoppedView);
		_this.listenTo(_this.viewstack, 'clear', _this.onClearViewstack);
		return _this;
	}

	_createClass(NavigationView, [{
		key: "push",
		value: function push(newBarView, animated) {
			var activeBar = this.getActiveBar();
			if (activeBar.view === newBarView) return this;

			// If masterDetail option is true then we have to keep
			// the first navigation bar (aka "The master navigation bar")
			// in place.
			if (this.options.masterDetail) {
				if (_underscore2.default.isEmpty(this._stack)) this.masterView = newBarView;

				if (this._stack.length <= 1 && typeof newBarView.hideBackButton === 'function') newBarView.hideBackButton();
			}

			var newStackItem = {
				view: newBarView
			};
			this._stack.unshift(newStackItem);

			if (this._stack.length > 2) {
				var popBar = this._stack.pop();
				var popView = popBar.view;
				if (isView(popView) && !_underscore2.default.isEqual(popView, this.masterView)) {
					popView.$el.detach();
				}
			}

			if (isView(newBarView)) {
				newBarView.setZindex(10);
				this.$el.append(newBarView.el);
				newBarView.render();
				newStackItem.animationHandler = window.requestNextAnimationFrame(function () {
					newStackItem.animationHandler = null;
					newBarView.move(100, _BarView2.default.PUSH, animated === undefined || animated);
				});
			}

			var oldBar = this.getOldBar();
			var oldBarView = oldBar.view;
			if (isView(oldBarView)) {
				if (oldBar.animationHandler) {
					window.cancelAnimationFrame(oldBar.animationHandler);
					oldBar.animationHandler = null;
				}
				oldBarView.setZindex(0);
				window.requestNextAnimationFrame(function () {
					oldBarView.move(0, _BarView2.default.DETACH, true);
				});
			}

			return this;
		}
	}, {
		key: "pop",
		value: function pop(popBarView) {
			var _this2 = this;

			var activeBar = this.getActiveBar();
			var oldBar = this.getOldBar();

			var activeBarView = activeBar.view;
			var oldBarView = oldBar.view;

			// Ensure we doesn't pop the same bar view
			if (oldBarView === popBarView) return this;

			if (isView(activeBarView)) {
				activeBarView.setZindex(0);
				activeBarView.move(0, _BarView2.default.POP, true);
			}

			if (isView(oldBarView)) {
				oldBarView.setZindex(10);
				oldBarView.move(100, _BarView2.default.RESTORE, true);
			}

			this._stack.shift();

			// Retrieve the bar view from the last PageView of viewstack
			var pageView = this.viewstack.getViewAtIndex(this.viewstack.size() - 2);
			var newBarView = void 0;
			if (isView(pageView) && pageView.getNavigationBar) {
				newBarView = pageView.getNavigationBar();
				this._stack.push({
					view: newBarView
				});
			}

			setTimeout(function () {
				_this2.requestAnimationFrame(function () {
					if (isView(activeBarView)) activeBarView.$el.detach();

					if (isView(newBarView)) {
						newBarView.setZindex(0);
						_this2.$el.append(newBarView.el);
					}
				});
			}, activeBarView && activeBarView.options ? activeBarView.options.duration : 300);

			// this.requestAnimationFrame(()=>{	});
		}
	}, {
		key: "getActiveBar",
		value: function getActiveBar() {
			return this._stack[0] || {};
		}
	}, {
		key: "getOldBar",
		value: function getOldBar() {
			return this._stack[1] || {};
		}
	}, {
		key: "onPushedView",
		value: function onPushedView(view) {
			if (!view || !view.getNavigationBar) return;
			var barView = view.getNavigationBar();
			this.push(barView, view.options.animated);
		}
	}, {
		key: "onPoppedView",
		value: function onPoppedView(view) {
			if (!view || !view.getNavigationBar) return;
			var barView = view.getNavigationBar();
			this.pop(barView);
		}
	}, {
		key: "onClearViewstack",
		value: function onClearViewstack(viewstack) {
			var _this3 = this;

			this.requestAnimationFrame(function () {
				var size = viewstack.size();
				_underscore2.default.forEach(_this3._stack, function (aBar) {
					if (aBar && aBar.view) aBar.view.$el.detach();
				});
				_this3._stack = [];
				if (size === 0) {
					return;
				}
				if (size > 1) {
					_this3.onPushedView(viewstack._stack[size - 2].view);
				}
				_this3.onPushedView(viewstack._stack[size - 1].view);
			});
		}
	}, {
		key: "onSwipeBack",
		value: function onSwipeBack(percent, animated) {
			var activeBar = this.getActiveBar();
			var oldBar = this.getOldBar();

			var activeBarView = activeBar.view;
			var oldBarView = oldBar.view;

			if (isView(activeBarView)) activeBarView.move(percent, _BarView2.default.POP, animated);
			if (isView(oldBarView)) oldBarView.move(100 - percent, _BarView2.default.RESTORE, animated);
		}
	}, {
		key: "show",
		value: function show() {
			var _this4 = this;

			if (!this.visible) {
				this.requestAnimationFrame(function () {
					_this4.el.style.display = 'block';
					_this4.el.style.opacity = 1;
					_this4.visible = true;
				});
			}
		}
	}, {
		key: "hide",
		value: function hide() {
			var _this5 = this;

			if (this.visible) {
				this.requestAnimationFrame(function () {
					_this5.el.style.opacity = 0;
					setTimeout(function () {
						_this5.requestAnimationFrame(function () {
							_this5.el.style.display = 'none';
							_this5.visible = false;
						});
					}, 150);
				});
			}
		}
	}, {
		key: "toggle",
		value: function toggle() {
			if (this.visible === false) {
				this.show();
			} else {
				this.hide();
			}
		}
	}, {
		key: "isVisible",
		value: function isVisible() {
			return this.visible;
		}
	}]);

	return NavigationView;
}(_BaseView3.default);

exports.default = NavigationView;
;

},{"../BaseView":27,"./../../examples/bower_components/context-utils/lib/context.js":7,"./../../examples/bower_components/underscore/underscore.js":17,"./BarView":32}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("./../bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _contextUtils = require("./../bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _PageView2 = require('../../lib/PageView');

var _PageView3 = _interopRequireDefault(_PageView2);

var _OsBarView = require('../../lib/navigations/OsBarView');

var _OsBarView2 = _interopRequireDefault(_OsBarView);

var _ListView = require('../../lib/listviews/ListView');

var _ListView2 = _interopRequireDefault(_ListView);

var _DifferentSizeListViewPage = require('./DifferentSizeListViewPage');

var _DifferentSizeListViewPage2 = _interopRequireDefault(_DifferentSizeListViewPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MenuPage = function (_PageView) {
	_inherits(MenuPage, _PageView);

	_createClass(MenuPage, [{
		key: 'addClass',
		value: function addClass() {
			return 'menu-page';
		}
	}]);

	function MenuPage(options) {
		_classCallCheck(this, MenuPage);

		var _this = _possibleConstructorReturn(this, (MenuPage.__proto__ || Object.getPrototypeOf(MenuPage)).call(this, options));

		_this.template = require('../templates/menu.html');

		_this.addEvents({
			'click .js-different-size': 'onDifferentSizeClick',
			'click .js-different-size-with-header': 'onDifferentSizeWithHeaderClick',
			'click .js-different-size-with-2-columns': 'onDifferentSizeWith2ColumnsClick',
			'click .js-different-size-with-3-columns': 'onDifferentSizeWith3ColumnsClick',
			'click .js-horizontal-different-size': 'onHorizontalDifferentSizeClick',
			'click .js-horizontal-different-size-with-header': 'onHorizontalDifferentSizeWithHeaderClick',
			'click .js-horizontal-different-size-with-2-columns': 'onHorizontalDifferentSizeWith2ColumnsClick',
			'click .js-horizontal-different-size-with-3-columns': 'onHorizontalDifferentSizeWith3ColumnsClick'
		});

		var state = _this.getState();
		var navigationBarView = new _OsBarView2.default({
			state: state,
			addClass: 'back-bar',
			center: (0, _jquery2.default)('<span class="title"></span>').text('Examples'),
			popViewOnBackButton: false
		});
		_this.addSubView('navigationBarView', navigationBarView);
		return _this;
	}

	_createClass(MenuPage, [{
		key: 'getNavigationBar',
		value: function getNavigationBar() {
			return this.getSubView('navigationBarView');
		}
	}, {
		key: 'onRender',
		value: function onRender(rendered) {
			if (!rendered) {
				this.$el.html(this.template());
			}
		}

		//
		// Vertial list view
		//

	}, {
		key: 'onDifferentSizeClick',
		value: function onDifferentSizeClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default();
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}
	}, {
		key: 'onDifferentSizeWithHeaderClick',
		value: function onDifferentSizeWithHeaderClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default({
				listview: {
					headerSize: 40
				}
			});
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}
	}, {
		key: 'onDifferentSizeWith2ColumnsClick',
		value: function onDifferentSizeWith2ColumnsClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default({
				listview: {
					itemsPerRow: 2
				}
			});
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}
	}, {
		key: 'onDifferentSizeWith3ColumnsClick',
		value: function onDifferentSizeWith3ColumnsClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default({
				listview: {
					itemsPerRow: 3
				}
			});
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}

		//
		// Horizontal list view
		//

	}, {
		key: 'onHorizontalDifferentSizeClick',
		value: function onHorizontalDifferentSizeClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default({
				listview: {
					orientation: _ListView2.default.ORIENTATION_HORIZONTAL
				}
			});
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}
	}, {
		key: 'onHorizontalDifferentSizeWithHeaderClick',
		value: function onHorizontalDifferentSizeWithHeaderClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default({
				listview: {
					orientation: _ListView2.default.ORIENTATION_HORIZONTAL,
					headerSize: 40
				}
			});
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}
	}, {
		key: 'onHorizontalDifferentSizeWith2ColumnsClick',
		value: function onHorizontalDifferentSizeWith2ColumnsClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default({
				listview: {
					orientation: _ListView2.default.ORIENTATION_HORIZONTAL,
					itemsPerRow: 2
				}
			});
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}
	}, {
		key: 'onHorizontalDifferentSizeWith3ColumnsClick',
		value: function onHorizontalDifferentSizeWith3ColumnsClick() {
			var differentSizeListViewPage = new _DifferentSizeListViewPage2.default({
				listview: {
					orientation: _ListView2.default.ORIENTATION_HORIZONTAL,
					itemsPerRow: 3
				}
			});
			_contextUtils2.default.viewstack.pushView(differentSizeListViewPage);
		}
	}]);

	return MenuPage;
}(_PageView3.default);

exports.default = MenuPage;

},{"../../lib/PageView":29,"../../lib/listviews/ListView":31,"../../lib/navigations/OsBarView":34,"../templates/menu.html":26,"./../bower_components/context-utils/lib/context.js":7,"./../bower_components/jquery/dist/jquery.js":11,"./../bower_components/underscore/underscore.js":17,"./DifferentSizeListViewPage":19}],26:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<h1>ListView</h1>\n<h2>Vertical</h2>\n<div>\n\t<button class="button js-different-size">Different size</button>\n\t<button class="button js-different-size-with-header">With header</button>\n\t<button class="button js-different-size-with-2-columns">With 2 columns</button>\n\t<button class="button js-different-size-with-3-columns">With 3 columns</button>\n</div>\n<h2>Horizontal</h2>\n<div>\n\t<button class="button js-horizontal-different-size">Different size</button>\n\t<button class="button js-horizontal-different-size-with-header">With header</button>\n\t<button class="button js-horizontal-different-size-with-2-columns">With 2 rows</button>\n\t<button class="button js-horizontal-different-size-with-3-columns">With 3 rows</button>\n</div>\n';
}
return __p;
};

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("./../bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _contextUtils = require("./../bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _backbone = require("./../bower_components/backbone/backbone.js");

var _PageView2 = require('../../lib/PageView');

var _PageView3 = _interopRequireDefault(_PageView2);

var _OsBarView = require('../../lib/navigations/OsBarView');

var _OsBarView2 = _interopRequireDefault(_OsBarView);

var _DifferentSizeListView = require('./DifferentSizeListView');

var _DifferentSizeListView2 = _interopRequireDefault(_DifferentSizeListView);

var _ModelA = require('./models/ModelA');

var _ModelA2 = _interopRequireDefault(_ModelA);

var _ModelB = require('./models/ModelB');

var _ModelB2 = _interopRequireDefault(_ModelB);

var _ModelC = require('./models/ModelC');

var _ModelC2 = _interopRequireDefault(_ModelC);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DifferentSizeListViewPage = function (_PageView) {
	_inherits(DifferentSizeListViewPage, _PageView);

	_createClass(DifferentSizeListViewPage, [{
		key: 'addClass',
		value: function addClass() {
			return 'different-size-list-view';
		}
	}]);

	function DifferentSizeListViewPage(options) {
		_classCallCheck(this, DifferentSizeListViewPage);

		var _this = _possibleConstructorReturn(this, (DifferentSizeListViewPage.__proto__ || Object.getPrototypeOf(DifferentSizeListViewPage)).call(this, options));

		var state = _this.getState();
		var navigationBarView = new _OsBarView2.default({
			state: state,
			addClass: 'back-bar',
			left: '<span>Back</span>',
			center: (0, _jquery2.default)('<span class="title"></span>').text('Different size list view'),
			popViewOnBackButton: true
		});
		_this.addSubView('navigationBarView', navigationBarView);

		_this.initCollection();

		var differentSizeListView = new _DifferentSizeListView2.default(_underscore2.default.extend(_this.options.listview || {}, {
			collection: _this.collection
		}));
		_this.addSubView('differentSizeListView', differentSizeListView);

		// For debug
		window.__listView = differentSizeListView;
		return _this;
	}

	_createClass(DifferentSizeListViewPage, [{
		key: 'getNavigationBar',
		value: function getNavigationBar() {
			return this.getSubView('navigationBarView');
		}
	}, {
		key: 'onRender',
		value: function onRender(rendered) {
			if (!rendered) {
				var differentSizeListView = this.getSubView('differentSizeListView');
				this.$el.append(differentSizeListView.el);
				differentSizeListView.render();
			}
		}

		//
		// Utils
		//

	}, {
		key: 'initCollection',
		value: function initCollection() {
			var colors = ['rgb(156, 221, 174)', 'rgb(219, 204, 126)', 'rgb(126, 177, 219)'];

			var getImage = function getImage(size) {
				return 'http://via.placeholder.com/200x200'; //?_=' + Math.floor(Math.random() * 1000000);
			};

			var models = [];
			var aModelClass = void 0;
			for (var i = 0; i < 100; i++) {
				var size = (i % 3 + 1) * 100;
				switch (i % 3) {
					case 0:
						aModelClass = _ModelA2.default;break;
					case 1:
						aModelClass = _ModelB2.default;break;
					case 2:
						aModelClass = _ModelC2.default;break;
				}
				models.push(new aModelClass({
					id: i,
					size: size,
					color: colors[i % 3],
					image: getImage(size)
				}));
			}

			var differentSizeCollection = new _backbone.Collection(models);
			this.collection = differentSizeCollection;
		}
	}]);

	return DifferentSizeListViewPage;
}(_PageView3.default);

exports.default = DifferentSizeListViewPage;

},{"../../lib/PageView":29,"../../lib/navigations/OsBarView":34,"./../bower_components/backbone/backbone.js":6,"./../bower_components/context-utils/lib/context.js":7,"./../bower_components/jquery/dist/jquery.js":11,"./../bower_components/underscore/underscore.js":17,"./DifferentSizeListView":18,"./models/ModelA":22,"./models/ModelB":23,"./models/ModelC":24}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("./../../examples/bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _contextUtils = require("./../../examples/bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _backbone = require("./../../examples/bower_components/backbone/backbone.js");

var _BarView2 = require("./BarView");

var _BarView3 = _interopRequireDefault(_BarView2);

var _BezierEasing = require("../utils/BezierEasing");

var _BezierEasing2 = _interopRequireDefault(_BezierEasing);

var _animate = require("../utils/animate");

var _animate2 = _interopRequireDefault(_animate);

var _style = require("../utils/style");

var _getContextOptions = require("../utils/getContextOptions");

var _getContextOptions2 = _interopRequireDefault(_getContextOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ANIMATION_PUSH_LEFT = 'push_left';
var ANIMATION_ZOOM_IN = 'zoom_in';

// export default class OsBarView extends BarView {

var OsBarView = function (_BarView) {
	_inherits(OsBarView, _BarView);

	_createClass(OsBarView, [{
		key: "className",
		value: function className() {
			// Deprecated: ui-ios-navigation-bar
			return 'ui-navigation-bar ui-ios-navigation-bar ui-os-navigation-bar';
		}
	}]);

	function OsBarView(options) {
		_classCallCheck(this, OsBarView);

		var _this = _possibleConstructorReturn(this, (OsBarView.__proto__ || Object.getPrototypeOf(OsBarView)).call(this, options));

		var state = _this.getState();

		_this.template = require('../../templates/navigations/os_bar_view.html');
		_this.setDefaultsOptions((0, _getContextOptions2.default)('OsBarView') || {}, {
			addClass: '',
			viewstack: state ? state.get('viewstack') : _contextUtils2.default.viewstack,
			left: null,
			center: null,
			right: null,
			hideBackButton: false,
			popViewOnBackButton: true,
			pageAnimation: ANIMATION_PUSH_LEFT // Don't set to null or _.defaults consider it as valid value
		});

		_this.viewstack = _this.options.viewstack;
		delete _this.options.viewstack;

		if (_underscore2.default.result(_this.options, 'addClass')) {
			_this.$el.addClass(_underscore2.default.result(_this.options, 'addClass') || '');
		}

		_this.addEvents({
			'click .left-side': 'onLeftSideClick',
			'click .center-side': 'onCenterSideClick',
			'click .right-side': 'onRightSideClick'
		});

		_this._oldPercent = -1;

		_this.debounce('onLeftSideClick');
		_this.debounce('onCenterSideClick');
		_this.debounce('onRightSideClick');

		return _this;
	}

	_createClass(OsBarView, [{
		key: "onLeftSideClick",
		value: function onLeftSideClick(e) {
			if (this.options.popViewOnBackButton) {
				e.preventDefault();
				e.stopPropagation();
				(0, _jquery2.default)(':focus').blur();
				this.viewstack.popView(null, { animated: true, delay: true });
			}
			this.trigger('leftClick', e);
		}
	}, {
		key: "onCenterSideClick",
		value: function onCenterSideClick(e) {
			this.trigger('centerClick', e);
		}
	}, {
		key: "onRightSideClick",
		value: function onRightSideClick(e) {
			this.trigger('rightClick', e);
		}
	}, {
		key: "showBackButton",
		value: function showBackButton() {
			var _this2 = this;

			this.options.hideBackButton = false;
			if (!this.rendered) return;
			this.requestAnimationFrame(function () {
				_this2.cache.left.display = '';
			});
		}
	}, {
		key: "hideBackButton",
		value: function hideBackButton() {
			var _this3 = this;

			this.options.hideBackButton = true;
			if (!this.rendered) return;
			this.requestAnimationFrame(function () {
				_this3.cache.left.display = 'none';
			});
		}
	}, {
		key: "onRender",
		value: function onRender(rendered) {
			if (rendered) return this;

			var left = this.cache.left = document.createElement('div');
			var center = this.cache.center = document.createElement('div');
			var right = this.cache.right = document.createElement('div');

			left.className = 'left-side';
			center.className = 'center-side';
			right.className = 'right-side';

			left.style.opacity = 0;
			center.style.opacity = 0;
			right.style.opacity = 0;

			if (this.options.hideBackButton) left.style.display = 'none';

			this.$el.append(left, center, right);

			if (this.options.left) {
				if (this.options.left instanceof _backbone.View) {
					this.addSubView(this.options.left.cid, this.options.left);
					left.appendChild(this.options.left.el);
					this.options.left.render();
				} else if (this.options.left instanceof _jquery2.default) left.appendChild(this.options.left.get(0));else left.innerHTML = this.options.left;
			}

			if (this.options.center) {
				if (this.options.center instanceof _backbone.View) {
					this.addSubView(this.options.center.cid, this.options.center);
					center.appendChild(this.options.center.el);
					this.options.center.render();
				} else if (this.options.center instanceof _jquery2.default) center.appendChild(this.options.center.get(0));else center.innerHTML = this.options.center;
			}

			if (this.options.right) {
				if (this.options.right instanceof _backbone.View) {
					this.addSubView(this.options.right.cid, this.options.right);
					right.appendChild(this.options.right.el);
					this.options.right.render();
				} else if (this.options.right instanceof _jquery2.default) right.appendChild(this.options.right.get(0));else right.innerHTML = this.options.right;
			}

			return this;
		}
	}, {
		key: "move",
		value: function move(percent, direction, animated) {
			switch (this.options.pageAnimation) {
				case ANIMATION_PUSH_LEFT:
					this.movePushLeft(percent, direction, animated);
					break;
				case ANIMATION_ZOOM_IN:
					this.moveZoomIn(percent, direction, animated);
					break;
			}

			return this;
		}
	}, {
		key: "movePushLeft",
		value: function movePushLeft(percent, direction, animated) {
			var _this4 = this;

			if (!this.rendered) return;

			var easingIn = (0, _BezierEasing2.default)(.01, .69, .36, 1);
			var easingOut = (0, _BezierEasing2.default)(.81, .09, .1, .6);
			percent = percent / 100;

			var delta = 40;
			var left = this.cache.left;
			var center = this.cache.center;
			var right = this.cache.right;
			var transform = '';
			var initTransform = '';

			switch (direction) {
				case OsBarView.PUSH:
					percent = easingIn(percent);
					transform = 'translate3d(0%, 0, 0)';
					initTransform = 'translate3d(' + delta + '%, 0, 0)';
					break;
				case OsBarView.DETACH:
					percent = easingOut(percent);
					transform = 'translate3d(' + -delta * (1 - percent) + '%, 0, 0)';
					initTransform = 'translate3d(0, 0, 0)';
					break;
				case OsBarView.RESTORE:
					percent = easingOut(percent);
					transform = 'translate3d(' + -delta * (1 - percent) + '%, 0, 0)';
					initTransform = 'translate3d(-' + delta + '%, 0, 0)';
					break;
				case OsBarView.POP:
					percent = easingOut(percent);
					transform = 'translate3d(' + delta * (1 - percent) + '%, 0, 0)';
					initTransform = 'translate3d(0, 0, 0)';
					break;
			}

			left.style[(0, _style.getVendorStyle)('transition')] = '';
			center.style[(0, _style.getVendorStyle)('transition')] = '';
			right.style[(0, _style.getVendorStyle)('transition')] = '';

			if (animated) {
				if (this._oldPercent !== -1) {
					initTransform = null;
				}

				(0, _animate2.default)(left, {
					duration: this.options.duration + 'ms',
					timing: 'ease-out',
					start: {
						'transform': initTransform,
						'opacity': null
					},
					end: {
						'transform': transform,
						'opacity': percent * percent
					}
				});

				(0, _animate2.default)(center, {
					duration: this.options.duration + 'ms',
					start: {
						'transform': initTransform,
						'opacity': null
					},
					end: {
						'transform': transform,
						'opacity': percent
					}
				}, function () {
					// end
					_this4._oldPercent = -1;
				});

				(0, _animate2.default)(right, {
					duration: this.options.duration + 'ms',
					timing: 'ease-out',
					start: {
						'transform': initTransform,
						'opacity': null
					},
					end: {
						'transform': transform,
						'opacity': percent * percent
					}
				});
			} else {
				this._oldPercent = percent;

				left.style.opacity = percent * percent;
				center.style.opacity = percent;
				right.style.opacity = percent * percent;

				left.style[(0, _style.getVendorStyle)('transform')] = transform;
				center.style[(0, _style.getVendorStyle)('transform')] = transform;
				right.style[(0, _style.getVendorStyle)('transform')] = transform;
			}

			return this;
		}
	}, {
		key: "moveZoomIn",
		value: function moveZoomIn(percent, direction, animated) {
			var _this5 = this;

			if (!this.rendered) return;

			var easingIn = (0, _BezierEasing2.default)(.01, .69, .36, 1);
			var easingOut = (0, _BezierEasing2.default)(.81, .09, .1, .6);
			percent = percent / 100;

			var left = this.cache.left;
			var center = this.cache.center;
			var right = this.cache.right;
			var opacity = '';
			var initOpacity = '';

			switch (direction) {
				case OsBarView.PUSH:
				case OsBarView.RESTORE:
					initOpacity = 0;
					opacity = 1;
					break;
				case OsBarView.DETACH:
				case OsBarView.POP:
					initOpacity = 1;
					opacity = 0;
					break;
			}

			if (animated) {
				(0, _animate2.default)(left, {
					duration: this.options.duration + 'ms',
					timing: 'ease-out',
					start: {
						'opacity': initOpacity
					},
					end: {
						'opacity': opacity * opacity
					}
				});

				(0, _animate2.default)(center, {
					duration: this.options.duration + 'ms',
					start: {
						'opacity': initOpacity
					},
					end: {
						'opacity': opacity
					}
				}, function () {
					// end
					_this5._oldPercent = -1;
				});

				(0, _animate2.default)(right, {
					duration: this.options.duration + 'ms',
					timing: 'ease-out',
					start: {
						'opacity': initOpacity
					},
					end: {
						'opacity': opacity * opacity
					}
				});
			} else {
				this._oldPercent = percent;

				opacity = easingOut(percent);

				left.style.opacity = opacity * opacity;
				center.style.opacity = opacity;
				right.style.opacity = opacity * opacity;
			}

			return this;
		}
	}]);

	return OsBarView;
}(_BarView3.default);

exports.default = OsBarView;
;

},{"../../templates/navigations/os_bar_view.html":40,"../utils/BezierEasing":35,"../utils/animate":36,"../utils/getContextOptions":37,"../utils/style":39,"./../../examples/bower_components/backbone/backbone.js":6,"./../../examples/bower_components/context-utils/lib/context.js":7,"./../../examples/bower_components/jquery/dist/jquery.js":11,"./../../examples/bower_components/underscore/underscore.js":17,"./BarView":32}],40:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="left-side" data-placeholder="left-side" ></div>\n<div class="center-side" data-placeholder="center-side" ></div>\n<div class="right-side" data-placeholder="right-side" ></div>';
}
return __p;
};

},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("./../examples/bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _contextUtils = require("./../examples/bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _backbone = require("./../examples/bower_components/backbone/backbone.js");

var _backbone2 = _interopRequireDefault(_backbone);

var _BaseView2 = require("./BaseView");

var _BaseView3 = _interopRequireDefault(_BaseView2);

var _animate = require("./utils/animate");

var _animate2 = _interopRequireDefault(_animate);

var _BezierEasing = require("./utils/BezierEasing");

var _BezierEasing2 = _interopRequireDefault(_BezierEasing);

var _BarView = require("./navigations/BarView");

var _BarView2 = _interopRequireDefault(_BarView);

var _getContextOptions = require("./utils/getContextOptions");

var _getContextOptions2 = _interopRequireDefault(_getContextOptions);

var _style = require("./utils/style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//
// Utils
//

var getTouch = function getTouch(ev) {
	var touch = void 0;
	if (ev && ev.changedTouches) {
		var changedTouches = ev.changedTouches;
		if (changedTouches && changedTouches.length > 0) {
			touch = changedTouches[0];
		}
	}
	return touch;
};

var getPageX = function getPageX(ev) {
	var pageX = 0;
	var touch = getTouch(ev);
	if (touch && _underscore2.default.isNumber(touch.pageX)) pageX = touch.pageX;
	return pageX;
};
var getPageY = function getPageY(ev) {
	var pageY = 0;
	var touch = getTouch(ev);
	if (touch && _underscore2.default.isNumber(touch.pageY)) pageY = touch.pageY;
	return pageY;
};
var isInRect = function isInRect(x, y, top, left, width, height) {
	return x >= left && x <= left + width && y >= top && y <= top + height;
};

//
// Page View
//

var STATUS_NORMAL = 'normal';
var STATUS_MOVING = 'moving';

var ANIMATION_PUSH_LEFT = 'push_left';
var ANIMATION_ZOOM_IN = 'zoom_in';

var PageView = function (_BaseView) {
	_inherits(PageView, _BaseView);

	_createClass(PageView, [{
		key: "className",
		value: function className() {
			return 'ui-page ' + (_underscore2.default.result(this, "addClass") || '');
		}
	}]);

	function PageView(options) {
		_classCallCheck(this, PageView);

		var _this = _possibleConstructorReturn(this, (PageView.__proto__ || Object.getPrototypeOf(PageView)).call(this, options));

		var state = _this.getState();

		_this._oldPercent = -1;
		_this.viewport = _contextUtils2.default.device && _contextUtils2.default.device.getViewport ? _contextUtils2.default.device.getViewport() : { width: 0, height: 0 };
		_this.isActive = false;
		_this.pageStatus = STATUS_NORMAL;

		_this.setDefaultsOptions((0, _getContextOptions2.default)('PageView'), {
			swipeBack: true,
			animated: true,
			duration: 300,
			deltaPageRender: 100,
			viewstack: state ? state.get('viewstack') : _contextUtils2.default.viewstack,
			navigation: state ? state.get('navigation') : _contextUtils2.default.navigation,
			swipeBackDirection: 'horizontal', // horizontal, vertical, all
			swipeBackClassName: 'swipe-back',
			swipeBackBoundaryLeft: 0,
			swipeBackBoundaryTop: 0,
			swipeBackBoundaryWidth: 40,
			swipeBackBoundaryHeight: _this.viewport.height,
			swipeBackVelocityLimit: 0.4, // Velocity limit to trigger viewstack.popView()
			pageAnimation: ANIMATION_PUSH_LEFT // Don't set to null or _.defaults consider it as valid value
		});

		_this.viewstack = _this.options.viewstack;
		delete _this.options.viewstack;

		_this.renderingTimeoutHandler = null;

		// Set navigation controller
		_this.setNavigationView(_this.options.navigation);

		return _this;
	}

	_createClass(PageView, [{
		key: "onBeforePush",
		value: function onBeforePush() {
			//
			// Animation start
			//
			switch (this.options.pageAnimation) {
				case ANIMATION_PUSH_LEFT:
					if (this.options.animated) {
						this.el.style[(0, _style.getVendorStyle)('backfaceVisibility')] = 'hidden';
						(0, _style.translate3d)(this.el, '100%', 0, 0, true); // if you put pixels the transform does not work
					}
					break;
				case ANIMATION_ZOOM_IN:
					this.options.swipeBack = false;
					if (this.options.animated) {
						this.el.style[(0, _style.getVendorStyle)('backfaceVisibility')] = 'hidden';
						(0, _style.scaleAndTranslate3d)(this.el, 0.8, 0, 0, 0, true);
						this.el.style.opacity = 0;
					}
					break;
			}

			//
			// Swipe back
			//
			this._swipeBackStop = false;
			if (this.options.swipeBack === true) {

				this.onSwipeBackTouchStart = _underscore2.default.bind(this.onSwipeBackTouchStart, this);
				this.onSwipeBackTouchMove = _underscore2.default.bind(this.onSwipeBackTouchMove, this);
				this.onSwipeBackTouchEnd = _underscore2.default.bind(this.onSwipeBackTouchEnd, this);

				this.el.addEventListener('touchstart', this.onSwipeBackTouchStart);
			}
		}

		// Render

	}, {
		key: "render",
		value: function render() {
			var _this2 = this;

			// If the view is moving delay the render
			if (this.pageStatus == STATUS_MOVING) {
				if (this.renderingTimeoutHandler) clearTimeout(this.renderingTimeoutHandler);
				this.renderingTimeoutHandler = setTimeout(function () {
					_this2.renderingTimeoutHandler = null;
					_this2.render();
				}, this.options.duration);
				return;
			}

			if (this.options.animated === true && !this.rendered) {
				// Move animation
				if (!this.moved) {
					this.move(100, 0, true);
					this.moved = true;
				}
				// Rendering
				window.requestNextAnimationFrame(function () {
					if (_this2.renderingTimeoutHandler) clearTimeout(_this2.renderingTimeoutHandler);
					_this2.renderingTimeoutHandler = setTimeout(function () {
						_this2.renderingTimeoutHandler = null;
						return _get(PageView.prototype.__proto__ || Object.getPrototypeOf(PageView.prototype), "render", _this2).call(_this2);
					}, _this2.options.duration + _this2.options.deltaPageRender);
				});
				return;
			}
			return _get(PageView.prototype.__proto__ || Object.getPrototypeOf(PageView.prototype), "render", this).call(this);
		}

		// Navigation view

	}, {
		key: "setNavigationView",
		value: function setNavigationView(navigation) {
			var ctx = this.getState() || _contextUtils2.default; // Todo: Sostituire con State
			if (navigation instanceof _backbone2.default.View) {
				this.navigation = navigation;
			} else if (ctx && ctx.views && ctx.views.navigation) {
				this.navigation = ctx.views.navigation;
			} else {
				this.navigation = null;
			}
			return this;
		}
	}, {
		key: "getNavigationView",
		value: function getNavigationView() {
			return this.navigation;
		}
	}, {
		key: "getNavigationBar",
		value: function getNavigationBar() {
			return null;
		}

		// Può assumere più valori.
		// @return Number millisecondi di durata dell'animazione
		// @return String nome dell'animazione CSS

	}, {
		key: "getAnimationPushDuration",
		value: function getAnimationPushDuration() {
			return this.options.animated ? this.options.duration : null;
		}

		// Può assumere più valori.
		// @return Number millisecondi di durata dell'animazione
		// @return String nome dell'animazione CSS

	}, {
		key: "getAnimationPopDuration",
		value: function getAnimationPopDuration() {
			return this.options.duration || null;
		}
	}, {
		key: "closeKeyboard",
		value: function closeKeyboard() {
			(0, _jquery2.default)(':focus').blur();
			// if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.Keyboard)
			// 	cordova.plugins.Keyboard.close();
		}

		//
		// Events
		//

	}, {
		key: "onBeforeDeactivate",
		value: function onBeforeDeactivate() {
			this.closeKeyboard();
		}
	}, {
		key: "onDeactivate",
		value: function onDeactivate() {
			this.closeKeyboard();
			this.$el.addClass('deactivate');
			this.isActive = false;
			var state = this.getState();
			if (state) state.trigger('deactivated');
		}
	}, {
		key: "onBeforeActivate",
		value: function onBeforeActivate() {
			this.closeKeyboard();
		}
	}, {
		key: "onActivate",
		value: function onActivate(firstTime) {
			this.closeKeyboard();
			this.$el.removeClass('deactivate');
			this.isActive = true;
			var state = this.getState();
			if (state) state.trigger('activated');
		}
	}, {
		key: "onDestroy",
		value: function onDestroy() {
			if (this.renderingTimeoutHandler) {
				clearTimeout(this.renderingTimeoutHandler);
			}

			this.el.removeEventListener('touchstart', this.onSwipeBackTouchStart);

			document.removeEventListener('touchmove', this.onSwipeBackTouchMove);
			document.removeEventListener('touchend', this.onSwipeBackTouchEnd);
			document.removeEventListener('touchcancel', this.onSwipeBackTouchEnd);

			_get(PageView.prototype.__proto__ || Object.getPrototypeOf(PageView.prototype), "onDestroy", this).call(this);
		}
	}, {
		key: "onBeforePop",
		value: function onBeforePop() {
			var _this3 = this;

			this.pageStatus = STATUS_MOVING;
			if (this.options.animated === true) {
				window.requestAnimationFrame(function () {
					_this3.move(0, 4, true);
				});
			}
		}
	}, {
		key: "onSwipeBackTouchStart",
		value: function onSwipeBackTouchStart(ev) {
			if (!ev || !ev.timeStamp || !this.isActive) return;

			var top = this.options.swipeBackBoundaryTop;
			var left = this.options.swipeBackBoundaryLeft;
			var width = this.options.swipeBackBoundaryWidth;
			var height = this.options.swipeBackBoundaryHeight;
			var pageX = this._swipeBackStartX = getPageX(ev);
			var pageY = this._swipeBackStartY = getPageY(ev);

			this._swipeBackMoveDirection = null;

			if (isInRect(pageX, pageY, top, left, width, height) && this.viewport.width > 0 && !this._swipeBackStop) {

				this.pageStatus = STATUS_MOVING;

				document.addEventListener('touchmove', this.onSwipeBackTouchMove);
				document.addEventListener('touchend', this.onSwipeBackTouchEnd);
				document.addEventListener('touchcancel', this.onSwipeBackTouchEnd);

				this.el.style[(0, _style.getVendorStyle)('transition')] = '';
				this.$el.addClass(this.options.swipeBackClassName);

				this._swipeBackDeltaScreenX = pageX;
				this._swipeBackDeltaScreenY = pageY;
				this._swipeBackStop = true;
				this._swipeBackStartTime = ev.timeStamp;
			}
		}
	}, {
		key: "onSwipeBackTouchEnd",
		value: function onSwipeBackTouchEnd(ev) {
			var _this4 = this;

			if (!ev || !ev.timeStamp || !this.isActive) return;

			this.pageStatus = STATUS_NORMAL;

			var ctx = _contextUtils2.default;
			var navigation = this.getNavigationView();
			var pageX = getPageX(ev);
			var pageY = getPageY(ev);
			var pop = false;
			var currentDirection = this._swipeBackMoveDirection;
			var viewstack = this.viewstack;
			var removeTouchEvents = function removeTouchEvents() {
				document.removeEventListener('touchmove', _this4.onSwipeBackTouchMove);
				document.removeEventListener('touchend', _this4.onSwipeBackTouchEnd);
				document.removeEventListener('touchcancel', _this4.onSwipeBackTouchEnd);
			};

			this._swipeBackMoveDirection = null;

			var distance = pageX - this._swipeBackDeltaScreenX;
			var time = ev.timeStamp - this._swipeBackStartTime;
			var speed = Math.abs(distance) / time || 0.1;

			if (speed >= this.options.swipeBackVelocityLimit || pageX > this.viewport.width / 2) {
				pop = true;
				navigationOnSwipeBack(0);
			} else {
				navigationOnSwipeBack(100);

				this.el.style[(0, _style.getVendorStyle)('transition')] = 'transform ' + this.options.duration + 'ms';
				(0, _style.translate3d)(this.el, 0, 0, 0);
			}

			removeTouchEvents();

			if (pop && this.viewstack) this.viewstack.popView(this, { animated: true, delay: true });

			setTimeout(function () {
				_this4.el.style[(0, _style.getVendorStyle)('transition')] = '';
				_this4._swipeBackStop = false;
				_this4.$el.removeClass(_this4.options.swipeBackClassName);
			}, this.options.duration);

			function navigationOnSwipeBack(percent) {
				if (navigation && navigation.onSwipeBack) navigation.onSwipeBack(percent, true);
				if (viewstack) viewstack.onSwipeBack(percent, true);
			};
		}
	}, {
		key: "onSwipeBackTouchMove",
		value: function onSwipeBackTouchMove(ev) {
			var ctx = _contextUtils2.default;
			var navigation = this.getNavigationView();
			var pageX = getPageX(ev) - this._swipeBackDeltaScreenX;
			var pageY = getPageY(ev) - this._swipeBackDeltaScreenY;
			var percent = 0;
			if (pageX < 0) pageX = 0;else if (pageX > this.viewport.width) pageX = this.viewport.width;
			if (pageY < 0) pageY = 0;else if (pageY > this.viewport.height) pageY = this.viewport.height;

			// Check direction
			if (this.options.swipeBackDirection === 'horizontal' && (pageX === 0 || this._swipeBackMoveDirection === 'vertical')) {
				this._swipeBackMoveDirection = 'vertical';
				return;
			} else if (this.options.swipeBackDirection === 'vertical' && (pageY === 0 || this._swipeBackMoveDirection === 'horizontal')) {
				this._swipeBackMoveDirection = 'horizontal';
				return;
			}

			// Stop propagation event
			ev.stopPropagation();
			// ev.preventDefault();

			if (this.viewport.width > 0) percent = 100 - Math.round(pageX * 100 / this.viewport.width * 10) / 10;

			if (navigation && navigation.onSwipeBack) navigation.onSwipeBack(percent, false);

			// Viewstack
			if (this.viewstack) this.viewstack.onSwipeBack(percent, false);

			(0, _style.translate3d)(this.el, pageX, 0, 0);

			return false;
		}
	}, {
		key: "move",
		value: function move(percent, direction, animated) {
			switch (this.options.pageAnimation) {
				case ANIMATION_PUSH_LEFT:
					this.movePushLeft(percent, direction, animated);
					break;
				case ANIMATION_ZOOM_IN:
					this.moveZoomIn(percent, direction, animated);
					break;
			}

			return this;
		}
	}, {
		key: "movePushLeft",
		value: function movePushLeft(percent, direction, animated) {
			var self = this;
			var transform = '';
			var initTransform = '';

			switch (direction) {
				case _BarView2.default.PUSH:
					initTransform = 'translate3d(100%, 0, 0)';
					transform = 'translate3d(0,0,0)';
					break;
				case _BarView2.default.DETACH:
					initTransform = 'translate3d(0, 0, 0)';
					transform = 'translate3d(' + -50 * (percent / 100) + '%, 0, 0)';
					break;
					break;
				case _BarView2.default.RESTORE:
					initTransform = 'translate3d(' + -50 * (percent / 100) + '%, 0, 0)';
					transform = 'translate3d(0, 0, 0)';
					break;
				case _BarView2.default.POP:
					initTransform = null;
					transform = 'translate3d(100%, 0, 0)';
					break;
			}

			var el = this.el;
			el.style[(0, _style.getVendorStyle)('transition')] = '';

			if (animated) {
				if (this._oldPercent !== -1) {
					initTransform = null;
				}

				(0, _animate2.default)(el, {
					duration: this.options.duration + 'ms',
					timing: 'ease-out',
					start: {
						'transform': initTransform
					},
					end: {
						'transform': transform
					}
				});
			} else {
				this._oldPercent = percent;
				el.style[(0, _style.getVendorStyle)('transform')] = transform;
			}
		}
	}, {
		key: "moveZoomIn",
		value: function moveZoomIn(percent, direction, animated) {
			var self = this;
			var transform = '';
			var opacity = 1;
			var initTransform = '';
			var initOpacity = 0;

			// let easingIn  = BezierEasing(.01,.69,.36,1);
			var easingOut = (0, _BezierEasing2.default)(.81, .09, .1, .6);

			switch (direction) {
				case _BarView2.default.PUSH:
					initTransform = 'scale(0.9)';
					transform = 'scale(1)';
					initOpacity = 0;
					opacity = 1;
					break;
				case _BarView2.default.DETACH:
					initTransform = 'scale(1)';
					transform = 'scale(0.9)';
					initOpacity = 1;
					opacity = 0;
					break;
				case _BarView2.default.RESTORE:
					initTransform = 'scale(0.9)';
					transform = 'scale(1)';
					initOpacity = 0;
					opacity = 1;
					break;
				case _BarView2.default.POP:
					initTransform = 'scale(1)';
					transform = 'scale(0.8)';
					initOpacity = 1;
					opacity = 0;
					break;
			}

			var el = this.el;
			el.style[(0, _style.getVendorStyle)('transition')] = '';

			if (animated) {
				if (this._oldPercent !== -1) {
					initTransform = null;
				}

				(0, _animate2.default)(el, {
					duration: this.options.duration + 'ms',
					timing: 'ease-out',
					start: {
						'transform': initTransform,
						'opacity': initOpacity
					},
					end: {
						'transform': transform,
						'opacity': opacity
					}
				});
			} else {
				this._oldPercent = percent;
				el.style.opacity = easingOut(percent / 100);
				el.style[(0, _style.getVendorStyle)('transform')] = transform;
			}
		}
	}]);

	return PageView;
}(_BaseView3.default);

exports.default = PageView;
;

PageView.ANIMATION_PUSH_LEFT = ANIMATION_PUSH_LEFT;
PageView.ANIMATION_ZOOM_IN = ANIMATION_ZOOM_IN;

},{"./../examples/bower_components/backbone/backbone.js":6,"./../examples/bower_components/context-utils/lib/context.js":7,"./../examples/bower_components/jquery/dist/jquery.js":11,"./../examples/bower_components/underscore/underscore.js":17,"./BaseView":27,"./navigations/BarView":32,"./utils/BezierEasing":35,"./utils/animate":36,"./utils/getContextOptions":37,"./utils/style":39}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (el, animation, done) {

	if (!_underscore2.default.isObject(animation)) throw new Error('animation is required');

	if (!_underscore2.default.isObject(animation.start)) throw new Error('animation.start is required');

	if (!_underscore2.default.isObject(animation.end)) throw new Error('animation.end is required');

	_underscore2.default.defaults(animation, {
		duration: '300ms',
		timing: ''
	});

	var properties = _underscore2.default.keys(animation.start);

	// Empty transition property. We don't want animation for initial state.
	var transitionProperty = (0, _style.getVendorStyle)('transition');
	var timingProperty = (0, _style.getVendorStyle)('transition-timing-function');
	el.style[transitionProperty] = '';
	el.style[timingProperty] = '';

	// Set the start state
	var transition = '';
	var aProperty;
	for (var i = 0, n = properties.length; i < n; i++) {
		aProperty = properties[i];

		if (animation.start[aProperty] !== null && animation.start[aProperty] !== undefined) el.style[(0, _style.getVendorStyle)(aProperty)] = animation.start[aProperty];

		// Build the transition string
		transition += (0, _style.getVendorStyle)(aProperty) + ' ' + animation.duration;
		if (i < n - 1) transition += ', ';
	}

	// Ensure to apply the initial state
	window.getComputedStyle(el)[transitionProperty];

	// Set the transition property to animate the element
	el.style[transitionProperty] = transition;
	el.style[timingProperty] = animation.timing;

	window.requestNextAnimationFrame(function () {
		for (var i = 0, n = properties.length; i < n; i++) {
			aProperty = properties[i];
			el.style[(0, _style.getVendorStyle)(aProperty)] = animation.end[aProperty];
		}
		if (_underscore2.default.isFunction(done)) {
			if (!animation.duration) return done();

			var duration = animation.duration.match(/\d+/);
			if (_underscore2.default.isArray(duration) && duration.length == 0) return done();

			setTimeout(function () {
				done();
			}, duration[0]);
		}
	});
};

var _underscore = require("./../../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _style = require("./style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

},{"./../../examples/bower_components/underscore/underscore.js":17,"./style":39}],35:[function(require,module,exports){
'use strict';

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A(aA1, aA2) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1, aA2) {
  return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1) {
  return 3.0 * aA1;
}

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope(aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(aX, aA, aB, mX1, mX2) {
  var currentX,
      currentT,
      i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
    var currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) {
      return aGuessT;
    }
    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}

module.exports = function bezier(mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX(aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing(x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    }
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

},{}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _BaseView2 = require("../BaseView");

var _BaseView3 = _interopRequireDefault(_BaseView2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PUSH = 0; // Push      | |<-
var DETACH = 1; // Detach  <-| |
var RESTORE = 2; // Restore ->| |
var POP = 4; // Pop       | |->

var BarView = function (_BaseView) {
	_inherits(BarView, _BaseView);

	_createClass(BarView, [{
		key: "className",
		value: function className() {
			return 'ui-navigation-bar';
		}
	}]);

	function BarView(options) {
		_classCallCheck(this, BarView);

		var _this = _possibleConstructorReturn(this, (BarView.__proto__ || Object.getPrototypeOf(BarView)).call(this, options));

		_this.setDefaultsOptions({ duration: 300, className: '' });
		return _this;
	}

	_createClass(BarView, [{
		key: "move",
		value: function move(percent, direction, animated) {
			return this;
		}
	}]);

	return BarView;
}(_BaseView3.default);

exports.default = BarView;
;

BarView.PUSH = PUSH;
BarView.DETACH = DETACH;
BarView.RESTORE = RESTORE;
BarView.POP = POP;

},{"../BaseView":27,"./../../examples/bower_components/underscore/underscore.js":17}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("./../bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _ListView2 = require('../../lib/listviews/ListView');

var _ListView3 = _interopRequireDefault(_ListView2);

var _ListItemView5 = require('../../lib/listviews/ListItemView');

var _ListItemView6 = _interopRequireDefault(_ListItemView5);

var _ImageView = require('../../lib/ImageView');

var _ImageView2 = _interopRequireDefault(_ImageView);

var _style = require('../../lib/utils/style');

var _ModelA = require('./models/ModelA');

var _ModelA2 = _interopRequireDefault(_ModelA);

var _ModelB = require('./models/ModelB');

var _ModelB2 = _interopRequireDefault(_ModelB);

var _ModelC = require('./models/ModelC');

var _ModelC2 = _interopRequireDefault(_ModelC);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CellA = function (_ListItemView) {
	_inherits(CellA, _ListItemView);

	function CellA() {
		_classCallCheck(this, CellA);

		return _possibleConstructorReturn(this, (CellA.__proto__ || Object.getPrototypeOf(CellA)).apply(this, arguments));
	}

	_createClass(CellA, [{
		key: 'className',
		value: function className() {
			return 'cellA';
		}
	}, {
		key: 'onRender',
		value: function onRender(rendered) {
			if (!rendered) {
				this.cache.$text = (0, _jquery2.default)('<span>');
				this.$el.append(this.cache.$text);
			}
			if (this.model) {
				this.cache.$text.text('CellA ' + this.model.id);
			} else {
				this.cache.$text.text('');
			}
		}
	}], [{
		key: 'getSize',
		value: function getSize(options) {
			return 100;
		}
	}]);

	return CellA;
}(_ListItemView6.default);

var CellB = function (_ListItemView2) {
	_inherits(CellB, _ListItemView2);

	function CellB() {
		_classCallCheck(this, CellB);

		return _possibleConstructorReturn(this, (CellB.__proto__ || Object.getPrototypeOf(CellB)).apply(this, arguments));
	}

	_createClass(CellB, [{
		key: 'className',
		value: function className() {
			return 'cellB';
		}
	}, {
		key: 'onRender',
		value: function onRender(rendered) {
			if (!rendered) {
				this.cache.$text = (0, _jquery2.default)('<span>');
				this.$el.append(this.cache.$text);
			}
			if (this.model) {
				this.cache.$text.text('CellB ' + this.model.id);
			} else {
				this.cache.$text.text('');
			}
		}
	}], [{
		key: 'getSize',
		value: function getSize(options) {
			return 200;
		}
	}]);

	return CellB;
}(_ListItemView6.default);

var CellC = function (_ListItemView3) {
	_inherits(CellC, _ListItemView3);

	_createClass(CellC, [{
		key: 'className',
		value: function className() {
			return 'cellC';
		}
	}], [{
		key: 'getSize',
		value: function getSize(options) {
			return 300;
		}
	}]);

	function CellC(options) {
		_classCallCheck(this, CellC);

		var _this3 = _possibleConstructorReturn(this, (CellC.__proto__ || Object.getPrototypeOf(CellC)).call(this, options));

		var imageView = new _ImageView2.default({
			size: 'contain',
			autoload: false,
			viewport: { width: 100, height: 100 }
		});
		imageView.el.style.width = 100;
		imageView.el.style.height = 100;
		_this3.addSubView('imageView', imageView);
		return _this3;
	}

	_createClass(CellC, [{
		key: 'onRender',
		value: function onRender(rendered) {
			var imageView = this.getSubView('imageView');
			if (!rendered) {
				this.cache.$text = (0, _jquery2.default)('<span>');
				this.$el.append(imageView.el, this.cache.$text);
				imageView.render();
			}
			if (this.model) {
				this.cache.$text.text('CellC ' + this.model.id);
				imageView.setSource(this.model.get('image'));
				imageView.load();
			} else {
				imageView.setSource(null);
				this.cache.$text.text('');
			}
		}
	}]);

	return CellC;
}(_ListItemView6.default);

var ResizableListItemView = function (_ListItemView4) {
	_inherits(ResizableListItemView, _ListItemView4);

	function ResizableListItemView(options) {
		_classCallCheck(this, ResizableListItemView);

		var _this4 = _possibleConstructorReturn(this, (ResizableListItemView.__proto__ || Object.getPrototypeOf(ResizableListItemView)).call(this, options));

		if (!_this4.options.contentTypes) throw new Error('options.contentTypes is missing from ResizableListItemView');

		var childrenOptions = {
			parentList: _this4.options.parentList
		};

		var aNewView = void 0;
		_underscore2.default.forEach(_this4.options.contentTypes, function (aContentType, anIndex) {
			aNewView = new aContentType.viewClass(childrenOptions);
			_this4.addSubView(anIndex, aNewView);
		});
		return _this4;
	}

	_createClass(ResizableListItemView, [{
		key: 'onRender',
		value: function onRender(rendered) {
			var _this5 = this;

			if (!rendered) {
				_underscore2.default.forEach(this.views, function (aView) {
					_this5.$el.append(aView.el);
					aView.render();
				});
			}

			var propertyToResize = this.options.parentList.isVertical() ? 'height' : 'width';
			var aSubView = void 0;
			_underscore2.default.forEach(this.options.contentTypes, function (aContentType, anIndex) {
				aSubView = _this5.getSubView(anIndex);
				if (_this5.model instanceof aContentType.modelClass) {
					aSubView.el.style.opacity = 1;
					_this5.el.style[propertyToResize] = aContentType.viewClass.getSize(_this5.model);
				} else {
					aSubView.el.style.opacity = 0;
				}
			});

			if (!this.model) {
				this.el.style.height = 0;
			}
		}
	}, {
		key: 'setModel',
		value: function setModel(newModel) {
			var _this6 = this;

			var aSubView = void 0;
			_underscore2.default.forEach(this.options.contentTypes, function (aContentType, anIndex) {
				if (newModel instanceof aContentType.modelClass) {
					aSubView = _this6.getSubView(anIndex);
					aSubView.setModel(newModel).render();
				}
			});
			_get(ResizableListItemView.prototype.__proto__ || Object.getPrototypeOf(ResizableListItemView.prototype), 'setModel', this).call(this, newModel);
		}
	}]);

	return ResizableListItemView;
}(_ListItemView6.default);

var DifferentSizeListView = function (_ListView) {
	_inherits(DifferentSizeListView, _ListView);

	function DifferentSizeListView() {
		_classCallCheck(this, DifferentSizeListView);

		return _possibleConstructorReturn(this, (DifferentSizeListView.__proto__ || Object.getPrototypeOf(DifferentSizeListView)).apply(this, arguments));
	}

	_createClass(DifferentSizeListView, [{
		key: 'getListItemViewAtIndexWithOptions',
		value: function getListItemViewAtIndexWithOptions(index, options) {
			options = _underscore2.default.clone(options);
			options.contentTypes = [{ modelClass: _ModelA2.default, viewClass: CellA }, { modelClass: _ModelB2.default, viewClass: CellB }, { modelClass: _ModelC2.default, viewClass: CellC }];
			return new ResizableListItemView(options);
		}
	}, {
		key: 'getListItemSizeAtIntexWithOptions',
		value: function getListItemSizeAtIntexWithOptions(index, options) {
			var model = options.model;
			if (model instanceof _ModelA2.default) return CellA.getSize(model);else if (model instanceof _ModelB2.default) return CellB.getSize(model);else if (model instanceof _ModelC2.default) return CellC.getSize(model);
		}
	}, {
		key: 'onSelectItem',
		value: function onSelectItem(item, done) {
			if (item.view) {
				console.log(item.view.model.toJSON());
			}
			return done();
		}
	}]);

	return DifferentSizeListView;
}(_ListView3.default);

exports.default = DifferentSizeListView;

},{"../../lib/ImageView":28,"../../lib/listviews/ListItemView":30,"../../lib/listviews/ListView":31,"../../lib/utils/style":39,"./../bower_components/jquery/dist/jquery.js":11,"./../bower_components/underscore/underscore.js":17,"./models/ModelA":22,"./models/ModelB":23,"./models/ModelC":24}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("./../../examples/bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _contextUtils = require("./../../examples/bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _backbone = require("./../../examples/bower_components/backbone/backbone.js");

var _BaseView2 = require("../BaseView");

var _BaseView3 = _interopRequireDefault(_BaseView2);

var _ListItemView = require("./ListItemView");

var _ListItemView2 = _interopRequireDefault(_ListItemView);

var _getContextOptions = require("../utils/getContextOptions");

var _getContextOptions2 = _interopRequireDefault(_getContextOptions);

var _style = require("../utils/style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TOP_DOWN = 1;
var DOWN_TOP = 2;
var LEFT_RIGHT = 4;
var RIGHT_LEFT = 8;
var ORIENTATION_VERTICAL = 'vertical';
var ORIENTATION_HORIZONTAL = 'horizontal';

var ticking = false;
var requestTick = function requestTick(callback) {
	if (!ticking) {
		window.requestAnimationFrame(function () {
			ticking = false;
			callback();
		});
	}
	ticking = true;
};

var ListView = function (_BaseView) {
	_inherits(ListView, _BaseView);

	_createClass(ListView, [{
		key: "className",
		value: function className() {
			return 'ui-list-view ' + (_underscore2.default.result(this, "addClass") || '');
		}
	}]);

	function ListView(options) {
		_classCallCheck(this, ListView);

		var _this = _possibleConstructorReturn(this, (ListView.__proto__ || Object.getPrototypeOf(ListView)).call(this, options));

		_this.addEvents({
			'click': 'onClick', // _.debounce(this.onClick, 500, true),
			'scroll': 'onScroll',
			'touchstart': 'onTouchStart',
			'touchmove': 'onTouchMove',
			'touchend': 'onTouchEnd',
			'mousedown': 'onTouchStart',
			'mousemove': 'onTouchMove',
			'mouseup': 'onTouchEnd'
		});

		_this.setDefaultsOptions((0, _getContextOptions2.default)('ListView'), {
			itemClass: 'ui-list-item',
			itemHeight: 120,
			itemWidth: 120,
			itemsPerRow: 1,
			placeholders: 20, // Number of items
			placeholderCache: 2,
			orientation: ORIENTATION_VERTICAL,
			infinite: false,
			infiniteLoadingSize: 44,
			distance: 100,
			pullToRefresh: false,
			pullToRefreshWithOverscroll: false,
			pullToRefreshSize: 60,
			pullToRefreshContent: 'Pull to refresh...',
			pullToRefreshClass: 'ui-pull-to-refresh',
			touchActiveClassName: 'touch-active',
			emptyText: '',
			delayedRender: 0,
			headerView: null, // view to print on the header
			headerSize: 0, // height of the header in a vertical listview or width in an horizontal listview
			changeDirectionPan: 50
		});

		_this.items = [];
		_this.rowItems = []; // [{ index: 1, from: 200, to: 300 }, ...]
		_this.rowPositions = []; // Cumulative position due to different sizes of items
		_this.x = 0;
		_this.y = 0;
		_this.overscrollX = 0;
		_this.overscrollY = 0;
		_this.isOverscrolling = false;
		_this.previousX = 0;
		_this.previousY = 0;
		_this.offsetCalculated = false;
		_this.offsetX = 0;
		_this.offsetY = 0;
		_this.listWidth = 0;
		_this.listHeight = 0;
		_this.containerSize = 0;
		_this.rendered = false;
		_this.isLoadingMore = false;
		_this.isRefreshing = false;
		_this.isClicking = false;
		_this.activeItem = null;
		_this.touchX = 0;
		_this.touchY = 0;
		_this.touchStartedAtScollX = 0;
		_this.touchStartedAtScollY = 0;
		_this.direction = null;
		_this.previousDirection = null;
		_this.startChangeDirectionAt = null;

		_this.setCollection(_this.collection);

		_this.onMove = _underscore2.default.bind(_this.onMove, _this);
		return _this;
	}

	//
	// Methods
	//

	_createClass(ListView, [{
		key: "render",
		value: function render() {
			var _this2 = this;

			if (this.onRender) {
				if (this.timeoutId) clearTimeout(this.timeoutId);
				if (this.rafId) this.cancelAnimationFrame(this.rafId);

				this.timeoutId = setTimeout(function () {
					_this2.timeoutId = null;
					_this2.rafId = _this2.requestAnimationFrame(function () {
						// Pass to the onRender callback if the view is already rendered
						_this2.onRender(_this2.rendered);
						_this2.delegateEvents();
						_this2.rendered = true;
						_this2.rafId = null;
					});
				}, this.options.delayedRender);
			} else {
				this.rendered = true;
			}
			return this;
		}
	}, {
		key: "onRender",
		value: function onRender(rendered) {
			var _this3 = this;

			if (rendered) return this;
			// Prepare the content
			this.$el.addClass('overflow-scroll').addClass(this.options.orientation);

			this.listWidth = this.$el.width();
			this.listHeight = this.$el.height();
			(0, _style.overflowScrolling)(this.el, true, this.options.orientation); // Per Android e WK

			// Empty text
			this.cache.$emptyText = (0, _jquery2.default)('<div class="empty"></div>').text(this.options.emptyText).hide();
			if (!this.collection.fetching) {
				this.sync();
			}
			this.$el.append(this.cache.$emptyText);

			// Container
			var $scrollContainer = this.cache.$scrollContainer = (0, _jquery2.default)('<div>');
			this.resizeContainer();

			this.requestAnimationFrame(function () {
				_this3.$el.removeClass('overflow-scroll');
				_this3.requestAnimationFrame(function () {
					_this3.$el.addClass('overflow-scroll');
				});
			});

			// Preparo gli elementi vuoti
			var anElement, anItem, aPosition, aXY;
			var itemStyle = {
				position: 'absolute',
				top: 0,
				left: 0
			};
			for (var i = 0; i < this.options.placeholders; i++) {
				anElement = (0, _jquery2.default)('<div>').addClass(this.options.itemClass);
				anItem = {
					index: i,
					$el: anElement
				};
				aXY = this.getXYFromIndex(i);
				anItem.x = aXY.x;
				anItem.y = aXY.y;

				if (this.options.orientation === ORIENTATION_VERTICAL) {
					itemStyle.width = this.listWidth / this.options.itemsPerRow / this.listWidth * 100 + '%';
				} else {
					itemStyle.height = this.listHeight / this.options.itemsPerRow / this.listHeight * 100 + '%';
				}

				anElement.css(itemStyle);

				this.updateContent(anItem, true);
				this.items.push(anItem);
				$scrollContainer.append(anElement);
			}

			this.$el.append($scrollContainer);

			// Header
			if (this.options.headerView && this.options.headerView instanceof _BaseView3.default) {
				this.$el.prepend(this.options.headerView.el);
				this.options.headerView.render();
			}

			// Pull to refresh
			if (this.options.pullToRefresh) {
				var $pullToRefresh = this.cache.$pullToRefresh = (0, _jquery2.default)('<div>').addClass(this.options.pullToRefreshClass);
				$pullToRefresh.css({
					position: 'absolute',
					top: 0,
					left: 0,
					'margin-top': "-" + this.options.pullToRefreshSize + "px"
				});

				// Check if this.options.pullToRefreshContent is a BaseView or not
				if (this.options.pullToRefreshContent instanceof _BaseView3.default) {
					$pullToRefresh.append(this.options.pullToRefreshContent.el);
					this.options.pullToRefreshContent.render();
				} else {
					$pullToRefresh.append(this.options.pullToRefreshContent);
				}

				this.$el.prepend($pullToRefresh);
			}
		}
	}, {
		key: "updateContent",
		value: function updateContent(item, immediate) {
			var _this4 = this;

			// Aggiorna il contenuto
			var model = this.collection.at(item.index);
			if (!item.view && model) {

				// if (!('getListItemViewAtIndexWithOptions' in this))
				// 	throw new Error('Method getListItemViewAtIndexWithOptions not implemented');

				item.view = this.getListItemViewAtIndexWithOptions(item.index, {
					el: item.$el.get(0),
					model: model,
					state: this.getState(),
					parentList: this,
					removeOnDestroy: true
				});
			}

			// Render
			if (item.view) {
				item.view.setModel(model);
				item.view.render();
			}

			// Riposiziona l'elemento
			var position = this.getPositionAtIndex(item.index);
			var xy = this.getXYFromIndex(item.index);
			item.x = xy.x;
			item.y = xy.y;
			this.requestAnimationFrame(function () {
				for (var c = 0; c < _this4.options.itemsPerRow; c++) {
					if (position.column !== c) item.$el.removeClass('col-' + c);
				}
				item.$el.addClass('col-' + position.column);
			});
			(0, _style.translate3d)(item.$el, item.x, item.y, 0, immediate);
		}
	}, {
		key: "updateRangeContents",
		value: function updateRangeContents(startIndex, endIndex, forceUpdate) {
			var anItem;

			startIndex = startIndex - this.options.placeholderCache;
			if (startIndex < 0) startIndex = 0;

			endIndex = endIndex + this.options.placeholderCache;
			if (endIndex > this.getItemsCount()) endIndex = this.getItemsCount();

			for (var i = startIndex; i < endIndex; i++) {
				anItem = this.getItemAtIndex(i);
				if (anItem.index !== i || forceUpdate) {
					anItem.index = i;
					this.updateContent(anItem);
				}
			}
		}
	}, {
		key: "updateAllContents",
		value: function updateAllContents() {
			var anItem;

			for (var i = 0; i < this.options.placeholders; i++) {
				anItem = this.items[i];
				this.updateContent(anItem);
			}
		}
	}, {
		key: "resizeContainer",
		value: function resizeContainer() {
			this.listWidth = this.$el.width();
			this.listHeight = this.$el.height();

			if (this.cache.$scrollContainer) {
				var containerStyle = {
					position: 'relative',
					overflow: 'visible'
				};
				// Calculate the size of every item and get his position
				this.calculateRowPosition();

				// Check if the number of elements is less then then amount of
				// placeholder. This prevent the list from scrolling more then
				// then real number of items.
				if (this.getCollection().length < this.options.placeholders) {
					containerStyle.overflow = 'hidden';
				}

				if (this.options.orientation === ORIENTATION_VERTICAL) {
					containerStyle.height = this.containerSize + 'px';
					containerStyle.width = '100%';
				} else {
					containerStyle.height = '100%';
					containerStyle.width = this.containerSize + 'px';
				}

				this.cache.$scrollContainer.css(containerStyle);
			}
		}
	}, {
		key: "pause",
		value: function pause() {
			(0, _style.overflowScrolling)(this.el, false, this.options.orientation);
			return this;
		}
	}, {
		key: "resume",
		value: function resume() {
			(0, _style.overflowScrolling)(this.el, true, this.options.orientation);
			return this;
		}
	}, {
		key: "reset",
		value: function reset() {
			this.onReset();
		}
	}, {
		key: "sync",
		value: function sync() {
			this.onSync();
		}
	}, {
		key: "getListItemViewAtIndexWithOptions",
		value: function getListItemViewAtIndexWithOptions(index, options) {
			return new _ListItemView2.default(options);
		}
	}, {
		key: "setCollection",
		value: function setCollection(collection) {
			if (this.collection) {
				this.stopListening(this.collection);
			}

			if (!collection) {
				this.collection = null;
				return;
			}

			if (!(collection instanceof _backbone.Collection)) collection = new _backbone.Collection(collection);

			this.collection = collection;

			this.listenTo(this.collection, 'sync', this.onSync);
			this.listenTo(this.collection, 'reset', this.onReset);
			this.listenTo(this.collection, 'sort', this.onSort);
			this.listenTo(this.collection, 'add', _underscore2.default.debounce(_underscore2.default.bind(this.onAdd, this)));
			this.listenTo(this.collection, 'remove', _underscore2.default.debounce(_underscore2.default.bind(this.onRemove, this)));

			// Reset
			this.reset();
		}
	}, {
		key: "refresh",
		value: function refresh() {
			var _this5 = this;

			if (this.isRefreshing) return;
			if (typeof this.onRefresh == 'function') {
				this.isRefreshing = true;

				this.showPullToRefresh();

				// Stops the scroll
				this.pause();

				if (this.options.pullToRefreshContent instanceof _BaseView3.default && 'onRefreshStart' in this.options.pullToRefreshContent) {
					this.options.pullToRefreshContent.onRefreshStart();
				}

				this.onRefresh(function (successfully) {
					if (_this5.options.pullToRefreshContent instanceof _BaseView3.default && 'onRefreshComplete' in _this5.options.pullToRefreshContent) {
						_this5.options.pullToRefreshContent.onRefreshComplete(successfully || successfully === void 0);
					}
					_this5.isRefreshing = false;
					_this5.resume();
					_this5.hidePullToRefresh();
				});
			}
		}
	}, {
		key: "updatePullToRefreshOverscrollPosition",
		value: function updatePullToRefreshOverscrollPosition() {
			this.cache.$pullToRefresh.get(0).style[(0, _style.getVendorStyle)('transition')] = '';
			if (this.options.orientation === ORIENTATION_VERTICAL) {
				var translateY = this.overscrollY;
				// Add some friction
				if (translateY > 100) translateY = Math.sqrt(100 * translateY);
				// translateY = 50 * Math.log10(translateY);
				(0, _style.translate3d)(this.cache.$pullToRefresh, 0, translateY, 0);
			} else {
				var translateX = this.overscrollX;
				// Add some friction
				if (translateX > 100) translateX = Math.sqrt(100 * translateX);
				// translateX = 50 * Math.log10(translateX);
				(0, _style.translate3d)(this.cache.$pullToRefresh, 0, this.overscrollX, 0);
			}
		}
	}, {
		key: "showPullToRefresh",
		value: function showPullToRefresh() {
			// If overscroll is disabled we don't want animation on pull to refresh view
			if (this.options.pullToRefreshWithOverscroll) (0, _style.transition)(this.cache.$pullToRefresh, 'transform 300ms ease-out');else (0, _style.transition)(this.cache.$pullToRefresh, '');

			(0, _style.translate3d)(this.cache.$pullToRefresh, 0, this.options.pullToRefreshSize, 0);
			if (!this.options.pullToRefreshWithOverscroll) {
				(0, _style.transition)(this.cache.$scrollContainer, '');
				(0, _style.translate3d)(this.cache.$scrollContainer, 0, this.options.pullToRefreshSize, 0);
			}
		}
	}, {
		key: "hidePullToRefresh",
		value: function hidePullToRefresh() {
			var _this6 = this;

			setTimeout(function () {
				(0, _style.transition)(_this6.cache.$pullToRefresh, 'transform 300ms ease-out');
				(0, _style.translate3d)(_this6.cache.$pullToRefresh, 0, 0, 0);
				if (!_this6.options.pullToRefreshWithOverscroll) {
					(0, _style.transition)(_this6.cache.$scrollContainer, 'transform 300ms ease-out');
					(0, _style.translate3d)(_this6.cache.$scrollContainer, 0, 0, 0);
				}
			}, 300);
		}
	}, {
		key: "setItemsPerRow",
		value: function setItemsPerRow(newItemsPerRow) {
			var _this7 = this;

			if (newItemsPerRow != this.options.itemsPerRow) {
				setTimeout(function () {
					var oldItemsPerRow = _this7.options.itemsPerRow;
					var startIndex = void 0;
					var newStartItemPosition = void 0;
					var oldStartItemPosition = void 0;
					var scrollDelta = void 0;
					var scrollTo = void 0;
					var itemStyle = {};

					startIndex = _this7.getStartIndex();
					// Calculate current/old position
					oldStartItemPosition = _this7.getPositionAtIndex(startIndex);
					// Change itemsPerRow option
					_this7.options.itemsPerRow = newItemsPerRow;
					// Resize the container
					_this7.resizeContainer();
					// Calculate new position
					newStartItemPosition = _this7.getPositionAtIndex(startIndex);

					if (_this7.options.orientation === ORIENTATION_VERTICAL) {
						itemStyle.width = _this7.listWidth / _this7.options.itemsPerRow / _this7.listWidth * 100 + '%';
						scrollDelta = oldStartItemPosition.row * _this7.options.itemHeight + _this7.y;
						scrollTo = newStartItemPosition.row * _this7.options.itemHeight - scrollDelta;
						_this7.el.scrollTop = scrollTo;
					} else {
						itemStyle.height = _this7.listHeight / _this7.options.itemsPerRow / _this7.listHeight * 100 + '%';
						scrollDelta = oldStartItemPosition.row * _this7.options.itemWidth + _this7.x;
						scrollTo = newStartItemPosition.row * _this7.options.itemWidth - scrollDelta;
						_this7.el.scrollLeft = scrollTo;
					}

					// Resize all items
					for (var i = 0; i < _this7.items.length; i++) {
						_this7.items[i].$el.css(itemStyle);
						for (var c = 0; c < oldItemsPerRow; c++) {
							_this7.items[i].$el.removeClass('col-' + c);
						}
					}

					_this7.updateAllContents();
				}, 100);
			}
		}
	}, {
		key: "getCollection",
		value: function getCollection() {
			return this.collection;
		}
	}, {
		key: "loadMore",
		value: function loadMore() {
			var _this8 = this;

			if (this.isLoadingMore) return;

			if ('onLoadMore' in this && this.shouldLoadMore()) {
				this.isLoadingMore = true;
				// TODO: mostrare lo spinner
				this.onLoadMore(function () {
					_this8.isLoadingMore = false;
				});
			}
		}
	}, {
		key: "shouldLoadMore",
		value: function shouldLoadMore() {
			return true;
		}
	}, {
		key: "scrollTop",
		value: function scrollTop(animated) {
			// TODO: animate scroll
			this.pause();
			this.el.scrollTop = 0;
			// Trigger change:direction when user taps the status bar
			this.direction = DOWN_TOP;
			if (this.direction != this.previousDirection) {
				this.trigger('change:direction', this.direction);
				this.previousDirection = this.direction;
			}
			this.resume();
		}
	}, {
		key: "isVertical",
		value: function isVertical() {
			return this.options.orientation === ORIENTATION_VERTICAL;
		}

		//
		// Events
		//

	}, {
		key: "onScroll",
		value: function onScroll(ev) {
			requestTick(this.onMove);
		}
	}, {
		key: "onMove",
		value: function onMove() {
			var startIndex = void 0;
			var endIndex = void 0;

			if (this.options.orientation === ORIENTATION_VERTICAL) {
				var y = this.y = -this.el.scrollTop;
				this.direction = y < this.previousY ? TOP_DOWN : DOWN_TOP;
				if (this.direction != this.previousDirection && y < 0) {
					this.startChangeDirectionAt = y;
					this.previousDirection = this.direction;
				}

				if (this.startChangeDirectionAt !== null && Math.abs(this.startChangeDirectionAt - y) > this.options.changeDirectionPan) {
					this.startChangeDirectionAt = null;
					this.trigger('change:direction', this.direction);
				}

				this.previousY = y;
				startIndex = this.getStartIndex();
				endIndex = this.getEndIndex();

				if (this.options.infinite) {
					if (this.containerSize - this.listHeight - this.options.distance < -y) {
						this.loadMore();
					}
				}
			} else {
				var x = this.x = -this.el.scrollLeft;
				this.direction = x < this.previousX ? LEFT_RIGHT : RIGHT_LEFT;
				if (this.direction != this.previousDirection && x < 0) {
					this.trigger('change:direction', this.direction);
					this.previousDirection = this.direction;
				}
				this.previousX = x;
				startIndex = this.getStartIndex();
				endIndex = this.getEndIndex();

				if (this.options.infinite) {
					if (this.containerSize - this.listWidth - this.options.distance < -x) {
						this.loadMore();
					}
				}
			}

			this.updateRangeContents(startIndex, endIndex);
		}
	}, {
		key: "onTouchStart",
		value: function onTouchStart(e) {
			var _this9 = this;

			if ((this.isClicking || this.isRefreshing || this.activeItem) && e.editable) return;

			this.touchStartedAtScrollX = this.x;
			this.touchStartedAtScrollY = this.y;

			if ('onSelectItem' in this) {
				var event = this.normalizeEvent(e);
				var x = -event.x + this.x;
				var y = -event.y + this.y;
				var item = this.getItemFromXY(x, y);
				this.touchX = event.x;
				this.touchY = event.y;
				if (item && item.view) {
					this.activeItem = item;
					window.requestAnimationFrame(function () {
						if (_this9.activeItem) _this9.activeItem.view.$el.addClass(_this9.options.touchActiveClassName);
					});
				}
			}
		}
	}, {
		key: "onTouchMove",
		value: function onTouchMove(e) {
			var _this10 = this;

			if ((this.isOverscrolling || this.isRefreshing) && e.cancelable) {
				e.preventDefault();
				e.stopPropagation();
			}
			var event = this.normalizeEvent(e);
			var deltaX = Math.abs(this.touchX - event.x);
			var deltaY = Math.abs(this.touchY - event.y);
			if (this.activeItem && (deltaX > 20 || deltaY > 20)) {
				window.requestAnimationFrame(function () {
					if (_this10.activeItem) {
						_this10.activeItem.view.$el.removeClass(_this10.options.touchActiveClassName);
						_this10.activeItem = null;
					}
				});
			}
			// Overscroll
			if (this.options.pullToRefresh && this.options.pullToRefreshWithOverscroll && !this.isRefreshing) {
				if (this.y === 0) {
					this.overscrollY = event.y - this.touchY + this.touchStartedAtScrollY;
					this.updatePullToRefreshOverscrollPosition();
					if (this.overscrollY >= 10) {
						this.isOverscrolling = true;
					}
					// console.log('y:%s ty:%s oy:%s overscrolling:%s', this.y, this.touchY, this.overscrollY, this.isOverscrolling);
				} else if (this.x === 0) {
					this.overscrollX = event.x - this.touchX + this.touchStartedAtScrollX;
					this.updatePullToRefreshOverscrollPosition();
					if (this.overscrollX >= 10) {
						this.isOverscrolling = true;
					}
				}
			}
		}
	}, {
		key: "onTouchEnd",
		value: function onTouchEnd(e) {
			var _this11 = this;

			this.isOverscrolling = false;

			// Trigger refresh due to pullToRefresh
			if (this.options.pullToRefresh && !this.isRefreshing) {
				if (this.options.pullToRefreshWithOverscroll && this.overscrollY > this.options.pullToRefreshSize * 2 || !this.options.pullToRefreshWithOverscroll && this.y > this.options.pullToRefreshSize * 2) {
					this.refresh();
				} else {
					this.hidePullToRefresh();
				}
			}

			if (this.activeItem) {
				window.requestNextAnimationFrame(function () {
					if (_this11.activeItem) {
						_this11.activeItem.view.$el.removeClass(_this11.options.touchActiveClassName);
						_this11.activeItem = null;
					}
				});
			}
		}
	}, {
		key: "onClick",
		value: function onClick(e) {
			var _this12 = this;

			if (this.isClicking || this.isRefreshing) return;

			if ('onSelectItem' in this) {
				var event = this.normalizeEvent(e);
				var x = -event.x + this.x;
				var y = -event.y + this.y;
				var item = this.getItemFromXY(x, y);

				// To retreve an element from x,y
				var element = document.elementFromPoint(event.pageX, event.pageY);

				if (item && item.view) {
					this.isClicking = true;
					this.onSelectItem({ view: item.view, element: element }, function () {
						_this12.isClicking = false;
					});
				}
			}
		}
	}, {
		key: "onAdd",
		value: function onAdd(model) {
			if (this.rendered) {
				this.resizeContainer();
				// let modelIndex = this.getCollection().indexOf(model);
				var startIndex = this.getStartIndex();
				var endIndex = this.getEndIndex();
				this.updateRangeContents(startIndex, endIndex, true);
			}
		}
	}, {
		key: "onRemove",
		value: function onRemove(model) {
			if (this.rendered) {
				this.resizeContainer();
				this.updateAllContents();
			}
			this.sync();
		}
	}, {
		key: "onSync",
		value: function onSync() {
			if (this.cache.$emptyText) {
				// Empty state
				if (this.collection.length === 0) {
					this.cache.$emptyText.show();
				} else {
					this.cache.$emptyText.hide();
				}
			}
		}
	}, {
		key: "onSort",
		value: function onSort() {
			if (this.rendered) {
				this.updateAllContents();
			}
		}
	}, {
		key: "onReset",
		value: function onReset() {
			var _this13 = this;

			if (this.rendered) {
				// Reset item indexes
				for (var i = 0, n = this.items.length; i < n; i++) {
					this.items[i].index = i;
				}
				window.requestAnimationFrame(function () {
					// Reset scroll
					_this13.x = 0;
					_this13.y = 0;
					_this13.el.scrollTop = 0;
					_this13.el.scrollLeft = 0;
					// Update container and content
					_this13.resizeContainer();
					_this13.updateAllContents();
					_this13.pause();
					window.requestAnimationFrame(function () {
						_this13.resume();
					});
					_this13.sync();
				});
			}
		}
	}, {
		key: "onDestroy",
		value: function onDestroy() {
			var anItem;
			for (var i = 0; i < this.options.placeholders; i++) {
				anItem = this.items[i];
				if (anItem && anItem.view) anItem.view.destroy();
			}
			_get(ListView.prototype.__proto__ || Object.getPrototypeOf(ListView.prototype), "onDestroy", this).call(this);
		}

		//
		// Helpers
		//

	}, {
		key: "wrapIndex",
		value: function wrapIndex(index) {
			var n = this.options.placeholders;
			return (index % n + n) % n;
		}
	}, {
		key: "normalizeEvent",
		value: function normalizeEvent(e) {
			var x, y, pageX, pageY;
			if (!this.offsetCalculated) {
				var offset = this.$el.offset();
				this.offsetX = offset.left;
				this.offsetY = offset.top;
			}
			if (e.type === 'click' || e.type === 'mouseup' || e.type === 'mousedown' || e.type === 'mousemove') {
				x = e.pageX - this.offsetX;
				y = e.pageY - this.offsetY;
				pageX = e.pageX;
				pageY = e.pageY;
			} else if (e.type === 'touchstart' || e.type === 'touchend' || e.type === 'touchmove') {
				x = e.originalEvent.changedTouches[0].pageX - this.offsetX;
				y = e.originalEvent.changedTouches[0].pageY - this.offsetY;
				pageX = e.originalEvent.changedTouches[0].pageX;
				pageY = e.originalEvent.changedTouches[0].pageY;
			}
			return { x: x, y: y, pageX: pageX, pageY: pageY };
		}
	}, {
		key: "getContainerSize",
		value: function getContainerSize() {
			var rows = this.getRowsCount();
			var infiniteLoadingSize = 0;

			if (this.options.infinite && this.shouldLoadMore()) {
				infiniteLoadingSize = this.options.infiniteLoadingSize;
			}

			return this.containerSize + this.options.headerSize;
		}
	}, {
		key: "calculateRowPosition",
		value: function calculateRowPosition() {
			var _this14 = this;

			if (!this.listWidth || !this.listHeight) {
				return;
			}

			var state = this.getState();
			this.rowPositions = [];
			this.rowItems = [];

			var headerSize = this.options.headerSize;
			var itemsPerRow = this.options.itemsPerRow;
			var orientation = this.options.orientation;

			var aCumulativePosition = headerSize;
			var aSize = void 0;
			var aRowMaxSize = 0;
			var aRow = void 0;
			var aColumn = void 0;
			var aColumnWidth = void 0;
			var aColumnHeight = void 0;
			this.collection.forEach(function (aModel, anIndex) {
				aSize = _this14.getListItemSizeAtIntexWithOptions(anIndex, {
					model: aModel,
					state: state
				});
				aRowMaxSize = Math.max(aRowMaxSize, aSize);

				aRow = Math.floor(anIndex / itemsPerRow);

				if (!_this14.rowItems[aRow]) {
					_this14.rowItems.push([]);
				}

				_this14.rowPositions[anIndex] = aCumulativePosition;

				if (orientation === ORIENTATION_VERTICAL) {
					aColumn = anIndex % itemsPerRow;
					aColumnWidth = _this14.listWidth / itemsPerRow;
					_this14.rowItems[aRow].push({
						index: anIndex,
						top: aCumulativePosition,
						right: (aColumn + 1) * aColumnWidth,
						bottom: aCumulativePosition + aSize,
						left: aColumn * aColumnWidth
					});
				} else {
					aColumn = anIndex % itemsPerRow;
					aColumnHeight = _this14.listHeight / itemsPerRow;
					_this14.rowItems[aRow].push({
						index: anIndex,
						top: aColumn * aColumnHeight,
						right: aCumulativePosition + aSize,
						bottom: (aColumn + 1) * aColumnHeight,
						left: aCumulativePosition
					});
				}

				if (anIndex % itemsPerRow === itemsPerRow - 1) {
					aCumulativePosition += aRowMaxSize;
					// Change the bottom property of every column in row
					// only if itemsPerRow > 1
					if (itemsPerRow > 1) {
						for (var i = 0; i < _this14.rowItems[aRow].length; i++) {
							if (orientation === ORIENTATION_VERTICAL) {
								_this14.rowItems[aRow][i].bottom = _this14.rowItems[aRow][i].top + aRowMaxSize;
							} else {
								_this14.rowItems[aRow][i].right = _this14.rowItems[aRow][i].left + aRowMaxSize;
							}
						}
					}
					aRowMaxSize = 0;
				}
			});

			this.containerSize = aCumulativePosition;
		}
	}, {
		key: "getStartIndex",
		value: function getStartIndex() {
			if (this.options.orientation === ORIENTATION_VERTICAL) {
				return this.getIndexFromXY(0, this.y);
			} else {
				return this.getIndexFromXY(this.x, 0);
			}
		}
	}, {
		key: "getEndIndex",
		value: function getEndIndex() {
			if (this.options.orientation === ORIENTATION_VERTICAL) {
				return this.getIndexFromXY(this.listWidth - 1, this.y - this.listHeight);
			} else {
				return this.getIndexFromXY(this.x - this.listWidth, this.listHeight - 1);
			}
		}
	}, {
		key: "getXYFromIndex",
		value: function getXYFromIndex(index) {
			var aPosition = this.getPositionAtIndex(index);
			var xy = {};
			if (this.options.orientation === ORIENTATION_VERTICAL) {
				xy = {
					x: aPosition.column * Math.floor(this.listWidth / this.options.itemsPerRow),
					y: this.rowPositions[index]
				};
			} else {
				xy = {
					x: this.rowPositions[index],
					y: aPosition.column * Math.floor(this.listHeight / this.options.itemsPerRow)
				};
			}
			return xy;
		}
	}, {
		key: "binarySearch",
		value: function binarySearch(rows, x, y) {
			var _this15 = this;

			x = Math.abs(x);
			y = Math.abs(y);

			var inRect = function inRect(items, x, y) {
				return _underscore2.default.find(items, function (anItem) {
					return x >= anItem.left && x <= anItem.right && y >= anItem.top && y <= anItem.bottom;
				});
			};

			var isBeforeRect = function isBeforeRect(items, x, y) {
				if (_this15.options.orientation === ORIENTATION_VERTICAL) return y < items[0].top;else return x < items[0].left;
			};

			var isAfterRect = function isAfterRect(items, x, y) {
				if (_this15.options.orientation === ORIENTATION_VERTICAL) return y > items[0].bottom;else return x > items[0].right;
			};

			var startIndex = 0,
			    stopIndex = rows.length - 1,
			    middle = Math.floor((stopIndex + startIndex) / 2);

			while (!inRect(rows[middle], x, y) && startIndex < stopIndex) {

				//adjust search area
				if (isBeforeRect(rows[middle], x, y)) {
					stopIndex = middle - 1;
				} else if (isAfterRect(rows[middle], x, y)) {
					startIndex = middle + 1;
				}

				//recalculate middle
				middle = Math.floor((stopIndex + startIndex) / 2);
			}

			//make sure it's the right value
			var result = inRect(rows[middle], x, y);
			return result ? result.index : -1;
		}
	}, {
		key: "getIndexFromXY",
		value: function getIndexFromXY(x, y) {
			var index;
			var row;
			var column;

			// Fix needed when you create a ListView with display: none;
			if (this.listWidth === 0) this.listWidth = this.$el.width();

			if (this.listHeight === 0) this.listHeight = this.$el.height();

			index = this.binarySearch(this.rowItems, x, y);

			return index;
		}
	}, {
		key: "getItemFromXY",
		value: function getItemFromXY(x, y) {
			var index = this.getIndexFromXY(x, y);
			return this.items[this.wrapIndex(index)];
		}
	}, {
		key: "getRowsCount",
		value: function getRowsCount() {
			var length = this.collection.length;
			return Math.ceil(length / (this.options.itemsPerRow || 1));
		}
	}, {
		key: "getPositionAtIndex",
		value: function getPositionAtIndex(index) {
			// Vertical (R,C)
			//
			// |---|---|
			// |0,0|0,1|
			// |---|---|
			// |1,0|1,1|
			// |---|---|
			// |   |   |

			// Horizontal (R,C)
			// ------------
			// |0,0|1,0|
			// ------------
			// |0,1|1,1|
			// ------------
			return {
				row: Math.floor(index / this.options.itemsPerRow), // First row = 0
				column: index % this.options.itemsPerRow
			};
		}
	}, {
		key: "getItemAtIndex",
		value: function getItemAtIndex(index) {
			return this.items[this.wrapIndex(index)];
		}
	}, {
		key: "getListItemSizeAtIntexWithOptions",
		value: function getListItemSizeAtIntexWithOptions(index) {
			if (this.options.orientation === ORIENTATION_VERTICAL) {
				return this.options.itemHeight;
			} else {
				return this.options.itemWidth;
			}
		}
	}, {
		key: "getItemsCount",
		value: function getItemsCount() {
			if (!this.collection) return 0;
			return this.collection.length;
		}
	}]);

	return ListView;
}(_BaseView3.default);

// Const


exports.default = ListView;
ListView.ORIENTATION_VERTICAL = ORIENTATION_VERTICAL;
ListView.ORIENTATION_HORIZONTAL = ORIENTATION_HORIZONTAL;
ListView.TOP_DOWN = 1;
ListView.DOWN_TOP = 2;
ListView.LEFT_RIGHT = 4;
ListView.RIGHT_LEFT = 8;

},{"../BaseView":27,"../utils/getContextOptions":37,"../utils/style":39,"./../../examples/bower_components/backbone/backbone.js":6,"./../../examples/bower_components/context-utils/lib/context.js":7,"./../../examples/bower_components/jquery/dist/jquery.js":11,"./../../examples/bower_components/underscore/underscore.js":17,"./ListItemView":30}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports._elementStyle = undefined;
exports.getVendorStyle = getVendorStyle;
exports.translate3d = translate3d;
exports.scale = scale;
exports.scaleAndTranslate3d = scaleAndTranslate3d;
exports.overflowScrolling = overflowScrolling;
exports.transition = transition;

var _jquery = require("./../../examples/bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create an element div for util
var _elementStyle = exports._elementStyle = document.createElement('div').style;

// Return the vendor
// http://addyosmani.com/polyfillthehtml5gaps/slides/#78
function getVendorStyle(prop) {
	var prefixes = ['Moz', 'Khtml', 'Webkit', 'O', 'ms'];
	var upper = prop.charAt(0).toUpperCase() + prop.slice(1);

	if (prop in _elementStyle) return prop;

	for (var len = prefixes.length; len--;) {
		if (prefixes[len] + upper in _elementStyle) return prefixes[len] + upper;
	}
	return;
};

// Translate3d
function translate3d(el, x, y, z, immediate) {

	if (el instanceof _jquery2.default) el = el.get(0);

	if (!el instanceof Element) throw new Error('It is not an object Element');

	if (typeof x === 'number') x = x.toString() + 'px';
	if (typeof y === 'number') y = y.toString() + 'px';
	if (typeof z === 'number') z = z.toString() + 'px';

	//
	var transformProp = getVendorStyle('transform');
	var transform = 'translate3d(' + x + ', ' + y + ', ' + z + ')';

	//
	if (immediate) {
		el.style[transformProp] = transform;
		return;
	}

	//
	window.requestAnimationFrame(function () {
		el.style[transformProp] = transform;
	});
};

// scale
function scale(el, scale, immediate) {

	if (el instanceof _jquery2.default) el = el.get(0);

	if (!el instanceof Element) throw new Error('It is not an object Element');

	var transformProp = getVendorStyle('transform');
	var transform = 'scale(' + scale + ')';

	if (immediate) {
		el.style[transformProp] = transform;
		return;
	}

	window.requestAnimationFrame(function () {
		el.style[transformProp] = transform;
	});
};

// scaleAndTranslate3d
function scaleAndTranslate3d(el, scale, x, y, z, immediate) {

	if (el instanceof _jquery2.default) el = el.get(0);

	if (!el instanceof Element) throw new Error('It is not an object Element');

	if (typeof x === 'number') x = x.toString() + 'px';
	if (typeof y === 'number') y = y.toString() + 'px';
	if (typeof z === 'number') z = z.toString() + 'px';

	var transformProp = getVendorStyle('transform');
	var transform = 'scale(' + scale + ') translate3d(' + x + ', ' + y + ', ' + z + ')';

	if (immediate) {
		el.style[transformProp] = transform;
		return;
	}

	window.requestAnimationFrame(function () {
		el.style[transformProp] = transform;
	});
};

// Overflow scrolling
var overflowScrollingProperty = void 0;
function overflowScrolling(el, enable) {
	var orientation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'vertical';


	if (el instanceof _jquery2.default) el = el.get(0);

	if (!overflowScrollingProperty) overflowScrollingProperty = 'webkitOverflowScrolling' in el.style ? 'webkitOverflowScrolling' : 'overflowScrolling';

	if (enable) {
		el.style[overflowScrollingProperty] = 'touch';
		if (orientation === 'vertical') {
			el.style.overflowX = 'hidden';
			el.style.overflowY = 'auto';
		} else if (orientation === 'horizontal') {
			el.style.overflowX = 'auto';
			el.style.overflowY = 'hidden';
		}
	} else {
		el.style[overflowScrollingProperty] = 'auto';
		el.style.overflowX = 'hidden';
		el.style.overflowY = 'hidden';
	}
};

// CSS transition
function transition(el, transition) {
	if (el instanceof _jquery2.default) el = el.get(0);
	el.style[getVendorStyle('transition')] = transition;
}

},{"./../../examples/bower_components/jquery/dist/jquery.js":11}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = getContextOptions;

var _contextUtils = require("./../../examples/bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getContextOptions(viewName) {
	if (_contextUtils2.default && _contextUtils2.default.uikit && _contextUtils2.default.uikit[viewName]) return _contextUtils2.default.uikit[viewName];
	return {};
}

},{"./../../examples/bower_components/context-utils/lib/context.js":7}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("./../../examples/bower_components/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _BaseView2 = require("../BaseView");

var _BaseView3 = _interopRequireDefault(_BaseView2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ListItemView = function (_BaseView) {
	_inherits(ListItemView, _BaseView);

	function ListItemView(options) {
		_classCallCheck(this, ListItemView);

		var _this = _possibleConstructorReturn(this, (ListItemView.__proto__ || Object.getPrototypeOf(ListItemView)).call(this, options));

		_this._visibility = false;

		_this.listenTo(_this.model, 'change', _this.render);
		return _this;
	}

	_createClass(ListItemView, [{
		key: "setModel",
		value: function setModel(newModel) {
			if (this.model) {
				this.stopListening(this.model);
				this.model = null;
			}
			if (newModel) {
				this.model = newModel;
				this.listenTo(this.model, 'change', this.render);
			}
			return this;
		}
	}, {
		key: "onRender",
		value: function onRender(rendered) {
			if (!rendered) {
				this.cache.$title = (0, _jquery2.default)('<span>').text(this.model.toString());
				this.$el.append(this.cache.$title);
			} else if (this.model) {
				this.cache.$title.text(this.model.toString());
			} else {
				this.cache.$title.text('');
			}
			return this;
		}
	}]);

	return ListItemView;
}(_BaseView3.default);

exports.default = ListItemView;

},{"../BaseView":27,"./../../examples/bower_components/jquery/dist/jquery.js":11,"./../../examples/bower_components/underscore/underscore.js":17}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _BaseView2 = require("./BaseView");

var _BaseView3 = _interopRequireDefault(_BaseView2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var callbackIdGenerator = 0;
var emptyImage = 'empty.gif';
var cache = [];
var timeout = void 0;

var ImageView = function (_BaseView) {
	_inherits(ImageView, _BaseView);

	_createClass(ImageView, [{
		key: "tagName",
		value: function tagName() {
			return 'figure';
		}
	}]);

	function ImageView(options) {
		_classCallCheck(this, ImageView);

		var _this = _possibleConstructorReturn(this, (ImageView.__proto__ || Object.getPrototypeOf(ImageView)).call(this, options));

		_this._loaded = false;
		_this._loadDebounce = null;
		_this._appended = false;

		_this.src = '';

		_this.setDefaultsOptions({
			src: null,
			autoload: true,
			placeholder: null,
			size: 'auto', // auto, normal, contain, cover. Scale the image to its container
			worker: false,
			viewport: null,
			className: 'ui-image',
			position: 'center', // top-left, top, top-right, center-left, center, center-right, bottom-left, bottom, bottom-right
			orientation: 0
		});

		_this.$el.addClass(_underscore2.default.result(_this.options, 'className') || '');

		if (_this.options.size !== 'normal') _this.$el.addClass(' ' + _underscore2.default.result(_this.options, 'position') || '');

		_this.image = new Image();
		_this.image.style.opacity = 0;

		// Placeholder
		_this.placeholderImage = new Image();
		_this.placeholderImage.onload = function () {
			_this._placeholderLoaded = true;
			if (!_this._loaded) {
				_this.requestAnimationFrame(function () {
					_this.image.src = _this.placeholderImage.src;
					_this.requestAnimationFrame(function () {
						if (_this.rendered) _this.render();
					});
				});
			}
		};

		if (_this.options.placeholder) {
			_this.placeholderImage.src = _this.options.placeholder;
		}

		_this.bufferImage = new Image();

		// Normal
		_this.bufferImage.onerror = function (err) {
			_this._loaded = false;
			_this.requestAnimationFrame(function () {
				_this.image.src = _this.options.placeholder || emptyImage;
			});
		};
		_this.bufferImage.onload = function () {
			_this._loaded = true;
			_this.requestAnimationFrame(function () {
				_this.image.src = _this.src;
				_this.requestAnimationFrame(function () {
					if (_this.rendered) _this.render();
					_this.trigger('loaded');
				});
			});
		};

		_this.setSource(_this.options.src);
		return _this;
	}

	_createClass(ImageView, [{
		key: "load",
		value: function load() {
			var _this2 = this;

			if (this.src == this.bufferImage.src) return;
			this._loaded = false;
			if (this._loadDebounce) this.cancelAnimationFrame(this._loadDebounce);
			this._loadDebounce = this.requestAnimationFrame(function () {
				_this2.bufferImage.src = _this2.src;
			});
		}
	}, {
		key: "setSource",
		value: function setSource(src, orientation) {
			if (this.src == src) return;
			if (typeof orientation !== 'undefined') {
				this.options.orientation = orientation;
			}
			if (this._loadDebounce) this.cancelAnimationFrame(this._loadDebounce);
			this.src = src;
			if (this.options.autoload) {
				this.load();
				return;
			}
			// this.image.style.visiblity = 'hidden';
			this.image.style.opacity = 0;
			this.image.src = emptyImage;
		}
	}, {
		key: "setPlaceholder",
		value: function setPlaceholder(src, orientation) {
			if (this.placeholderImage.src == src) return;
			if (typeof orientation !== 'undefined') {
				this.options.orientation = orientation;
			}
			if (this._loadDebounce) this.cancelAnimationFrame(this._loadDebounce);
			this.placeholderImage.src = src;
			this.image.style.opacity = 0;
			this.image.src = emptyImage;
		}
	}, {
		key: "onRender",
		value: function onRender(rendered) {
			var _this3 = this;

			if (!this._loaded && !this._placeholderLoaded) return;

			var bufferImage = this.bufferImage;
			var orientation = this.options.orientation;

			if (!this._loaded && this._placeholderLoaded) {
				bufferImage = this.placeholderImage;
				orientation = 0;
			}

			var width = bufferImage.width;
			var height = bufferImage.height;

			var viewport = this.options.viewport ? this.options.viewport : this.viewport;
			if (!viewport) {
				// CAUTION: Always specify viewport dimensions to improve the performance!
				viewport = this.viewport = { width: this.$el.width(), height: this.$el.height() };
			}

			if (Math.abs(orientation) === 90) {
				viewport = {
					width: viewport.height,
					height: viewport.width
				};
			}

			var cssText = '';

			var size = this.options.size;
			if (size !== 'normal') {
				var resized = {};
				var cover = size === 'cover';

				if (size === 'auto') cover = width < height;

				var viewportRatio = viewport.width / viewport.height;
				var imageRatio = width / height;
				var position = this.options.position;

				var top;
				var left;
				var displayWidth;
				var displayHeight;
				var marginTop;
				var marginLeft;

				if (cover === true && imageRatio >= viewportRatio || cover === false && imageRatio <= viewportRatio) {
					resized.width = width * viewport.height / height;
					displayWidth = resized.width;
					displayHeight = viewport.height;
				} else if (cover === true && imageRatio < viewportRatio || cover === false && imageRatio > viewportRatio) {
					resized.height = height * viewport.width / width;
					displayWidth = viewport.width;
					displayHeight = resized.height;
				}

				switch (position) {
					case 'top':
						top = 0;
						left = 50;
						marginTop = 0;
						marginLeft = displayWidth / -2;
						break;
					case 'center':
					default:
						top = 50;
						left = 50;
						marginTop = displayHeight / -2;
						marginLeft = displayWidth / -2;
						break;
				}

				cssText = 'position: absolute;' + 'top: ' + top + '%;' + 'left: ' + left + '%;' + 'height: ' + displayHeight + 'px;' + 'width: ' + displayWidth + 'px;' + 'margin-top: ' + marginTop + 'px;' + 'margin-left: ' + marginLeft + 'px;';
			}

			if (orientation !== 0) {
				cssText += '-webkit-transform: rotate(' + orientation + 'deg);';
				cssText += 'transform: rotate(' + orientation + 'deg);';
			}

			this.requestAnimationFrame(function () {
				cssText += 'opacity: 1;';
				_this3.image.style.cssText = cssText;
				if (!_this3._appended) {
					_this3.$el.append(_this3.image);
					_this3._appended = true;
				}
			});
		}
	}, {
		key: "refresh",
		value: function refresh() {
			this.viewport = null;
			this.render();
		}
	}, {
		key: "width",
		value: function width(val) {
			if (typeof val !== "undefined") return this.image.width = val;
			return this.image.width || 0;
		}
	}, {
		key: "height",
		value: function height(val) {
			if (typeof val !== "undefined") return this.image.height = val;
			return this.image.height || 0;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			cache.push(this.image);
			this.image.src = emptyImage;
			if (this.placeholderImage.src) {
				cache.push(this.placeholderImage);
				this.placeholderImage.src = emptyImage;
			}
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(function () {
				cache = [];
			}, 60000);
			_get(ImageView.prototype.__proto__ || Object.getPrototypeOf(ImageView.prototype), "destroy", this).call(this);
		}
	}]);

	return ImageView;
}(_BaseView3.default);

exports.default = ImageView;

},{"./../examples/bower_components/underscore/underscore.js":17,"./BaseView":27}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("./../examples/bower_components/underscore/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _contextUtils = require("./../examples/bower_components/context-utils/lib/context.js");

var _contextUtils2 = _interopRequireDefault(_contextUtils);

var _backbone = require("./../examples/bower_components/backbone/backbone.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseView = function (_View) {
	_inherits(BaseView, _View);

	function BaseView(options) {
		_classCallCheck(this, BaseView);

		// Initialize view options
		var _this = _possibleConstructorReturn(this, (BaseView.__proto__ || Object.getPrototypeOf(BaseView)).call(this, options));

		_this.options = options || {};

		// Set de default options
		_this.setDefaultsOptions({ state: null, removeOnDestroy: true });

		// State [optional]
		_this.state = _this.options.state;
		delete _this.options.state;
		_this.cache = {};
		// Store sub views
		_this.views = {};
		// Check if the view is rendered
		_this.rendered = false;
		// Alias
		_this.rAF = function () {
			console.warn('method rAF deprecated');
		}; // this.requestAnimationFrame;
		_this.cAF = function () {
			console.warn('method cAF deprecated');
		}; // this.cancelAnimationFrame;
		// Backbone touch active class
		_this.touchActiveClassName = 'touch-active';
		return _this;
	}

	_createClass(BaseView, [{
		key: "className",
		value: function className() {
			return 'ui-base-view ' + (_underscore2.default.result(this, "addClass") || '');
		}

		// Set defaults options

	}, {
		key: "setDefaultsOptions",
		value: function setDefaultsOptions(defaults, moreDefaults) {
			_underscore2.default.defaults(this.options, defaults, moreDefaults);
			return this;
		}

		// Set the view state

	}, {
		key: "setState",
		value: function setState(state) {
			this.state = state;
			return this;
		}

		// Return the view state

	}, {
		key: "getState",
		value: function getState() {
			return this.state;
		}

		// Add events to the current view

	}, {
		key: "addEvents",
		value: function addEvents(events) {
			this.events = _underscore2.default.defaults(events, this.events || {});
			this.delegateEvents();
			return this;
		}

		// Add a new subview

	}, {
		key: "addSubView",
		value: function addSubView(name, view, state) {
			// When adding a subview inject the state
			if (view instanceof BaseView) {
				if (state) view.setState(state);
				if (this.state) view.setState(this.state);
			}
			this.views[name] = view;
			return this;
		}

		// Get a subview

	}, {
		key: "getSubView",
		value: function getSubView(name) {
			return this.views[name];
		}

		// Remove a subview

	}, {
		key: "removeSubView",
		value: function removeSubView(name) {
			var view = this.getSubView(name);
			if (view instanceof BaseView) {
				this.stopListening(view);
				view.destroy();
			}
			delete this.views[name];
			return this;
		}

		// Wrapper for Request Animation Frame

	}, {
		key: "requestAnimationFrame",
		value: function requestAnimationFrame(callback) {
			return window.requestAnimationFrame(callback);
		}

		// Wrapper for Cancel Animation Frame

	}, {
		key: "cancelAnimationFrame",
		value: function cancelAnimationFrame(id) {
			return window.cancelAnimationFrame(id);
		}

		// Manipulate z-index of the view

	}, {
		key: "setZindex",
		value: function setZindex(zIndex) {
			var _this2 = this;

			if (_underscore2.default.isNumber(zIndex)) {
				window.requestAnimationFrame(function () {
					_this2._zIndex = zIndex;
					_this2.el.style.zIndex = zIndex;
				});
			}
			return this;
		}

		// Obtain z-index of the view

	}, {
		key: "getZindex",
		value: function getZindex() {
			return this._zIndex;
		}

		// Debounce a method

	}, {
		key: "debounce",
		value: function debounce(method, delay) {
			if (!delay) delay = 500;
			this[method] = _underscore2.default.debounce(_underscore2.default.bind(this[method], this), delay, true);
		}

		// Wrap render event inside requestAnimationFrame and delgate subviews
		// to be rendered

	}, {
		key: "render",
		value: function render() {
			var _this3 = this;

			var renderEnd = function renderEnd() {
				_this3.delegateEvents();
				_this3.rendered = true;
				if (_this3.onAfterRender) _this3.onAfterRender();
			};

			if (this.onRender) {
				if (this.rafId) this.cancelAnimationFrame(this.rafId);
				this.rafId = this.requestAnimationFrame(function () {
					_this3.rafId = null;
					// Pass to the onRender callback if the view is already rendered
					_this3.onRender(_this3.rendered, renderEnd);

					if (_this3.onRender.length === 1) renderEnd();
				});
			} else {
				this.rendered = true;
			}
			return this;
		}

		// Empty onRender callback

	}, {
		key: "onRender",
		value: function onRender(rendered) {}
		// This method should be implemented on the subview


		// Called after onRender

	}, {
		key: "onAfterRender",
		value: function onAfterRender() {}
		// This method should be implemented on the subview


		// Scrolla la view fino all'elemento oppure ad una posizione precisa.
		// el può essere un elemento del DOM, un elemento jQuery oppure un intero.

	}, {
		key: "scrollToElement",
		value: function scrollToElement(scroller, el, animated) {
			if (typeof animated === 'undefined') {
				animated = true;
			}

			if (typeof el === 'undefined') {
				el = scroller;
				scroller = this.el;
			}

			if (typeof scroller === 'undefined') {
				scroller = this.el;
			}

			var currentDevice = _contextUtils2.default.device.getOS();
			var nameDevice = currentDevice.name.toLowerCase();

			// Normalizza lo scroller
			if (scroller instanceof $) {
				scroller = scroller.get(0);
			}

			// Porta in alto lo scroll della pagina
			var newScroll = void 0;
			if (el instanceof $) {
				newScroll = scroller.scrollTop + el.position().top;
			} else if (_underscore2.default.isNumber(el)) {
				newScroll = el;
			} else {
				newScroll = scroller.scrollTop + $(el).position().top;
			}

			this.requestAnimationFrame(function () {
				// Blocca lo scroll dell'utente
				style.overflowScrolling(scroller, false);
				// Per i vecchi dispositivi non viene fatta nessuna animazione
				if (!animated || nameDevice == 'android' && currentDevice.version < 5 || nameDevice == 'windows phone') {
					// Riabilita lo scroll dell'utente
					style.overflowScrolling(scroller, true);
					scroller.scrollTop = newScroll;
				} else {
					$(scroller).animate({
						scrollTop: newScroll
					}, 200, function () {
						// Riabilita lo scroll dell'utente
						style.overflowScrolling(scroller, true);
					});
				}
			});
		}

		// Destroy of view
		// reference: http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/

	}, {
		key: "destroy",
		value: function destroy() {
			var _this4 = this;

			this.off();
			if (this.options.removeOnDestroy) {
				this.requestAnimationFrame(function () {
					_this4.remove();
				});
			} else {
				this.undelegateEvents();
			}
			if (this.onDestroy) this.onDestroy();
		}

		// Propagates the command to destroy all the subview

	}, {
		key: "onDestroy",
		value: function onDestroy() {
			_underscore2.default.forEach(this.views, function (aView) {
				if (aView instanceof BaseView) aView.destroy();
			});
		}
	}]);

	return BaseView;
}(_backbone.View);

exports.default = BaseView;

},{"./../examples/bower_components/backbone/backbone.js":6,"./../examples/bower_components/context-utils/lib/context.js":7,"./../examples/bower_components/underscore/underscore.js":17}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backbone = require("./../../bower_components/backbone/backbone.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModelC = function (_Model) {
  _inherits(ModelC, _Model);

  function ModelC() {
    _classCallCheck(this, ModelC);

    return _possibleConstructorReturn(this, (ModelC.__proto__ || Object.getPrototypeOf(ModelC)).apply(this, arguments));
  }

  return ModelC;
}(_backbone.Model);

exports.default = ModelC;
;

},{"./../../bower_components/backbone/backbone.js":6}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backbone = require("./../../bower_components/backbone/backbone.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModelB = function (_Model) {
  _inherits(ModelB, _Model);

  function ModelB() {
    _classCallCheck(this, ModelB);

    return _possibleConstructorReturn(this, (ModelB.__proto__ || Object.getPrototypeOf(ModelB)).apply(this, arguments));
  }

  return ModelB;
}(_backbone.Model);

exports.default = ModelB;
;

},{"./../../bower_components/backbone/backbone.js":6}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backbone = require("./../../bower_components/backbone/backbone.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModelA = function (_Model) {
  _inherits(ModelA, _Model);

  function ModelA() {
    _classCallCheck(this, ModelA);

    return _possibleConstructorReturn(this, (ModelA.__proto__ || Object.getPrototypeOf(ModelA)).apply(this, arguments));
  }

  return ModelA;
}(_backbone.Model);

exports.default = ModelA;
;

},{"./../../bower_components/backbone/backbone.js":6}],5:[function(require,module,exports){
'use strict';

(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['backbone', 'underscore'], function (Backbone, _) {
			return factory(Backbone, _);
		});
	} else if (typeof exports !== 'undefined') {
		var Backbone = require("./../../backbone/backbone.js");
		var _ = require("./../../underscore/underscore.js");
		module.exports = factory(Backbone, _);
	} else {
		factory(root.Backbone, root._);
	}
})(undefined, function (Backbone, _) {

	'use strict';

	var prefix = function () {
		var styles = window.getComputedStyle(document.documentElement, '');
		var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
		var dom = 'WebKit|Moz|MS|O'.match(new RegExp('(' + pre + ')', 'i'))[1];
		return {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: pre[0].toUpperCase() + pre.substr(1)
		};
	}();

	// Refer: http://www.w3schools.com/jsref/event_animationend.asp
	// webkitAnimationEnd: Code for Chrome, Safari and Opera
	// animationend: other browser.
	// Compability: >= IE10, >= 4.0 Chrome, >= 16 Moz, >= 4.0 Safari, >= 15.0 Opera
	var _animationEnd = ['WebKit', 'O'].indexOf(prefix.dom) > -1 ? 'webkitAnimationEnd' : 'animationend';

	var ViewStack = Backbone.View.extend({

		_stack: null,
		_current: null,
		_length: null,
		_baseZIndex: 0,
		_zIndexGap: 100,

		initialize: function initialize(options) {

			options = _.defaults(options || {}, { zIndexGap: 100 });

			if (_.isObject(options.context)) this._context = options.context;

			// The element is composed of:
			//  {
			//      view    : { instance of Backbone.View }
			//      options : { the view options }
			//  }
			this._stack = [];
			this._current = null;
			this.$el.empty();

			if (_.isNumber(options.zIndex) && options.zIndex > 0) this.setBaseZIndex(Math.floor(options.zIndex));else this.setBaseZIndex(0);

			if (_.isNumber(options.zIndexGap) && options.zIndexGap > 0) this._zIndexGap = Math.floor(options.zIndexGap);else this._zIndexGap = 100;
		},

		initStack: function initStack() {
			if (this._length === null) {
				this._length = this._stack.length;
				return this;
			}

			this.clearStack(this._length);
			return this;
		},

		clearStack: function clearStack(length) {
			if (!length) length = 0;
			var cleared = false;
			while (this._stack.length > length) {
				this.popView(null, { silent: true });
				cleared = true;
			}
			if (cleared) {
				this.trigger('clear', this);
			}
			return this;
		},

		size: function size() {
			return this._stack.length;
		},

		exists: function exists(classType) {
			var result = _.find(this._stack, function (element) {
				return element.view instanceof classType;
			});
			return !!result;
		},

		indexOf: function indexOf(view) {
			for (var i = this._stack.length - 1; i >= 0; i--) {
				if (this._stack[i].view === view) {
					return i;
				}
			}
			return -1;
		},

		getView: function getView() {
			if (this._stack.length > 0) {
				var element = this._stack[this._stack.length - 1];
				if (_.isObject(element)) return element.view;
			}
			return null;
		},

		getViewActive: function getViewActive() {
			return this._current;
		},

		getActiveViewWithOptions: function getActiveViewWithOptions() {
			return this._stack[this._stack.length - 1];
		},

		getViewAtIndex: function getViewAtIndex(index) {
			var element = this._stack[index];
			if (_.isObject(element)) return element.view;
			return null;
		},

		getFirstInstanceFromClassType: function getFirstInstanceFromClassType(classType) {
			var r = _.find(this._stack, function (aItem) {
				return _.isObject(aItem) && aItem.view instanceof classType;
			});
			return r ? r.view : null;
		},

		getZIndex: function getZIndex() {
			return this._stack.length * 100 + this._zIndexGap + this._baseZIndex;
		},

		setBaseZIndex: function setBaseZIndex(value) {
			this._baseZIndex = parseInt(value);
			return this;
		},

		getBaseZIndex: function getBaseZIndex() {
			return this._baseZIndex;
		},

		// Add a view to viewstack
		pushView: function pushView(newView, options) {
			if (!(newView instanceof Backbone.View)) {
				return this;
			}

			options = _.defaults(options || {}, {
				animatePreviousView: true,
				render: true
			});

			if (this._current === newView) return this;

			var oldActiveView = this._current;
			var zIndex = this.getZIndex();

			if (newView.setZindex) newView.setZindex(zIndex);else newView.el.style.zIndex = zIndex;

			//
			// NewView:
			// onBeforePush
			//      push into stack
			//      append in the DOM
			// onPush
			//      render
			// onBeforeActivate
			//      wait for the end of the animation. If it is not animated runs immediately.
			// onActivate
			//

			//
			// CurrentView
			// onBeforeDeactivate()
			//      animate
			// onDeactivate() ... In this hook deactivate all events, scroll, ecc
			//


			// Hook: before push
			if (newView.onBeforePush) newView.onBeforePush();

			// Add to stack
			this._stack.push({
				view: newView,
				options: options
			});

			// Append into DOM
			this.$el.append(newView.el);

			// Hook: on push
			if (newView.onPush) newView.onPush();

			// Render the view
			if (options.render) newView.render();

			// Set the current view
			this._current = newView;

			// Hook:Deactive old active view
			if (options.animatePreviousView === true) {
				this._hookDeactive(oldActiveView, options.animated);
			} else {
				if (oldActiveView.onDeactivate) oldActiveView.onDeactivate();
			}

			// Hook: Active new view
			this._hookActivate(newView, options.animated, true);

			// Update view's url
			this.trigger('pushed', newView).refreshUrl(options.url);

			return this;
		},

		// Remove a view from viewstack
		popView: function popView(poppedView, options) {
			if (!(poppedView instanceof Backbone.View) && typeof options === "undefined") {
				options = poppedView;
				poppedView = undefined;
			}

			if (!_.isObject(options)) options = {};

			var self = this;
			var currentView = self._current;

			if (_.isUndefined(poppedView) || _.isNull(poppedView)) poppedView = currentView;

			// Hook: before pop
			if (poppedView.onBeforePop) poppedView.onBeforePop();

			if (!options.animated) {
				poppedView = self._popView(poppedView, options);
				runPopHook();
				return poppedView;
			}

			poppedView = self._popView(poppedView, options);

			if (!poppedView) return null;

			var animationPopDuration = null;
			if (poppedView.getAnimationPopDuration) animationPopDuration = poppedView.getAnimationPopDuration();

			if (animationPopDuration !== null) {
				setTimeout(function () {
					runPopHook();
				}, animationPopDuration);
				poppedView.$el.addClass('pop');
				return this;
			}

			if (_.isString(animationPopDuration) && !_.isEmpty(animationPopDuration)) {

				poppedView.$el.on(_animationEnd, function (e) {
					if (e && e.originalEvent && e.originalEvent.animationName == animationPopDuration) {
						poppedView.$el.off(_animationEnd);
						runPopHook();
					}
				});

				poppedView.$el.addClass('pop');
				return this;
			}

			poppedView.$el.one(_animationEnd, function (e) {
				runPopHook();
			});
			poppedView.$el.addClass('pop');

			return poppedView;

			function runPopHook(destroy) {
				if (poppedView.onPop) poppedView.onPop();
				poppedView.trigger('pop');
				if (poppedView.destroy) poppedView.destroy();
			}
		},

		popViewFromClassType: function popViewFromClassType(classType, options) {
			var self = this;
			var instances = _.filter(this._stack, function (item) {
				return item.view instanceof classType;
			});
			_.forEach(instances, function (anInstance) {
				self.popView(anInstance.view, anInstance.options);
			});
			return this;
		},

		popViewToInstance: function popViewToInstance(instance, options) {
			options = _.defaults(options || {}, {
				popInstance: true
			});
			var indexOfViewToPop = this.indexOf(instance);
			if (indexOfViewToPop === -1) return;
			for (var i = this._stack.length - 1; shouldPopView(i); i--) {
				this.popView(this._stack[i].view, options);
			}
			return this;

			function shouldPopView(indexOfView) {
				if (indexOfView > indexOfViewToPop) return true;else if (options.popInstance && indexOfView === indexOfViewToPop) return true;else return false;
			}
		},

		onSwipeBack: function onSwipeBack(percent, animated) {
			var indexCurrentView = this.indexOf(this._current);
			var prevView = this.getViewAtIndex(indexCurrentView - 1);
			if (prevView instanceof Backbone.View && prevView.move) {
				prevView.move(100 - percent, 2, animated); // TODO: Mettere la costante RESTORE = 2
			}
			return this;
		},

		// Update page URL
		refreshUrl: function refreshUrl(url) {
			var context = this._context;
			if (!_.isObject(context)) return this;

			if (!url) {
				var stack = this._stack;
				var aChunck;
				url = [];
				_.each(stack, function (anElement) {
					aChunck = _.result(anElement.view, 'url');
					if (aChunck) url.push(aChunck);
				});
				url = url.join('/');
			}

			if (context && context.page && typeof url == "string" && !_.isEmpty(url)) context.page.navigate(url, { trigger: false });

			return this;
		},

		//
		// Private
		//


		_popView: function _popView(poppedView, options) {

			options = _.defaults(options || {}, {
				silent: false
			});

			var elementPoppedView = null;
			if (poppedView instanceof Backbone.View) {
				var index = _.findIndex(this._stack, function (el) {
					return el.view == poppedView;
				});
				elementPoppedView = this._stack.splice(index, 1);
				if (_.isArray(elementPoppedView)) elementPoppedView = elementPoppedView[0];
			} else {
				elementPoppedView = this._stack.pop();
			}

			if (!_.isObject(elementPoppedView) || !elementPoppedView.view) {
				return null;
			}

			poppedView = elementPoppedView.view;

			// Assegno la nuova view corrente
			var el = this._stack[this._stack.length - 1];
			if (_.isObject(el) && el.view) {

				this._current = el.view;
				// Hooks activate
				this._hookActivate(this._current, !!elementPoppedView.options.animatePreviousView, false);
			}

			if (!options.silent) {
				this.trigger('popped', poppedView);
			}

			this.refreshUrl();

			return poppedView;
		},

		_hookActivate: function _hookActivate(view, animate, firstTime) {
			if (!(view instanceof Backbone.View)) return this;

			// Hook on before
			if (view.onBeforeActivate) view.onBeforeActivate(firstTime);

			if (!animate) {
				runActivateHook();
				return this;
			}

			var animationPushDuration = null;

			// I get the entry animation runtime. If it is done by javascript
			if (view.getAnimationPushDuration) animationPushDuration = view.getAnimationPushDuration();

			if (_.isNumber(animationPushDuration)) {
				setTimeout(function () {
					runActivateHook();
				}, animationPushDuration);
				return this;
			}

			// I wait for the end of the CSS's animation with a particular name.
			if (!_.isEmpty(animationPushDuration) && _.isString(animationPushDuration)) {
				view.$el.on(_animationEnd, function (e) {
					if (e && e.originalEvent && e.originalEvent.animationName == animationPushDuration) {
						poppedView.$el.off(_animationEnd);
						runActivateHook();
					}
				});
				return this;
			}

			// I wait for the end of the CSS's animation.
			view.$el.one(_animationEnd, function (e) {
				runActivateHook();
			});

			return this;

			function runActivateHook() {
				if (view.onActivate) view.onActivate(firstTime);
			}
		},

		_hookDeactive: function _hookDeactive(view, animate) {
			if (!(view instanceof Backbone.View)) return this;

			// Hook on before deactivate old active view
			if (view && view.onBeforeDeactivate) view.onBeforeDeactivate();

			// if the request is not the animation
			if (!animate) {
				runDeactivateHook();
				return this;
			}

			var animationPopDuration = null;

			// I get the animation runtime. If it is done by javascript
			if (view.getAnimationPopDuration) animationPopDuration = view.getAnimationPopDuration();

			if (_.isNumber(animationPopDuration)) {
				setTimeout(function () {
					runDeactivateHook();
				}, animationPopDuration);
				return this;
			}

			// I wait for the end of the CSS's animation with a particular name.
			if (!_.isEmpty(animationPopDuration) && _.isString(animationPopDuration)) {
				view.$el.on(_animationEnd, function (e) {
					if (e && e.originalEvent && e.originalEvent.animationName == animationPopDuration) {
						poppedView.$el.off(_animationEnd);
						runDeactivateHook();
					}
				});
				return this;
			}

			// I wait for the end of the CSS's animation.
			view.$el.one(_animationEnd, function (e) {
				runDeactivateHook();
			});

			return this;

			function runDeactivateHook() {
				if (view.onDeactivate) view.onDeactivate();
			}
		}

	});

	ViewStack.middleware = function middleware(options) {
		if (!options) options = {};

		return function (context, next) {
			options.context = context;
			var vs = new ViewStack(options);
			vs.clearStack();
			vs.render();
			context.viewstack = vs;
			next();
		};
	};

	return ViewStack;
});

},{"./../../backbone/backbone.js":6,"./../../underscore/underscore.js":17}]},{},[21])
//# sourceMappingURL=bundle.js.map
