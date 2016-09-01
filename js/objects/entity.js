class Entity{
	/**
	 * @param name
	 * @param position
	 * @param size
	 * @param data
	 */
	constructor(name, position = new GVector2f(), size = new GVector2f(), data = {}){
		this._position 			= position;
		this._size 				= size;
		this._name 				= name;

		this._selected 			= false;
		this._visible 			= true;
		this._moving 			= false;
		this._locked			= false;
		this._minSize 			= false;
		this._selectedConnector = false;
		this._layer				= "default";

		Entity.changeAttr(this, data);

		if(isUndefined(this._connectors))	//presunute nižšie lebo chcem priradiť iba ak neexsituju
			this._connectors 	= [new GVector2f(0.5, 0), new GVector2f(0.5, 1), new GVector2f(0, 0.5), new GVector2f(1, 0.5)];

		if(isUndefined(this._id))	//presunute pod priradenie atributov lebo chcem priradiť ID iba ak nieje ešte
			this._id			= Entity.getId();

		if(isUndefined(this._borderWidth))
			this._borderWidth 	= Creator.borderWidth;

		if(isUndefined(this._radius))
			this._radius 		= Creator.radius;

		if(isUndefined(this._fillColor))
			this._fillColor 	= Creator.color;

		if(isUndefined(this._borderColor))
			this._borderColor 	= Creator.borderColor;
	}


	/**
	 * Vygeneruje jedinečný identifikátor
	 *
	 * @returns {Number}
	 */
	static getId(){
		if(isUndefined(Entity._ides))
			Entity._ides = [];

		var id = parseInt(Math.random() * 1000000);
		while(isDefined(Entity._ides[id]))
			id = parseInt(Math.random() * 1000000);
		Entity._ides[id] = 1;
		return id;
	}


	/**
	 * Pridá k objektu nový connector
	 */
	addConnector(){
		objectToArray(arguments).forEach(e => this._connectors.push(e), this);
	}


	/**
	 * Vráti true ak je šanca že bolo kliknuté na niektorú časť objektu
	 *
	 * @param x
	 * @param y
	 * @param obj
	 * @returns {boolean}
	 */
	clickInBoundingBox(x, y, obj = this){
		return x + SELECTOR_SIZE > obj._position.x && x - SELECTOR_SIZE < obj._position.x + obj._size.x &&
			   y + SELECTOR_SIZE > obj._position.y && y - SELECTOR_SIZE < obj._position.y + obj._size.y;
	};


	/**
	 * Zistí či bolo kliknuté na objekt a ak áno zavolá príslušnú funkciu
	 * @param x
	 * @param y
	 * @returns {boolean}
	 */
	clickIn(x, y){return false;};


	/**
	 * Vykoná príslušnú akciu po kliknutí
	 */
	//_doClickAct(index, x, y){};


	/**
	 * Zistí či bolo pressnuté na objekt a ak áno zavolá príslušnú funkciu
	 * @param x
	 * @param y
	 */
	pressIn(x, y){}



	/*
	 * vykoná príslušnú akciu po pressnutí
	 */
	//_doPressAct(index, x, y){};


	/**
	 * Vyčistí objekt (vykonáva sa tesne pred zmazaním)
	 */
	cleanUp(){};


	/**
	 * Vykreslí objekt
	 */
	draw(){};


	/**
	 * Nastavý objektu atribút
	 *
	 * @param obj
	 * @param attr
	 * @param val
	 * @returns {*}
	 */
	static setAttr(obj, attr, val){
		if(isUndefined(Entity["attr"]) || isDefined(Entity["attr"]["Entity"][attr]) || isDefined(Entity["attr"][obj.name][attr]))
			obj["_" + attr] = val;
		else
			Logger.error("k objektu " + obj.name + " sa snaží priradiť neplatný atribút: " + attr);

		Events.objectChange(obj, attr, val);
		return obj;
	}


	/**
	 * Zmení objektu atribút
	 *
	 * @param obj
	 * @param data
	 * @param val
	 * @returns {*}
	 */
	static changeAttr(obj, data, val){
		if(isObject(data))
			each(data, (e, i) => Entity.setAttr(obj, i, e));
		else 
			Entity.setAttr(obj, data, val);
		return obj;
	}


	/**
	 * Vypočíta maximálnu a minimálnu poziciu z pola bodov
	 *
	 * @param points
	 * @param position
	 * @param size
	 */
	static findMinAndMax(points, position, size){
		position.set(points[0]);
		size.set(points[0]);
		points.forEach(function(e, i){
			if(i == 0)
				return;
			position.x = Math.min(points[i].x, position.x);
			position.y = Math.min(points[i].y, position.y);
			size.x = Math.max(points[i].x, size.x);
			size.y = Math.max(points[i].y, size.y);
		});

		size.sub(position);
	}


	/**
	 * Skontroluje či sa súradnica nachadza na nejakom connectore
	 *
	 * @param vec
	 */
	checkConnectors(vec){
		if(Creator.operation != OPERATION_DRAW_JOIN)
			return;

		this._selectedConnector = false;
		this._connectors.forEach(function(e){
			if(this._selectedConnector)
				return;
			var d = e.getClone().mul(this.size);
			if (vec.dist(this.position.x + d.x, this.position.y + d.y) < SELECTOR_SIZE){
				this._selectedConnector = e;
				if(!Creator.object)
					Creator.createObject(this);
			}
		}, this);
	}


	/**
	 * Vykreslí všetky connectory
	 *
	 * @param obj
	 */
	static drawConnectors(obj){
		if(Creator.operation != OPERATION_DRAW_JOIN && (Creator.operation != OPERATION_DRAW_LINE || !Menu.isToolActive()))
			return;

		obj._connectors.forEach(e => drawConnector(e, obj));
	};


	/**
	 * Animuje pohyb alebo zmenu velkosti
	 *
	 * @param obj
	 * @param targetPos
	 * @param fps
	 */
	static animateMove(obj, targetPos, fps = FPS){
		var vec = targetPos.getClone().sub(obj.position).div(fps),
			counter = 0,
			int = setInterval(function(){
			obj.position.add(vec);
			draw();
			if(++counter == fps){
				clearInterval(int);
				obj.position = targetPos;
			}
		}, 1000 / fps);
	}


	/**
	 * Nastaví konkrétny typ pohybu
	 *
	 * @param obj
	 * @param vec
	 */
	static setMoveType(obj, vec){
		if (vec.dist(obj.position.x + (obj.size.x >> 1), obj.position.y) < SELECTOR_SIZE)
			obj.moveType = 0;
		else if (vec.dist(obj.position.x + obj.size.x, obj.position.y + (obj.size.y >> 1)) < SELECTOR_SIZE)
			obj.moveType = 1;
		else if (vec.dist(obj.position.x + (obj.size.x >> 1), obj.position.y + obj.size.y) < SELECTOR_SIZE)
			obj.moveType = 2;
		else if (vec.dist(obj.position.x, obj.position.y + (obj.size.y >> 1)) < SELECTOR_SIZE)
			obj.moveType = 3;
		else if (vec.dist(obj.position.x + obj.size.x, obj.position.y + obj.size.y) < SELECTOR_SIZE)
			obj.moveType = 5;
		else if (vec.x > obj.position.x && vec.y > obj.position.y && vec.x < obj.position.x + obj.size.x && vec.y < obj.position.y + obj.size.y)
			obj.moveType = 4;
	}


	/**
	 * Vráti nový objekt buď podla stringu alebo podla objektu ktorý obsahuje typ inštancie
	 *
	 * @param obj
	 * @returns {*}
	 */
	static createInstance(obj){
		var type = isString(obj) ? obj : obj._name;
		switch(type){
			case OBJECT_RECT :
				return new Rect();
			case OBJECT_ARC :
				return new Arc();
			case OBJECT_TABLE :
				return new Table();
			case OBJECT_TEXT :
				return new Text("");
			case OBJECT_POLYGON :
				return new Polygon([0,0,0]);
			case OBJECT_LINE :
				return new Line([0,0,0]);
			case OBJECT_CLASS :
				return new Class();
			default :
				Logger.error("snažíš sa vložiť objekt s neznámym menom: " + obj._name);
				return null;
		}
	};

	/**
	 * Vytvorým nový objekt
	 *
	 * @param obj
	 * @param generateId
	 * @returns
	 */
	static create(obj, generateId = true){
		//ak niekto pošle JSON ako konštruktor
		if(isString(obj))
			obj = JSON.parse(obj);

		//vytvorím novú inštanciue
		var result = Entity.createInstance(obj);

		if(result){
			//nakopírujem atributy
			each(obj, function(e, i){
				if(e && isDefined(e["_x"]) && typeof isDefined(e["_y"]))
					result[i] = new GVector2f(e._x, e._y);
				else if(i == "data")
					result[i] = e.map(ee => ee.map(eee => eee));
				else if(i == "points")
					result[i] = e.map(ee => new GVector2f(ee._x, ee._y));
				else if(i == "_id" && generateId)
					result[i] = Entity.getId();
				else
					result[i] = e;
			});
			Logger.notif("objekt bol úspešne vytvorený");
			Logger.log("Vytvoril sa objekt " + (result.name || "Neznámy"), LOGGER_OBJECT_CREATED);
		}
		return result;
	}

	/**
	 * vytvorý kópiu objektu
	 */
	/*
	static getClone(obj){
		var res = Entity.create(obj);
			res.position.add(obj.size);
		return res;
		var copy = Object.create(obj.__proto__);
		each(obj, function(e, i){
			if(e.constructor.name == "GVector2f")
				copy[i] = e.getClone();
			else if(i == "data"){
				copy[i] = [];
				e.forEach(function(ee){
					ee.forEach(eee => tmp.push(eee));
					copy[i].push(tmp);
				});
			}
			else if(i == "points"){
				copy[i] = [];
				e.forEach(ee => copy[i].push(ee.getClone().add(obj.size)));
			}
			else
				copy[i] = e;
		});

		copy.position.add(obj.size);
		return  clone;
	}
	*/
	/**
	 * GETTERS
	 *
	 * @returns {*}
	 */
	get id(){return this._id;}
	get name(){return this._name;}
	get size(){return this._size;}
	get layer(){return this._layer;}
	get radius(){return this._radius;}
	get locked(){return this._locked;}
	get minSize(){return this._minSize;}
	get visible(){return this._visible;}
	get selected(){return this._selected;}
	get position(){return this._position;}
	get fillColor(){return this._fillColor;}
	get borderWidth(){return this._borderWidth;}
	get borderColor(){return this._borderColor;}
	get selectedConnector(){return this._selectedConnector;}


	/**
	 * SETTERS
	 *
	 */
	//set id(val){this._id = val;}
	set layer(val){this._layer = val;}
	set locked(val){this._locked = val;}
	set minSize(val){this._minSize = val};
	set selected(val){this._selected = val;}
	//set fillColor(val){this._fillColor = val;}
	//set borderWidth(val){this._borderWidth = val;}
	//set borderColor(val){this._borderColor = val;}
	set selectedConnector(val){this._selectedConnector = val;}

}