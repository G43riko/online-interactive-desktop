/*
	compatible:	forEach, JSON parsing 14.9.2016
*/
class SceneManager{
	constructor(){
		this._items 		= {};
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
		//počítadlo pre kliknutia
        let counter = 0;

        //vytvoríme zobrazenie kliknutia
        let viewer = new Arc(new GVector2f(x, y), new GVector2f());

        //nastavime mu vlastnosti
		Entity.changeAttr(viewer, {
			"fill" : false,
			"borderColor" : CLICK_COLOR
		});

		//pridame ho do zoznamu už existujucich zobrazení
		this._clickViewers[this._clickViewers.length] = viewer;

		//každú snímku
        let interval = setInterval(() => {
        	//posunieme
			viewer.position.sub(CLICK_SPEED);

			//zmenime velkosť
			viewer.size.add(CLICK_SPEED * 2);

			//ak sa už vykreslil dostatočne vela krat
			if(++counter == CLICK_LIMIT){
				//zmažeme ho zo zoznamu
				this._clickViewers.splice(this._clickViewers.indexOf(viewer), 1);

				//zatavime inerval
				clearInterval(interval);
			}
			//vykreslime
			pdraw();
		}, 1000 / FPS);
	}
	mouseDown(x, y){
        //počítadlo pre kliknutia
        let counter = 0;

        //vytvoríme zobrazenie kliknutia
        let viewer = new Arc(new GVector2f(x, y).sub(CLICK_SPEED * CLICK_LIMIT),
							 new GVector2f(CLICK_SPEED * 2 * CLICK_LIMIT));

        //nastavime mu vlastnosti
		Entity.changeAttr(viewer, {
			"fill" : false,
			"borderColor" : CLICK_COLOR
		});

        //pridame ho do zoznamu už existujucich zobrazení
		this._clickViewers[this._clickViewers.length] = viewer;

		//každú snímku
        let interval = setInterval(() => {
			//posunieme
			viewer.position.add(CLICK_SPEED);

            //zmenime velkosť
			viewer.size.sub(CLICK_SPEED * 2);

            //ak sa už vykreslil dostatočne vela krat
			if(++counter == CLICK_LIMIT){
				//zmažeme ho zo zoznamu
				this._clickViewers.splice(this._clickViewers.indexOf(viewer), 1);

                //zatavime inerval
				clearInterval(interval);
			}
            //vykreslime
			pdraw();
		}, 1000 / FPS);
	}

	initSecondCanvas(){
		this._secondCanvas = new CanvasHandler();
	}

	forEach(func){
		each(this._layers, e => e.visible && e.forEach(func));
	}

	cleanUp(){
		//prejdeme všetky vrstvy
		each(this._layers, e => {
			//a každú jednu vyčistíme
			e.cleanUp();
			//ak nieje defaultná vrstva tak ju zmažeme
			if(e.title !== PROJECT_LAYER_TITLE){
				this.deleteLayer(e.title);
			}
		});

		//zaznamename vyčistenie scény
		Events.sceneCleanUp();

		//zalogujeme
		Logger.log(getMessage(MSG_OBJECT_CLEANED, this.constructor.name), LOGGER_OBJECT_CLEANED);
	}

	onScreenResize(){
		each(this._layers, e => e.onResize());
	}

	createLayer(title = PROJECT_LAYER_TITLE, layerType = ""){
		//ak už vrstva z názvom existuje upozorníme používatela
		if(this._layers.hasOwnProperty(title)){
			Logger.error(getMessage(MSG_RECREATE_LAYER, title));
			return null;
		}

		//ak už je vytvorený maximum vrstiev upozorníme používatela
		if(this.layersNumber == LIMIT_MAXIMUM_LAYERS){
			Logger.error(getMessage(MSG_MAXIMUM_LAYER, LIMIT_MAXIMUM_LAYERS));
			return null;
		}

		//vytvorime vrstvy
		this._layers[title] = new Layer(title, layerType);

		//zvačšíme počet vrstiev
		this._layersCount++;

		//ak existuje viewer vytvorime ho aj v ňom
		if(isDefined(Layers)){
			Layers.createLayer(this._layers[title]);
		}

		//uložime vytvorenie vrstvy
		Events.layerCreate(title, layerType);

		//vratime novú vrstvu
		return this._layers[title];
	}

