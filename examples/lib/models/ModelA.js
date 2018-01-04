import { Model } from 'backbone';

export default class ModelA extends Model {

	toString() {
		return this.id;
	}

};
