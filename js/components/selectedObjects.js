class ObjectsManager{
	constructor(){
		this._objects = [];
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	size(){
		return this._objects.length;
	};
	add(o){
		if((isDefined(o.locked) && o.locked) || !o)
			return;

		this._objects.push(o);

		o.selected = true;

		updateSelectedObjectView(o);
	};
	get(i){
		return this._objects.hasOwnProperty(i) ? this._objects[i] : false;
	};

	getLast(){
		return this._objects[this.size() - 1];
	};
	clear(){
		this._objects.forEach(function(e){
			if(isDefined(e.moveType))
				e.moveType = -1;
			e.selected = false;
		});
		this._objects = [];
	};
	clearAndAdd(o){
		this.clear();
		this.add(o);
	};

	forEach(e){
		this._objects.forEach(e);
	};
}