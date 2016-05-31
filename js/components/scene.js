class SceneManager{
	constructor(){
		this._layers = {};
		this._paint = null;
	};

	forEach(func){
		$.each(this._layers, function(key, val){
			if(val.visible)
				val.forEach(func);
		});
	};

	cleanUp(){
		$.each(this._layers, function(key, val){
			val.cleanUp();
		});
		this.paint.cleanUp();
	};

	createLayer(title){
		if(this._layers.hasOwnProperty(title))
			Logger.error("ide sa vytvoriť vrstva ktorá už existuje: " + title);
		this._layers[title] = new Layer(title);
	};

	addToScene(object, layer = "default"){
		if(!this._layers.hasOwnProperty(layer))
			Logger.error("ide sa načítať neexistujúca vrstva: " + layer);
		this._layers[layer].add(object);
	};

	draw(){
		this.forEach(function(e){
			if(typeof e.draw === "function")
				e.draw();
		});
		this.paint.draw();
	};

	get paint(){
		if(this._paint == null)
			this._paint = new Paint("black", 5);
		return this._paint;
	};

	remove(obj, layer = "default"){
		this._layers[layer].remove(obj);
	};
}