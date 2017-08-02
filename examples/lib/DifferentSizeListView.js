import _ from 'underscore';
import $ from 'jquery';
import ListView from '../../lib/listviews/ListView';
import ListItemView from '../../lib/listviews/ListItemView';
import ImageView from '../../lib/ImageView';
import { getVendorStyle } from '../../lib/utils/style';
import ModelA from './models/ModelA';
import ModelB from './models/ModelB';
import ModelC from './models/ModelC';

class CellA extends ListItemView {
	static getSize(options) {
		return 100;
	}
	className() { return 'cellA' }
	onRender(rendered) {
		if (!rendered) {
			this.cache.$text = $('<span>');
			this.$el.append(this.cache.$text);
		}
		if (this.model) {
			this.cache.$text.text(`CellA ${ this.model.id }`);
		} else {
			this.cache.$text.text('');
		}
	}
}

class CellB extends ListItemView {
	static getSize(options) {
		return 200;
	}
	className() { return 'cellB' }
	onRender(rendered) {
		if (!rendered) {
			this.cache.$text = $('<span>');
			this.$el.append(this.cache.$text);
		}
		if (this.model) {
			this.cache.$text.text(`CellB ${ this.model.id }`);
		} else {
			this.cache.$text.text('');
		}
	}
}

class CellC extends ListItemView {
	static getSize(options) {
		return 300;
	}
	className() { return 'cellC' }
	constructor(options) {
		super(options);
		const imageView = new ImageView({
			size: 'contain',
			autoload: false,
			viewport: { width: 100, height: 100 }
		});
		imageView.el.style.width = 100;
		imageView.el.style.height = 100;
		this.addSubView('imageView', imageView);
	}

	onRender(rendered) {
		const imageView = this.getSubView('imageView');
		if (!rendered) {
			this.cache.$text = $('<span>');
			this.$el.append(
				imageView.el,
				this.cache.$text
			);
			imageView.render();
		}
		if (this.model) {
			this.cache.$text.text(`CellC ${ this.model.id }`);
			imageView.setSource(this.model.get('image'));
			imageView.load();
		}
		else {
			imageView.setSource(null);
			this.cache.$text.text('');
		}
	}
}

class ResizableListItemView extends ListItemView {

	constructor(options) {
		super(options);

		if (!this.options.contentTypes)
			throw new Error('options.contentTypes is missing from ResizableListItemView');

		const childrenOptions = {
			parentList: this.options.parentList
		};

		let aNewView;
		_.forEach(this.options.contentTypes, (aContentType, anIndex) => {
			aNewView = new aContentType.viewClass(childrenOptions);
			this.addSubView(anIndex, aNewView);
		});
	}

	onRender(rendered) {
		if (!rendered) {
			_.forEach(this.views, (aView) => {
				this.$el.append(aView.el);
				aView.render();
			});
		}

		const propertyToResize = this.options.parentList.isVertical() ? 'height' : 'width';
		let aSubView;
		_.forEach(this.options.contentTypes, (aContentType, anIndex) => {
			aSubView = this.getSubView(anIndex);
			if (this.model instanceof aContentType.modelClass) {
				aSubView.el.style.opacity = 1;
				this.el.style[propertyToResize] = aContentType.viewClass.getSize(this.model);
			} else {
				aSubView.el.style.opacity = 0;
			}
		});

		if (!this.model) {
			this.el.style.height = 0;
		}
	}

	setModel(newModel) {
		let aSubView;
		_.forEach(this.options.contentTypes, (aContentType, anIndex) => {
			if (newModel instanceof aContentType.modelClass) {
				aSubView = this.getSubView(anIndex);
				aSubView.setModel(newModel).render();
			}
		});
		super.setModel(newModel);
	}

}

export default class DifferentSizeListView extends ListView {

	getListItemViewAtIndexWithOptions(index, options) {
		options = _.clone(options);
		options.contentTypes = [
			{ modelClass: ModelA, viewClass: CellA },
			{ modelClass: ModelB, viewClass: CellB },
			{ modelClass: ModelC, viewClass: CellC }
		];
		return new ResizableListItemView(options);
	}

	getListItemSizeAtIntexWithOptions(index, options) {
		const model = options.model;
		if (model instanceof ModelA)
			return CellA.getSize(model);
		else if (model instanceof ModelB)
			return CellB.getSize(model);
		else if (model instanceof ModelC)
			return CellC.getSize(model);
	}

	onSelectItem(item, done) {
		if (item.view) {
			console.log(item.view.model.toJSON());
		}
		return done();
	}

}
