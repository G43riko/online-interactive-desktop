/*
	compatible:	forEach, JSON parsing 14.9.2016
*/
console.log("creating");
class SceneManager{
	constructor(){
		this._clickViewers 	= [];
		this._layers 		= {};
		this._secondCanvas 	= null;
		this._layersCount 	= 0;
		this._creator 		= new objectCreator();
		this._objectManager = new ObjectsManager();

		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}

	isEmpty(){
		for(let i in this._layers){
			if(this._layers.hasOwnProperty(i) && !this._layers[i].isEmpty()){
				return false;
			}
		}
		return true;
	}

	mouseUp(x, y){
        let counter = 0;
        let viewer = new Arc(new GVector2f(x, y), new GVector2f());
		Entity.changeAttr(viewer, {
			"fill" : false,
			"borderColor" : CLICK_COLOR
		});
		this._clickViewers[this._clickViewers.length] = viewer;
        let interval = setInterval(() => {
			viewer.position.sub(CLICK_SPEED);
			viewer.size.add(CLICK_SPEED * 2);
			if(++counter == CLICK_LIMIT){
				this._clickViewers.splice(this._clickViewers.indexOf(viewer), 1);
				clearInterval(interval);
				pdraw();
			}
			pdraw();
		}, 1000 / FPS);
	}
	mouseDown(x, y){
        let counter = 0;
        let viewer = new Arc(new GVector2f(x, y).sub(CLICK_SPEED*CLICK_LIMIT),
							 new GVector2f(CLICK_SPEED * 2 * CLICK_LIMIT));
		Entity.changeAttr(viewer, {
			"fill" : false,
			"borderColor" : CLICK_COLOR
		});
		this._clickViewers[this._clickViewers.length] = viewer;
        let interval = setInterval(() => {
			viewer.position.add(CLICK_SPEED);
			viewer.size.sub(CLICK_SPEED * 2);
			if(++counter == CLICK_LIMIT){
				this._clickViewers.splice(this._clickViewers.indexOf(viewer), 1);
				clearInterval(interval);
				pdraw();
			}
			pdraw();
		}, 1000 / FPS);
	}

	initSecondCanvas(){
		this._secondCanvas = new CanvasHandler();
	}

	get creator(){return this._creator;}
	get objectManager(){return this._objectManager;}

	forEach(func){
		each(this._layers, e => e.visible && e.forEach(func));
	}

	cleanUp(){
		each(this._layers, e => {
			e.cleanUp();
			if(e.title !== PROJECT_LAYER_TITLE){
				this.deleteLayer(e.title);
			}
		});

		Events.sceneCleanUp();
		Logger.log(getMessage(MSG_OBJECT_CLEANED, this.constructor.name), LOGGER_OBJECT_CLEANED);
		
	}

	onScreenResize(){
		each(this._layers, e => e.paint.onScreenResize());
	}

	createLayer(title = PROJECT_LAYER_TITLE, layerType = ""){
		if(this._layers.hasOwnProperty(title)){
			Logger.error(getMessage(MSG_RECREATE_LAYER, title));
			return null;
		}
		if(this.layersNumber == LIMIT_MAXIMUM_LAYERS){
			Logger.error(getMessage(MSG_MAXIMUM_LAYER, LIMIT_MAXIMUM_LAYERS));
			return null;
		}
		this._layers[title] = new Layer(title, layerType);
		this._layersCount++;


		if(isDefined(Layers)){
			Layers.createLayer(this._layers[title]);
		}

		Events.layerCreate(title, layerType);
		return this._layers[title];
	}

	getLayer(layer){
		return this._layers[layer];
	}

	renameLayer(oldTitle, newTitle){
		if(this._layers[oldTitle] && !this._layers[newTitle]){
			this._layers[newTitle] = this._layers[oldTitle];
			delete this._layers[oldTitle];
			this._layers[newTitle].rename(newTitle);
		}
		
	}

