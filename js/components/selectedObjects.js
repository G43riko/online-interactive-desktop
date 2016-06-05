class ObjectsManager{
	constructor(){
		this._objects = [];
	}
	size(){
		return this._objects.length;
	};
	add(o){
		if((typeof o.locked !== "undefined" && o.locked) || !o)
			return;

		this._objects.push(o);

		o.selected = true;

		updateSelectedObjectView(o);
	};
	get(i){
		return this._objects.hasOwnProperty(i) ? this._objects[i] : false;
	};
	clear(){
		this._objects.forEach(function(e){
			if(typeof e.moveType !== "undefined")
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