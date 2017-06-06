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
		this._selectors 		= {tc: 1, bc: 1, cl: 1, cr: 1, br: 1};
		this._onChange			= null;
		this._movementType		= MOVEMENT_RANDOM;
		this._sceneAlias		= "";
		this._movementLimits	= {};
		this._drawCounter		= -1;
		this._drawFunctions		= {};
		this._selected 			= false; //či je objekt označený
		this._visible 			= true; //či je objekt viditelý
		this._moving 			= false; //či sa objektom aktuálne hýbe
		this._locked			= false; //či je objekt uzamnknutý
		this._minSize 			= false; //minimálna velkosť objektu
        this._mouseOver			= false; //či bola pri posldom teste myš na objekte
        this._selectable		= true; //či môže byť označený(či sa zobrazí border)
        this._onClick			= null; //funkcia čo sa má vykonať na kliknutie(keyUp)
        this._layer				= PROJECT_LAYER_TITLE; //názov vrstvy v ktorej sa objekt nachádza
        this._parent			= null; //rodičovský objekt
        this._childrens			= []; //dcérske objekty

		this.unsetConnector();

		Entity.changeAttr(this, data);

		if(isUndefined(this._connectors)){	//presunute nižšie lebo chcem priradiť iba ak neexsituju
			this._connectors 	= [new GVector2f(0.5, 0), new GVector2f(0.5, 1), new GVector2f(0, 0.5), new GVector2f(1, 0.5)];
		}

		if(isUndefined(this._id)){	//presunute pod priradenie atributov lebo chcem priradiť ID iba ak nieje ešte
			this._id			= Project.generateId();//Entity.getId();
		}

		if(isUndefined(this._borderWidth)){
			this._borderWidth	= Creator.borderWidth;
		}

		if(isUndefined(this._radius)){
			this._radius 		= Creator.radius;
		}

		if(isUndefined(this._fillColor)){
			this._fillColor 	= Creator.color;
		}

		if(isUndefined(this._borderColor)){
			this._borderColor 	= Creator.borderColor;
		}
	}

	change(){
		if(isFunction(this._onChange)){
            this._onChange(this);
		}
	}

	setConnector(id){
		if(this._connectors[id]){
			this._selectedConnector = id;
		}
	}

	unsetConnector(){
		this._selectedConnector = false;
	}

	set sceneAlias(val){
		this._sceneAlias = val;
	}

	get sceneAlias(){
		return this._sceneAlias;
	}

	highlight(){
        let counter = 0,
			speed = HIGHLIGHT_SPEED,
			movement = 1,
			interval = setInterval(() => {
				this._position.sub(speed);
				this._size.add(speed * 2);
				counter += movement;
				if(counter === HIGHLIGHT_LIMIT){
					speed *= -1;
					movement *= -1;
				}
				else if(counter === 0){
					if(--HIGHLIGHT_COUNT > 0){
						speed *= -1;
						movement *= -1;
					}
					else{
						clearInterval(interval);
					}
				}
				draw();
			}, 1000 / FPS);
	}
	/*
	move(x, y){

	}
	*/
	isIn(x, y, radius = 0){
		return x + radius > this._position.x && x - radius < this._position.x + this._size.x &&
			   y + radius > this._position.y && y - radius < this._position.y + this._size.y;
	}

	removeChildren(element){
        let index = this._childrens.indexOf(element);
		if(index >= 0){
			this._childrens.splice(index, 1);
			element._parent = null;
		}
		return element;
	}

	removeParent(){
		if(this._parent){
			this._parent.removeChildren(this);
		}

		return this;
	}

	addChildren(element){
		if(element._parent !== this && this._parent !== element){
            let index = this._childrens.indexOf(element);
			if(index < 0){
                this._childrens[this._childrens.length] = element;
				element._parent = this;
			}
		}
		return element;
	}

	eachChildren(func){
		each(this._childrens, e => func(e));
	}

	/**
	 * Vygeneruje jedinečný identifikátor
	 *
	 * @returns {Number}
	 */
	static getId(){
		if(isUndefined(Entity._actId)){
			Entity._actId = 0;
		}
		return Entity._actId++;
	}

    click(x, y){
        if(isFunction(this._onClick)){
            this._onClick(x, y);
        }
	}

	/**
	 * Pridá k objektu nový connector
	 */
	addConnector(){
		objectToArray(arguments).forEach(e => this._connectors.push(e), this);
	}

    doubleClickIn(x, y){
        //ak neexistuje funkcia alebo ak sa nekliklo na element vrátime false
        if (!isFunction(this._doubleClickIn) || !this.clickInBoundingBox(x, y)) {
            return false;
        }

        //zistíme že sa naozaj kliklo a výsledok vrátime
        return this._doubleClickIn(x, y);
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
	}

	/**
	 * Zistí či bolo kliknuté na objekt a ak áno zavolá príslušnú funkciu
	 *
	 * @param x
	 * @param y
	 * @returns {boolean}
	 */
	clickIn(x, y){
		//TODO nechceme aby to rátalo ani ak je zamknutý
		//if(this.locked)
		//	return false;

        //ak neexistuje funkcia alebo ak sa nekliklo na element vrátime false
		if (!isFunction(this._clickIn) || !this.clickInBoundingBox(x, y)){
			return false;
		}

		//zistíme že sa naozaj kliklo a výsledok vrátime
		return  this._clickIn(x, y);
	}

	set mouseOver(val){
		if(this._mouseOver !== val){
			draw();
		}
        this._mouseOver = val;
	}


    onResize(){
        //ak neexistuje funkcia  vrátime false
        if(!isFunction(this._onResize)){
            return false;
        }

        //zavolame funkciu
        this._onResize();
        return true;
	}

	hover(x, y){
        //ak neexistuje funkcia  vrátime false
		if(!isFunction(this._hover)){
			return false;
		}

		//zistime či sa kliklo na element
        this.mouseOver = this.clickInBoundingBox(x, y);
        //ak sa nekliklo na element vrátime false
		if(!this._mouseOver){
			return false;
		}

		//ak je šance že sa kliklo tak zistime či sa naozaj kliklo
		return this._hover(x, y);
	}

	/**
	 * Vykoná príslušnú akciu po kliknutí
	 */
	//_doClickAct(index, x, y){};


	/**
	 * Zistí či bolo pressnuté na objekt a ak áno zavolá príslušnú funkciu
	 * @param x
	 * @param y
	 */
	pressIn(x, y){
        //ak neexistuje funkcia alebo ak sa nekliklo na element vrátime false
        if (!isFunction(this._pressIn) || !this.clickInBoundingBox(x, y)){
            return false;
        }

        //zistíme že sa naozaj kliklo a výsledok vrátime
        return  this._pressIn(x, y);
	}

	/*
	 * vykoná príslušnú akciu po pressnutí
	 */
	//_doPressAct(index, x, y){};

	/**
	 * Vyčistí objekt (vykonáva sa tesne pred zmazaním)
	 */
	cleanUp(){}

	_draw(){}

	/**
	 * Vykreslí objekt
	 */
	draw(ctx = context){
		//skontroluje či sa túto snímku už nevykresloval
		if(context === ctx){//ale iba ak sa kreslí na hlavný canvas(nie pcanvas)
			if(this._drawCounter === Project.drawCounter){
				return;
			}
			this._drawCounter = Project.drawCounter;
		}

		//ak je neviditelný nevykreslí sa
		if (!this.visible){
			return;
		}

		//nakreslím aktuálny objekt
		this._draw(ctx);

		//vykreslím všetky pomocné kresliace funkcie
        for(let i in this._drawFunctions){
        	if(this._drawFunctions.hasOwnProperty(i)){
        		//volame funkciu aby this bol objekt ktorý ju volá
            	this._drawFunctions[i].call(this, ctx);
            }
		}

		//vykreslím všetyk deti
		for(let e in this._childrens){
			this._childrens[e].draw(ctx);
		}
	}

	addDrawFunction(key, value){
		if(isFunction(value)){
			this._drawFunctions[key] = value;
		}
	}

	removeDrawFunction(key){
		delete this._drawFunctions[key];
	}

	/**
	 * Nastavý objektu atribút
	 *
	 * @param obj
	 * @param attr
	 * @param val
	 * @static
	 * @returns {*}
	 */
	static setAttr(obj, attr, val){
		if(isUndefined(Entity.attr) || isDefined(Entity.attr.Entity[attr]) || isDefined(Entity.attr[obj.name][attr])){
			obj["_" + attr] = val;
		}
		else{
			Logger.error(getMessage(MSG_WRONG_ATTRIBUTE, obj.name, attr));
		}

		Events.objectChange(obj, attr, val);
		return obj;
	}


	/**
	 * Zmení objektu jeden alebo viac atribútov
	 *
	 * @param obj - objekt ktorý sa bude meniť
	 * @param {string|object} data - názov atribútu alebo objekt zo všetkýmy atribútmy
	 * @param {string|number} val - hodnota atribútu ktorý sa nastavuje
	 * @returns {*}
	 */
	static changeAttr(obj, data, val){
		if(isObject(data)){
			each(data, (e, i) => Entity.setAttr(obj, i, e));
		}
		else{
			Entity.setAttr(obj, data, val);
		}
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
		each(points, function(e, i){
			if(i){
				position.x = Math.min(points[i].x, position.x);
				position.y = Math.min(points[i].y, position.y);
				size.x = Math.max(points[i].x, size.x);
				size.y = Math.max(points[i].y, size.y);
			}
		});

		size.sub(position);
	}

	/**
	 * Skontroluje či sa súradnica nachadza na nejakom connectore
	 *
	 * @param vec
	 */
	checkConnectors(vec){
		//if(Creator.operation != OPERATION_DRAW_JOIN)
		//	return;

		this._selectedConnector = false;
		//this._connectors.forEach(function(e){
		each(this._connectors, (e, i) => {
			if(this._selectedConnector){
				return;
			}
            let d = e.getClone().mul(this.size);
			if (vec.dist(this.position.x + d.x, this.position.y + d.y) < SELECTOR_SIZE){
				this._selectedConnector = i;
				//if(!Creator.object)
				//	Creator.createObject(this);
			}
		});
	}

	getConnectorPosition(i){
        let conn = this._connectors[i];
		if(conn){
			return this._position.getClone().add(this._size.getClone().mul(conn));
		}
	}

	/**
	 * Vykreslí všetky connectory
	 *
	 * @param obj
	 * @param ctx
	 */
	static drawConnectors(obj, ctx){
		if(Creator.operation != OPERATION_DRAW_JOIN &&
			(Creator.operation != OPERATION_DRAW_LINE || !Input.isKeyDown(KEY_L_CTRL))){
			return;
		}

		obj._connectors.forEach(e => drawConnector(e, obj, ctx));
	}

	/**
	 * Animuje pohyb alebo zmenu velkosti
	 *
	 * @param obj
	 * @param targetPos
	 * @param fps
	 */
	static animateMove(obj, targetPos, fps = FPS){
        let vec = targetPos.getClone().sub(obj.position).div(fps),
			counter = 0,
			int = setInterval(function(){
				obj.position.add(vec);
				draw();
				if(++counter === fps){
					clearInterval(int);
					obj.position.set(targetPos);
				}
			}, 1000 / fps);
	}


	static animate(obj, attributes, duration){
		let frameTime = 1000 / FPS;
		let frames = parseInt(duration / frameTime);
		let counter = 0;
		let offsetData = {};

		if(attributes.position){
            offsetData.position = attributes.position.getClone().sub(obj.position).div(frames);

		}
        if(attributes.size){
            offsetData.size = attributes.size.getClone().sub(obj.size).div(frames);
        }

        if(attributes.borderWidth){
            offsetData.borderWidth = (attributes.borderWidth - obj.borderWidth) / frames;
        }

        if(attributes.fillColor){
            obj.fillColor_hsv = Color._RGB2HSV.apply(this, new Color(obj.fillColor).RGB);
            let hsvEnd = Color._RGB2HSV.apply(this, new Color(attributes.fillColor).RGB);
            offsetData.fillColor = [(hsvEnd[0] - obj.fillColor_hsv[0]) / frames,
									(hsvEnd[1] - obj.fillColor_hsv[1]) / frames,
									(hsvEnd[2] - obj.fillColor_hsv[2]) / frames];
		}
        if(attributes.borderColor){
            obj.borderColor_hsv = Color._RGB2HSV.apply(this, new Color(obj.borderColor).RGB);
            let hsvEnd = Color._RGB2HSV.apply(this, new Color(attributes.borderColor).RGB);
            offsetData.borderColor = [(hsvEnd[0] - obj.borderColor_hsv[0]) / frames,
							     	  (hsvEnd[1] - obj.borderColor_hsv[1]) / frames,
									  (hsvEnd[2] - obj.borderColor_hsv[2]) / frames];
        }

		let interval = setInterval(function(){
			draw();
			each(offsetData, function(e, i){
				if(e instanceof  GVector2f){
					Entity.setAttr(obj, i, obj[i].add(e))
                }
                else if(isNumber(e)){
                    Entity.setAttr(obj, i, obj[i] + e);
				}
				else if(isArray(e)){
                	obj[i + "_hsv"][0] += e[0];
                    obj[i + "_hsv"][1] += e[1];
                    obj[i + "_hsv"][2] += e[2];

					let color = Color._HSV2RGB(obj[i + "_hsv"][0],
											   obj[i + "_hsv"][1] * 100,
											   obj[i + "_hsv"][2] * 100);
                    Entity.setAttr(obj, i, "rgb(" + parseInt(color[0]) + "," + parseInt(color[1]) + "," + parseInt(color[2]) + ")");
				}
			});
			if(--frames === 0){
				clearInterval(interval);
			}
		}, frameTime);
	}

	/**
	 * Nastaví konkrétny typ pohybu
	 *
	 * @param obj
	 * @param vec
	 */
	static setMoveType(obj, vec){
		if (obj.selectors.tc && vec.dist(obj.position.x + (obj.size.x >> 1), obj.position.y) < SELECTOR_SIZE){
			obj.moveType = 0;
		}
		else if (obj.selectors.cr && vec.dist(obj.position.x + obj.size.x, obj.position.y + (obj.size.y >> 1)) < SELECTOR_SIZE){
			obj.moveType = 1;
		}
		else if (obj.selectors.bc && vec.dist(obj.position.x + (obj.size.x >> 1), obj.position.y + obj.size.y) < SELECTOR_SIZE){
			obj.moveType = 2;
		}
		else if (obj.selectors.cl && vec.dist(obj.position.x, obj.position.y + (obj.size.y >> 1)) < SELECTOR_SIZE){
			obj.moveType = 3;
		}
		else if (obj.selectors.br && vec.dist(obj.position.x + obj.size.x, obj.position.y + obj.size.y) < SELECTOR_SIZE){
			obj.moveType = 5;
		}
		else if (vec.x > obj.position.x && vec.y > obj.position.y && vec.x < obj.position.x + obj.size.x && vec.y < obj.position.y + obj.size.y){
			obj.moveType = 4;
		}
	}

	/**
	 * Vráti nový objekt buď podla stringu alebo podla objektu ktorý obsahuje typ inštancie
	 *
	 * @param obj
	 * @returns {*}
	 */
	static createInstance(obj){
        let type = isString(obj) ? obj : obj._name;
		switch(type){
			case OBJECT_RECT :
				return new Rect();
			case OBJECT_ARC :
				return new Arc();
			case OBJECT_TABLE :
				return new Table();
			case OBJECT_TEXT :
				return new TextField("");
			case OBJECT_POLYGON :
				return new Polygon([0, 0, 0]);
			case OBJECT_LINE :
				return new Line([0, 0, 0]);
            case OBJECT_IMAGE :
                return new ImageObject();
			case OBJECT_CLASS :
				return new Class();
			default :
				Logger.error(getMessage(MSG_UNKNOWN_OBJECT_NAME, obj._name));
				return null;
		}
	}

	/**
	 * Vytvorým nový objekt
	 *
	 * @param obj
	 * @param generateId
	 * @returns
	 */
	static create(obj, generateId = true){
		//ak niekto pošle JSON ako konštruktor
		if(isString(obj)){
			obj = JSON.parse(obj);
		}

		//vytvorím novú inštanciue
        let result = Entity.createInstance(obj);

		if(result){
			//nakopírujem atributy
			each(obj, function(e, i){
				console.log(e, " == ",i);
				if(e && isDefined(e["_x"]) && typeof isDefined(e["_y"])){
					result[i] = new GVector2f(e._x, e._y);
				}
				else if(i == "data"){
					result[i] = e.map(ee => ee.map(eee => eee));
				}
				else if(i == "points" || i == "_points"){
					result[i] = e.map(ee => new GVector2f(ee._x, ee._y));
				}
				else if(i == "_sceneAlias"){
					if(e){
						Scene.storeItem(e, result);
                    }
					result[i] = i;
				}
				else if(i == "_connectors"){
					result[i] = e.map(ee => new GVector2f(ee._x, ee._y));
				}
				else if(i == "_id" && generateId){
					result[i] = Project.generateId();//Entity.getId();
				}
				else if(i == "_onClick" || i == "_onChange"){
					if(isString(e)){
						this[i] = eval(e);
                    }
				}
				else if(i == "_drawFunctions"){
                    result[i] = {};
                    //prejdem všetky kresliace funkcia
					each(e, (ee, ii) => {
						//kažu jednu priradim na svoje miesto
                        result[i][ii] = eval(ee);
					})
				}
				else if(i == "_image"){
                    result[i] = new Image();
                    result[i] = e.src;
				}
				else{
					result[i] = e;
				}
			});
			Logger.write(MSG_OBJECT_SUCCESSFULLY_CREATED, result.name || "Neznámy");
			Logger.log("Vytvoril sa objekt " + (result.name || "Neznámy"), LOGGER_OBJECT_CREATED);
		}
		return result;
	}
    toObject(){
        let result = jQuery.extend(true, {}, this),
            addslashes = str => (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        if(isFunction(this._onChange)){
        	result._onChange = addslashes(this._onChange.toString());
        }
        if(isFunction(this._onClick)) {
            result._onClick = addslashes(this._onClick.toString());
        }
        this._drawFunctions = {};
		each(this._drawFunctions, (e, i) => {
            result._drawFunctions[i] = addslashes(this._drawFunctions[i].toString());
		});
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
    get parent(){return this._parent;}
	get radius(){return this._radius;}
	get locked(){return this._locked;}
	get minSize(){return this._minSize;}
	get visible(){return this._visible;}
    get onchange(){return this._onChange;}
	get selected(){return this._selected;}
	get position(){return this._position;}
    get selectors(){return this._selectors;}
	get fillColor(){return this._fillColor;}
	get mouseOver(){return this._mouseOver;}
    get selectable(){return this._selectable;}
	get borderWidth(){return this._borderWidth;}
	get borderColor(){return this._borderColor;}
    get movementType(){return this._movementType;}
    get movementLimits(){return this._movementLimits;}
	get selectedConnector(){return this._selectedConnector;}
	get center(){
		return this._position.getClone().add(this._size.getClone().div(2));
	}


	/**
	 * SETTERS
	 *
	 */

	set layer(val){this._layer = val;}
	set locked(val){this._locked = val;}
	set minSize(val){this._minSize = val;}
    set selected(val){this._selected = val;}
    set selectors(val){this._selectors = val;}
    set onClick(value){this._onClick = value;}
    set onchange(value){this._onChange = value;}
    set selectable(value){this._selectable = value;}
    set movementType(value){this._movementType = value;}
    set movementLimits(value){this._movementLimits = value;}
    set selectedConnector(val){this._selectedConnector = val;}
	//set fillColor(val){this._fillColor = val;}
	//set borderWidth(val){this._borderWidth = val;}
	//set borderColor(val){this._borderColor = val;}
}

function testMoveAnimation(){
    let obj = [];
	for(let i=0 ; i<100 ; i++){
		obj.push(new Rect(new GVector2f(Math.random() * canvas.width, Math.random() * canvas.height), new GVector2f(50, 50) , "blue"));
		Scene.addToScene(obj[obj.length - 1]);
		Entity.animateMove(obj[obj.length - 1], new GVector2f(300, 300));
	}
}

function testAnimation(){
	let arc = new Arc(new GVector2f(150, 150), new GVector2f(150, 150));
	Project.scene.addToScene(arc);

	Entity.animate(arc, {
		position: new GVector2f(800, 150),
		size: new GVector2f(50, 50),
		borderWidth: 5,
		fillColor: "#bf42b3",
		borderColor: "green"
	}, 1000);
}