	deleteLayer(title){
		if(!this._layers.hasOwnProperty(title)){
			Logger.error(getMessage(MSG_TRY_DELETE_ABSENT_LAYER, title));
		}

		if(this._layers[title].guiLayer){
			Logger.write(getMessage(MSG_TRY_DELETE_GUI_LAYER));
			return false;
		}

		this._layers[title].cleanUp();
		delete this._layers[title];

		this._layersCount--;

		if(isDefined(Layers)){
			Layers.deleteLayer(title);
		}

		Events.layerDelete(title);
	}

	changeLayer(object, newLayer){
        let layer = Project.scene.getLayer(newLayer);
		if(layer){
            let oldLayer = object.layer;
			layer.add(object);
			Entity.changeAttr(object, "layer", newLayer);
			Project.scene.getLayer(oldLayer).remove(object);
		}
	}

	getTaskObject(data){
		//var findAssignment = false;

		data.error = data.error === "" ? data.error : "";
		data.results = isEmptyObject(data.results) ? data.results : {};
		data.content = isEmptyArray(data.content) ? data.content : [];

		each(this.layers, function(e, i){
			if(e.visible){
				e.forEach(function(e){
					if(e === Layers){
						return;
					}
					if(e.visible){
						if(e.name === OBJECT_TEXT){
							if(e.text === ""){
								return;
							}
							if(e.taskResult){
								data.results[e.id] = e.text;
								e.text = "";
								each(data.results[e.id], () => e.text += " ");
								/*
								for(let i in data.results[e.id]){
									e.text += " ";
								}
								*/
							}
						}
						data.content[data.content.length] = e;
					}
				});
			}
		});

		//TODO treba nejako posielať zadanie
		let findAssignment = true;

		//preloopuje vrstvy
			//preskočí neviditelne
			//preloopuje objekty
				//preskočí neviditelne

				//ak je textInput
					//ak je prazdny tak vymaže

					//ak nie tak podla do resultov pridá podla idečtka texfieldu spravny vysledok
					//vymaže obsah
				
				//pridá to scene
		if(isEmptyObject(data.results)){
			data.error += getMessage(MSG_MISSING_RESULT_TEXT);
		}

		return data.error === "" && findAssignment;
	}

	addToScene(object, layer = Layers.activeLayerName, resend = true){
		if(!this._layers.hasOwnProperty(layer)){
			Logger.error(getMessage(MSG_ADD_OBJECT_TO_ABSENT_LAYER, layer));
		}

		object.layer = layer;
		this._layers[layer].add(object);

		Events.objectAdded(resend, object);

		if(!resend){
			object.selected = false;
		}

		draw();
	}

	findObjectsForRemove(x, y, radius){
		//TODO bud aktualna ale všetky vrstvy, podla Creator.allLayers
		each(this.layers, function(layer){
			layer.forEach(object => {
				if(isFunction(object.isIn)){
					if(object.isIn(x, y, radius)){
						layer.setForRemove(object);
					}
				}
			});
			layer.removeElements();
		});
	}

	get layers(){return this._layers;}
	get paint(){return Layers.activeLayer.paint;}
	get layersNumber(){return this._layersCount;}
	get secondCanvas(){return this._secondCanvas;}

	getObject(layer, id){
		return this._layers[layer].getObject(id);
	}

	pdraw(ctx){
		each(this._clickViewers, e => e.draw(ctx));
		/*
		for(var i=0 ; i<this._clickViewers.length ; i++){
			this._clickViewers[i].draw(ctx);
		}
		*/
	}

	draw(){
		each(this._layers, e => e.draw());
		/*
		for(var i=0 ; i<this._clickViewers.length ; i++){
			this._clickViewers[i].draw();
		}
		*/
	}


	remove(obj, layer = obj.layer, resend = true){
		this._layers[layer].remove(obj);
		Events.objectDeleted(resend, obj);

	}


	toString(){
		return JSON.stringify(this.toObject());
	}

	fromObject(content){
		each(content, Creator.create);
	}

	fromObjectToSingleLayer(layer, content){
		each(content, e => {
			e._layer = layer;
			Creator.create(e);
		});
	}

	toObject(){
		let result = [];
		each(this._layers, e => e.forEach(function(ee){//pre každu vrstvu prejde všetkými objektami
			if(ee.name != "LayerViewer"){
				result[result.length] = ee;
			}
		}));
		return result;
	}
}