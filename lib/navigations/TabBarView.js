import _ from "underscore";
import context from "context-utils";
import {trim, dasherize} from "underscore.string";
import $ from "jquery";
import Viewstack from "backbone.viewstack";
import device from "device-utils";
import BaseView from "../BaseView";
import NavigationView from "./NavigationView";
import State from "../utils/State";

export default class TabBarView extends BaseView {

	className() {
		return 'ui-tab-bar';
	}

	constructor(options) {
		super(options);

		this.options = _.defaults(this.options, {
			tabs: [],
			navigationClass: NavigationView
		});

		this._activeTab = '';

		// States
		this.states = context.states = {};
		var aState, aViewstack, aNavigation;

		let events = {};
		const NavigationClass = this.options.navigationClass;
		this.options.tabs.forEach(tab => {
			aState     = this.states[tab.route] = new State();
			aViewstack = new Viewstack({
				className: 'viewstack'
			});

			aNavigation = new NavigationClass({
				viewstack: aViewstack,
				state: aState,
				masterDetail: tab.masterDetail
			});

			aState.set('viewstack', aViewstack);
			aState.set('navigation', aNavigation);
			aState.set('tabAction', tab.action);
		});

		this.addEvents({
			'click .js-button': 'onButtonClick'
		});
	}

	getActiveState() {
		return this.states[this._activeTab];
	}

	getAnimationPushDuration(){
		return 0;
	}

	onRender(rendered) {
		if (!rendered) {
			let $tabBarContent = this.cache.$tabBarContent = $('<div class="ui-tab-bar-content" />');
			let $tabBarToolbar = this.cache.$tabBarToolbar = $('<div class="ui-tab-bar-toolbar" />');

			let aState, $aPage, $aButton;
			this.options.tabs.forEach(tab => {
				aState  = this.states[tab.route];

				$aPage   = $(`<div class="ui-tab-bar-content-page ${dasherize(trim(tab.route))} js-${dasherize(trim(tab.route))}" />`);
				$aButton = $('<span class="ui-tab-bar-toolbar-button js-button" />').data('tab', tab).attr('id', tab.route );
				if ( tab.icon )
					$aButton.append( $(`<i class="icon ${tab.icon}" />`) );

				if ( tab.label )
					$aButton.append( $('<span class="ui-tab-bar-toolbar-button-label" />').text( tab.label ) );

				this.cache['$' + tab.route + 'Button'] = $aButton;
				this.cache['$' + tab.route + 'Page']   = $aPage;

				$tabBarContent.append( $aPage );
				$tabBarToolbar.append( $aButton );

				$aPage.append(aState.get('navigation').el);
				$aPage.append(aState.get('viewstack').el);
				aState.get('navigation').render();
			});

			if (this._activeTab) {
				this.cache['$' + this._activeTab + 'Button'].addClass('active');
				this.cache['$' + this._activeTab + 'Page'].get(0).style.display = 'block';
			}

			this.$el.append( $tabBarContent, $tabBarToolbar );
		}
	}

	onButtonClick(ev){
		ev.preventDefault();
		const $el = $(ev.currentTarget);

		const tab = $el.data('tab');
		if ( tab && tab.route )
			this.navigate( tab.route );

		return false;
	}

	onBeforeActivate() {
		let activeState;
		let viewstack;
		let activeView;
		if (activeState = this.getActiveState()) {
			if (viewstack = activeState.get('viewstack')) {
				if (activeView = viewstack.getViewActive()) {
					if (activeView.onBeforeActivate) {
						activeView.onBeforeActivate();
					}
				}
			}
		}
	}

	onActivate(firstTime) {
		this.$el.removeClass('deactivate');
		let activeState;
		let viewstack;
		let activeView;
		if (activeState = this.getActiveState()) {
			if (viewstack = activeState.get('viewstack')) {
				if (activeView = viewstack.getViewActive()) {
					if (activeView.onActivate) {
						activeView.onActivate(firstTime);
					}
				}
			}
		}
	}

	navigate(newTab, options, done) {
		if ( _.isFunction(options) ){
			done = options;
			options = {};
		}
		if ( !_.isFunction(done) )
			done = ()=>{};

		_.defaults(options || (options = {}), {
			clear: false,
			changeStatus: false
		});

		if (options.changeStatus === true)
			options.changeStatus = context.params[0];

		let oldTab = this._activeTab;

		let state      = this.states[newTab];
		let viewstack  = state.get('viewstack');
		let navigation = state.get('navigation');

		if (newTab == oldTab) {
			this.clearChildViews(newTab);
			changeStatus();
			return;
		}

		this._activeTab = newTab;
		this.trigger('navigate', state, viewstack.size() === 0 );

		if (viewstack.size() === 0) {
			let fn = state.get("tabAction");
			if ( _.isFunction(fn) ){
				fn(context, options, done);
			}

		}

		context.page.navigate(newTab, { trigger: false });

		// Communicate to the active view that is about to be displayed
		let activeView = viewstack.getViewActive();
		if (activeView && activeView.onNavigate)
			activeView.onNavigate();

		changeStatus();

		if ( options.clear ){
			this.clearChildViews(newTab);
		}

		if (this.rendered) {

			this.requestAnimationFrame(() => {
				this.cache['$' + newTab + 'Button'].addClass('active');
				this.cache['$' + newTab + 'Page'].show();

				if (oldTab) {
					this.cache['$' + oldTab + 'Button'].removeClass('active');
					this.cache['$' + oldTab + 'Page'].hide();
				}

			});

		}

		function changeStatus() {
			if (options.changeStatus) {
				// By convention, the views must change their internal status through the changeStatus method
				let activeView = viewstack.getViewActive();
				if (activeView && activeView.changeStatus) {
					setTimeout(() => {
						activeView.changeStatus(options.changeStatus);
					}, 500);
				}
			}
		}
	}

	clearChildViews(tab) {
		let state = this.states[tab];
		let viewstack = state.get('viewstack');
		viewstack.clearStack(1);
		let activeView = viewstack.getViewActive();
		if (activeView) {
			activeView.getState().trigger('clearStack');
		}
	}

	clear(tab) {
		let state = this.states[tab];
		if (!state)
			throw new Error('Cannot find state named "' + tab + '"');
		let viewstack = state.get('viewstack');
		viewstack.clearStack();
	}

};
