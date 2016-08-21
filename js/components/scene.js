class SceneManager{
	constructor(){
		this._layers = {};
		this._layersCount = 0;
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	forEach(func){
		each(this._layers, e => e.visible && e.forEach(func));
	};

	cleanUp(){
		each(this._layers, e => {
			e.cleanUp();
			if(e.title !== "default")
				this.deleteLayer(e.title);
		});
	};

	createLayer(title = "default", taskLayer = false){
		if(this._layers.hasOwnProperty(title))
			Logger.error("ide sa vytvoriť vrstva ktorá už existuje: " + title);
		this._layers[title] = new Layer(title, taskLayer);
		this._layersCount++;


		if(isDefined(Layers))
			Layers.createLayer(this._layers[title]);
		Logger.log("Vytvorila sa vrstva " + title, LOGGER_LAYER_CHANGE);
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

		Logger.log("Vymazala sa vrstva " + title, LOGGER_LAYER_CHANGE);
	};

	getTaskObject(data){
		var findAssignment = false;

		data["error"] = data["error"] === "" ? data["error"] : "";
		data["results"] = isEmptyObject(data["results"]) ? data["results"] : {};
		data["content"] = isEmptyArray(data["content"]) ? data["content"] : [];

		each(this.layers, function(e, i){
			if(e.visible){
				e.forEach(function(e){
					if(e === Layers)
						return;
					if(e.visible){
						if(e.name === "Text"){
							if(e.text === "")
								return;
							data["results"][e.id] = e.text;
						}
						data["content"].push(e);
					}
				});
			}
		});

		//TODO treba nejako posielať zadanie
		findAssignment = true;

		//preloopuje vrstvy
			//preskočí neviditelne
			//preloopuje objekty
				//preskočí neviditelne

				//ak je textInput
					//ak je prazdny tak vymaže

					//ak nie tak podla do resultov pridá podla idečtka texfieldu spravny vysledok
					//vymaže obsah
				
				//pridá to scene
		if(isEmptyObject(data["results"])){
			data["error"] += "nieje zadaný žiadny text pre výsledok"
		}

		return data["error"] === "" && findAssignment;
	}

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