
import _        from "underscore";
import context  from "context-utils";
import BaseView from "../BaseView";
import BarView  from "./BarView";
// import { requestNextAnimationFrame } from "../utils/requestAnimationFrame";

let isView = function isView(view){
	return _.isObject(view) && view.render;
};

export default class NavigationView extends BaseView {

	className() {
		return 'ui-navigation';
	}

	constructor(options) {
		super(options);
		let state = this.getState();
		this.setDefaultsOptions({
			viewstack: state ? state.get('viewstack') : context.viewstack,
			masterDetail: false
		});

		this.visible = true;

		this._stack    = [];
		this.viewstack = this.options.viewstack;

		delete this.options.viewstack;

		this.listenTo(this.viewstack, 'pushed', this.onPushedView);
		this.listenTo(this.viewstack, 'popped', this.onPoppedView);
		this.listenTo(this.viewstack, 'clear', this.onClearViewstack);
	}

	push(newBarView, animated) {
		let activeBar = this.getActiveBar();
		if ( activeBar.view === newBarView )
			return this;

		// If masterDetail option is true then we have to keep
		// the first navigation bar (aka "The master navigation bar")
		// in place.
		if ( this.options.masterDetail ) {
			if ( _.isEmpty(this._stack) )
				this.masterView = newBarView;

			if ( this._stack.length <= 1 && typeof newBarView.hideBackButton === 'function' )
				newBarView.hideBackButton();
		}

		let newStackItem = {
			view: newBarView
		};
		this._stack.unshift(newStackItem);

		if ( this._stack.length > 2 ) {
			let popBar = this._stack.pop();
			let popView = popBar.view;
			if ( isView(popView) && !_.isEqual(popView, this.masterView) ) {
				popView.$el.detach();
			}
		}

		if ( isView(newBarView) ) {
			newBarView.setZindex(10);
			this.$el.append(newBarView.el);
			newBarView.render();
			newStackItem.animationHandler = window.requestNextAnimationFrame(() => {
				newStackItem.animationHandler = null;
				newBarView.move(100, BarView.PUSH, animated === undefined || animated);
			});
		}

		let oldBar = this.getOldBar();
		let oldBarView = oldBar.view;
		if ( isView(oldBarView) ) {
			if (oldBar.animationHandler) {
				window.cancelAnimationFrame(oldBar.animationHandler);
				oldBar.animationHandler = null;
			}
			oldBarView.setZindex(0);
			window.requestNextAnimationFrame(() => {
				oldBarView.move(0, BarView.DETACH, true);
			});
		}

		return this;
	}

	pop(popBarView) {
		let activeBar = this.getActiveBar();
		let oldBar    = this.getOldBar();

		let activeBarView = activeBar.view;
		let oldBarView = oldBar.view;

		// Ensure we doesn't pop the same bar view
		if ( oldBarView === popBarView )
			return this;

		if ( isView(activeBarView) ) {
			activeBarView.setZindex(0);
			activeBarView.move(0, BarView.POP, true);
		}

		if ( isView(oldBarView) ) {
			oldBarView.setZindex(10);
			oldBarView.move(100, BarView.RESTORE, true);
		}

		this._stack.shift();

		// Retrieve the bar view from the last PageView of viewstack
		let pageView = this.viewstack.getViewAtIndex(this.viewstack.size() - 2);
		let newBarView;
		if (isView(pageView) && pageView.getNavigationBar) {
			newBarView = pageView.getNavigationBar();
			this._stack.push({
				view: newBarView
			});
		}

		setTimeout(() => {
			this.requestAnimationFrame(()=>{
				if (isView(activeBarView))
					activeBarView.$el.detach();

				if (isView(newBarView)) {
					newBarView.setZindex(0);
					this.$el.append(newBarView.el);
				}
			});


		}, activeBarView && activeBarView.options ? activeBarView.options.duration : 300 );

		// this.requestAnimationFrame(()=>{	});

	}

	getActiveBar() {
		return this._stack[0] || {};
	}

	getOldBar() {
		return this._stack[1] || {};
	}

	onPushedView(view) {
		if ( !view || !view.getNavigationBar )
			return;
		let barView = view.getNavigationBar();
		this.push( barView, view.options.animated );
	}

	onPoppedView(view) {
		if ( !view || !view.getNavigationBar )
			return;
		let barView = view.getNavigationBar();
		this.pop(barView);
	}

	onClearViewstack(viewstack) {
		this.requestAnimationFrame(()=>{
			let size = viewstack.size();
			_.forEach(this._stack, (aBar) => {
				if ( aBar && aBar.view )
					aBar.view.$el.detach();
			});
			this._stack = [];
			if (size === 0) {
				return;
			}
			if (size > 1) {
				this.onPushedView(viewstack._stack[size - 2].view);
			}
			this.onPushedView(viewstack._stack[size - 1].view);
		});
	}

	onSwipeBack(percent, animated) {
		let activeBar = this.getActiveBar();
		let oldBar    = this.getOldBar();

		let activeBarView = activeBar.view;
		let oldBarView = oldBar.view;

		if ( isView(activeBarView) )
			activeBarView.move(percent, BarView.POP, animated);
		if ( isView(oldBarView) )
			oldBarView.move(100-percent, BarView.RESTORE, animated);
	}

	show() {
		if (!this.visible) {
			this.requestAnimationFrame(() => {
				this.el.style.display = 'block';
				this.el.style.opacity = 1;
				this.visible = true;
			});
		}
	}

	hide() {
		if (this.visible) {
			this.requestAnimationFrame(() => {
				this.el.style.opacity = 0;
				setTimeout(() => {
					this.requestAnimationFrame(() => {
						this.el.style.display = 'none';
						this.visible = false;
					});
				}, 150);
			});
		}
	}

	toggle() {
		if (this.visible === false) {
			this.show();
		} else {
			this.hide();
		}
	}

	isVisible() {
		return this.visible;
	}

};
