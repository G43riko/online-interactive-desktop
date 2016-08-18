class SceneManager{
	constructor(){
		this._layers = {};
		this._layersCount = 0;
	};

	forEach(func){
		each(this._layers, e => e.visible && e.forEach(func));
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


		if(isDefined(Layers))
			Layers.createLayer(this._layers[title]);

		return this._layers[title];
	};

	getLayer(layer){
		return this._layers[layer];
	}

	deleteLayer(title){
		if(!this._layers.hasOwnProperty(title))
			Logger.error("ide sa vymazať vrstva ktorá už neexistuje: " + title);

		this._layers[title].cleanUp();
		delete this._layers[title];

		this._layersCount--;

		if(isDefined(Layers))
			Layers.deleteLayer(title);
	};

	addToScene(object, layer = Layers.activeLayerName, resend = true){
		if(!this._layers.hasOwnProperty(layer))
			Logger.error("ide sa načítať neexistujúca vrstva: " + layer);
		object.layer = layer;
		this._layers[layer].add(object);


		EventHistory.objectCreateAction(object);
		if(resend && isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_CREATE);
		else
			object.selected = false;

		draw();
	};

	get layers(){return this._layers}

	get layersNumber(){
		return this._layersCount;
	}

	get(layer, id){
		return this._layers[layer].get(id);
	}

	draw(){
		//this.forEach(e => callIfFunc(e.draw));
		each(this._layers, e => e.draw());
	};

	get paint(){
		return Layers.activeLayer.paint;
	};

	remove(obj, layer = obj.layer, resend = true){
		this._layers[layer].remove(obj);
		if(resend && isSharing())
			Sharer.objectChange(obj, ACTION_OBJECT_DELETE);
		EventHistory.objectDeleteAction(obj);

	};

	toString(){
		return JSON.stringify(this.toObject());
	}

	fromObject(content){
		each(content, e => Creator.create(e));
		//content.forEach(e => Creator.create(e));
	}

	toObject(){
		var result = [];
		this.forEach(e => e.name == "LayerViewer" || result.push(e));
		return result;
	}
}