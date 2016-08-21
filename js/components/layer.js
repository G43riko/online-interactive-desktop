class Layer{
	constructor(title, layerType = ""){
		this._objects = {};
		this._visible = true;
		this._title = title;
		this._paint = null;
		this._locked = false;

		this._layerType = layerType;
	};

	get layerType(){return this._layerType;}
	get locked(){return this._locked || this._layerType !== ""}
	get taskLayer(){return this._layerType === "layer";}
	get guiLayer(){return this._layerType === "gui";}
	get visible(){return this._visible;}
	get objects(){return this._objects;}
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
		Logger.log("Bol vyčistený objekt " + this.constructor.name + "[" + this._title + "]", LOGGER_OBJECT_CLEANED);
	};

	get(id){
		return this._objects[id];
	}

	draw(){
		if(!this.visible)
			return;

		this.forEach(e => e.visible && e.draw());

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