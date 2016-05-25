class SceneManager{
	constructor(){
		this._layers = {};
	};
	forEach(func){
		$.each(this._layers, function(key, val){
			if(val.visible)
				val.forEach(func);
		});
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
}