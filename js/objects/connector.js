class Connector{
	constructor(object, data){
		this._object = object;
		this._data = data;
		this._position = object.position.add(object.size.mul(data));
		this._targets = [];
		this._pointers = [];
	}

	get position(){return this._position;}

	addTarget(target){
		this._targets.push(target);
	}

	forEachTargets(func){
		this._targets.forEach(func);
	}
}