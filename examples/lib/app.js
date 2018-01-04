import context from 'context-utils';
import Viewstack from 'backbone.viewstack';
import NavigationView from '../../lib/navigations/NavigationView';
import MenuPage from './MenuPage';
import requestNextAnimationFrame from '../../lib/utils/requestAnimationFrame';

context.uikit = {
	SwipeListItemView: {
		vibrate: () => {
			if (window.TapticEngine) {
				window.TapticEngine.selection();
			}
		}
	}
};

const viewstack = context.viewstack  = new Viewstack({ el: '#application' });
viewstack.render();

const navigationView = context.navigation = new NavigationView({
	viewstack: viewstack
});

viewstack.pushView(navigationView);

// Menu
const menuPage = new MenuPage({
	animated: false,
	swipeBack: false
});
viewstack.pushView(menuPage);
