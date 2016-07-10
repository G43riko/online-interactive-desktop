class SceneManager{
	constructor(){
		this._layers = {};
		this._paint = null;
		this._layersCount = 0;
	};

	forEach(func){
		each(this._layers, e	=> e.visible && e.forEach(func));
	};

	cleanUp(){
		each(this._layers, e => e.cleanUp());
		this.paint.cleanUp();
		this._layersCount = 0;
	};

	createLayer(title){
		if(this._layers.hasOwnProperty(title))
			Logger.error("ide sa vytvoriť vrstva ktorá už existuje: " + title);
		this._layers[title] = new Layer(title);
		this._layersCount++;
	};

	getLayer(layer){
		return this._layers[layer];
	}

	deleteLayer(title){
		if(!this._layers.hasOwnProperty(title))
			Logger.error("ide sa vymazať vrstva ktorá už neexistuje: " + title);
		//TODO vymazať vrstvu
		this._layersCount--;
	};

	addToScene(object, layer = "default", resend = true){
		if(!this._layers.hasOwnProperty(layer))
			Logger.error("ide sa načítať neexistujúca vrstva: " + layer);
		object.layer = layer;
		this._layers[layer].add(object);


		EventHistory.objectCreateAction(object);
		if(resend && isSharing())
			Sharer.objectChange(object, ACTION_CREATE);
		else
			object.selected = false;

		draw();
	};

	get layersNumber(){
		return this._layersCount;
	}

	get(layer, id){
		return this._layers[layer].get(id);
	}

	draw(){
		//this.forEach(e => callIfFunc(e.draw));
		this.forEach(e => isFunction(e.draw) && e.draw());
		this.paint.draw();
	};

	get paint(){
		if(isNull(this._paint))
			this._paint = new Paint("black", 5);
		return this._paint;
	};

	remove(obj, layer = obj.layer, resend = true){
		this._layers[layer].remove(obj);
		if(resend && isSharing())
			Sharer.objectChange(obj, ACTION_DELETE);
		EventHistory.objectDeleteAction(obj);

	};

	toString(){
		var result = [];
		this.forEach(e => e.name == "LayerViewer" || result.push(e));
		return JSON.stringify(result);
	}
}