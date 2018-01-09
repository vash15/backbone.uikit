import { Model } from 'backbone';

export default class ModelB extends Model {

	toString() {
		return this.id;
	}

};
