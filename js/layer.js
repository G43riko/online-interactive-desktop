class Layer{
	constructor(title){
		this._objects = [];
		this._visible = true;
		this.title = title;
	}

	get visible(){
		return this._visible;
	}

	draw(){
		if(!this.visible)
			return;
		this._objects.forEach(function(e){
			if(typeof e.draw === "function")
				e.draw();
		});
	}

	add(element){
		this._objects.push(element);
	}

	forEach(func){
		this._objects.forEach(func);
	}
}