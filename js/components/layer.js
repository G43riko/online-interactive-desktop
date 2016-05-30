class Layer{
	constructor(title){
		this._objects = [];
		this._visible = true;
		this.title = title;
	};

	get visible(){
		return this._visible;
	};

	set title(val){
		this._title = val;
	}

	get title(){
		return this._title;
	}
	cleanUp(){
		this.forEach(function(e){
			if(typeof e.cleanUp !== "undefined")
				e.cleanUp();
		});
		this._objects = [];
	}
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
			if(this._objects[i] === element) {
				this._objects.splice(i, 1);
			}
		}
	};

	forEach(func){
		this._objects.forEach(func);
	};
}