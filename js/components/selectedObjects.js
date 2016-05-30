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
		$("#cont_select_obj div").show();
	};
	get(i){
		return this._objects.hasOwnProperty(i) ? this._objects[i] : false;
	};
	clear(){
		$("#cont_select_obj div").hide();
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
	getLast(){
		return this.size() > 0 ? this.objects[this.size() - 1] : false;
	}
}