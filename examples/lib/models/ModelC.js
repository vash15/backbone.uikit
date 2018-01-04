import { Model } from 'backbone';

export default class ModelC extends Model {

	toString() {
		return this.id;
	}

};
