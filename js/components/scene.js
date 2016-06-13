class SceneManager{
	constructor(){
		this._layers = {};
		this._paint = null;
	};

	forEach(func){
		$.each(this._layers, (key, val)	=> val.visible && val.forEach(func));
	};

	cleanUp(){
		$.each(this._layers, (key, val) => val.cleanUp());
		this.paint.cleanUp();
	};

	createLayer(title){
		if(this._layers.hasOwnProperty(title))
			Logger.error("ide sa vytvoriť vrstva ktorá už existuje: " + title);
		this._layers[title] = new Layer(title);
	};

	addToScene(object, layer = "default", resend = true){
		if(!this._layers.hasOwnProperty(layer))
			Logger.error("ide sa načítať neexistujúca vrstva: " + layer);
		object.layer = layer;
		this._layers[layer].add(object);

		if(resend && typeof Sharer !== "undefined")
			Sharer.objectChange(object, ACTION_CREATE);
		else
			object.selected = false;
	};

	get(layer, id){
		return this._layers[layer].get(id);
	}

	draw(){
		//this.forEach(e => callIfFunc(e.draw));
		this.forEach(e => isFunction(e.draw) && e.draw());
		this.paint.draw();
	};

	get paint(){
		if(this._paint == null)
			this._paint = new Paint("black", 5);
		return this._paint;
	};

	remove(obj, layer = obj.layer, resend = true){
		this._layers[layer].remove(obj);
		if(resend && typeof Sharer !== "undefined")
			Sharer.objectChange(obj, ACTION_DELETE);

	};

	toString(){
		var result = [];
		this.forEach(e => e.name == "LayerViewer" || result.push(e));
		return JSON.stringify(result);
	}
}