class Layer{
	constructor(title){
		this._objects = [];
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
		this.forEach(function(e){
			if(typeof e.cleanUp !== "undefined")
				e.cleanUp();
		});
		this._objects = [];
	};

	draw(){
		if(!this.visible)
			return;
		this._objects.forEach(function(e){
			if(typeof e.draw === "function")
				e.draw();
		});
	};

	add(element){
		this._objects.push(element);
	};

	remove(element){
		for(var i = this._objects.length; i--;) {
			if(this._objects[i] === element)
				this._objects.splice(i, 1);
		}
	};

	forEach(func){
		this._objects.forEach(func);
	};
}