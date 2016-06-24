
// Utils
import * as requestAnimationFrame from './lib/utils/requestAnimationFrame';
import * as style from './lib/utils/style';
import * as animate from './lib/utils/animate';
import State from './lib/utils/State';

// View Base
import BaseView from './lib/BaseView';
import ImageView from './lib/ImageView';
import PageView from './lib/PageView';
import RateView from './lib/RateView';

// List View
import ListView from './lib/listviews/ListView';
import ListItemView from './lib/listviews/ListItemView';

// Navigations view
import NavigationView from './lib/navigations/NavigationView';
import BarView from './lib/navigations/BarView';
import TitleBarView from './lib/navigations/TitleBarView';
import IosBarView from './lib/navigations/IosBarView';

// Dialogs view
import ModalView from './lib/dialogs/ModalView';
import ImageViewModalView from './lib/dialogs/ImageViewModalView';


let index = {
	requestAnimationFrame : requestAnimationFrame,
	style                 : style,
	animate               : animate,
	State                 : State,
	BaseView              : BaseView,
	ImageView             : ImageView,
	PageView              : PageView,
	RateView              : RateView,
	ListView              : ListView,
	ListItemView          : ListItemView,
	NavigationView        : NavigationView,
	BarView               : BarView,
	TitleBarView          : TitleBarView,
	IosBarView            : IosBarView,
	ModalView             : ModalView,
	ImageViewModalView    : ImageViewModalView
};


export default index;
export {
	requestAnimationFrame as requestAnimationFrame,
	style                 as style,
	animate               as animate,
	State                 as State,
	BaseView              as BaseView,
	ImageView             as ImageView,
	PageView              as PageView,
	RateView              as RateView,
	ListView              as ListView,
	ListItemView          as ListItemView,
	NavigationView        as NavigationView,
	BarView               as BarView,
	TitleBarView          as TitleBarView,
	IosBarView            as IosBarView,
	ModalView             as ModalView,
	ImageViewModalView    as ImageViewModalView
};
