/*
	compatible:	forEach, JSON parsing 14.9.2016
*/
class SceneManager{
	constructor(){
		this._layers = {};
		this._secondCanvas = null;
		this._layersCount = 0;
		this._creator = new objectCreator();
		this._objectManager = new ObjectsManager();

		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	initSecondCanvas(){
		this._secondCanvas = new CanvasHandler();
	}

	get creator(){return this._creator;}
	get objectManager(){return this._objectManager;}

	forEach(func){
		each(this._layers, e => e.visible && e.forEach(func));
	};

	cleanUp(){
		each(this._layers, e => {
			e.cleanUp();
			if(e.title !== DEFAULT_LAYER_TITLE)
				this.deleteLayer(e.title);
		});

		Events.sceneCleanUp();
		Logger.log("Bol vyčistený objekt " + this.constructor.name, LOGGER_OBJECT_CLEANED);
	};

	onScreenResize(){
		each(this._layers, e => e.paint.onScreenResize())
	}

	createLayer(title = DEFAULT_LAYER_TITLE, layerType = ""){
		if(this._layers.hasOwnProperty(title)){
			Logger.error(getMessage(MSG_RECREATE_LAYER, title));
			return null;
		}
		if(this.layersNumber == LIMIT_LAYERS_COUNT){
			Logger.error(getMessage(MSG_MAXIMUM_LAYER, LIMIT_LAYERS_COUNT));
			return null;
		}
		this._layers[title] = new Layer(title, layerType);
		this._layersCount++;


		if(isDefined(Layers)){
			Layers.createLayer(this._layers[title]);
		}

		Events.layerCreate(title, layerType);
		return this._layers[title];
	};

	getLayer(layer){
		return this._layers[layer];
	}

	deleteLayer(title){
		if(!this._layers.hasOwnProperty(title))
			Logger.error("ide sa vymazať vrstva ktorá už neexistuje: " + title);

		if(this._layers[title].guiLayer){
			Logger.notif("nemože sa zmazať gui vrstva");
			return false;
		}

		this._layers[title].cleanUp();
		delete this._layers[title];

		this._layersCount--;

		if(isDefined(Layers))
			Layers.deleteLayer(title);

		Events.layerDelete(title);
	};

	changeLayer(object, newLayer){
		var layer = Project.scene.getLayer(newLayer);
		if(layer){
			var oldLayer = object.layer;
			layer.add(object);
			Entity.changeAttr(object, "layer", newLayer);
			Project.scene.getLayer(oldLayer).remove(object);
		}
	}

	getTaskObject(data){
		//var findAssignment = false;

		data["error"] = data["error"] === "" ? data["error"] : "";
		data["results"] = isEmptyObject(data["results"]) ? data["results"] : {};
		data["content"] = isEmptyArray(data["content"]) ? data["content"] : [];

		each(this.layers, function(e, i){
			if(e.visible){
				e.forEach(function(e){
					if(e === Layers)
						return;
					if(e.visible){
						if(e.name === OBJECT_TEXT){
							if(e.text === "")
								return;
							if(e.taskResult){
								data["results"][e.id] = e.text;
								e.text = "";
								for(var i in data["results"][e.id])
									e.text += " ";
							}
						}
						data["content"].push(e);
					}
				});
			}
		});

		//TODO treba nejako posielať zadanie
		var findAssignment = true;

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

		Events.objectAdded(resend, object);

		if(!resend)
			object.selected = false;

		draw();
	};

	findObjectsForRemove(x, y, radius){
		//TODO bud aktualna ale všetky vrstvy, podla Creator.allLayers
		each(Project.scene.layers, function(layer){
			layer.forEach(object => {
				if(isFunction(object.isIn)){
					if(object.isIn(x, y, radius)){
						layer.setForRemove(object);
					}
				}
			});
			layer.removeElements();
		})
	}

	get layers(){return this._layers;}
	get paint(){return Layers.activeLayer.paint;}
	get layersNumber(){return this._layersCount;}
	get secondCanvas(){return this._secondCanvas;}

	getObject(layer, id){
		return this._layers[layer].getObject(id);
	}

	draw(){
		each(this._layers, e => e.draw());
	};


	remove(obj, layer = obj.layer, resend = true){
		this._layers[layer].remove(obj);
		Events.objectDeleted(resend, obj);

	};


	toString(){
		return JSON.stringify(this.toObject());
	}

	fromObject(content){
		each(content, e => Creator.create(e));
	}

	fromObjectToSingleLayer(layer, content){
		each(content, e => {
			e._layer = layer;
			Creator.create(e);
		});
	}

	toObject(){
		var result = [];
		/* TOTO nemože byť lebo to nieje pole ale môj objekt
		each(this._layers, e => each(e, ee => {//pre každu vrstvu prejde všetkými objektami
			if(ee.name != "LayerViewer")
				result.push(ee)
		}));*/
		each(this._layers, e => e.forEach(function(ee){//pre každu vrstvu prejde všetkými objektami
			if(ee.name != "LayerViewer")
				result.push(ee)
		}));
		return result;
	}
}