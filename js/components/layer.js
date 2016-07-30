class Layer{
	constructor(title){
		this._objects = {};
		this._visible = true;
		this._title = title;
		this._paint = null;
	};

	get visible(){return this._visible;}
	get objects(){return this._objects}
	get title(){return this._title;}
	get paint(){
		if(isNull(this._paint))
			this._paint = new Paint("black", 5);
		return this._paint;
	};

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

		this.forEach(e => e.draw());

		this.paint.draw();
	};

	add(element){
		this._objects[element.id] = element;
	};

	remove(element){
		delete this._objects[element.id];
	};

	forEach(func){
		each(this._objects, e => func(e));
	};
}