class Layer{
	constructor(title){
		this._objects = {};
		this._visible = true;
		this._title = title;
	};

	get visible(){return this._visible;}
	get objects(){return this._objects}
	get title(){return this._title;}

	set visible(val){this._visible = val;}
	set objects(val){this._objects = val;}
	set title(val){this._title = val;}

	cleanUp(){
		this.forEach(e => callIfFunc(e.cleanUp));
		this._objects = [];
	};

	get(id){
		return this._objects[id];
	}

	draw(){
		if(!this.visible)
			return;
		//this._objects.forEach(e => callIfFunc(e.draw));
		this.forEach(e => e.draw());
	};

	add(element){
		this._objects[element.id] = element;
		//this._objects.push(element);
	};

	remove(element){
		delete this._objects[element.id];
		/*
		for(var i = this._objects.length; i--;) {
			if(this._objects[i] === element)
				this._objects.splice(i, 1);
		}
		*/
	};

	forEach(func){
		$.each(this._objects, (i, e) => func(e));
		//this._objects.forEach(func);
	};
}