	getLayer(layer){
		return this._layers[layer];
	}

	renameLayer(oldTitle, newTitle){
		//ak existuje vrstva zo starým názov a neexistuje vrstva z novým názvom
		if(this._layers[oldTitle] && !this._layers[newTitle]){
			//presunieme vrstvu
			this._layers[newTitle] = this._layers[oldTitle];

			//zmažeme starý index v poly
			delete this._layers[oldTitle];

			//premenujeme vrstvu
			this._layers[newTitle].rename(newTitle);
		}
	}

	deleteLayer(title){
		//ak neexistuje vrstva ktora sa ide vymazať upozornime použivatela
		if(!this._layers.hasOwnProperty(title)){
			Logger.error(getMessage(MSG_TRY_DELETE_ABSENT_LAYER, title));
		}

		//ak je vrstva ktorá sa ide vymazať gui tak upozornime používatela
		if(this._layers[title].guiLayer){
			Logger.write(getMessage(MSG_TRY_DELETE_GUI_LAYER));
			return false;
		}

		//vyčistíme vrstvu
		this._layers[title].cleanUp();

		//vymažeme vrstvu
		delete this._layers[title];

		//zmenšíme počet vrstiev
		this._layersCount--;

		//aj je viewer tak aj v ňom zmažeme vrstvu
		if(isDefined(Layers)){
			Layers.deleteLayer(title);
		}

		//uložíme zmazanie vrstvy
		Events.layerDelete(title);
	}

	changeLayer(object, newLayer){
		//získame vrstvu
        let layer = this.getLayer(newLayer);

        //ak existuje
		if(layer){
			//získame staru vrstvu
            let oldLayer = object.layer;

            //pridáme objekt do nover vrstvy
			layer.add(object);

			//zmenime hodnotu vrstvy v objekte
			Entity.changeAttr(object, "layer", newLayer);

			//zo starej vrstvy zmažeme objekt
            this.getLayer(oldLayer).remove(object);
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
	storeItem(key, value){
        this._items[key] = value;
	}
    getItem(key){
        return this._items[key];
    }
    deleteItem(key){
		delete this._items[key];
	}

	addToScene(object, layer = Layers.activeLayerName, resend = true){
    	//ak vrstva do ktorej pridávame objekt neexistuje upozornime používatela
		if(!this._layers.hasOwnProperty(layer)){
			Logger.error(getMessage(MSG_ADD_OBJECT_TO_ABSENT_LAYER, layer));
		}

		//ak je objekt pole tak rekurzivne zavolame funkciu pre každý jeden objekt
		if(isArray(object)){
			each(object, e => this.addToScene(e, layer, resend));
		}
		else{
			//nastavime objektu vrstvu
			object.layer = layer;

			//pridame objekt do vrstvy
			this._layers[layer].add(object);

			//uložime pridanie objektu
			Events.objectAdded(resend, object);

			//ak nemá preposlať tak neoznačíme objekt lebo sa vytvoril na dialku
			if(!resend){
				object.selected = false;
			}
        }

        //vykreslíme
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
	get creator(){return this._creator;}
	get paint(){return Layers.activeLayer.paint;}
	get layersNumber(){return this._layersCount;}
	get secondCanvas(){return this._secondCanvas;}
	get objectManager(){return this._objectManager;}

	getObject(layer, id){
		return this._layers[layer].getObject(id);
	}

	pdraw(ctx){
		each(this._clickViewers, e => e.draw(ctx));
	}

	draw(){
		each(this._layers, e => e.draw());
	}


	remove(obj, layer = obj.layer, resend = true){
		//nemôžeme mazať veci z úkolovej vrstvy
        if(this._layers[layer].taskLayer){
            return;
		}

		//zmažeme objekt z vrstvy
		this._layers[layer].remove(obj);

        //uložime zmazanie objektu
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

        //pre každu vrstvu prejde všetkými objektami
		each(this._layers, e => e.forEach(function(ee){
			//ak objekt nieje layer viewer
			if(ee.name != "LayerViewer"){
				//pridame ho do zoznamu výsledkov
				result[result.length] = ee;
			}
		}));

		//vratime vysledky
		return result;
	}
}