
import _        from "underscore";
import context  from "context-utils";
import BaseView from "../BaseView";
import BarView  from "./BarView";


let isView = function isView(view){
	return _.isObject(view) && view.render;
};

export default class NavigationView extends BaseView {

	addClass(){
		return 'navigation-view';
	}

	constructor(options) {
		super(options);
		let state = this.getState();
		this.options = _.defaults(options||{}, {
			viewstack: state.viewstack || context.viewstack,
		});

		this._stack    = [];
		this.viewstack = this.options.viewstack;

		delete this.options.viewstack;

		this.listenTo( this.viewstack, "pushed", this.onPushedView );
		this.listenTo( this.viewstack, "popped", this.onPoppedView );
	}

	onRender(rendered) {
		if (rendered ) return this;
		this.$el.empty();
		return this;
	}

	push( newBarView, animated ){
		let activeBarView = this.getActiveBarView();
		if ( activeBarView === newBarView )
			return this;

		this._stack.unshift(newBarView);

		if ( this._stack.length > 2 ){
			let popView = this._stack.pop();
			if ( isView(popView) ){
				popView.$el.detach();
			}
		}

		if ( isView(newBarView) ){
			newBarView.setZindex(10);
			this.$el.append( newBarView.el );
			newBarView.render();
			newBarView.move(100, BarView.PUSH, animated === undefined || animated );
		}

		let oldBarView = this.getOldBarView();
		if ( isView(oldBarView) ){
			oldBarView.setZindex(0);
			oldBarView.move(0, BarView.DETACH, true);
		}

		return this;
	}

	pop(popBarView){
		let activeBarView = this.getActiveBarView();
		let oldBarView    = this.getOldBarView();

		// Ensure we doesn't pop the same bar view
		if ( oldBarView === popBarView )
			return this;

		if ( isView(activeBarView) ){
			activeBarView.setZindex(0);
			activeBarView.move(0, BarView.POP, true);
		}

		if ( isView(oldBarView) ){
			oldBarView.setZindex(10);
			oldBarView.move(100, BarView.RESTORE, true);
		}

		let viewport = this.viewport;
		setTimeout(() => {
			if ( isView(activeBarView) )
				activeBarView.$el.detach();
			this._stack.shift();

			// Retrieve the bar view from the last PageView of viewstack
			let pageView = viewstack.getViewAtIndex( viewstack.size() - 2  );
			if ( isView(pageView) && pageView.getNavigationBar ){
				let newBarView = pageView.getNavigationBar();
				if ( isView(newBarView) ){
					newBarView.setZindex(0);
					self.$el.append( newBarView.el );
					self._stack.push( newBarView );
				}
			}

		}, activeBarView.options.duration);

	}

	getActiveBarView(){
		return this._stack[0];
	}

	getOldBarView(){
		return this._stack[1];
	}

	onPushedView(view){
		if ( !view || !view.getNavigationBar )
			return;
		let barView = view.getNavigationBar();
		this.push( barView, view.options.animated );
	}

	onPoppedView(view){
		if ( !view || !view.getNavigationBar )
			return;
		let barView = view.getNavigationBar();
		this.pop(barView);
	}

	onSwipeBack(percent, animated){
		let activeBar = this.getActiveBarView();
		let oldBar    = this.getOldBarView();

		if ( isView(activeBar) )
			activeBar.move(percent, BarView.POP, animated);
		if ( isView(oldBar) )
			oldBar.move( 100-percent, BarView.RESTORE, animated);
	}

};
