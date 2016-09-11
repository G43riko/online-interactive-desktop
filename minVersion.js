
class Arc extends Entity{
	constructor(position, size, fillColor){
		super(OBJECT_ARC, position, size, {fillColor: fillColor, minSize: new GVector2f(SELECTOR_SIZE)});
		this.moveType 	= -1;
	};

	updateCreatingPosition(pos){
		this.size.x = pos.x - this.position.x;
		this.size.y = pos.y - this.position.y;
	};

	clickIn(x, y){
		if (!this.clickInBoundingBox(x, y))
			return false;

		var vec = new GVector2f(x, y);
		this.moveType = -1;

		this.checkConnectors(vec);
		if(this._selectedConnector)
			return true;


		Entity.setMoveType(this, vec);
		return this.moveType >= 0;
	};

	draw(){
		if (!this.visible)
			return;

		doArc({
			position: this.position,
			size: this.size,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth,
			shadow: this.moving && !this.locked
		});

		drawBorder(this);

		Entity.drawConnectors(this);
	};
}class Arrow{
	static drawArrow(pFrom, pTo, parent, type = 0, angle = Math.PI / 6, length = 30){
		if(type == 0)
			return;

		var vec = pTo.getClone().sub(pFrom).normalize();
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);

		var p0 = new GVector2f(pTo.x, pTo.y);
		var p1 = new GVector2f(pTo.x - (vec.x * cos - vec.y * sin) * length,
							   pTo.y - (vec.x * sin + vec.y * cos) * length);
		var p2 = new GVector2f(pTo.x - (vec.x * cos + vec.y * sin) * length,
							   pTo.y + (vec.x * sin - vec.y * cos) * length);

		var p3 = new GVector2f(((pTo.x - ((vec.x * cos - vec.y * sin) * length << 1)) + (pTo.x - ((vec.x * cos + vec.y * sin) * length << 1))) >> 1,
							   ((pTo.y - ((vec.x * sin + vec.y * cos) * length << 1)) + (pTo.y + ((vec.x * sin - vec.y * cos) * length << 1))) >> 1);

		switch(type){
			case 2210:
				doLine({
					points: [[p1, p0],
					    	 [p2, p0]],
					borderColor: parent.borderColor,
					borderWidth: parent.borderWidth
				});
				break;
			case 2211:
				doPolygon({
					points: [p0, p1, p2],
					fill:true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: parent.fillColor,
					borderWidth: parent.borderWidth
				});
				break;
			case 2212:
				doPolygon({
					points: [p0, p1, p2],
					fill:true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: parent.borderColor,
					borderWidth: parent.borderWidth
				});
				break;
			case 2213:
				doPolygon({
					points: [p1, p0, p2, p3],
					fill: true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: parent.fillColor,
					borderWidth: parent.borderWidth
				});
				break;
			case 2214:
				doPolygon({
					points: [p1, p0, p2, p3],
					fill: true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: parent.borderColor,
					borderWidth: parent.borderWidth
				});
				break;
		}
	}
}class Class extends Table{
	constructor(position, size, title, attributes = {}, methods = {}, access = ACCESS_PUBLIC){
		super(position, size, [[]]);
		this._name = OBJECT_CLASS;
		this._title = title;
		this._access = access;
		this._methods = methods;
		this._attr = attributes;
		this._fontSize	= 15;
		this._lineHeight = 30;
		this._headerColor = "#24D330";
		this._bodyColor = "#CCFFCC";
		Entity.changeAttr(this, ATTRIBUTE_BORDER_COLOR, shadeColor1(this._headerColor, -20));

		this._makeData();

		this.size.set(this._size.x, this.data.length * this._lineHeight);
		this._calcMaxTextWidth();
		this._checkSize();
	}

	static _parseAttribute(string){
		var tmp = string.replace(/ /g, '').split(":");
		return {
			type: tmp[1],
			access: tmp[0][0],
			name:  tmp[0].slice(1, tmp[0].length)
		};
	}

	static _parseMethod(string){
		var tmp = string.replace(/ /g, '').split(")"),
			tmp2 = tmp[0].split("("),
			args = tmp2[1].split(",").map(a => a.split(":"));
		if(args[0][0] == "void")
			args = "void";
		return {
			returnType: tmp[1].replace(":", ""),
			access: tmp[0][0],
			name:  tmp2[0].slice(1, tmp2[0].length),
			args: args
		};
	}

	addMethod(name, returnType = "void", args = "void", access = ACCESS_PUBLIC){
		this._methods[name] = {
			name: name,
			retType: returnType,
			access: access,
			args: args
		};
		this._makeData();
	}

	static toAccess(access){
		switch(access){
			case ACCESS_PUBLIC: return "public";
			case ACCESS_PRIVATE: return "private";
			case ACCESS_PROTECTED: return "protected";
			default : return "";
		}
	}

	addAttribute(name, type, access = ACCESS_PUBLIC){
		this._attr[name] = {
			name: name,
			type: type,
			access: access
		};
		this._makeData();
	}

	static _methodToString(e){
		var args = (Array.isArray(e.args) ? e.args.map(e => e[0] + ": " + e[1]).join(", ") : e.args);
		return 	e.access + " " + e.name + "(" + args + "): " + e.retType;
	}

	static _attributeToString(e){
		return e.access + " " + e.name + ": " + e.type;
	}

	_makeData(){
		this.data = [[this._title]];
		each(this._attr, e => this.data.push([Class._attributeToString(e)]));
		each(this._methods, e => this.data.push([Class._methodToString(e)]));
	}

	getJavaSource(){
		var result = Class.toAccess(this._access) + " class " + this._title + "{\n\t";

		result += $.map(this._attr, e => Class.toAccess(e.access) + " " + e.type + " " + e.name + ";\n").join("\t");

		result += $.map(this._methods, function(e){
			var args = (Array.isArray(e.args) ? e.args.map(e => e[1] + " " + e[0]).join(", ") : ""),
				subRes = "\n\t" + Class.toAccess(e.access) + " " + e.retType + " ";
				subRes += e.name + "(" + args + "){\n\t\tTODO auto generated body\n\t}\n";
			return subRes;
		}).join("\t");
		result += "}";

		return result;
	}
}class Connector{
	constructor(object, data){
		this._object = object;
		this._data = data;
		this._position = object.position.add(object.size.mul(data));
		this._targets = [];
		this._pointers = [];
	}

	get position(){return this._position;}

	addTarget(target){
		this._targets.push(target);
	}

	forEachTargets(func){
		this._targets.forEach(func);
	}
}class Entity{
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
				return new TextField("");
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

}class ImageObject extends Entity{
	constructor(position, size, image, data){
		super(OBJECT_IMAGE, position, size, data);
		this._radius = 20;

		this._image = image || null;

		//if(!image)
		//	loadImage(e => this._image = e);
	}

	set image(img){this._image = img;}

	updateCreatingPosition(pos){
		this.size.x = pos.x - this.position.x;
		this.size.y = pos.y - this.position.y;
	};

	clickIn(x, y){
		if (!this.clickInBoundingBox(x, y))
			return false;

		var vec = new GVector2f(x, y);
		this.moveType = -1;

		this.checkConnectors(vec);
		if(this._selectedConnector)
			return true;

		Entity.setMoveType(this, vec);

		return this.moveType >= 0;
	};

	draw(){
		//context.drawImage(this._image, this.position.x, this.position.y, this.size.x, this.size.y);
		doRect({
			bgImage: this._image || false,
			fill: this._image === null,
			position: this._position,
			size: this.size,
			radius: this.radius,
			draw: true,
			shadow: this.moving && !this.locked,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor
		});

		drawBorder(this);
	}
}class Join extends Entity{
	constructor(obj1, type = JOIN_LINEAR){
		super(OBJECT_JOIN);
		this._obj1 				= obj1;
		this._obj1_connector 	= obj1.selectedConnector;
		this._obj2 				= null;
		this._obj2_connector 	= null;
		this._lineType 			= type;
		Entity.changeAttr(this, {borderColor: "blue", borderWidth: 5});

		this._tmpPos 			= obj1.position.getClone();
	};

	set obj2(val){
		this._obj2 = val;
		this._obj2_connector = val.selectedConnector;
		this._obj1.selectedConnector = false;
		this._obj2.selectedConnector = false;
	};

	set type(val){
		this._lineType = val;
		draw();
	};

	updateCreatingPosition(pos){
		this._tmpPos.set(pos);
	}

	draw(){
		if(this._obj1.position == null){
			Logger.warn("ide sa kresliť join ktorý nemá potrebné udaje");
			Scene.remove(this);
			return;
		}

		var obj1pos = this._obj1.position.getClone().add(this._obj1.size.getClone().mul(this._obj1_connector)),
			obj2pos,
			array = [];


		if(this._obj2 != null)
			obj2pos = this._obj2.position.getClone().add(this._obj2.size.getClone().mul(this._obj2_connector));
		else
			obj2pos = this._tmpPos;

		array.push(obj1pos);

		if(this._lineType != JOIN_LINEAR){
			var center = obj1pos.getClone().add(obj2pos).br(1),
				diff = obj1pos.getClone().sub(obj2pos);

			diff.x = Math.abs(diff.x);
			diff.y = Math.abs(diff.y);


			if(diff.x > diff.y) {
				if (this._lineType == JOIN_SEQUENCAL) {
					array.push(new GVector2f(center.x, obj1pos.y));
					array.push(new GVector2f(center.x, obj2pos.y));
					array.push(obj2pos);
				}
				else if (this._lineType == JOIN_BAZIER)
					array.push([new GVector2f(center.x, obj1pos.y),new GVector2f(center.x, obj2pos.y), obj2pos]);
			}
			else if(diff.x <= diff.y){
				if(this._lineType == JOIN_SEQUENCAL) {
					array.push(new GVector2f(obj1pos.x, center.y));
					array.push(new GVector2f(obj2pos.x, center.y));
					array.push(obj2pos);
				}
				else if(this._lineType == JOIN_BAZIER)
					array.push([new GVector2f(obj1pos.x, center.y), new GVector2f(obj2pos.x, center.y), obj2pos]);
			}
		}
		else
			array.push(obj2pos);

		if(this._lineType == JOIN_BAZIER)
			drawBazierCurve(array, this.borderWidth, this.borderColor);
		else
			doLine({points: array, borderWidth: this.borderWidth, borderColor: this.borderColor});
	};
}class Line extends Entity{
	constructor(points, width, fillColor, targetA = null, targetConnectionA = null) {
		super(OBJECT_LINE, new GVector2f(), new GVector2f(), {fillColor: fillColor, borderWidth: width});
		this._points 			= points;
		this.movingPoint		= -1;
		this._lineCap			= LINE_CAP_BUTT;
		this._joinType			= LINE_JOIN_MITER;
		this._lineStyle			= LINE_STYLE_NORMAL;
		this._lineType			= JOIN_LINEAR;
		this._arrow 			= new Image();
		this._arrow.src 		= "img/arrow.png";
		this._arrowEndType		= 0;
		this._arrowStartType	= 0;
		this._targetA			= targetA;
		this._targetConnectionA	= targetConnectionA;
		this._targetB			= null;
		this._targetConnectionB	= null;

		if(points.length < 2){
			Logger.warn("vytvoril sa line ktory mal menej ako 2 body a tak sa maže");
			Scene.remove(this);
		}
		Entity.findMinAndMax(this._points, this.position, this.size);
	}

	get points(){return this._points;}

	set lineCap(val){this._lineCap = val;}
	set arrowEndType(val){this._arrowEndType = val;}
	set lineType(val){this._lineType = val;}
	set joinType(val){this._joinType = val;}
	set lineStyle(val){this._lineStyle = val;}
	set arrowStartType(val){this._arrowStartType = val;}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		this._points.forEach(function(e, i){
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE){
				this._points.splice(i, 1);
				Entity.findMinAndMax(this._points, this.position, this.size);
			}
		}, this);

		if(this._points.length < 2)
			Scene.remove(this);

		return true;
	};

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		this.movingPoint = -1;
		this._points.forEach(function(e,i, points){
			if(this.movingPoint >= 0)
				return true;
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE)
				this.movingPoint = i;
			else if(i + 1 < points.length &&
				new GVector2f(x, y).dist((e.x + (points[i + 1].x) >> 1),
					(e.y + (points[i + 1].y) >> 1)) < SELECTOR_SIZE)
				this.movingPoint = parseFloat(i) + 0.5;
		}, this);

		if(this.movingPoint >= 0)
			return this.movingPoint >= 0;

		for(var i=1 ; i<this._points.length ; i++)
			if(Line.determineClick(this._points[i-1], this._points[i], x, y, 10))
				return true;


		return false;
	};

	static determineClick(p1, p2, x, y, maxDist){
		if(x < Math.min(p1.x, p2.x) || x > Math.max(p1.x, p2.x) || y < Math.min(p1.y, p2.y) || y > Math.max(p1.y, p2.y))
			return false;

		var dist = p1.dist(p2),
			log = Math.ceil(Math.log2(dist)),
			min,
			max,
			center,
			i;
		if(p1.x < p2.x){
			min = p1.getClone();
			max = p2.getClone();
		}
		else{
			min = p2.getClone();
			max = p1.getClone();
		}
		center = min.getClone().add(max).br(1);
		for(i=0 ; i<log ; i++){
			if(x > center.x)
				min = center;
			else
				max = center;
			center = min.add(max).br(1);

			if(Math.abs(y - center.y) < maxDist)
				return true;
		}
		return false;
	};

	updateCreatingPosition(pos){
		this._points[this._points.length - 1].set(pos);
		Entity.findMinAndMax(this._points, this.position, this.size);
	};

	draw(){
		var size = this._points.length;

		doLine({
			shadow: this.moving && !this.locked,
			lineCap: this._lineCap,
			joinType: this._joinType,
			lineStyle: this._lineStyle,
			points: this._points,
			borderWidth: this.borderWidth,
			borderColor: this.fillColor,
			radius: this.radius,
			lineDash: this._lineStyle == LINE_STYLE_STRIPPED ? [15, 5] : []
		});

		Arrow.drawArrow(this._points[1], this._points[0], this, this._arrowEndType);
		Arrow.drawArrow(this._points[size - 2], this._points[size - 1], this, this._arrowStartType);

		context.lineWidth = DEFAULT_STROKE_WIDTH << 1;
		if(this.selected){
			drawBorder(this, {});
			drawSelectArc(this._points[0].x, this._points[0].y);
			for(var i=1 ; i<size ; i++){
				drawSelectArc(this._points[i].x, this._points[i].y);
				drawSelectArc((this._points[i].x + this._points[i - 1].x) >> 1, (this._points[i].y + this._points[i - 1].y) >> 1);
			}
		}
	};
}class Paint extends Entity{
	constructor(){
		super(OBJECT_PAINT, new GVector2f(), new GVector2f());
		this._points 		= [Paint.defArray()];
		this._count 		= 0;
		this._canvas 		= document.createElement("canvas");
		this._canvas.width 	= canvas.width;
		this._canvas.height	= canvas.height;
		this._context 		= this._canvas.getContext('2d');
		this._action		= PAINT_ACTION_BRUSH;
		this._editBackup	= [];


	}

	static defArray(){
		return {
			color: null,
			action: null,
			size: null,
			points: []
		}
	}

	animate(speed = 20, limit = this._points.length - 1){
		var points 	= this._points,
			i 		= 0,
			ii 		= 0,
			inst 	= this;
		this.cleanUp();

		var interval = setInterval(function(){
			if(i >= limit || i >= points.length - 1){
				clearInterval(interval);
				return;
			}
			inst.addPoint(points[i]["points"][ii], points[i]["color"]);
			if(ii++ == points[i]["points"].length - 1){
				inst.breakLine();
				i++;
				ii = 0;
			}
			draw();
		}, speed);
	}

	redraw(points, limit = points.length - 1){
		this.cleanUp();
		var res = [];
		points.forEach(function(e, i){
			if(i > limit || isNull(e["color"]))
				return;
			res.push(e);


			if(Creator.brushColor !== e["color"])
				Creator.setOpt("brushColor", e["color"]);
			if(Creator.brushSize !== e["size"])
				Creator.setOpt("brushSize", e["size"]);
			if(Creator.brushType !== e["type"])
				Creator.setOpt("brushType", e["type"]);

			e["points"].forEach(function(ee, ii, arr){
				if(ii)
					this._drawLine(ee, arr[ii - 1], this._actColor)
			}, this);
		}, this);
		this._points = res;
		if(points.length > 0 && points[points.length - 1]["points"].length)
			this.breakLine();
		Logger.log("prekresluje sa " + this.constructor.name, LOGGER_DRAW);
		draw();

	}

	undo(){
		if(this._points.length === 1)
			return false;

		if(isNull(this._points[this._points.length - 1]["color"]))
			this._points.pop();

		this._editBackup.push(this._points.pop());

		this.redraw(this._points);
		if(this._points.length === 0)
			this._points.push(Paint.defArray());
	}

	redo(){
		if(this._editBackup.length == 0)
			return false;

		if(isNull(this._points[this._points.length - 1]["color"]))
			this._points.pop();
		this._points.push(this._editBackup.pop());
		this.redraw(this._points); // toto nemusí prepisovať celé
	}


	/**
	 * Pridá nový pod do malby podla aktualne nakresleneho štetca
	 *
	 * @param point
	 */
	addPoint(point){
		var lastArr = this._points[this._points.length - 1],
			arr = lastArr["points"];

		this._editBackup = [];
		this._count++;

		if(isNull(lastArr["color"])){ //TODO toto nižšie sa bude asi stále prepisovať
			lastArr["color"] = Creator.brushColor;
			lastArr["action"] = Paints.action;
			lastArr["type"] = Creator.brushType;
			lastArr["size"] = Creator.brushSize;
		}

		if(arr.length)
			this._drawLine(arr[arr.length - 1], point);
		arr.push(point);
	}

	fromObject(content){
		each(content, ee => each(ee["points"], (e, i , arr) => arr[i] = new GVector2f(e._x, e._y)));

		each(content, ee => {
			each(ee["points"], (e, i , arr) => {
				arr[i] = new GVector2f(e._x, e._y);
			})
		});
		this.redraw(content);
	}

	toObject(){
		return this._points;
	}

	_drawLine(pointA, pointB){
		if(this._action == PAINT_ACTION_LINE){
			this._context.lineCap 		= LINE_CAP_ROUND;
			this._context.lineWidth 	= this.borderWidth;
			this._context.strokeStyle	= Creator.brushColor;
			this._context.beginPath();
			this._context.moveTo(pointA.x, pointA.y);
			this._context.lineTo(pointB.x, pointB.y);
			this._context.stroke();
		}
		else if(this._action == PAINT_ACTION_BRUSH){
			var dist 	= pointA.dist(pointB),
				angle 	= Math.atan2(pointA.x - pointB.x, pointA.y - pointB.y);
			for (var i = 0; i < dist; i++)
				this._context.drawImage(Paints.selectedBrush,
					pointB.x + (Math.sin(angle) * i) - (Creator.brushSize >> 1),
					pointB.y + (Math.cos(angle) * i) - (Creator.brushSize >> 1),
					Creator.brushSize,
					Creator.brushSize);
		}
	}

	cleanUp(){
		this._points = [Paint.defArray()];
		this._points[this._actColor] = [[]];
		this._count = 0;
		this._context.clearRect(0, 0, canvas.width, canvas.height);
		Logger.log("Bol vyčistený objekt " + this.constructor.name, LOGGER_OBJECT_CLEANED);
	}

	breakLine(){
		if(this._points[this._points.length - 1].points.length < 2)
			this._points[this._points.length - 1] = Paint.defArray();
		else
			this._points.push(Paint.defArray());
	}

	draw() {
		if (!this.visible)
			return;
		context.drawImage(this._canvas, 0, 0);
	};
}class Polygon extends Entity{
	constructor(points, color){
		super(OBJECT_POLYGON, new GVector2f(), new GVector2f(), {fillColor: color});
		this.points 		= points;
		this.movingPoint	= -1;
		if(points.length < 3){
			Logger.warn("vytvoril sa polygon ktory mal menej ako 3 body a tak sa maže");
			Scene.remove(this);
		}

		Entity.findMinAndMax(this.points, this.position, this.size);
	}


	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		this.points.forEach(function(e, i){
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE){
				this.points.splice(i, 1);
				Entity.findMinAndMax(this.points, this.position, this.size);
			}
		}, this);

		if(this.points.length < 3)
			Scene.remove(this);

		return true;
	};

	clickIn(x, y) {
		if (!this.clickInBoundingBox(x, y))
			return false;

		this.movingPoint = -1;
		var vec = new GVector2f(x, y);
		this.points.forEach(function(e,i, points){
			if(this.movingPoint >= 0)
				return true;
			if(vec.dist(e) < SELECTOR_SIZE)
				this.movingPoint = i;
			else if(i < points.length && vec.dist((e.x + (points[(i + 1) % points.length].x) >> 1),
													  (e.y + (points[(i + 1) % points.length].y) >> 1)) < SELECTOR_SIZE)
				this.movingPoint = parseFloat(i) + 0.5;
		}, this);

		if(this.movingPoint >= 0)
			return true;

		return Polygon.determineClick(this.points, x, y);
	};

	static determineClick(points, x, y){
		for(var i=0 ; i<points.length ; i++){
			var big = i + 1;
			var less = i - 1;
			if(i == 0)
				less = points.length - 1;
			if(i == points.length - 1)
				big = 0;

			var vec1 = points[i].getClone().sub(points[less]);
			var vec2 = points[big].getClone().sub(points[i]);
			var toMouse = new GVector2f(x, y).sub(points[i]);
			if(angleBetween(vec1, vec2) < angleBetween(vec1, toMouse))
				return false
		}

		return true;
	}

	draw(){
		doPolygon({
			shadow: this.moving && !this.locked,
			points: this.points,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth,
			radius: this.radius
		});
		console.log("radius: " + this.radius);
		if(this.selected){
			drawBorder(this, {});
			for(var i=0 ; i<this.points.length ; i++){
				var min = i - 1;
				if(i == 0)
					min = this.points.length - 1;
				drawSelectArc(this.points[i].x, this.points[i].y);
				drawSelectArc((this.points[i].x + this.points[min].x) >> 1, (this.points[i].y + this.points[min].y) >> 1);
			}
		}

	};
}class Rect extends Entity {
	constructor(position, size, fillColor){
		super(OBJECT_RECT, position, size, {fillColor: fillColor});
		this.moveType 	= -1;
		this.minSize 	= new GVector2f(SELECTOR_SIZE);
		this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1))
	}

	set radius(val){
		this._radius = parseFloat(val);
		if(this._radius < 100)
			this._radius *= 100;
		this._checkRadius();
	}

	updateCreatingPosition(pos){
		this.size.x = pos.x - this.position.x;
		this.size.y = pos.y - this.position.y;
	};

	clickIn(x, y){
		if (!this.clickInBoundingBox(x, y))
			return false;

		var vec = new GVector2f(x, y);
		this.moveType = -1;

		this.checkConnectors(vec);
		if(this._selectedConnector)
			return true;

		Entity.setMoveType(this, vec);

		return this.moveType >= 0;
	};

	_checkRadius(){
		if(this._radius > Math.min(this.size.x, this.size.y) >> 1)
			this._radius = Math.min(this.size.x, this.size.y) >> 1;
	}

	draw(){
		if (!this.visible)
			return;

		this._checkRadius();

		doRect({
			position: this.position,
			size: this.size,
			fillColor: this.fillColor,
			shadow: this.moving && !this.locked,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor,
			radius: this._radius
		});

		Entity.drawConnectors(this);

		drawBorder(this);
	}
}
class Table extends Entity{
	constructor(position, size, data = [[]]){
		super(OBJECT_TABLE, position, size, {borderColor: shadeColor1(TABLE_HEADER_COLOR, -20), radius: TABLE_RADIUS});
		this.data = data;
		this._headerColor 	= TABLE_HEADER_COLOR;
		this.moveType 		= -1;
		this._bodyColor	 	= TABLE_BODY_COLOR;
		this._textOffset	= TABLE_TEXT_OFFSET;
		this._columnWidth 	= this._size.x / this.data[0].length;
		this._lineHeight	= TABLE_LINE_HEIGHT;

		this._fontSize 		= DEFAULT_FONT_SIZE;

		this.size.set(this._size.x, data.length * this._lineHeight);
		this._calcMaxTextWidth();
	}

	clear(pos, type){
		if(type == "row"){
			var row = parseInt((pos - this._position.y) / this._lineHeight);
			this.data[row].forEach(function(e, i){
				this.data[row][i] = "";
			}, this);
		}
		else if(type == "column"){
			var column = parseInt((pos - this._position.x) / this._columnWidth);
			this.data.forEach(function(e){
				e[column] = "";
			});
		}
		else if(type == "table"){
			this.data.forEach(function(e){
				e.forEach(function(ee, i){
					e[i] = "";
				}, this);
			}, this);
		}
	}

	addRow(y, type){
		var row = parseInt((y - this._position.y) / this._lineHeight),
			offset = 0;

		if(type == "below")
			offset++;

		var newRow = [];
		this.data[0].forEach(function(){
			newRow.push([""]);
		});
		this.data.splice(row + offset, 0, newRow);
		this._size.y = this.data.length * this._lineHeight;
		this._checkSize();
	}

	addColumn(x, type){
		var column = parseInt((x - this._position.x) / this._columnWidth),
			offset = 0;
		if(type == "right")
			offset++;

		this.data.forEach(function(e){
			e.splice(column + offset, 0, [""]);
		});

		this._columnWidth 	= this._size.x / this.data[0].length;
		this._checkSize();

	}

	removeRow(y){
		var row = parseInt((y - this._position.y) / this._lineHeight);

		if(row > 0)
			this.data.splice(row, 1);
		else
			Logger.error("nemožeš vymazať hlavičku tabulky");
		this._size.y = this.data.length * this._lineHeight;
		this._calcMaxTextWidth();

		if(this.data.length == 0)
			Scene.remove(this);
	}

	removeColumn(x){
		var column = parseInt((x - this._position.x) / this._columnWidth);

		this.data.forEach(function(e){
			e.splice(column, 1);
		});
		this._columnWidth 	= this._size.x / this.data[0].length;
		this._calcMaxTextWidth();

		if(this.data[0].length == 0)
			Scene.remove(this);
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		var pos = this.position,
			vec = new GVector2f(x, y);

		if(vec.dist(pos.x + (this.size.x >> 1), pos.y) < SELECTOR_SIZE)
			this.moveType = 0;
		else if(vec.dist(pos.x + this.size.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this.moveType = 1;
		else if(vec.dist(pos.x +(this.size.x >> 1), pos.y + this.size.y) < SELECTOR_SIZE)
			this.moveType = 2;
		else if(vec.dist(pos.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this.moveType = 3;
		else if(vec.dist(pos.x + this.size.x, pos.y + this.size.y) < SELECTOR_SIZE)
			this.moveType = 5;
		else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
			this.moveType = 4;
		return this.moveType >= 0;
	}

	_calcMaxTextWidth(value){
		var w;
		context.font = this._fontSize + "pt " + DEFAULT_FONT;
		if(isString(value)){
			w = context.measureText(value).width + (this._textOffset << 1);
			if(w > this._maxTextWidth){
				this._maxTextWidth = w;
				return;
			}
		}
		this._maxTextWidth = 0;
		this.data.forEach(function(e){
			e.forEach(function(ee){
				var w = context.measureText(ee).width + (this._textOffset << 1);
				if(w > this._maxTextWidth)
					this._maxTextWidth = w;
			},this);
		}, this);
	}

	_checkSize(){
		if(this.size.y < this._fontSize * 2 * this.data.length)
			this.size.y = this._fontSize * 2 * this.data.length;

		this._lineHeight = this.size.y / this.data.length;
		this._columnWidth = Math.max(this.size.x / this.data[0].length, this._maxTextWidth);
		this.size.x = this._columnWidth * this.data[0].length;
	}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y) || this.locked)
			return false;

		var row = parseInt((y - this._position.y) / this._lineHeight),
			column = parseInt((x - this._position.x) / this._columnWidth),
			posY = this._position.y + row * this._lineHeight + 1,
			posX = this._position.x + column * this._columnWidth + 1,
			w = this._columnWidth;

		getText(this.data[row][column], new GVector2f(posX, posY), new GVector2f(w, this._lineHeight).sub(4), function(val){
			this.data[row][column] = val;
			this._calcMaxTextWidth(val);
			this._checkSize();
		}, this);

		return true;
	}

	draw(){
		var i,
			j,
			posX = this._position.x,
			posY = this._position.y,
			points = [];


		if(this.moveType >= 0)
			this._checkSize();

		//FILL HEADER

		doRect({
			position: this._position,
			width: this._size.x,
			height: this._lineHeight,
			radius: {tr: this.radius, tl: this.radius},
			fillColor: this._headerColor,
			shadow: this.moving && !this.locked
		});

		//FILL BODY
		doRect({
			x: this._position.x,
			y: this._position.y +  this._lineHeight,
			width: this._size.x,
			height: this._lineHeight * (this.data.length - 1),
			radius: {br: this.radius, bl: this.radius},
			fillColor: this._bodyColor,
			shadow: this.moving && !this.locked
		});

		//DRAW BORDER
		doRect({
			position: this._position,
			size: this._size,
			radius: this.radius,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth
		});

		///DRAW HEADER TEXT
		for(i=0 ; i<this.data[0].length ; i++) {
			if (i > 0)
				points.push([posX, this._position.y, posX, this._position.y + this.data.length * this._lineHeight]);
			fillText(this.data[0][i], posX + (this._columnWidth >> 1),  this._position.y + (this._lineHeight >> 1), this._fontSize, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
			posX += this._columnWidth;
		}

		//DRAW BODY TEXT
		for(i=1 ; i<this.data.length ; i++){
			posX = this._position.x;
			posY += this._lineHeight;
			if(i > 0)
				points.push([this._position.x, posY, this._position.x + this._size.x, posY]);
			for(j=0 ; j<this.data[i].length ; j++) {
				fillText(this.data[i][j], posX + (this._columnWidth >> 1),  posY + (this._lineHeight >> 1), this._fontSize, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
				posX += this._columnWidth;
			}
		}

		//HORIZONTAL AND VERTICAL LINES
		doLine({
			points: points,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor
		});

		drawBorder(this);
	}
}class TextArea extends Entity{
	constructor(text, position, size, fontColor = DEFAULT_FONT_COLOR){
		super(OBJECT_TEXT, position, size, {fillColor: DEFAULT_BACKGROUND_COLOR, radius: DEFAULT_RADIUS});
		this._text 		= text || "";
		this._textColor = fontColor;
		this._fontSize 	= DEFAULT_FONT_SIZE;
		this._moveType 	= -1;
		this._verticalTextAlign = FONT_VALIGN_TOP;
		this._horizontalTextAlign = FONT_HALIGN_LEFT;
		this._fontOffset = DEFAULT_TEXT_OFFSET;
		this._selected = false;
		this._padding = 20;
		this._lineHeight = 30;

		this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1))
	}

	_blur(){
		this._selected = false;
		SelectedText = null;
	}

	set text(val){
		console.log(val);
		this._text = val.split("\n");
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y)){
			if(this._selected)
				this._blur();
			return false;
		}

		this._selected = true;
		SelectedText = this;

		var pos = this.position,
			vec = new GVector2f(x, y);

		var area = document.getElementById("selectedEditor");
		
		if(area){
			document.body.removeChild(area);
		}

		area = document.createElement("div");
		area.setAttribute("id", "selectedEditor");
		area.setAttribute("contenteditable", "true");
		area.style["top"] = this._position.y + "px";
		area.style["left"] = this._position.x + "px";
		area.style["width"] = this._size.x + "px";
		area.style["height"] = this._size.y + "px";
		area.style["backgroundColor"] = this._fillColor;
		area.style["borderRadius"] = this._radius + "px";
		area.style["padding"] = this._padding + "px";
		area.style["color"] = this._textColor;
		area.style["zIndex"] = 100000;

		area.style["font"] = this._fontSize + "pt " + DEFAULT_FONT;

		document.body.insertBefore(area, document.getElementById("myCanvas"));

		this.checkConnectors(vec);
		if(this._selectedConnector)
			return true;

		if(vec.dist(pos.x + (this.size.x >> 1), pos.y) < SELECTOR_SIZE)
			this._moveType = 0;
		else if(vec.dist(pos.x + this.size.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this._moveType = 1;
		else if(vec.dist(pos.x +(this.size.x >> 1), pos.y + this.size.y) < SELECTOR_SIZE)
			this._moveType = 2;
		else if(vec.dist(pos.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this._moveType = 3;
		else if(vec.dist(pos.x + this.size.x, pos.y + this.size.y) < SELECTOR_SIZE)
			this._moveType = 5;
		else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
			this._moveType = 4;
		return this._moveType >= 0;
	};

	draw(){
		var pos = this.position.getClone();

		doRect({
			shadow: this.moving && !this.locked,
			position: this.position,
			size: this.size,
			radius: this.radius,
			fillColor: this.fillColor,
			borderWidth: this._borderWidth,
			draw: true,
			fill: true
		});

		context.textAlign = this._horizontalTextAlign;
		context.textBaseline = this._verticalTextAlign;
		context.fillStyle = this._textColor;
		context.font = this._fontSize + "pt " + DEFAULT_FONT;

		var offsetY = this._padding;
		each(this._text, e => {
			//console.log(offsetY + "kreslí sa: "+ this._fontSize);
			context.fillText(e, pos.x + this._padding, pos.y + offsetY);
			offsetY += this._lineHeight* 1.40	;//29 * 1.41;//this._fontSize * 1.333333 *2;
		})
	}
}class TextField extends Entity{
	constructor(text, position, size, fontColor = DEFAULT_FONT_COLOR){
		super("Text", position, size, {fillColor: DEFAULT_BACKGROUND_COLOR, radius: DEFAULT_RADIUS});//TODO premenovať na input
		this._text 		= text || "";
		this._textColor = fontColor;
		this._fontSize 	= DEFAULT_FONT_SIZE;
		this._moveType 	= -1;
		this.size.x 	= calcTextWidth(text, this._fontSize + "pt " + DEFAULT_FONT) + (DEFAULT_TEXT_OFFSET << 1);
		this.minSize 	= this.size.getClone();
		this._verticalTextAlign = FONT_VALIGN_TOP;
		this._horizontalTextAlign = FONT_HALIGN_LEFT;
		this._fontOffset = DEFAULT_TEXT_OFFSET;

		this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1))
	};

	get moveType(){
		return this._moveType;
	}

	set moveType(val){
		this._moveType = val;
	}

	set verticalTextAlign(val){
		this._verticalTextAlign = val;
	}

	set horizontalTextAlign(val){
		this._horizontalTextAlign = val;
	}

	get text(){
		return this._text;
	}

	draw(){
		var pos = this.position.getClone();

		doRect({
			shadow: this.moving && !this.locked,
			position: this.position,
			size: this.size,
			radius: this.radius,
			fillColor: this.fillColor,
			borderWidth: this._borderWidth,
			draw: true,
			fill: true
		});


		context.textAlign = this._horizontalTextAlign;
		context.textBaseline = this._verticalTextAlign;
		context.fillStyle = this._textColor;
		context.font = this._fontSize + "pt " + DEFAULT_FONT;
		
		if(this._horizontalTextAlign == FONT_HALIGN_LEFT)
			pos.x += this._fontOffset;
		else if(this._horizontalTextAlign == FONT_HALIGN_CENTER)
			pos.x += this.size.x >> 1;
		else if(this._horizontalTextAlign == FONT_HALIGN_RIGHT)
			pos.x += this.size.x - this._fontOffset;

		if(this._verticalTextAlign == FONT_VALIGN_MIDDLE)
			pos.y += this.size.y >> 1;
		else if(this._verticalTextAlign == FONT_VALIGN_BOTT)
			pos.y += this.size.y - this._fontOffset;

		context.fillText(this._text, pos.x, pos.y);

		drawBorder(this);
		Entity.drawConnectors(this);
	};

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		var pos = this.position,
			vec = new GVector2f(x, y);


		this.checkConnectors(vec);
		if(this._selectedConnector)
			return true;

		if(vec.dist(pos.x + (this.size.x >> 1), pos.y) < SELECTOR_SIZE)
			this._moveType = 0;
		else if(vec.dist(pos.x + this.size.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this._moveType = 1;
		else if(vec.dist(pos.x +(this.size.x >> 1), pos.y + this.size.y) < SELECTOR_SIZE)
			this._moveType = 2;
		else if(vec.dist(pos.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this._moveType = 3;
		else if(vec.dist(pos.x + this.size.x, pos.y + this.size.y) < SELECTOR_SIZE)
			this._moveType = 5;
		else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
			this._moveType = 4;
		return this._moveType >= 0;
	};

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		getText(this._text, new GVector2f(x, y), this._size.getClone().sub(4), function(val){
			if(val.length == 0)
				Scene.remove(this);
			this._text = val;
			this._size.x = calcTextWidth(val) + (DEFAULT_TEXT_OFFSET << 1);
		}, this);

		return true;
	};





}class BrushManager{


}function pickUpColor(func, thisArg){
	var T;
	if (arguments.length > 1)
		T = thisArg;
	$("#colorPalete").delegate(".colorPatern", "click", function(){
		$(".selected").removeClass("selected");
		func.call(T, $(this).addClass("selected").css("backgroundColor"));
		closeDialog();
		draw();
	});
	showColors();
}

function shadeColor1(color, percent) {  // deprecated. See below.
	var num = parseInt(color.slice(1), 16),
		amt = Math.round(2.55 * percent), 
		R = (num >> 16) + amt, 
		G = (num >> 8 & 0x00FF) + amt,
		B = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
							  (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
							  (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function hexToRGBA(color) {
	var num = parseInt(color.slice(1), 16);
	return [num >> 16, num >> 8 & 0x00FF, num & 0x0000FF];
}
class ContentManager{
	constructor(){
		this._contentImage = null;
		this._contentHTML  = null;
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	setContentImage(src = false){
		if(this._contentImage === null)
			this._contentImage = document.getElementById("contentImage");

		if(src)
			this._contentImage.src = src;
		else{
			this._contentImage.src = "#";
			loadImage(img => this._contentImage.src = img.src);
		}

		this._contentImage.classList.remove("hide");
	}

	setContentHTML(){
		if(this._contentHTML === null)
			this._contentHTML = document.getElementById("contentHTML");
		this._contentHTML.classList.remove("hide");
		loadFile(html => this._contentHTML.innerHTML = html);
	}

	hideContent(){
		if(this._contentImage !== null)
			this._contentImage.classList.add("hide");
		if(this._contentHTML !== null)
			this._contentHTML.classList.add("hide");
	}
}class ContextMenuManager{
	constructor(position, titles = [], parent = false, key = "undefined"){
		this._position 			= position;
		this._subMenu 			= false;
		this._parent 			= parent;
		this._key 				= key;
		this._textColor 		= CONTEXT_MENU_FONT_COLOR;
		this._selectedObject 	= parent ? parent._selectedObject : selectedObjects.movedObject;
		this._titles 			= titles;

		//TODO toto prerobiť do JSON suboru
		if(this._titles.length == 0){
			if(selectedObjects.movedObject){
				if(isIn(selectedObjects.movedObject.name, OBJECT_RECT, OBJECT_POLYGON, OBJECT_ARC, OBJECT_LINE, OBJECT_TABLE, OBJECT_IMAGE, OBJECT_TEXT))
					this._addFields("delete", "locked", "makeCopy", "changeLayer", "changeOpacity");

				if(isIn(selectedObjects.movedObject.name, OBJECT_RECT, OBJECT_POLYGON, OBJECT_TEXT, OBJECT_ARC))
					this._addFields("changeFillColor", "changeBorderColor");

				if(isIn(selectedObjects.movedObject.name, OBJECT_RECT, OBJECT_POLYGON, OBJECT_TEXT, OBJECT_LINE))
					this._addFields("radius");

				if(selectedObjects.movedObject.name == OBJECT_LINE)
					this._addFields("joinType", "lineCap", "lineStyle", "lineType", "lineWidth", "arrowEndType", "arrowStartType");
				else if(selectedObjects.movedObject.name == OBJECT_TABLE)
					this._addFields("editTable");
				else if(selectedObjects.movedObject.name == OBJECT_TEXT)
					this._addFields("verticalTextAlign", "horizontalTextAlign");
				else if(selectedObjects.movedObject.name == OBJECT_IMAGE)
					this._addFields("changeImage");
				else if(selectedObjects.movedObject.name == "LayerViewer"){
					this._addFields("visible", "lockLayer", "showPaint");
					if(!selectedObjects.movedObject.locked)
						this._addFields("deleteLayer", "renameLayer", "clearLayer");
				}
			}
			else
				this._addFields("clearWorkspace");
		}
		context.font = (30 - CONTEXT_MENU_OFFSET) + "pt " + DEFAULT_FONT;

		var hasExtension = false;

		if(titles.length)
			titles.forEach(function(e, i, arr){
				if(e["type"] == INPUT_TYPE_RADIO){
					hasExtension = true;
					arr[i]["value"] = this._selectedObject["_" + this._key] == e["name"];
				}

				if(e["type"] == INPUT_TYPE_CHECKBOX){
					hasExtension = true;
					if(e["key"] == "locked")
						arr[i]["value"] = selectedObjects.movedObject.locked;
					else if(e["key"] == "visible")
						arr[i]["value"] = selectedObjects.movedObject.visible;
					else if(e["key"] == "showPaint")
						arr[i]["value"] = selectedObjects.movedObject.showPaint;
				}
			}, this);

		this._menuWidth = getMaxWidth(this._titles.map(e => e["label"])) + (CONTEXT_MENU_OFFSET << 1);

		if(hasExtension)
			this._menuWidth += 30;

		this._size = new GVector2f(this._menuWidth, this._titles.length * CONTEXT_MENU_LINE_HEIGHT);
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	get position(){
		return this._position;
	};

	_addFields(){
		var res;
		objectToArray(arguments).forEach(function(e){
			res = ContextMenuManager.items[e];
			res["key"] = e;
			this._titles.push(res);
		}, this);
	};

	clickInBoundingBox(x, y){
		return x + SELECTOR_SIZE > this._position.x && x - SELECTOR_SIZE < this._position.x + this._menuWidth &&
			   y + SELECTOR_SIZE > this._position.y && y - SELECTOR_SIZE < this._position.y + this._titles.length * CONTEXT_MENU_LINE_HEIGHT;
	};

	draw(){
		if(this._position.x + this._menuWidth > canvas.width)
			this._position.x = canvas.width - this._menuWidth;

		if(this._position.y + this._titles.length * CONTEXT_MENU_LINE_HEIGHT >canvas.height)
			this._position.y = canvas.height - this._titles.length * CONTEXT_MENU_LINE_HEIGHT;

		var count 		= 0,
			pX 			= this._position.x,
			pY 			= this._position.y,
			menuWidth 	= this._menuWidth,
			posY 		= pY,
			checkSize 	= 20,
			offset 		= (CONTEXT_MENU_LINE_HEIGHT - checkSize) >> 1;

		doRect({
			position:[pX, pY],
			width: this._menuWidth,
			height: Object.keys(this._titles).length * CONTEXT_MENU_LINE_HEIGHT,
			radius: MENU_RADIUS,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth,
			fillColor: "rgb(153, 217, 234)",
			shadow: true,
			draw: true
		});
		each(this._titles, function(e){
			context.fillStyle = DEFAULT_FONT_COLOR;
			posY = pY + count * CONTEXT_MENU_LINE_HEIGHT;
			if(count++)
				doLine({points: [pX, posY, pX + menuWidth, posY], draw: true});


			if(this._subMenu && e["key"] == this._subMenu._key)
				fillText(e["label"], pX, posY,  30 - CONTEXT_MENU_OFFSET, this._textColor);
			else
				fillText(e["label"], pX, posY,  30 - CONTEXT_MENU_OFFSET, this._textColor, [CONTEXT_MENU_OFFSET, 0]);

			if(e["type"] == INPUT_TYPE_CHECKBOX)
				doRect({
					x: pX + menuWidth - offset - checkSize,
					y: posY + offset,
					size: checkSize,
					radius: 5,
					borderColor: this.borderColor,
					borderWidth: this.borderWidth,
					fillColor: e["value"] ? CHECKBOX_COLOR_TRUE : CHECKBOX_COLOR_FALSE,
					draw: true
				});
			else if(e["type"] == INPUT_TYPE_RADIO)
				doArc({
					x: pX + menuWidth - offset - checkSize,
					y: posY + offset,
					size: checkSize,
					borderColor: DEFAULT_FONT_COLOR,
					fillColor: DEFAULT_FONT_COLOR,
					draw: !e["value"],
					fill: e["value"]
				});
			else if(e["type"] == "widthValue")
				doLine({
					points: [pX + menuWidth - (checkSize << 2), posY + (CONTEXT_MENU_LINE_HEIGHT >> 1),
							 pX + menuWidth - offset, posY + (CONTEXT_MENU_LINE_HEIGHT >> 1)],
					borderWidth: e["name"]
				});
		}, this);
	
		if(this._subMenu)
			this._subMenu.draw();
	};

	_doClickAct(opt) {
		var act = opt.key;


		Logger.log("Klikol v contextMenu na položku " + act, LOGGER_CONTEXT_CLICK);
		switch (act) {
			case "changeFillColor":
				pickUpColor(color => Entity.changeAttr(this._selectedObject, ATTRIBUTE_FILL_COLOR, color), this);
				actContextMenu = false;
				break;
			case "changeBorderColor":
				pickUpColor(color => Entity.changeAttr(this._selectedObject, ATTRIBUTE_BORDER_COLOR, color), this);
				actContextMenu = false;
				break;
			case "delete":
				if (this._selectedObject)
					Scene.remove(this._selectedObject);
				actContextMenu = false;
				break;
			case "locked":
				this._selectedObject.locked = !this._selectedObject.locked;
				ContextMenuManager.items["locked"].value = this._selectedObject.locked;
				actContextMenu = false;
				break;
			case "clearWorkspace":
				Scene.cleanUp();
				actContextMenu = false;
				break;
			case "removeRow":
				this._selectedObject.removeRow(this._parent.position.y);
				actContextMenu = false;
				break;
			case "removeColumn":
				this._selectedObject.removeColumn(this._parent.position.x);
				actContextMenu = false;
				break;
			case "addRowBelow":
				this._selectedObject.addRow(this._parent.position.y, "below");
				actContextMenu = false;
				break;
			case "addRowAbove":
				this._selectedObject.addRow(this._parent.position.y, "above");
				actContextMenu = false;
				break;
			case "addColumnToRight":
				this._selectedObject.addColumn(this._parent.position.x, "right");
				actContextMenu = false;
				break;
			case "addColumnToLeft":
				this._selectedObject.addColumn(this._parent.position.x, "left");
				actContextMenu = false;
				break;
			case "clearRow":
				this._selectedObject.clear(this._parent.position.y, "row");
				actContextMenu = false;
				break;
			case "clearColumn":
				this._selectedObject.clear(this._parent.position.x, "column");
				actContextMenu = false;
				break;
			case "clearTable":
				this._selectedObject.clear(null, "table");
				actContextMenu = false;
				break;
			case "showPaint":
				this._selectedObject.toggleVisibilityOfPaint(this._position.y);
				actContextMenu = false;
				break;
			case "visible":
				this._selectedObject.toggleVisibilityOfLayer(this._position.y);
				actContextMenu = false;
				break;
			case "clearLayer":
				this._selectedObject.clearLayer(this.position.y);
				actContextMenu = false;
				break;
			case "renameLayer":
				this._selectedObject.renameLayer(this.position.y);
				actContextMenu = false;
				break;
			case "makeCopy":
				var obj = Entity.create(this._selectedObject);
				obj.position.add(this._selectedObject.size);
				Scene.addToScene(obj);
				actContextMenu = false;
				break;
			default:
				if(opt.group == "roundRadius"){
					Entity.changeAttr(this._selectedObject, ATTRIBUTE_RADIUS, opt.name);
					actContextMenu = false;
				}
				else if(opt.group == "lineCapValue"){
					this._selectedObject.lineCap = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "joinTypeValue"){
					this._selectedObject.joinType = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "lineStyleValue"){
					this._selectedObject.lineStyle = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "widthValue"){
					Entity.changeAttr(this._selectedObject, ATTRIBUTE_BORDER_WIDTH, opt.name);
					//this._selectedObject.borderWidth = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "arrowEndType"){
					this._selectedObject.arrowEndType = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "arrowStartType"){
					this._selectedObject.arrowStartType = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "valignValue"){
					this._selectedObject.verticalTextAlign = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "halignValue"){
					this._selectedObject.horizontalTextAlign = opt.name;
					actContextMenu = false;
				}

		}
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return this._subMenu ? this._subMenu.clickIn(x, y) : false;

		var i = parseInt((y - this._position.y) / CONTEXT_MENU_LINE_HEIGHT);

		if(isDefined(this._titles[i]) && this._titles[i].hasOwnProperty("fields")){
			var pos = this._position.getClone().add(this._menuWidth, i * CONTEXT_MENU_LINE_HEIGHT);
			if(pos.x + this._menuWidth > canvas.width)
				pos.x -= this._menuWidth << 1;
			this._subMenu = new ContextMenuManager(pos, objectToArray(this._titles[i]["fields"]), this, this._titles[i]["key"]);
		}
		else
			this._subMenu = false;

		this._doClickAct(this._titles[i]);

		return true;

	};
}class objectCreator{
	constructor(){
		this._object 		= false;
		this._fillColor 	= DEFAULT_FILL_COLOR;
		this._borderColor 	= DEFAULT_BORDER_COLOR;
		this._borderWidth 	= DEFAULT_STROKE_WIDTH;
		this._operation 	= OPERATION_DRAW_RECT;
		this._lineWidth 	= DEFAULT_STROKE_WIDTH;
		this._fontSize		= DEFAULT_FONT_SIZE;
		this._fontColor		= DEFAULT_FONT_COLOR;
		this._lineType		= DEFAULT_LINE_TYPE;
		this._lineStyle		= DEFAULT_LINE_STYLE;
		this._brushSize		= DEFAULT_BRUSH_SIZE;
		this._brushType		= DEFAULT_BRUSH_TYPE;
		this._brushColor	= DEFAULT_BRUSH_COLOR;
		this._radius		= DEFAULT_RADIUS;
		this._items 		= null;
		this._view			= null;
		this._visibleView	= true;
		this._allowedItems 	= ["_fillColor", "_borderColor", "_borderWidth", "_operation", "_lineWidth", "_fontSize",
							   "_fontColor", "_lineType", "_lineStyle", "_brushSize", "_brushType", "_brushColor",
							   "_radius"];
		
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	onMouseMove(pos, movX, movY){
		updateSelectedObjectView(this._object);
		this._object.updateCreatingPosition(pos);
	}

	set visibleView(val){this._visibleView = val;}
	/**
	 * Nastaví view pre creator
	 *
	 * @param val - view ktorý sa má priradiť
	 */
	set view(val){
		this._view = val;

		if(this._items !== null)
			this.init()
	}


	/**
	 * Načíta dáta pre CreatorView
	 *
	 * @param data - objekt ktorý vznikol s parsovaním načítaneho súboru s dátami pre CreatorView
	 */
	init(data = false){
		if(this._items === null && data !== false)
			this._items = data;

		if(this._view !== null)
			this._view.init();
	}


	/**
	 * Vytvorí dočasný objekt ktorý sa má vytvoriť a uloží sa do Creatora
	 *
	 * @param position - pozícia kde sa má objaviť objekt
	 */
	createObject(position){
		switch(this._operation){
			case OPERATION_DRAW_RECT:
				this._object = new Rect(position, new GVector2f(), this._fillColor);
				break;
			case OPERATION_DRAW_ARC:
				this._object = new Arc(position, new GVector2f(), this._fillColor);
				break;
			case OPERATION_DRAW_LINE:
				this._object = new Line([position, position.getClone()], this._lineWidth, this._fillColor);
				break;
			case OPERATION_DRAW_JOIN:
				this._object = new Join(position);
				break;
			case OPERATION_DRAW_IMAGE:
				this._object = new ImageObject(position, new GVector2f());
				break;
		}
		selectedObjects.clearAndAdd(this._object);//TODO toto nesposobuje to rýchle pohybocanie objektt???
	}


	/**
	 * Dokončí vytváranie objektu
	 */
	finishCreating(){
		if(this._object.name === OBJECT_IMAGE)
			loadImage(e => {
				this._object.image = e;
				Scene.addToScene(this._object);
				this._object = false;
			});
		else{
			Scene.addToScene(this._object);
			this._object = false;
		}
	}


	/**
	 * Načíta všetky dáta potrebné pre creator s jedného objektu
	 *
	 * @param content
	 */
	fromObject(content){
		each(content, function(e, i){
			if(isIn(i, this._allowedItems))
				this.setOpt(i, e);
		}, this);
	}


	/**
	 * Uloží Creator to jedného objektu
	 */
	toObject(){
		var result = {};
		each(this, (e, i) => result[i] = e);
		return result;
	}


	/**
	 * Nakreslí akuálne vytváraný objekt a takisto aj view ak existuje
	 */
	draw(){
		if(this._object)
			this._object.draw();

		if(this._view !== null && this._items !== null && this._visibleView)
			this._view.draw();
	}


	/**
	 * Vytvorý objekt bud s objektu alebo s JSON stringu a vloží ho do scény
	 *
	 * @param obj - objekt alebo JSON string s dátami potrebnými pre vytvorenie objektu
	 * @returns {obj} - vráci novo vytvorený objekt alebo NULL ak sa vytvorenie nepodarí
	 */
	create(obj){
		var result = Entity.create(obj, false);
		if(result){
			Scene.addToScene(result, result.layer, false);
			draw();
		}
		return result;
	}


	/**
	 * Nastavý vlastnosť creatora na určitú hodnotu
	 *
	 * @param key
	 * @param val
	 */
	setOpt(key, val){
		if(key[0] != "_")
			key = "_" + key;

		this[key] = val;




		if(key === "_brushType"){
			if(val !== "line")
				Paints.selectedImage = val;
		}

		Events.creatorChange(key, val);

		/*
		 * Ak sa zmení vlastnosť štetca musí prekresliť štetec aby sa mohlo rovno malovať
		 */
		if(isIn(key, "_brushColor", "_brushSize", "_brushType")){
			Paints.rePaintImage(this.brushSize, this.brushColor);
		}

		/*
		 * Ak s zmení nejaká farba musí sa prekresliť aj view zobtrazujúci aktuálnu farbu
		 */
		if(isIn(key, "_fillColor", "_borderColor", "_fontColor", "_color", "_brushColor") && isDefined(this._view))
			this._view.init();

	}

	/**
	 * Zistí či bolo kliknuté na CreatorViewer alebo nie
	 *
	 * @param x
	 * @param y
	 * @returns {*} - vráti TRUE alebo FALSE
	 */
	clickIn(x, y){
		return isDefined(this._view) && this._visibleView ? this._view.clickIn(x, y) : false;
	}

	get items(){return this._items;}
	get object(){return this._object;}

	get radius(){return this._radius;}
	get color(){return this._fillColor;}
	get lineType(){return this._lineType;}
	get fontSize(){return this._fontSize;}
	get fillColor(){return this._fillColor;}
	get fontColor(){return this._fontColor;}
	get operation(){return this._operation;}
	get lineWidth(){return this._lineWidth;}
	get lineStyle(){return this._lineStyle;}
	get brushSize(){return this._brushSize;}
	get brushType(){return this._brushType;}
	get brushColor(){return this._brushColor;}
	get borderColor(){return this._borderColor;}
	get borderWidth(){return this._borderWidth;}

	set object(val){this._object = val;}
	set operation(val){this._operation = val; this._view.changeOperation();}
}class CreatorViewer extends Entity{
	constructor(position = new GVector2f(100, 100), size = new GVector2f(400, 40), data = {}){
		super("CreatorViewer", position, size, data);
		this._items 		= [];
		this._canvas		= document.createElement("canvas");
		this._context 		= this._canvas.getContext('2d');
		
		Entity.changeAttr(this,{
			fillColor: MENU_BACKGROUND_COLOR,
			borderColor: MENU_BORDER_COLOR,
			borderWidth: MENU_BORDER_WIDTH,
			radius: MENU_RADIUS
		});
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	init(){
		this.size.x = (MENU_WIDTH + MENU_OFFSET) * getLength(Creator.items) + MENU_OFFSET;
		this.size.y = MENU_HEIGHT + (MENU_OFFSET << 1);

		this._canvas.width 	= this._size.x;
		this._canvas.height	= MENU_HEIGHT << 4;
		this._context 		= this._canvas.getContext('2d');

		var counter = 0;
		var posY 	= 0;
		each(Creator.items, function(e, i, arr){
			posY = 0;
			arr[i]["offset"] = counter;

			doRect({
				//bgColor: e.image,
				x: counter,
				y: posY,
				width: MENU_WIDTH,
				height: MENU_HEIGHT,
				radius: this._radius,
				borderColor: this._borderColor,
				fillColor: this._fillColor,
				borderWidth: this._borderWidth,
				ctx: this._context
			});

			if(isDefined(e["values"]))
				e["values"].forEach(function(ee, ii){
					if(posY > 0)
						doRect({
							//bgColor: e.image,
							x: counter,
							y: posY,
							width: MENU_WIDTH,
							height: MENU_HEIGHT,
							radius: this._radius,
							borderColor: this._borderColor,
							fillColor: this._fillColor,
							borderWidth: this._borderWidth,
							ctx: this._context
						});

					if(ee == Creator[i])
						arr[i]["selectedIndex"] = ii;

					this._drawIcon(i, ee, counter, posY);
					posY += MENU_HEIGHT;
				}, this);
			else if(i == ATTRIBUTE_FONT_COLOR)
				fillText("Abc", counter + (MENU_WIDTH >> 1), posY + (MENU_HEIGHT >> 1), DEFAULT_FONT_SIZE, Creator.fontColor, 0, FONT_ALIGN_CENTER, this._context);
			else{
				arr[i]["selectedIndex"] = 0;
				this._drawIcon(i, Creator[i], counter, posY);
			}
			counter += MENU_WIDTH;
		}, this);
		this.changeOperation();
		//window.open(this._canvas.toDataURL("image/png"), '_blank');
	}

	_drawIcon(key, value, posX, posY, width = MENU_WIDTH, height = MENU_HEIGHT,  offset = 5){
		switch(key){
			case ATTRIBUTE_LINE_WIDTH :
				doLine({
					points: [posX + offset, posY + (height >> 1), posX + width - offset, posY + (height >> 1)],
					borderWidth: value,
					borderColor: MENU_BORDER_COLOR,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_RADIUS :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: 5,
					borderColor: MENU_BORDER_COLOR,
					radius: value,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_FILL_COLOR :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: 5,
					borderColor: MENU_BORDER_COLOR,
					fillColor: Creator[ATTRIBUTE_FILL_COLOR],
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BRUSH_TYPE:
				if(value === "line")
					doArc({
						position: [posX + (offset << 1), posY + (offset << 1)],
						size: [width - (offset << 2), height - (offset << 2)],
						fillColor: MENU_BACKGROUND_COLOR,
						ctx: this._context
					});
				else
					doRect({
						position: [posX, posY ],
						size: [width, height],
						bgImage: Paints.getBrush(value),
						ctx: this._context
					});
				break;
			case ATTRIBUTE_BRUSH_COLOR :
				doArc({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					fillColor: Creator[ATTRIBUTE_BRUSH_COLOR],
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BRUSH_SIZE :
				doArc({
					position: [posX + (width >> 1), posY + (height >> 1)],
					size: [value , value ],
					center: true,
					fillColor: MENU_BORDER_COLOR,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BORDER_COLOR :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: 5,
					borderColor: Creator[ATTRIBUTE_BORDER_COLOR],
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BORDER_WIDTH :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: value,
					borderColor: MENU_BORDER_COLOR,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_FONT_SIZE :
				fillText("Abc", posX + (width >> 1), posY + (height >> 1), value, MENU_BACKGROUND_COLOR, 0, FONT_ALIGN_CENTER, this._context);
				break;
			default :
				fillText(key, posX + (width >> 1), posY + (height >> 1), 7, MENU_FONT_COLOR, 0, FONT_ALIGN_CENTER, this._context);
		}
	}

	clickIn(x, y){
		if(y < this.position.y || x < this.position.x || x > this.position.x + this.size.x)
			return false;
		var counter =  this.position.x + MENU_OFFSET,
			click 	= false,
			num;
		this._items.forEach(function(e, i, arr){
			if(!click && x > counter && x < counter + MENU_WIDTH){
				if(y < this.position.y + MENU_OFFSET + MENU_HEIGHT){
					if(e["item"]["type"] == "color")
						pickUpColor(color => Creator.setOpt(e["key"], color));
					else
						arr[i]["itemsSelected"] = !e["itemsSelected"];
					click = true;
				}
				else if(e["itemsSelected"]){
					num = this.position.y + MENU_OFFSET;
					if(isDefined(e["item"]["values"]))
						e["item"]["values"].forEach(function(ee, ii){
							num += MENU_HEIGHT + MENU_OFFSET;
							if(!click && y > num && y < num + MENU_HEIGHT){
								Creator.setOpt(e["key"], ee);
								arr[i]["item"]["selectedIndex"] = ii;
								click = true;
								arr[i]["itemsSelected"] = !arr[i]["itemsSelected"];
							}
						});
				}
			}
			else if(e["itemsSelected"])
				arr[i]["itemsSelected"] = false;

			counter += MENU_OFFSET + MENU_WIDTH;
		}, this);
		return click;
	}

	static allowedOption(operation, allowed){
		switch(operation){
			case 1000:
				return isIn(OBJECT_RECT, allowed);
			case 1001:
				return isIn(OBJECT_ARC, allowed);
			case 1002:
				return isIn(OBJECT_PAINT, allowed);
			case 1003:
				return isIn(OBJECT_LINE, allowed);
			case 1004:
				return isIn(OBJECT_JOIN, allowed);
		}
		return false;
	}

	changeOperation(){
		this._items = [];
		each(Creator.items, function(e, i){
			if(!CreatorViewer.allowedOption(Creator.operation, e["allowedFor"]))
				return;

			this._items.push({
				item: e,
				key: i,
				itemsSelected: false
			});

		}, this);
	}

	draw(){
		var counter = MENU_OFFSET;
		this._items.forEach(function(e){
			doRect({
				bgImage: {
					x: e["item"]["offset"],
					y: e["item"]["selectedIndex"] * MENU_HEIGHT,
					w: MENU_WIDTH,
					h: MENU_HEIGHT,
					img: this._canvas
				},
				x: this.position.x + counter,
				y: this.position.y + MENU_OFFSET,
				width: MENU_WIDTH,
				height: MENU_HEIGHT,
				radius: this._radius,
				borderColor: this._borderColor,
				borderWidth: this._borderWidth
			});

			fillText(e["key"], this.position.x + counter + (MENU_WIDTH >> 1), this.position.y + MENU_OFFSET + (MENU_HEIGHT >> 1), 7, MENU_FONT_COLOR, 0, FONT_ALIGN_CENTER);

			if(e["itemsSelected"] && isDefined(e["item"]["values"])){
				var num = this.position.y + MENU_OFFSET;
				e["item"]["values"].forEach(function(ee, ii){
					num += MENU_OFFSET + MENU_WIDTH;
					doRect({
						bgImage: {
							x: e["item"]["offset"],
							y: ii * MENU_HEIGHT,
							w: MENU_WIDTH,
							h: MENU_HEIGHT,
							img: this._canvas
						},
						x: this.position.x + counter,
						y: num,
						width: MENU_WIDTH,
						height: MENU_HEIGHT,
						radius: this._radius,
						borderColor: this._borderColor,
						borderWidth: this._borderWidth
					});
				},this);
			}


			counter += MENU_WIDTH + MENU_OFFSET;
		}, this);
	}
}class EventManager{
	constructor(){
		this._history = [];

	}

	paintAddPoint(position, activeLayerName){//PaintManager.addPoint
		if(isSharing())
			Sharer.paint.addPoint(position, activeLayerName);
	}

	paintBreakLine(activeLayerName){//PaintManager.breakLine
		if(isSharing())
			Sharer.paint.breakLine(activeLayerName);
		Logger.log("bola ukončená čiara vo vrstve " + activeLayerName, LOGGER_PAINT_ACTION);
	}

	paintCleanUp(activeLayerName){//PaintManager.cleanUp
		if(isSharing())
			Sharer.paint.clean(activeLayerName);
		Logger.log("Bol vyčistený objekt " + this.constructor.name, LOGGER_OBJECT_CLEANED);
	}

	paintBrushChange(size, color, imageTitle){//PaintManager
		Logger.log("Bol prekreslený štetec " + size + ", " + color + ", " + imageTitle, LOGGER_PAINT_HISTORY);

	}

	paintUndo(layer){//PaintManager
		Logger.log("bolo zavolane undo na vrstvu " + layer, LOGGER_PAINT_HISTORY);
	}

	paintRedo(layer){//PaintManager
		Logger.log("bolo zavolane redo na vrstvu " + layer, LOGGER_PAINT_HISTORY);
	}

	layerCreate(title, type){//Scene.createLayer
		Logger.log("Vytvorila sa vrstva " + title + "typu: " + type, LOGGER_LAYER_CHANGE);
	}

	layerDelete(title){//Scene
		Logger.log("Vymazala sa vrstva " + title, LOGGER_LAYER_CHANGE);
	}

	creatorChange(key, val){//Creator.setOpt
		if(isSharing())
			Sharer.changeCreator(key, val);
		Logger.log("Creatorovi sa nastavuje " + key + " na " + val, LOGGER_CREATOR_CHANGE);
	}

	objectAdded(resend, object){//Scene.addToScene
		if(resend && isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_CREATE);
	}

	objectChange(object, attribute){//Entity.setAttr
		if(isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_CHANGE, [attribute]);
	}

	objectDeleted(resend, object){//Scene.remove
		if(resend && isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_DELETE);
	}

	objectMove(object){//Utils.Movement.move
		if(isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_MOVE);
	}

	sceneCleanUp(){//Scene.cleanUp

	}

	loadScene(){//Scene

	}
}class FileManager{
	constructor(){
		this._input = document.createElement("input");
		this._input.setAttribute("type", "file");
		this._input.setAttribute("value", "files");
		this._input.setAttribute("class", "hide");

		this._link = document.createElement("a");
		this._link.setAttribute("class", "hide");
		this._link.setAttribute("href", "");
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	saveFile(name, text, type = "text/plain"){
		this._link.href = URL.createObjectURL(new Blob([text], {type: type}));
		this._link.download = name;
		this._link.click();
	}

	saveImage(name, image){
		this._link.href = typeof image === "string" ? image : image.src;
		this._link.download = name;
		this._link.click();
	}

	loadImage(func){
		this._input.onchange = function(e){
			var reader = new FileReader();
			reader.onload = function(){
				var image = new Image();
				image.src = reader.result;
				func(image);
			};
			reader.readAsDataURL(e.target.files[0]);
		};
		this._input.click();
	}

	loadFile(func){
		this._input.onchange = function(e){
			var reader = new FileReader();
			reader.onload = () => func(reader.result);
			reader.readAsText(e.target.files[0]);
		};
		this._input.click();
	}


}

function saveFile(name, text, type){
	if(typeof type === "undefined")
		type = "text/plain";
	var file = new Blob([text], {type: type}),
		a   = document.getElementById("fileLink");

	a.href = URL.createObjectURL(file);
	a.download = name;
	a.click()
}

function saveImage(name, image){
	var a = document.getElementById("fileLink");
	a.href = image;
	a.download = name;
	a.click();
}

function loadImage(func){
	var el = document.getElementById("fileInput");
	el.onchange = function(e){
		var reader = new FileReader();
		reader.onload = function(){
			var image = new Image();
			image.src = reader.result;
			func(image);
		};
		reader.readAsDataURL(e.target["files"][0]);
	};
	el.click();
}

function loadFile(func){
	//var el = document.getElementById("fileInput");
	var el = document.createElement("input");
	el.setAttribute("id", "fileInput");
	el.setAttribute("type", "file");
	el.setAttribute("value", "files");
	el.setAttribute("class", "hide");

	el.onchange = function(e){
		var reader = new FileReader();
		reader.onload = () => func(reader.result);
		reader.readAsText(e.target["files"][0]);
	};
	el.click();
}


function saveSceneAsFile(fileName = "scene_backup"){
	var data = {
		scene: Scene.toObject(),
		creator: Creator.toObject(),
		paints: Paints.toObject(),
		type: 2500
	};

	saveFile(fileName, JSON.stringify(data));
}

function saveSceneAsTask(fileName = "default_task"){
	var result = {};

	if(Scene.getTaskObject(result)){
		var data = {
			scene: result["content"],
			results:  result["results"],
			title: fileName,
			type: 2501
		};
		saveFile(fileName, JSON.stringify(data));
	}
	else
		Alert.warning(result.error);
}

function loadTask(scene, results, title){
	if(Task)
		return Logger.error("načítava sa task ked už jeden existuje");

	var layer = Scene.createLayer(title, "task");
	each(scene, e => {
		e.layer = layer.title;
		Creator.create(e);
	});
	Task = new TaskManager(results, title, layer);
	Logger.notif("Task " + title + " bol úspešne vytvorený");
}

function loadSceneFromFile(){
	loadFile(function(content){
		//try{
		var data = JSON.parse(content);
		if(data["type"] && data["type"] === 2501)
			loadTask(data["scene"], data["results"], data["title"]);
		else{
			Scene.fromObject(data.scene);
			Creator.fromObject(data.creator);
			Paints.fromObject(data.paints);
		}
		/*
		 }
		 catch(err){
		 Logger.error("nepodarilo sa načítať súbor s dôvodu: ", err);
		 }
		 */
	});
}function showOptions(){
	$("#modalWindow ").find("#optionsForm").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
}

function showColors(){
	$("#modalWindow ").find("#colorPalete").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
}

function shareALl(el){
	Options.setOpt("grid", el.checked);
	document.getElementById("idShareMenu").checked = el.checked;
	document.getElementById("idSharePaints").checked = el.checked;
	document.getElementById("idShareObjects").checked = el.checked;
	document.getElementById("idShareCreator").checked = el.checked;
	document.getElementById("idShareLayers").checked = el.checked;
}

function showSharingOptions(){
	$("#modalWindow ").find("#shareForm").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
}

function showSavingOptions(){
	document.getElementById("idImageWidth").value = canvas.width;
	document.getElementById("idImageHeight").value = canvas.height;
	var div, el, counter = 0, parent = document.getElementById("layersSavionOptions");
	parent.innerHTML = "";
	each(Scene.layers, (a) => {
		div = document.createElement("div");

		el = document.createElement("input");
		el.setAttribute("type", "checkbox");
		el.setAttribute("class", "layerVisibility");
		el.setAttribute("id", "layer" + counter);
		el.setAttribute("checked", "true");

		el.setAttribute("name", a.title);
		div.appendChild(el);

		el = document.createElement("label");
		el.setAttribute("for", "layer" + (counter++));
		el.appendChild(document.createTextNode(a.title));
		div.appendChild(el);
		parent.appendChild(div);
	});

	$("#modalWindow ").find("#saveForm").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
}

function serializeSaveData(){
	var getValueIfExist = (e, val = false) => e ? (e.type == "checkbox" ? e.checked : e.value) : val;
	var result = [];
	result["width"] = getValueIfExist(document.getElementById("idImageWidth"), canvas.width);
	result["height"] = getValueIfExist(document.getElementById("idImageHeight"), canvas.height);
	result["name"] = getValueIfExist(document.getElementById("idImageName"));

	result["format"] = document.getElementById("idImageFormat");
	result["format"] = result["format"].options &&
		result["format"].selectedIndex &&
		result["format"].options[result["format"].selectedIndex] &&
		result["format"].options[result["format"].selectedIndex].value;

	var layerCheckboxes = document.getElementsByClassName("layerVisibility");
	result["selectedLayers"] = [];
	each(layerCheckboxes, e => e.checked && result["selectedLayers"].push(e.name));
	/*
	 for(var i=0 ; i<layerCheckboxes.length ; i++)
	 if(layerCheckboxes[i].checked)
	 result["selectedLayers"].push(layerCheckboxes[i].name);
	 */

	//TODO načítať farbu pozadia
	result["background"] = KEYWORD_TRANSPARENT;

	processImageData(result);
}

function processImageData(data){
	data["name"] = isString(data["name"]) || "desktopScreen";
	data["format"] = isString(data["format"]) || IMAGE_FORMAT_PNG;
	data["width"] = data["width"] || canvas.width;
	data["height"] = data["height"] || canvas.height;
	data["selectedLayers"] = data["selectedLayers"] || [];


	/*
	 * velký canvas kde sa všetko nakreslí
	 */
	var ca = document.createElement("canvas");
	ca.width = canvas.width;
	ca.height = canvas.height;
	var resContext = ca.getContext("2d");

	/*
	 * prekreslí pozadie ak je nastavene a nieje priesvitné
	 */
	if(isString(data["background"]) && data["background"] !== KEYWORD_TRANSPARENT){
		doRect({
			x: 0,
			y: 0,
			width: ca.width,
			height: ca.height,
			fillColor: data["background"],
			ctx: resContext
		});
	}

	/*
	 * Vykreslí vrstvy určené na vykresleni
	 */
	for(var i in data["selectedLayers"]){
		if(data["selectedLayers"].hasOwnProperty(i)){
			//TODO vykreslenie jednotlivých vrstiev
		}
	}

	//TODO toto zakomentovať lebo to prekresluje všetko
	resContext.drawImage(canvas, 0, 0);

	/*
	 * malý canvas kde sa prekreslí velký canvas
	 */
	var resCanvas =  document.createElement("canvas");
	resCanvas.width = data["width"];
	resCanvas.height = data["height"];
	resContext = resCanvas.getContext("2d");
	resContext.drawImage(ca, 0, 0, resCanvas.width, resCanvas.height);


	/*
	 * uloženie súboru
	 */
	Files.saveImage(data["name"], resCanvas.toDataURL(data["format"]));
	closeDialog();
}

function serializeShareData(){
	var getValueIfExists = e => e ? (e.type == "checkbox" ? e.checked : e.value) : false;
	var result = {};
	result["realTime"] = getValueIfExists(document.getElementById("idRealtimeSharing"));
	result["maxWatchers"] = getValueIfExists(document.getElementById("idMaxWatchers"));
	result["password"] = getValueIfExists(document.getElementById("idSharingPassword"));
	result["detailMovement"] = getValueIfExists(document.getElementById("idDetailMovement"));

	result["shareMenu"] = getValueIfExists(document.getElementById("idShareMenu"));
	result["sharePaints"] = getValueIfExists(document.getElementById("idSharePaints"));
	result["shareObjects"] = getValueIfExists(document.getElementById("idShareObjects"));
	result["shareCreator"] = getValueIfExists(document.getElementById("idShareCreator"));
	result["shareLayers"] = getValueIfExists(document.getElementById("idShareLayers"));
	
	closeDialog();
	Sharer.startShare(result);
}class ChatViewer{
 				constructor(title, myName, sendMessage){
 					this._myName		= myName;
 					this._title 		= title;
 					this._createHTML();
 					this._isShifDown	= false;
 					this._textC 		= document.getElementById("textC");
 					this._histC 		= document.getElementById("histC");
 					this._chatW			= document.getElementById("chatW");
 					this._histW 		= document.getElementById("hist");
 					this._sendMessage 	= sendMessage;
 					this._init(document.getElementById("headC"));
 					this.hide();
 				}

 				_createHTML(){
 					var result = '<div id="chatW"><div id="headC"><span id="chatTitle">';
 					result += this._title + '</span><div class="headerButton" id="hideChat">×</div>';
 					result += '<div class="headerButton" id="toggleChat">-</div>';
 					result += '<div class="headerButton" id="clearChat">C</div></div>';
 					result += '<div id="histC"><div id="hist"></div></div>';
 					result += '<div id="textC" contenteditable="true"></div></div>';

 					var el = document.createElement("div");
 					el.innerHTML = result;
 					document.body.appendChild(el.firstChild);
 					//document.body.innerHTML += result;
 				}

 				hide(){
 					this._chatW.style.display = "none";
 				}

 				show(){
 					this._chatW.style.display = "block";
 				}

 				_init(headC){
 					document.getElementById("chatTitle").innerHTML = this._title;
 					document.getElementById("toggleChat").onclick = () => this.toggleChat();
 					document.getElementById("clearChat").onclick = () => this._histW.innerHTML = "";
 					document.getElementById("hideChat").onclick = () => this.hide();
 					headC.onmousedown = ee => {
						if(ee.target != headC)
							return false;
						var backup = window.onmousemove;
						window.onmousemove = e => this._check(e, ee, this._chatW);
						window.onmouseup = e => window.onmousemove = backup;
					};

		 			this._textC.onkeydown = e => {
		 				if(e.keyCode === SHIFT_KEY)
							this._isShifDown = true;

						e.target.onkeyup = e => {
			 				if(e.keyCode === SHIFT_KEY)
			 					this._isShifDown = false;
			 				this._updateData();
			 			};

		 				if(e.keyCode == ENTER_KEY && !this._isShifDown){
		 					this._prepareMessage();	
		 					return false;
		 				}
		 			};
 				}

 				_updateData(size = true, offset = true){
	 				if(size)
	 					this._histC.style.height = (this._chatW.offsetHeight - this._textC.offsetHeight - 30) + "px";

	 				if(offset)
						this._histC.scrollTop = this._histC.scrollHeight - this._histC.clientHeight;
	 			}

	 			_check(e, f, g){
					var h = (a, b, c, d) => (Math.max(Math.min(a - b, c - d), 0)) + "px";
					g.style.top = h(e.clientY, f.offsetY, window.innerHeight, g.offsetHeight);
					g.style.left = h(e.clientX, f.offsetX, window.innerWidth, g.offsetWidth);
				}

				toggleChat(){
					var toggle = (height, display) =>{
							this._chatW.style.height  = height + "px";
							this._histC.style.display = display;
							this._textC.style.display = display;
					};
					this._chatW.style.height == "28px" ? toggle(404, "block") : toggle(28, "none");
				}

				recieveMessage(msg, sender){
	 				var string;
	 				if(this._myName != sender){
	 					string = '<div class="messageC">';
	 					string += '<div class ="senderName">' + getFormattedDate() + ' - ';
	 					string += sender + ':</div>';
	 				}
	 				else{
	 					string = '<div class="messageC myMessage">';
	 				}
	 				
	 				string += '<div class="messageText">' + msg + '</div></div>';

	 				this._histW.innerHTML += string;

	 				this._updateData(false);
	 			}

	 			_prepareMessage(){
	 				var context = this._textC.innerHTML;
	 				this._sendMessage(context);

	 				this._textC.innerHTML = "";
	 			}
 			}class InputManager{
	constructor(){
		this._keys = [];
		this._timer = false;
		this._buttons = [];
		this._pressPosition = new GVector2f();
		this._mousePos = new GVector2f();
		this._lastTouch = false;
		this._hist = {};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	get mousePos(){return this._mousePos;}

	_initWindowListeners(){
		window.onresize = function(){
			initCanvasSize();
			draw();
		};

		window.orientationchange = function(){
			initCanvasSize();
			draw();
		};

		window.onbeforeunload= function(event){
			event.returnValue = "Nazoaj chceš odísť s tejto stránky???!!!";
		};

		window.onkeydown = e => {
			this._keyDown(e.keyCode);

			if(!e.target.onkeyup)
				e.target.onkeyup = e => {
					this._keyUp(e.keyCode);
					e.target.onkeyup = false;
				}
		};

		window.addEventListener('orientationchange', initCanvasSize, false)
	}

	initListeners(target){
		this._initWindowListeners();

		target.onclick = function(){draw();};

		target.onmousepress = function(e){
			return Listeners.mousePress(e.position.getClone(), e.button);
		};

		target.ondblclick = function(e){
			Listeners.mouseDoubleClick(new GVector2f(e.offsetX, e.offsetY), e.button);
		};

		target.onmousedown = e => {
			this._buttonDown(e);
			Listeners.mouseDown(new GVector2f(e.offsetX, e.offsetY), e.button);

			e.target.onmouseup = e => {
				if(!this.isButtonDown(e.button))
					return  false;
				this._buttonUp(e);

				e.target.onmousemove = false;
				e.target.onmouseup = false;

				Listeners.mouseUp(new GVector2f(e.offsetX, e.offsetY), e.button);
			};
			e.target.onmousemove = e => {
				this._mouseMove(e);
				Listeners.mouseMove(new GVector2f(e.offsetX, e.offsetY), e["movementX"], e["movementY"]);
			}
		};

		$(target).bind('contextmenu', () => false);


		target.addEventListener("touchstart", e => {
			this._lastTouch = getMousePos(target, e);
			Input._buttonDown({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});

			Listeners.mouseDown(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
			
			e.target.addEventListener("touchmove", e => {
				Input._mouseMove({offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});
				var mov = getMousePos(target, e);
				mov.x -=  this._lastTouch.x;
				mov.y -=  this._lastTouch.y;
				this._lastTouch = getMousePos(target, e);
				Listeners.mouseMove(new GVector2f(this._lastTouch.x, this._lastTouch.y), mov.x, mov.y);

			}, false);


			e.target.addEventListener("touchend", () => {
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input._buttonUp({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});
				Listeners.mouseUp(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
			}, false);

			e.target.addEventListener("touchcancel", () => {
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input._buttonUp({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});
				Listeners.mouseUp(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
			}, false);
		}, false);
	}

	_keyDown(val){
		this._keys[val] = true;

		Logger.log("stlačené klavesa " + val, LOGGER_KEY_EVENT);
	};

	_keyUp(val){
		this._keys[val] = false;
		Listeners.keyUp(val, this.isKeyDown(L_CTRL_KEY));

		if(!this._hist[val])
			this._hist[val] = 0;

		this._hist[val]++;

		Logger.log("pustená klavesa " + val, LOGGER_KEY_EVENT);
	};

	isKeyDown(val){
		return this._keys[val];
	};

	_checkPress(button){
		if(SelectedText)
			return;
		var inst = this;
		this._buttons[button] = false;
		canvas.onmousepress({
			position: inst._pressPosition,
			button: button
		});
		Logger.log("podržané tlačítko myši ::" + button + "::" + inst._pressPosition.x + "::"+ inst._pressPosition.y, LOGGER_MOUSE_EVENT);

		if(this._timer){}
		this._clearTimer();
	};

	_clearTimer(){
		clearTimeout(this._timer);
		this._timer = false;
	};

	_mouseMove(val){
		this._mousePos.set(val.offsetX, val.offsetY);

		if(isSharing())
			Sharer.mouseChange();
		if(this._timer)
			if(this._pressPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION)
				this._clearTimer();
	};

	_buttonDown(val){
		this._buttons[val.button] = true;
		if(val.button == LEFT_BUTTON && isSharing())
				Sharer.mouseChange();

		var t = this;
		if (this._timer)
			this._clearTimer();
		this._timer = setTimeout(function(){t._checkPress(val.button)}, TOUCH_DURATION);
		this._pressPosition.set(val.offsetX, val.offsetY);

		Logger.log("stlačené tlačítko myši ::" + val.button + "::" + val.offsetX + "::"+ val.offsetY, LOGGER_MOUSE_EVENT);
	};

	_buttonUp(val){
		if (this._timer)
			this._clearTimer();
		this._buttons[val.button] = false;
		if(val.button == LEFT_BUTTON && isSharing())
			Sharer.mouseChange();
		Logger.log("pustené tlačítko myši ::" + val.button + "::" + val.offsetX + "::"+ val.offsetY, LOGGER_MOUSE_EVENT);
	};

	isButtonDown(val){
		return this._buttons[val];
	};
}
class Layer{
	constructor(title, layerType = ""){
		this._objects 	= {};
		this._visible 	= true;
		this._title 	= title;
		this._paint 	= null;
		this._locked 	= false;
		this._drawPaint	= true;
		this._layerType = layerType;
	};

	get locked(){return this._locked || this._layerType !== ""}
	get taskLayer(){return this._layerType === "layer";}
	get guiLayer(){return this._layerType === "gui";}
	get drawPaint (){return this._drawPaint;}
	get layerType(){return this._layerType;}
	get visible(){return this._visible;}
	get objects(){return this._objects;}
	get title(){return this._title;}
	get paint(){
		if(isNull(this._paint))
			this._paint = new Paint();
		return this._paint;
	};

	set drawPaint(val){this._drawPaint = val;}
	set visible(val){this._visible = val;}
	set objects(val){this._objects = val;}
	set title(val){this._title = val;}

	cleanUp(){
		this.forEach(e => callIfFunc(e.cleanUp));
		this._objects = [];
		Logger.log("Bol vyčistený objekt " + this.constructor.name + "[" + this._title + "]", LOGGER_OBJECT_CLEANED);
	};

	get(id){
		return this._objects[id];
	}

	draw(){
		if(!this.visible)
			return;

		this.forEach(e => e.visible && e.draw());

		if(this._drawPaint)
			this.paint.draw();
	};

	add(element){
		this._objects[element.id] = element;
	};

	remove(element){
		delete this._objects[element.id];
	};

	forEach(func){
		each(this._objects, e => func(e));
	};
}const BUTTON_NEW_LAYER 		= 100;
const BUTTON_DELETE_LAYER 	= 101;
const BUTTON_HIDE_PANEL 	= 102;

class LayersViewer extends Entity{
	constructor(){
		super("LayerViewer", new GVector2f(1300, 100), new GVector2f(180, 500));
		Entity.changeAttr(this, {
			fillColor: MENU_BACKGROUND_COLOR,
			borderColor: MENU_BORDER_COLOR,
			borderWidth: 2
		});

		this._buttonFillColor 	= MENU_DISABLED_BG_COLOR;
		this._activeLayerColor  = MENU_DISABLED_BG_COLOR;
		this._minimalized		= false;
		this._layerPanelHeight 	= 50;
		this._fontSize 			= 20;
		this._fontColor 		= MENU_FONT_COLOR;
		this._checkBoxSize 		= 30;
		this._checkYOffset 		= ((this._layerPanelHeight - this._checkBoxSize) >> 1);
		this._activeLayer		= DEFAULT_LAYER_TITLE;
		this._layers 			= {};
		this._offset			= 1;
		this._buttonSize 		= 40;
		this._layersCount 		= 0;

		each(Scene._layers, e => this.createLayer(e), this);
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	_toggleMinimalize(){
		this._minimalized = !this._minimalized;
	}

	/**
	 * vytvorý novú vrstvu v LayerVieweri a v scéne
	 *
	 * @param layer - novovytvorená vrstva
	 */
	createLayer(layer){
		var order = this._offset + this._layersCount++;
		this._layers[layer.title] = {
			posY: this._layerPanelHeight * order,
			offset : order,
			posX: this.position.x,
			layer: layer
		};
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y) || !Input.isButtonDown(LEFT_BUTTON))
			return false;
		var i = this._getLayerOfYPos(y),
			offsetX = (this.size.x - this._buttonSize * 3) >> 2,
			offsetY = (this._layerPanelHeight - this._buttonSize) >> 1,
			j, xx, yy;

		if(i !== 0 && this._minimalized)
			return false;

		if(i == 0){
			for(j=0 ; j<3 ; j++){
				xx = this.position.x + this._buttonSize * j + offsetX * (j + 1);
				yy = this.position.y + offsetY;
				if(x > xx && y > yy && x < xx + this._buttonSize && y < yy + this._buttonSize){
					this._buttonClick(j);
					break;
				}
			}
		}
		else 
			each(this._layers, function(e){
				if(e.offset === i)
					this._activeLayer = e.layer.title;
			}, this);
		return true;
	}


	/**
	 * Vymaže vrstvu s LayerViewera a zo scény
	 *
	 * @param title - názov vrstvy ktorá sa má vymazař
	 */
	deleteLayer(title){
		each(this._layers, function(e){
			if(e.offset > this._layers[title].offset){
				e.offset--;
				e.posY -= this._layerPanelHeight;
			}

			if(e.offset === this._layers[title].offset)
				this._activeLayer = e.layer.title;
		}, this);

		this._layersCount--;

		/*
		 * Ak sa maže posledná vrstva nastaví sa ako aktualna defaultná vrstva
		 */
		if(this._activeLayer === title)
			this._activeLayer = DEFAULT_LAYER_TITLE;

		delete this._layers[title];
	}

	/**
	 * Vykoná operácie po kliknutí na tlačítko
	 *
	 * @param order - poradie tlačítka na ktorá bolo kliknuté
	 * @private
	 */
	_buttonClick(order){
		switch(order){
			case 0://create layer
				this._minimalized || Scene.createLayer("layer" + (this._offset + this._layersCount));
				break;
			case 1://remove layer
				this._minimalized || Scene.deleteLayer(this._activeLayer);
				break;
			case 2:
				this._toggleMinimalize();
				break;
			default:
				Logger.error("neznáme tlačítko v layerManagerovy");
		}
	}

	_getLayerOfYPos(num){
		return parseInt((num - this.position.y) / this._layerPanelHeight);
	}

	clearLayer(num){
		this._layers[this._getLayerOfYPos(num)].layer.cleanUp();
	}

	renameLayer(num){
		var i 		= this._getLayerOfYPos(num),
			layer 	= this._layers[i].layer;
		getText(layer.title, this.position.x, this.position.y + i * this._layerPanelHeight, val => layer.title = val);
	}

	toggleVisibilityOfPaint(num){
		var i = this._getLayerOfYPos(num);

		each(this._layers, function(e){
			if(e.offset === i)
				e.layer.drawPaint = !e.layer.drawPaint;
		}, this);
	}

	toggleVisibilityOfLayer(num){
		var i = this._getLayerOfYPos(num);

		each(this._layers, function(e){
			if(e.offset === i)
				e.layer.visible = !e.layer.visible;
		}, this);
		//this._layers[i].layer.visible = !this._layers[i].layer.visible;
	}

	_drawLayer(layer){
		var checkColor 	= layer.layer._visible ? CHECKBOX_COLOR_TRUE : CHECKBOX_COLOR_FALSE,
			//posY 		= this.position.y + order * this._layerPanelHeight;
			posY 		= this.position.y + layer.posY;
		doRect({
			position: [this.position.x, posY],
			size: [this.size.x, this._layerPanelHeight],
			radius: MENU_RADIUS,
			draw: true,
			borderColor: this._borderColor,
			borderWidth: this.borderWidth,
			fill: this._activeLayer == layer.layer.title,
			fillColor: this._activeLayerColor
		});

		fillText(layer.layer.title, this.position.x, posY, this._fontSize, this._fontColor, [7, 5]);

		doRect({
			x: this.position.x + this.size.x - this._checkBoxSize - this._checkYOffset,
			y: posY + this._checkYOffset,
			size: this._checkBoxSize,
			radius: 3,
			fillColor: checkColor,
			borderColor: this.borderColor
		});
	}

	draw(){
		doRect({
			position: this.position,
			width: this.size.x,
			height: this._minimalized ? this._layerPanelHeight : this.size.y,
			//size: this.size,
			radius: MENU_RADIUS,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth
		});



		var offsetX = (this.size.x - this._buttonSize * 3) >> 2,
			offsetY = (this._layerPanelHeight - this._buttonSize) >> 1,
			offset = 5,
			inst = this,
			getLinesSur = function (i, x, y){
				var list = [
					[
						[(inst._buttonSize >> 1) + x, offset + y, (inst._buttonSize >> 1) + x, inst._buttonSize - offset + y],
						[offset + x, (inst._buttonSize >> 1) + y, inst._buttonSize - offset + x, (inst._buttonSize >> 1) + y]
					],
					[
						[(offset << 1) + x, (offset << 1) + y, inst._buttonSize - (offset << 1) + x, inst._buttonSize - (offset << 1) + y],
						[inst._buttonSize - (offset << 1) + x , (offset << 1)+ y, (offset << 1) + x, inst._buttonSize - (offset << 1) + y]
					],
					[offset + x, (inst._buttonSize >> 1) + y, inst._buttonSize - offset + x, (inst._buttonSize >> 1) + y]
				];
				return list[i];
			};

		for(var i=0 ; i<3 ; i++){
			var x = this.position.x + this._buttonSize * i + offsetX * (i + 1);
			var y = this.position.y + offsetY;
			doArc({
				x: x,
				y: y,
				width: this._buttonSize,
				height: this._buttonSize,
				draw:true,
				borderColor: this.borderColor,
				borderWidth: this.borderWidth,
				fillColor: this._buttonFillColor
			});
			doLine({
				points: getLinesSur(i, x, y),
				borderColor: this.borderColor,
				borderWidth: this.borderWidth
			})
		}
		if(!this._minimalized)
			each(this._layers, e => this._drawLayer(e), this);
	}
	get activeLayerName(){
		return this._activeLayer;
	}
	get activeLayer(){
		return Scene.getLayer(this.activeLayerName);
	}
}class MenuManager{
	constructor(position = new GVector2f(), size = new GVector2f(MENU_WIDTH, MENU_HEIGHT), key = "mainMenu", parent = null){
		if(parent != null)
			this._items = parent._allItems[key];

		this._key 						= key;
		this._parent 					= parent;
		this._toolActive 				= false;
		this._fontColor 				= MENU_FONT_COLOR;
		//this._backgroundColor 		= "rgb(153, 217, 234)";
		this._backgroundColor 			= MENU_BACKGROUND_COLOR;
		this._disabledBackgroundColor 	= MENU_DISABLED_BG_COLOR;
		this._position 					= position.add(MENU_OFFSET);
		this._offset 					= MENU_OFFSET;
		this._size 						= size;
		this._vertical 					= parent != null;

		this._canvas 					= parent == null ? document.createElement("canvas") : parent._canvas;
		this._context					= null;
		this._tmpDrawArray				= [];
		this._visible 					= true;
		this._visibleSubMenu 			= false;
		this._subMenus					= {};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	get position(){return this._position;}
	get size(){return this._size;}
	set visible(val){this._visible = val;}

	static _changeDataByComponents(data){
		if(!Components.tools() && Components.draw()) //ak je kreslenie a nie nastroje musí sa nastaviť kreslenie
			Creator.operation = OPERATION_DRAW_PATH;

		data["mainMenu"]["tools"]["visible"] = Components.tools();
		data["mainMenu"]["content"]["visible"] = Components.content();
		data["mainMenu"]["sharing"]["visible"] = Components.share();
		if(!Components.load() && !Components.save() && !Components.screen())
			data["mainMenu"]["file"]["visible"] = false;
		else{
			data["file"]["loadXML"]["visible"] = Components.load();
			data["file"]["saveXML"]["visible"] = Components.save();
			data["file"]["saveImg"]["visible"] = Components.screen();
		}


		return data;
	}
	init(data){
		data = MenuManager._changeDataByComponents(data);
		var array = [],
			counter = new GVector2f(),
			w = this._size.x + MENU_OFFSET,
			h = this._size.y + MENU_OFFSET,
			num = 0,
			store = {},
			tmp;
		each(data, function(eee, ii){
			array[ii] = [];
			each(data[ii], function(e, i){
				if(isDefined(e["values"])){
					e.values.forEach(function(ee){
						tmp = {};
						tmp["visible"] = e["visible"];
						tmp["disabled"] = e["disabled"];
						tmp["key"] = i.replace("XYZ ", "");

						counter.x > counter.y && counter.y++ || counter.x++;

						tmp["posX"] = counter.x;
						tmp["posY"] = counter.y;
						tmp["value"] = ee;
						this._tmpDrawArray.push({
							x: counter.x,
							y: counter.y,
							value:  ee,
							key: i
						});
						array[ii].push(tmp);
					}, this);
					return;
				}

				e["key"] = i;

				counter.x > counter.y && counter.y++ || counter.x++;

				e["posX"] = counter.x;
				e["posY"] = counter.y;
				this._tmpDrawArray.push({
					x: counter.x,
					y: counter.y,
					key: i
				});

				array[ii].push(e);
			}, this);

			if(isIn(ii, "tools", "file", "content", "sharing"))
				store[ii] = num;
			if(ii !== "mainMenu" && data["mainMenu"][ii]["visible"])
				num++;
		}, this);


		this._canvas.width 	= this._tmpDrawArray[this._tmpDrawArray.length - 1].x * this._size.x + this._size.x;
		this._canvas.height	= this._tmpDrawArray[this._tmpDrawArray.length - 1].y * this._size.y + this._size.y;
		this._context 		= this._canvas.getContext('2d');

		this._redraw();


		this._items 	= array["mainMenu"];
		this._allItems 	= array;

		each(store, (e, i) => {
			this._subMenus[i] = new MenuManager(new GVector2f(e * w, h), new GVector2f(this._size.x, this._size.y), i, this);
		}, this);
		draw();
	}

	isToolActive(){
		var tmp = this._toolActive;
		this._toolActive = false;
		return tmp;
	};

	/*
	 * CLICK
	 */

	clickIn(x, y) {
		if(!this._visible)
			return false;

		var posY = this._position.y,
			posX = this._position.x,
			result = false;

		if(this._visibleSubMenu)
			result = this._subMenus[this._visibleSubMenu].clickIn(x, y);

		this._visibleSubMenu = false;

		if(result)
			return result;

		this._items.forEach(function(e) {
			if (!e["visible"] || result)
				return false;

			if(x > posX && x < posX + this._size.x && y > posY && y < posY + this._size.y ){
				result = e;
				this._doClickAct(e);
			}

			if(this._vertical)
				posY += this._size.y + this._offset;
			else
				posX += this._size.x + this._offset;
		}, this);

		if(result)
			return result;
	};

	disabled(menu, button, value){
		if(isDefined(this._subMenus[menu]))
			each(this._subMenus[menu]._items, function(e, i, arr){
				if(e.key === button)
					arr[i].disabled = value;
			});
	}

	_doClickAct(val){
		var key = val.key;

		if(val.disabled){
			Logger.log("Klikol v menu na disablovanu položku " + key, LOGGER_MENU_CLICK);
			return;
		}

		Logger.log("Klikol v menu na položku " + key, LOGGER_MENU_CLICK);
		if(isIn(key, "file", "content", "sharing")){
			this._visibleSubMenu = key;
			return;
		}
		switch(key){
			case "tools":
				this._toolActive = "tools";
				break;
			case "color":
				pickUpColor(color => Creator.setOpt(ATTRIBUTE_FILL_COLOR, color));
				break;
			case "options":
				showOptions();
				break;
			case "draw":
				Creator.operation = OPERATION_DRAW_PATH;
				break;
			case "rect":
				Creator.operation = OPERATION_DRAW_RECT;
				break;
			case "image":
				Creator.operation = OPERATION_DRAW_IMAGE;
				break;
			case "line":
				Creator.operation = OPERATION_DRAW_LINE;
				break;
			case "startShare":
				showSharingOptions();
				break;
			case "loadLocalImage":
				Content.setContentImage();
				break;
			case "loadLocalHTML":
				Content.setContentHTML();
				break;
			case "saveImg":
				//saveCanvasAsFile();
				showSavingOptions();
				break;
			case "watch":
				window.open(Sharer.getWatcherUrl(), '_blank');
				break;
			case "saveTask":
				saveSceneAsTask();
				break;
			case "saveXML":
				saveSceneAsFile();
				break;
			case "loadXML":
				loadSceneFromFile();
				break;
			case "arc":
				Creator.operation = OPERATION_DRAW_ARC;
				break;
			case "defaultBrushes":
				Paints.setImage(val.value);
				break;
			case "defaultWidth":
				Creator.setOpt(ATTRIBUTE_LINE_WIDTH, val.value);
				this._parent._redraw();
				break;
			case "join":
				Creator.operation = OPERATION_DRAW_JOIN;
				break;
			case "lineWidth":
				this._visibleSubMenu = key;
				break;
		}
	}

	/*
	 * PRESS
	 */

	_doPressAct(index, pos){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this._visibleSubMenu = index;
				break;
			case "file":
				actContextMenu = new ContextMenuManager(pos, [], false, "file");
				break;
		}
		return index;
	};

	pressIn(x, y){
		if(!this._visible)
			return false;
		var posY = this._position.y,
			posX = this._position.x,
			result = false;

		if(this._visibleSubMenu)
			result = this._subMenus[this._visibleSubMenu].clickIn(x, y);

		if(result)
			return result;

		this._items.forEach(function(e) {
			if (!e["visible"] || result)
				return false;

			if(x > posX && x < posX + this._size.x && y > posY && y < posY + this._size.y ){
				result = e;
				this._doPressAct(e.key, new GVector2f(x, y));
			}

			if(this._vertical)
				posY += this._size.y + this._offset;
			else
				posX += this._size.x + this._offset;

		}, this);
		if(result)
			return result;
	};

	/*
	 * DRAW
	 */

	draw(){
		if(!this._items || !this._visible)
			return;
		var posY = this._position.y,
			posX = this._position.x;


		context.lineWidth = MENU_BORDER_WIDTH;
		context.strokeStyle = MENU_BORDER_COLOR;
		context.fillStyle = this._backgroundColor;

		this._items.forEach(function(e){
			if(!e["visible"])
				return;
			var bgColor = e["disabled"] ? this._disabledBackgroundColor : this._backgroundColor;
			if(e["key"] == "color" )
				bgColor = Creator.color;
			doRect({
				position: [posX, posY],
				size: this._size,
				radius: MENU_RADIUS,
				fillColor: bgColor,
				borderWidth: MENU_BORDER_WIDTH,
				borderColor: MENU_BORDER_COLOR
			});

			context.drawImage(this._canvas, e["posX"] * this._size.x, e["posY"] * this._size.y, this._size.x, this._size.y, posX, posY, this._size.x, this._size.y);

			if(this._vertical)
				posY += this._size.y + this._offset;
			else
				posX += this._size.x + this._offset;
		}, this);


		if(this._visibleSubMenu)
			this._subMenus[this._visibleSubMenu].draw();
	};

	_redraw(){
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this._tmpDrawArray.forEach(function(e){
			this._drawIcon(e, e.x * this._size.x, e.y * this._size.y, 5, this._size.x, this._size.y, this._fontColor);
		}, this);

		Logger.log("prekresluje sa " + this.constructor.name, LOGGER_DRAW);
	}

	_drawIcon(type, x, y, offset = 5, width = this._size.x, height = this._size.y, strokeColor = DEFAUL_STROKE_COLOR, strokeWidth = DEFAULT_STROKE_WIDTH){
		var img;
		switch(type.key){
			case "arc":
				doArc({
					position: [x + offset, y + offset],
					size: [width - (offset << 1), height - (offset << 1)],
					borderColor: strokeColor,
					borderWidth: strokeWidth,
					ctx: this._context
				});
				break;
			case "rect":
				doRect({
					position: [x + offset, y + offset],
					size: [width - (offset << 1), height - (offset << 1)],
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				break;
			case "line":
				doLine({
					points: [new GVector2f(x + offset, y + offset),
							 new GVector2f(x + width - (offset << 1), y + (height >> 1)),
							 new GVector2f(x + offset, y +  height - (offset << 1)),
							 new GVector2f(x + width - (offset << 1), y + offset)],
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				break;
			case "text":
				fillText("TEXT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "ctrl":
				fillText("CTRL", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "file":
				fillText("FILE", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "content":
				fillText("CONT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "watch":
				fillText("WATCH", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "shareOptions":
				fillText("OPT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "stopShare":
				fillText("STOP", x + (width >> 1), y + (height >> 1), height  / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "startShare":
				fillText("START", x + (width >> 1), y + (height >> 1), height  / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "sharing":
				fillText("SHARE", x + (width >> 1), y + (height >> 1), height / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadLocalImage":
				fillText("locImg", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadLocalHTML":
				fillText("locHTML", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadExternalImage":
				fillText("extImg", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadExternalHTML":
				fillText("extHTML", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "saveImg":
				fillText("SAVE IMG", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "saveXML":
				fillText("SAVE XML", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "saveTask":
				fillText("SAVE TASK", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadXML":
				fillText("LOAD XML", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "options":
				fillText("OPT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "table":
				var lines = 4;
				var line = (height - (offset << 1)) / lines;
				var points = [[x + (width >> 1), y + offset, x + (width >> 1), y - offset + height]];
				for(var i=1, data = line ; i<lines ; i++, data += line)
					points.push([x + offset, y + offset + data, x - offset + width, y + offset + data]);

				doRect({
					position: [x + offset, y + offset],
					size: [width - (offset << 1), height - (offset << 1)],
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				
				doLine({
					points: points,
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				//fillText("TAB", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "class":
				fillText("CLASS", x + (width >> 1), y + (height >> 1), height / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "image":
				fillText("IMG", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "tools":
				fillText("TOOLS", x + (width >> 1), y + (height >> 1), height / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "polygon":
				fillText("POLY", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;

			case "help":
				fillText("HELP", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "defaultWidth":
				doLine({
					points: [x + offset, y + (height >> 1), x + width - offset, y + (height >> 1)],
					borderWidth: type.value,
					borderColor: strokeColor,
					ctx: this._context
				});
				break;
			case "brushes":
				img = Paints.selectedImg;
				if(img == null)
					return;
				this._context.drawImage(img, 0, 0, img.width, img.height, x , y, width, height);
				break;
			case "lineWidth":
				doLine({
					points: [x + offset, y + (height >> 1), x + width - offset, y + (height >> 1)],
					borderWidth: Creator.lineWidth,
					borderColor: this._fontColor,
					ctx: this._context
				});

				break;
			case "defaultBrushes":
				Paints.addBrush(type.value);
				img = Paints.getBrush(type.value);
				this._context.drawImage(img, 0, 0, img.width, img.height, x , y, width, height);
				break;
			case "draw":
				drawQuadraticCurve([new GVector2f(x + offset, y + offset),
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + width - (offset << 1), y + (height >> 1))],
					[new GVector2f(x + offset, y + offset), new GVector2f(x + offset, y +  height - (offset << 1))],
					[new GVector2f(x + width - (offset << 1), y + (height >> 1)), new GVector2f(x + width - (offset << 1), y + offset)],
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + offset, y + offset)]], strokeWidth, strokeColor, this._context);
				break;
			case "join":
				fillText("JOIN", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
		}
	}
}class OptionsManager{
	constructor(){
		this._options = {
			snapping: {
				id: "idAllowedSnapping",
				attr: "value",
				val: 0 //0, 30, 45, 90
			},
			grid: {
				id: "idShowGrid",
				attr: "checked",
				val: true
			},
			showLayersViewer: {
				id: "idShowLayersViewer",
				attr: "checked",
				val: true
			},
			shadows: {
				id: "idShadows",
				attr: "checked",
				val: true
			},
			movingSilhouette: {
				id: "idMovingSilhouette",
				attr: "checked",
				val: false
			}
		};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	_processAndSetValueIfExistById(id, val, attr){
		var e = document.getElementById(id);
		if(e){
			e.value = this[val];
			e.onchange = e => this.setOpt(val, e.target[attr], false);
		}
	}

	init(){
		each(this._options, (e, i) => this._processAndSetValueIfExistById(e["id"], i, e["attr"]));
	}

	get grid(){return this._options["grid"]["val"];}
	get shadows(){return this._options["shadows"]["val"];}
	get snapping(){return this._options["snapping"]["val"];}
	get showLayersViewer(){return this._options["showLayersViewer"]["val"];}
	get movingSilhouette(){return this._options["movingSilhouette"]["val"];}


	setOpt(key, val, setElement = true){
		var obj = this._options[key];
		if(setElement){
			var e = document.getElementById(obj["id"]);
			if(e)
				e[obj["attr"]] = val
		}

		if(key === "showLayersViewer")
			Entity.setAttr(Layers, "visible", val);
		
		Logger.log("nastavila sa možnosť " + key + " na hodnotu " + val, LOGGER_CHANGE_OPTION);
		obj["val"] = val;
		draw();
	}
}class PaintManager{
	constructor(){
		this._brushes			= [];
		this._selectedImage		= null;
		this._selectedImageName	= null;
		this._selectedBrush		= null;
		this._action			= PAINT_ACTION_BRUSH;
		this._paintHistory		= [];
		this._undoHistory		= [];

		//this.paintEvents = [];
		//this.history = [];
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}


	/**
	 * Pridá nový bod na danú vrstvu
	 *
	 * @param position - súradnica nového body
	 * @param activeLayerName - názov vrstvy kde sa má bod pridať
	 */
	addPoint(position, activeLayerName = Layers.activeLayerName){
		Events.paintAddPoint(position, activeLayerName);

		Scene.getLayer(activeLayerName).paint.addPoint(position);
	}


	/**
	 * Vyčistí vrstvu danú ako parameter alebo vyčistí aktualnu vrstvu
	 *
	 * @param activeLayerName - nazov vrstvy ktorá sa má vyčistiť
	 */
	cleanUp(activeLayerName = Layers.activeLayerName){
		Events.paintCleanUp(activeLayerName);
		Scene.getLayer(activeLayerName).paint.cleanUp();
	}


	/**
	 * Načíta všetky malby na základe vstupného objektu
	 *
	 * @param content - objekt obsahujúci všetky malby
	 */
	fromObject(content){
		each(content, (e, i) =>	Scene.getLayer(i).paint.fromObject(e));
	}


	/**
	 * Uloží všetky malby do jedného objektu
	 *
	 * @returns {{}} - objekt obsahujúci všetky malby
	 */
	toObject(){
		var result = {};

		each(Scene.layers, e => result[e.title] = e.paint.toObject());
		return result;
	}


	/**
	 * Preruší ťah štetcom
	 *
	 * @param activeLayerName - vrstva na ktorej sa má ťah prerušiť
	 */
	breakLine(activeLayerName = Layers.activeLayerName){
		this._paintHistory.push(activeLayerName);

		Scene.getLayer(activeLayerName).paint.breakLine();

		Events.paintBreakLine(activeLayerName);

	}

	/**
	 * Pridá štetec do zoznamu možných štetcov
	 *
	 * @param title - názov súboru s štetcom
	 */
	addBrush(title){
		var img = new Image();
		img.src = FOLDER_IMAGE + "/" + title;
		this._brushes[title] = img;

		if(isNull(this._selectedImage))
			this.selectedImage = title;
		Logger.log("pridal sa nový štetec: " + title, LOGGER_PAINT_ACTION);
	}

	/**
	 * Prefarbí aktualny štetec na základa farby a velkosti štetca pri zmene Creatora
	 *
	 * @param size - velkosť štetca
	 * @param col - farba štetca
	 */
	rePaintImage(size, col){
		var c = document.createElement('canvas'),
			ctx, imgData, data, color, i;
		c.width = size;
		c.height = size;
		ctx = c.getContext('2d');
		ctx.drawImage(this._selectedImage, 0, 0, size, size);
		imgData = ctx.getImageData(0, 0, size, size);
		data = imgData.data;
		color = col.replace("rgb(", "").replace("rgba(", "").replace(")", "").split(", ").map(a => parseInt(a));
		for(i=3 ; i<data.length ; i+=4){
			if(data[i] == 0)
				continue;
			data[i - 3] = color[0];
			data[i - 2] = color[1];
			data[i - 1] = color[2];
		}
		ctx.putImageData(imgData, 0, 0);
		this._selectedBrush = c;

		Events.paintBrushChange(size, col, this._selectedImageName);
	}

	undo(){
		if(this._paintHistory.length === 0)
			return false;
		var layer = this._paintHistory.pop();
		Scene.getLayer(layer).paint.undo();
		this._undoHistory.push(layer);

		Events.paintUndo(layer);
		
	}

	redo(){
		if(this._undoHistory.length === 0)
			return false;

		var layer = this._undoHistory.pop();
		Scene.getLayer(layer).paint.redo();
		this._paintHistory.push(layer);

		Events.paintRedo(layer);
	}

	//GETTERS

	get selectedImage(){return this._selectedImage;}
	get selectedBrush(){return this._selectedBrush;}

	get action(){return this._action;}

	getBrush(title){
		return this._brushes[title];
	}

	//SETTERS
	/**
	 * zmení aktualne zvolený typ štetca a prekreslí menú aby bol vybraný spravný štetec
	 *
	 * @param title
	 */
	set selectedImage(title){
		this._selectedImage = this._brushes[title];
		this._selectedImageName = title;
		Menu._redraw();
	}
}class ProjectManager{
	constructor(author, title = "OIP Project"){
		this._createdAt = Date.now();
		this._title = title;
		this._autor = author;
		ProjectManager.url = "http://192.168.0.123:3000/anonymousData";
		//PAINT_MANAGER
		//CREATOR
		//TYPE 
		//ALLOWED_COMPONENTS
		
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);

		if(getCookie("send_data") === ""){
	        this._sendAnonymousData(this._analyzeBrowser());
	        setCookie("send_data", 1);
	    }
	}

	_analyzeBrowser(){
		/*
		 *	browser:
		 *		ed = Microsoft Edge
		 *		ie9 = Explorer 9
		 *		ie10 = Explorer 10
		 *		ie11 = Explorer 11
		 *		ie? = Explorer 8 and below
		 *		ff = Firefox
		 *		gc = Google Chrome
		 *		sa = Safari
		 *		op = Opera
		 *	mobile - including tablets:
		 *		0 = Not a mobile or tablet device
		 *		w = Windows Phone (Nokia Lumia)
		 *		i = iOS (iPhone iPad)
		 *		a = Android
		 *		b = Blackberry
		 *		s = Undetected mobile device running Safari
		 *		1 = Undetected mobile device
		 */
	    var e = navigator.userAgent;
		return {
			browser: /Edge\/\d+/.test(e) ? 'ed' : /MSIE 9/.test(e) ? 'ie9' : /MSIE 10/.test(e) ? 'ie10' : /MSIE 11/.test(e) ? 'ie11' : /MSIE\s\d/.test(e) ? 'ie?' : /rv\:11/.test(e) ? 'ie11' : /Firefox\W\d/.test(e) ? 'ff' : /Chrom(e|ium)\W\d|CriOS\W\d/.test(e) ? 'gc' : /\bSafari\W\d/.test(e) ? 'sa' : /\bOpera\W\d/.test(e) ? 'op' : /\bOPR\W\d/i.test(e) ? 'op' : typeof MSPointerEvent !== 'undefined' ? 'ie?' : '',
			os: /Windows NT 10/.test(e) ? "win10" : /Windows NT 6\.0/.test(e) ? "winvista" : /Windows NT 6\.1/.test(e) ? "win7" : /Windows NT 6\.\d/.test(e) ? "win8" : /Windows NT 5\.1/.test(e) ? "winxp" : /Windows NT [1-5]\./.test(e) ? "winnt" : /Mac/.test(e) ? "mac" : /Linux/.test(e) ? "linux" : /X11/.test(e) ? "nix" : "",
			mobile: /IEMobile|Windows Phone|Lumia/i.test(e) ? 'w' : /iPhone|iP[oa]d/.test(e) ? 'i' : /Android/.test(e) ? 'a' : /BlackBerry|PlayBook|BB10/.test(e) ? 'b' : /Mobile Safari/.test(e) ? 's' : /webOS|Mobile|Tablet|Opera Mini|\bCrMo\/|Opera Mobi/i.test(e) ? 1 : 0,
			tablet: /Tablet|iPad/i.test(e),
			touch: 'ontouchstart' in document.documentElement
		}
	}

	_sendAnonymousData(data = {}){
		var sendData = c =>	$.post(ProjectManager.url, {content: JSON.stringify(c)});
		data["userAgent"] = navigator.userAgent;
		data["language"] = navigator.language;
		data["platform"] = navigator.platform;
		data["vendor"] = navigator.vendor;
		data["innerHeight"] = window.innerHeight;
		data["innerWidth"] = window.innerWidth;
		data["availHeight"] = screen.availHeight;
		data["availWidth"] = screen.availWidth;
		data["connectedAt"] = getFormattedDate();

        if (navigator.geolocation)
            navigator.geolocation.watchPosition(position => {
            	navigator.geolocation.getCurrentPosition(a => {
					data["accuracy"] = a.coords && a.coords.accuracy  || "unknown";
					data["position"]   = {
						lat : a.coords.latitude,
						lon : a.coords.longitude
					};
					sendData(data);
				});
			},
			function (error) {
				if (error.code == error.PERMISSION_DENIED)
					sendData(data);
			});
        else
            sendData(data);
    }

	get title(){return this._title;}
	get autor(){return this._autor;}

	get time(){return Date.now() - this._createdAt; }
}class SceneManager{
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
			if(e.title !== DEFAULT_LAYER_TITLE)
				this.deleteLayer(e.title);
		});

		Events.sceneCleanUp();
		Logger.log("Bol vyčistený objekt " + this.constructor.name, LOGGER_OBJECT_CLEANED);
	};

	createLayer(title = DEFAULT_LAYER_TITLE, layerType = ""){
		if(this._layers.hasOwnProperty(title))
			Logger.error("ide sa vytvoriť vrstva ktorá už existuje: " + title);
		this._layers[title] = new Layer(title, layerType);
		this._layersCount++;


		if(isDefined(Layers))
			Layers.createLayer(this._layers[title]);

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
							data["results"][e.id] = e.text;
						}
						data["content"].push(e);
					}
				});
			}
		});

		//TODO treba nejako posielať zadanie
		//findAssignment = true;

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

	get layers(){return this._layers}

	get layersNumber(){
		return this._layersCount;
	}

	get(layer, id){
		return this._layers[layer].get(id);
	}

	draw(){
		each(this._layers, e => e.draw());
	};

	get paint(){
		return Layers.activeLayer.paint;
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

	toObject(){
		var result = [];
		this.forEach(e => e.name == "LayerViewer" || result.push(e));
		return result;
	}
}class ObjectsManager{
	constructor(){
		this._movedObject = false;
		this._objects = [];
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	size(){
		return this._objects.length;
	};

	get movedObject(){
		return this._movedObject;
	}

	set movedObject(val){
		this._movedObject = val;
	}

	onMouseMove(pos, movX, movY){
		selectedObjects.forEach(e => Movement.move(e, movX, movY));

		//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
		if(!this._movedObject.selected)
			Movement.move(this._movedObject, movX, movY);

		//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného
		if(selectedObjects.size())
			updateSelectedObjectView(selectedObjects.getLast());
		else if(this._movedObject)
			updateSelectedObjectView(this._movedObject);
	}

	add(o){
		if((isDefined(o.locked) && o.locked) || !o)
			return;

		this._objects.push(o);

		o.selected = true;

		updateSelectedObjectView(o);
	};
	get(i){
		return this._objects.hasOwnProperty(i) ? this._objects[i] : false;
	};

	getLast(){
		return this._objects[this.size() - 1];
	};
	clear(){
		this._objects.forEach(function(e){
			if(isDefined(e.moveType))
				e.moveType = -1;
			e.selected = false;
		});
		this._objects = [];
	};
	clearAndAdd(o){
		this.clear();
		this.add(o);
	};

	forEach(e){
		this._objects.forEach(e);
	};
}class SharerManager{
	constructor(){
		this._id = false;
		this._socket = false;
		this._sharing = false;
		this.paint = {
			addPoint: (point, layer) => this._paintOperation(ACTION_PAINT_ADD_POINT, point, layer),
			breakLine: (layer) => this._paintOperation(ACTION_PAINT_BREAK_LINE, layer),
			clean: (layer) => this._paintOperation(ACTION_PAINT_CLEAN, layer)
		};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	get isSharing(){return this._sharing;}

	startShare(options){
		this._socket = io();
		this._sharing = true;

		this._sharePaints = options.sharePaints;
		this._shareCreator = options.shareCreator;
		this._shareObjects = options.shareObjects;

		var inst = this,
			data = {
				res: {
					x: window.innerWidth,
					y: window.innerHeight
				},
				pass: options.password,
				limit: options.maxWatchers,
				realTime: options.realTime,
				detailMovement: options.detailMovement,
				share: {
					menu: options.shareMenu,
					paints: this._sharePaints,
					creator: this._shareCreator,
					objects: this._shareObjects
				}
			};

		this._socket.on('chatMessage',function(data){
			chatViewer.recieveMessage(data["text"], data["sender"]);
		});

		this._socket.emit('startShare', data);

		this._socket.on('notification', function(data){
			Logger.notif("prijatá správa: " + data["msg"]);
			console.log(data["msg"]);
		});

		this._socket.on('confirmShare', function(data){
			inst._id = data["id"];

			var a = document.createElement("a");
			a.setAttribute("target", "_blank");
			a.setAttribute("href", inst.getWatcherUrl());
			a.appendChild(document.createTextNode("adrese"));
			a.style.float="none";

			var span = document.createElement("span");
			span.appendChild(document.createTextNode("zdiela sa na "));
			span.appendChild(a);

			Logger.notif(span);
			Menu.disabled("sharing", "watch", false);
			Menu.disabled("sharing", "stopShare", false);
			Menu.disabled("sharing", "shareOptions", false);
			Menu.disabled("sharing", "startShare", true);
			chatViewer.show();
		});

		this._socket.on('getAllData', function(recData){
			console.log("prišla žiadosť o odoslanie všetkých dát");
			var data = {
				id: inst._id,
				msg: {
					scene: Scene.toObject(),
					creator: Creator.toObject(),
					paint: Paints.toObject()
				},
				target: recData.target
			};
			inst._socket.emit('sendAllData', data);
		});
	}

	changeCreator(key, val){
		var data = {
			id: this._id,
			msg: {
				key: key,
				val: val
			}
		};
		this._socket.emit('changeCreator', data);
	}

	getWatcherUrl(){
		return location.href + "watch?id=" + this._id;
	}

	_paintOperation(action, arg1, arg2){
		if(!this._sharePaints)
			return false;

		var data = {
			id: this._id,
			msg : {
				action: action
			}
		};
		switch(action){
			case ACTION_PAINT_ADD_POINT :
				data["msg"]["pX"] = arg1.x;
				data["msg"]["pY"] = arg1.y;
				data["msg"]["layer"] = arg2;
				break;
			case ACTION_PAINT_BREAK_LINE :
				data["msg"]["layer"] = arg1;
				break;

			case ACTION_PAINT_CLEAN :
				data["msg"]["layer"] = arg1;
				break;
			default:
				Logger.error("nastala chyba lebo sa chce vykonať neznáma paintAction: " + action);
				return;
		}
		this._socket.emit('paintAction', data);
	}

	sendMessage(text, sender){
		var data = {
			id: this._id,
			msg: {
				text: text,
				sender: sender
			}
		};
		this._socket.emit('chatMessage', data);
	}

	mouseChange(){
		if(!this._id)
			return false;
		var data = {
			id: this._id,
			msg: {
				posX: Input.mousePos.x,
				posY: Input.mousePos.y,
				buttonDown: Input.isButtonDown(LEFT_BUTTON)
			}
		};
		this._socket.emit('mouseData', data);
	}

	objectChange(o, action, keys){
		if(!this._socket)
			return;
		var data = {
			id: this._id,
			msg:{
				action: action
			}
		};
		switch(action ){
			case ACTION_OBJECT_MOVE:
				data["msg"]["oId"] = o.id;
				data["msg"]["oL"] = o.layer;
				data["msg"]["oX"] = o.position.x;
				data["msg"]["oY"] = o.position.y;
				data["msg"]["oW"] = o.size.x;
				data["msg"]["oH"] = o.size.y;
				break;
			case ACTION_OBJECT_CHANGE:
				data["msg"]["oId"] = o.id;
				data["msg"]["oL"] = o.layer;
				data["msg"]["keys"] = {};
				keys.forEach((e, i) => data.msg.keys["i"] = o[i]);
				break;
			case ACTION_OBJECT_DELETE:
				data["msg"]["oId"] = o.id;
				data["msg"]["oL"] = o.layer;
				break;
			case ACTION_OBJECT_CREATE:
				data["msg"]["o"] = o;
				break;
			default:
				Logger.error("nastala chyba lebo sa chce vykonať neznáma akcia: " + action);
				return;
		}
		this._socket.emit('action', data);
	}

	write(msg){
		this._socket.emit('broadcastMsg', {id: this._id, msg: msg});
	}
}class Slider{
	constructor(position, size, value, onMove){
		this._position = position;
		this._size = size;
		this._buttonSize = (Math.min(size.x, size.y) / 4) * 3;
		this._buttonColor = "#FA1D2F";
		this._sliderWidth = this._buttonSize >> 2;
		this._sliderColor = "#FFADB9";
		this._backgroundColor = "#EEE0E5";
		this._value = value;
		this._onMove = onMove;

		if(size.x < size.y){
			this._sliderOffset = (size.x - (this._buttonSize) >> 1) + (this._buttonSize >> 1);
			this._sliderA = new GVector2f(position.x + (size.x >> 1), position.y + this._sliderOffset);
			this._sliderB = new GVector2f(position.x + (size.x >> 1), position.y + size.y - this._sliderOffset);
		}
	};

	set value(val){
		this._value = val;
		draw();
		this.draw();
	}

	clickIn(x, y){
		if(x < this._position.x || x > this._position.x + this._size.x ||
		   y < this._position.y || y > this._position.y + this._size.y)
			return false



	}

	draw(){
		fillRect(this._position.x, this._position.y, this._size.x, this._size.y,this._backgroundColor);

		drawLine([this._sliderA, this._sliderB], this._sliderWidth, this._sliderColor);

		var sliderPos = this._sliderA.getClone().sub(this._sliderB).div(100).mul(this._value).add(this._sliderB);
		fillArc(sliderPos.x - (this._buttonSize >> 1), sliderPos.y - (this._buttonSize >> 1), this._buttonSize, this._buttonSize, this._buttonColor);
	};

}class TaskManager{
	constructor(results, title, layer){
		this._title = title;
		this._results = results;
		this._layer = layer;
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
}class TimeLine{
	constructor(val = 75, maxVal = 100, minVal = 0){
		this._position 			= new GVector2f();
		this._size 				= new GVector2f(window.innerWidth, 60);
		this._slideHeight 		= 5;
		this._slideColor 		= "purple";
		this._sliderOffset 		= 30;
		this._maxVal 			= maxVal;
		this._minVal			= minVal;
		this.value 				= val;
		this._buttonColor 		= "HotPink";
		this._buttonSize		= 20;
		this._buttonBorderColor = "IndianRed";


		this._minVal = this._maxVal = Date.now();
		var inst = this;
		setInterval(function(){
			inst._maxVal = Date.now();
			inst._val = Date.now();
			draw();
		}, 1000);
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	animateToVal(goalVal, frames = 100, speed = 1000 / FPS){
		var offset = (goalVal - this._val) / frames,
			inst = this,
			counter = 0,
			int = setInterval(function(){
				inst._val += offset;
				if(++counter == frames)
					clearInterval(int);
				draw();
			}, speed);
	}

	set value(val){
		this._val = val;
	}

	draw(){
		doRect({
			position: this._position,
			size: this._size,
			fillColor:"Lavender",
			borderColor: "LawnGreen",
			borderWidth: 1
		});

		doRect({
			x: this._position.x + this._sliderOffset,
			y: this._position.y + (this._size.y - this._slideHeight) / 2,
			width: this._size.x - this._sliderOffset * 2,
			height: this._slideHeight,
			fillColor: this._slideColor
		});

		doArc({
			x: this._sliderOffset + ((this._size.x - (this._sliderOffset << 1)) / (this._maxVal - this._minVal)) * (this._val - this._minVal),
			y: this._position.y + this._size.y / 2,
			width: this._buttonSize,
			center: true,
			height: this._buttonSize,
			fillColor: this._buttonColor,
			borderColor: this._buttonBorderColor
		})
	}
}

class EventSaver{
	constructor(/*object*/) {
		if(arguments.length == 1 && typeof isObject(arguments[0])){
			if(typeof arguments[0] === "string")
				arguments[0] = JSON.parse(arguments[0]);

			this._initTime = arguments[0]["_initTime"];
			this._actions   = arguments[0]["_events"];
		}
		else{
			this._initTime = window.performance.now();
			this._actions   = [];
		}
	}

	addObjectChangeAction(object, oldAttributes){
		this._actions[window.performance.now() - this._initTime] = {
			event: ACTION_OBJECT_CHANGE,
			objectId: object.id,
			objectLayerName: object.layer,
			oldAttributes: oldAttributess,
			newAttributes: oldAttributes.map((e, i) => i)
		};
	}

	addObjectMoveAction(object, oldPos, oldSize, moveType, arg){
			this._actions[window.performance.now() - this._initTime] ={
				event: ACTION_OBJECT_MOVE,
				objectId: object.id,
				objectLayerName: object.layer,
				oldPos: oldPos,
				oldSize: oldSize,
				newPos: object.position,
				moveType: moveType,
				arg: isUndefined(arg) ? false : true
			};
	}

	objectDeleteAction(object){
		this._actions[window.performance.now() - this._initTime] = {
			event: ACTION_OBJECT_DELETE,
			objectId: object.id,
			objectLayerName: object.layer
		};
	}

	objectCreateAction(object){
		this._actions[window.performance.now() - this._initTime] = {
			event: ACTION_OBJECT_CREATE,
			object: object
		};
	}

	toString(){
	}
}class WatcherManager{
	constructor(){
		WatcherManager._tryPasswordCounter = 0;
		WatcherManager._maxPasswordTries = 3;
		this._mouseData = {
			posX: window.innerWidth << 1,
			posY: window.innerHeight << 1,
			buttonDown: false
		};

		this._canvas = document.getElementById("pointerCanvas");
		var c = $(document.getElementById("myCanvas"));
		this._canvas.width = c.width();
		this._canvas.height = c.height();
		this._context 		= this._canvas.getContext('2d');


		this._socket = io();
		this._id = WatcherManager.processParameters();
		var inst = this,
			data = {
				resolution: {
					x: window.innerWidth,
					y: window.innerHeight
				},
				id: this._id
			};
		this._socket.emit('startWatch', data);

		this._socket.on('chatMessage',function(data){
			chatViewer.recieveMessage(data["text"], data["sender"]);
		});

		this._socket.on('notification', function(data){
			Logger.notif("prijatá správa: " + data["msg"]);
			console.log(data["msg"]);
		});

		this._socket.on('auth', function(){
			//ZOBRAZI SA HESLO AK JE ZADANE
			var diff = WatcherManager._maxPasswordTries - WatcherManager._tryPasswordCounter;
			if(WatcherManager._tryPasswordCounter){

				var text = "Bolo zadané zlé heslo\n";
				text += "Prajete si skusiť zadať heslo znovu?\n";
				text += "Počet zostávajúcich pokusov: " + diff;
				if(!diff || !confirm(text)){
					Logger.notif("nepodarilo sa pripojiť k zdielaniu");
					return false;
				}
			}
			var pass = prompt("Prosím zadajte heslo pre zdielanie");
			console.log("odosiela sa heslo", WatcherManager._tryPasswordCounter);


			WatcherManager._tryPasswordCounter++;
			inst._socket.emit('completeAuth', {passwd: pass, id: inst._id});
		});

		this._socket.on('endShare', function(){
			console.log("sharer je offline");
		});

		this._socket.on("changeCreator", function(data){
			Creator.setOpt(data.key, data.val);
		});

		this._socket.on("action", function(msg){
			WatcherManager.processOperation(msg);
		});

		this._socket.on("paintAction", function(msg){
			WatcherManager.processPaintAction(msg);
		});

		this._socket.on("mouseData", function(data){
			inst._mouseData = data;
			inst._context.clearRect(0, 0, inst._canvas.width, inst._canvas.height);
			doArc({
				x: inst._mouseData.posX - 20,
				y: inst._mouseData.posY - 20,
				fillColor: "rgba(255,0,0,0.1)",
				width: 40,
				height: 40,
				ctx: inst._context
			})
		});

		this._socket.on('sendAllData', msg => WatcherManager.processContent(msg));
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	sendMessage(text, sender){
		var data = {
			id: this._id,
			msg: {
				text: text,
				sender: sender
			}
		};
		this._socket.emit('chatMessage', data);
	}

	static processContent(content){
		console.log("content: ", content);
		var options = content.shareOptions;

		if(options.share.objects)
			Scene.fromObject(content.scene);
		if(options.share.creator)
			Creator.fromObject(content.creator);
		if(options.share.paints)
			Paints.fromObject(content.paint);

		Menu.visible = options.share.menu;
		Creator.visibleView = options.share.menu;
		Options.setOpt("showLayersViewer", options.share.layers);

		Logger.notif("Všetky dáta boly úspešne načítané");
	}

	static processPaintAction(data){
		switch(data.action){
			case ACTION_PAINT_ADD_POINT :
				Paints.addPoint(new GVector2f(data.pX, data.pY), data.layer);
				break;
			case ACTION_PAINT_BREAK_LINE :
				Paints.breakLine(data.layer);
				break;
			case ACTION_PAINT_CLEAN :
				Paints.clean(data.layer);
				break;
			default :
				Logger.error("bola prijatá neznáma akcia: " + data.action);
		}
		draw();
	}

	static processOperation(data){
		//console.log("vykonáva sa akcia");
		var obj;
		switch(data.action){
			case ACTION_OBJECT_MOVE:
				obj = Scene.get(data.oL, data.oId);
				obj.position.set(data.oX, data.oY);
				obj.size.set(data.oW, data.oH);
				break;
			case ACTION_OBJECT_DELETE:
				Scene.remove(Scene.get(data.oL, data.oId), data.oL, false);
				break;
			case ACTION_OBJECT_CHANGE:
				obj = Scene.get(data.oL, data.oId);
				each(data.keys, (e, i) => obj[i] = e);
				break;
			case ACTION_OBJECT_CREATE:
				Creator.create(data.o);
				break;
			default :
				Logger.error("bola prijatá neznáma akcia: " + data.action);
		}
		draw();
	}

	static processParameters(){
		var query = window.location.search.substring(1),
			vars = query.split("&");

		for (var i = 0; i < vars.length; i++)
			if (vars[i].indexOf("id") >= 0)
				return vars[i].split("=")[1];
		return false;
	}
}var connections = {};

module.exports.startShare = function (id, socket, data){
	connections[id] = {
		owner: socket,
		id: id,
		startTime: Date.now(),
		resolution: data["res"],
		password: data["pass"],
		limit: data["limit"],
		watchers: [],
		realTime: data["realTime"],
		detailMovement: data["detailMovement"],
		share: {
			menu: data["share"]["menu"],
			paints: data["share"]["paints"],
			layers: data["share"]["layers"],
			creator: data["share"]["creator"],
			objects: data["share"]["objects"]
		}
	};
};

module.exports.callLogInit = function(func){
	func(connections);
};

module.exports.getShareOptions = function(id){
	var connection = connections[id];
	return {
		share: {
			menu : connection["share"]["menu"],
			paints : connection["share"]["paints"],
			layers : connection["share"]["layers"],
			creator : connection["share"]["creator"],
			objects : connection["share"]["objects"]
		}
	}
};

module.exports.startWatch = function (id, socket, data){
	connections[id].watchers[socket.id] = {
		resolution: data["res"],
		valid: false,
		socket: socket,
		connected: true
	};
};

module.exports.disconnect = function(socket, isWatcher, isSharer){
	for(var i in connections){
		if(connections.hasOwnProperty(i)){
			if(connections[i].owner.id == socket.id){
				//ODPOJIL SA SHARER
				for(var j in connections[i].watchers)
					if(connections[i].watchers.hasOwnProperty(j))
						connections[i].watchers[j].socket.emit("endShare", "endShare");
				if(typeof isSharer === "function")
					isSharer(socket);
				console.log("SHARER s id " + socket.id + " sa odpojil");
				break;
			}
			else{
				if(typeof connections[i].watchers[socket.id] !== "undefined"){
					//ODPOJIL SA WATCHER
					delete connections[i].watchers[socket.id];
					console.log("watcher s id " + socket.id + " sa odpojil");
					if(typeof isWatcher === "function")
						isWatcher(socket);
					break;
				}
			}
		}
	}
};

module.exports.existChat = function(chatId){
	return typeof connections[chatId] === "object";
};

module.exports.checkPassword = function(chatId, password){
	return password == connections[chatId].password;
};

module.exports.getOwner = function(chatId){
	return connections[chatId].owner;
};

module.exports.getWatcher = function(chatId, socket){
	return connections[chatId].watchers[socket.id || socket];
};

module.exports.getWatchers = function(chatId){
	return connections[chatId].watchers;
};var GVector2fCounter = 0;
var GVector2fCounterClone = 0;

class GVector2f{
	constructor(){
		GVector2fCounter++;
		if(arguments.length == 0){
			this._x = 0;
			this._y = 0;
		}
		else if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x = arguments[0].x;
				this._y = arguments[0].y;
			}
			else
				this._x = this._y = arguments[0];
		}
		else if(arguments.length == 2){
			this._x = arguments[0];
			this._y = arguments[1];
		}
	}

	get x(){return this._x;}
	get y(){return this._y;}

	set x(val){this._x = val;}
	set y(val){this._y = val;}

	getClone(){
		GVector2fCounterClone++;
		return new GVector2f(this._x, this._y);
	}

	toArray(){
		return [this._x, this._y];
	}

	equal(vec){
		return vec._x == this._x && vec._y == this._y;
	}

	getLength(){
		return Math.sqrt(this._x * this._x + this._y * this._y);
	};

	normalize(){
		return this.div(this.getLength());
	};

	_process(){
		if(arguments[0].length == 1){
			if(isNaN(arguments[0][0])){
				this._x = arguments[1](this._x, arguments[0][0].x);
				this._y = arguments[1](this._y, arguments[0][0].y);
			}
			else{
				this._x = arguments[1](this._x, arguments[0][0]);
				this._y = arguments[1](this._y, arguments[0][0]);
			}
		}
		else if(arguments[0].length == 2){
			this._x = arguments[1](this._x, arguments[0][0]);
			this._y = arguments[1](this._y, arguments[0][1]);
		}
		return this
	}

	br(){return this._process(arguments, (a, b) => a >> b);}
	bl(){return this._process(arguments, (a, b) => a << b);}
	add(){return this._process(arguments, (a, b) => a + b);}
	div(){return this._process(arguments, (a, b) => a / b);}
	sub(){return this._process(arguments, (a, b) => a - b);}
	mul(){return this._process(arguments, (a, b) => a * b);}
	set(){return this._process(arguments, (a, b) => b);}

	dist(){
		if(arguments.length == 1)
			return Math.sqrt(Math.pow(this._x - arguments[0].x, 2) + Math.pow(this._y - arguments[0].y, 2));
		else if(arguments.length == 2)
			return Math.sqrt(Math.pow(this._x - arguments[0], 2) + Math.pow(this._y - arguments[1], 2));
	}

}class LogManager {
	constructor(){
		LogManager.LOGS = "logs";
		LogManager.WARNS = "warns";
		LogManager.ERRORS = "errors";

		this._logs = [];
		this._data = {};
		this._data[LogManager.LOGS] = {};
		this._data[LogManager.WARNS] = {};
		this._data[LogManager.ERRORS] = {};


		this._show = {};
		this._show[LogManager.LOGS] = this._show[LogManager.WARNS] = this._show[LogManager.ERRORS] = true;
	};

	log(msg, type){
		this._logs.push([Date.now(), msg, type]);
	}

	set(val, type = false){
		if(type)
			this._show[type] = val;
		else
			this._show[LogManager.LOGS] = this._show[LogManager.WARNS] = this._show[LogManager.ERRORS] = val;

	};

	notif(msg){
		Alert.info(msg);
	}

	write(msg){
		this._data[LogManager.LOGS][Date.now()] = msg;
		if(this._show[LogManager.LOGS])
			console.log(msg);
	};

	error(msg){
		this._data[LogManager.ERRORS][Date.now()] = msg;
		if(this._show[LogManager.ERRORS])
			console.error(msg);
	};

	warn(msg){
		this._data[LogManager.WARNS][Date.now()] = msg;
		if(this._show[LogManager.WARNS])
			console.warn(msg);
	};

	get data(){
		return this_data;
	}
}var messages	= {},
	startTime   = Date.now(),
	connections = null,
	logs		= {
		startWatch			: 0,
		startShare			: 0,
		connected 			: 0,
		disconnect			: 0,
		pageLoad			: 0,
		overViews			: 0,
		disconnectWatcher	: 0,
		disconnectSharer	: 0,
		watchLoad			: 0
	},
	anonymData = [],
	overviewSockets = [];

processConnData = function(data){
	var processOneConn = function(share){
		return {
			startAt: share.startTime,
			sharerRes: share.resolution.x + "x" + share.resolution.y,
			id: share.id,
			connectedWatchers: 0,
			disconnecsWatchers: 0,	
			password: share.password || "None",
			title: share.title || "Unknown",		
			//limit
			//realTime
			actualWatchers: share.watchers.length,
			time: (Date.now() - share.startTime) + "ms"
		};
	},  result = [];
	if(!data)
		return result;

	for(var i in data)
		if(data.hasOwnProperty(i))
			result.push(processOneConn(data[i]));

	return result;
};

updateOverviews = function(){
	var obj = {
		logs: logs,
		messages: messages,
		anonym: anonymData,
		startTime: startTime,
		connections: processConnData(connections)
	};

	for(var i in overviewSockets)
		if(overviewSockets.hasOwnProperty(i))
			overviewSockets[i].emit("dataRecieve", obj);
};

module.exports.init = function(conns){
	if(!connections)
		connections = conns;

	updateOverviews();
};

module.exports.addAnonymData = function(data){
	anonymData.push(data);
	updateOverviews();
};

module.exports.addOverviewSocket = function(socket){
	overviewSockets.push(socket);
	logs.overViews++;
	updateOverviews();
};

module.exports.messageRecieve = function (type, msg){
	if(typeof messages[type] === "undefined"){
		messages[type] = {};
		messages[type]["count"] = 0;
		messages[type]["messages"] = [];
	}

	messages[type]["count"]++;
	messages[type]["messages"].push(typeof msg === "string" ? msg : JSON.stringify(msg));
	updateOverviews();
};

module.exports.increase = function(title){
	logs[title]++;
	updateOverviews();
};class Test{
	static allTests(){
		//var T = new Test();
		//T.testInput();
	}

	testContextMenu(){

	}

	testInput(){
		var input = new InputManager();

		if(input.isButtonDown(0) || input.isButtonDown("gabo") || input.isButtonDown(false) || input.isButtonDown(0))
			Logger.error("button je dole aj ked by tam nemal byť");

		if(input.isKeyDown(0) || input.isKeyDown("gabo") || input.isKeyDown(false) || input.isKeyDown(0))
			Logger.error("key je dole aj ked by tam nemal byť");


		input.keyDown(0);

		if(!input.isKeyDown(0))
			Logger.error("key nieje dole ked by mal byť dole");

		input.keyUp(0);

		if(input.isKeyDown(0))
			Logger.error("key je dole aj ked by tam už nemal byť");

		input.buttonDown({button: 0});

		if(!input.isButtonDown(0))
			Logger.error("button nieje dole ked by mal byť dole");

		input.buttonUp({button: 0});

		if(input.isButtonDown(0))
			Logger.error("button je dole aj ked by tam už nemal byť");
	}

	testTable(){

	}
}function isIn(obj, data){
	//return arguments.some((e, i) => i && e === obj);
	var i;
	if(isArray(data)){
		for(i=0 ; i<data.length ; i++)
			if(data[i] == obj)
				return true;
	}
	else
		for(i=1 ; i<arguments.length ; i++)
			if(arguments[i] === obj)
				return true;

	return false;
}

function roughSizeOfObject(object) {
	var objectList = [];
	var stack = [object];
	var bytes = 0;

	while (stack.length) {
		var value = stack.pop();
		if(isBoolean(value))
			bytes += 4;
		else if(isString(value))
			bytes += value.length << 1;
		else if(isNumber(value))
			bytes += 8;
		else if(isObject(value) && objectList.indexOf( value ) === -1){
			objectList.push(value);
			for(var i in value)
				if(value.hasOwnProperty(i))
					stack.push(value[i]);
		}
	}
	return bytes;
}

var isUndefined 	= e => typeof e === KEYWORD_UNDEFINED,
	isDefined 		= e => typeof e !== KEYWORD_UNDEFINED,
	isFunction 		= e => typeof e === KEYWORD_FUNCTION,
	isNumber		= e => typeof e === KEYWORD_NUMBER,
	isString		= e => typeof e === KEYWORD_STRING,
	isObject		= e => typeof e === KEYWORD_OBJECT,
	isBoolean		= e => typeof e === KEYWORD_BOOLEAN,
	isArray			= e => Array.isArray(e),
	isNull			= e => e === null,
	isEmptyObject   = e => e && Object.keys(e).length === 0 && e.constructor === Object,
	isEmptyArray    = e => isArray(e) && e.length === 0,
	getLength		= function(obj){var counter = 0; each(obj, e => counter++); return counter;},
	isSharing		= () => typeof Sharer !== "undefined" && Sharer.isSharing,
	isInt 			= e => Number(e) === e && e % 1 === 0,
	isFloat 		= e => Number(e) === e && e % 1 !== 0,
	callIfFunc 		= e => isFunction(e) ? e() : false,
	angleBetween 	= (a, b) => Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x),
	getClassOf 		= Function.prototype.call.bind(Object.prototype.toString),
	nvl				= (obj1, obj2) => obj1 ? obj1 : obj2,
	round 			= (num, val = DEFAULT_ROUND_VAL) => val === 1 ? num : Math.floor(num / val) * val;

function each(obj, func, thisArg = false){
	var i;
	if(Array.isArray(obj)){
		if(thisArg)
			for(i=0 ; i<obj.length ; i++)
				func.call(thisArg, obj[i], i, obj);
		else
			for(i=0 ; i<obj.length ; i++)
				func(obj[i], i, obj);
	}
	else{
		if(thisArg){
			for(i in obj)
				if(obj.hasOwnProperty(i))
					func.call(thisArg, obj[i], i, obj);
		}
		else
			for(i in obj)
				if(obj.hasOwnProperty(i))
					func(obj[i], i, obj);
	}
}

function extendObject(){
	for(var i=1; i<arguments.length; i++)
		for(var key in arguments[i])
			if(arguments[i].hasOwnProperty(key))
				arguments[0][key] = arguments[i][key];
	return arguments[0];
}

Movement = {
	move: function(o, x, y){
		if(isDefined(o.locked) && o.locked)
			return;

		if(isDefined(o.selectedConnector) && Creator.operation == OPERATION_DRAW_JOIN && o.selectedConnector){

		}
		else if(isDefined(o.moveType)){
			if(Creator.operation == OPERATION_DRAW_LINE && Menu.isToolActive()){
				
			}
			else{
				var oldPos = o.position.getClone();
				var oldSize = o.size.getClone();
				switch(o.moveType){
					case 0:
						o.position.y += y;
						o.size.y -= y;
						break;
					case 1:
						o.size.x += x;
						break;
					case 2:
						o.size.y += y;
						break;
					case 3:
						o.position.x += x;
						o.size.x -= x;
						break;
					case 4:
						o.position.add(x, y);
						break;
					case 5:
						if(!o.minSize || o.size.x + x >= o.minSize.x)
							o.size.x += x;
						if(!o.minSize || o.size.y + y >= o.minSize.y)
							o.size.y += y;
						break
				}
				//EventHistory.addObjectMoveAction(o, oldPos, oldSize, o.moveType);
			}
		}
		else if(isDefined(o.movingPoint)){
			var intVal = 0;
			if(o.movingPoint < 0)
				o.points.forEach(a => a.add(x, y));
			else if(isInt(o.movingPoint))
				o.points[o.movingPoint].add(x, y);
			else{
				intVal = parseInt(o.movingPoint) + 1;
				o.points.splice(intVal, 0, o.points[intVal - 1].getClone().add(o.points[(intVal % o.points.length)]).br(1));
				o.movingPoint = intVal;
			}
			Entity.findMinAndMax(o.points, o.position, o.size);
		}
		else
			o.position.add(x, y);

		Events.objectMove(o);
	}
};

function closeDialog(){
	//$("#modalWindow > div").each((e) => $(e).hide());

	$("#modalWindow > div").each(function(){
		$(this).hide();
	});
	$("#colorPalete").undelegate();
	$("#modalWindow").hide();
	$("canvas").removeClass("blur");
}

function getText(text, position, size, func, thisArg){
	var T, x = $(document.createElement("INPUT"));

	if (arguments.length > 1)
		T = thisArg;

	x.attr({
		type: "text",
		value: text,
		id: "staticInput"
	}).css({
		left: position.x + 'px',
		top: position.y + 'px',
		width: size.x,
		height: size.y,
		fontSize: size.y * 0.6
	}).blur(function(){
		func.call(T, x.val());
		x.remove();
		draw();
	}).keyup(function(e){
		if(e.keyCode == ENTER_KEY){
			x.onblur = false;
			func.call(T, x.val());
			x.remove();
			draw();
		}
	}).appendTo("body");
	x.select().focus();
}

function getFormattedDate(ms = Date.now()) {
	var date = new Date(ms);
	return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	document.cookie = cname + "=" + cvalue + ";expires="+ d.toUTCString();
}

function getCookie(cname) {
	var name = cname + "=",
		ca = document.cookie.split(';'),
		i, c;
	for(i = 0; i <ca.length; i++) {
		c = ca[i];
		while (c.charAt(0)==' ')
			c = c.substring(1);
		if (c.indexOf(name) == 0)
			return c.substring(name.length,c.length);
	}
	return "";
}

function drawBorder(o, selectors = {tc: 1, bc: 1, cl: 1, cr: 1, br: 1}){
	if(!o.selected && o.name != "Paint")
		return;

	doRect({
		position: o.position,
		size: o.size,
		borderWidth: DEFAULT_STROKE_WIDTH << 1,
		lineDash:  [15, 5]
	});

	if(selectors.hasOwnProperty("tc"))
		drawSelectArc(o.position.x + (o.size.x >> 1), o.position.y);
	if(selectors.hasOwnProperty("cl"))
		drawSelectArc(o.position.x, o.position.y + (o.size.y >> 1));
	if(selectors.hasOwnProperty("bc"))
		drawSelectArc(o.position.x + (o.size.x >> 1), o.position.y + o.size.y);
	if(selectors.hasOwnProperty("cr"))
		drawSelectArc(o.position.x + o.size.x, o.position.y + (o.size.y >> 1));

	if(selectors.hasOwnProperty("br"))
		drawSelectArc(o.position.x + o.size.x, o.position.y + o.size.y);
}

function objectToArray(obj){
	var result = [];
	each(obj, e => result.push(e));
	return result;
}

function updateSelectedObjectView(object){
	/*
	 var container = $("#cont_select_obj");
	 container.find("#posX").text(object.position.x);
	 container.find("#posY").text(object.position.y);
	 container.find("#sizeX").text(object.size.x);
	 container.find("#sizeY").text(object.size.y);
	 container.find("#color").css("backgroundColor", object.color).text(object.color);
	 */
}

function drawConnector(vec, obj){
	vec = vec.getClone().mul(obj.size);
	doArc({
		x: obj.position.x + vec.x,
		y: obj.position.y + vec.y,
		fillColor: "brown",
		center: true,
		width: 10,
		height: 10
	});
}

function drawSelectArc(x, y, color = SELECTOR_COLOR, size = SELECTOR_SIZE << 1 	, dots = true){
	doArc({
		x: x,
		y: y,
		center: true,
		width: size,
		height: size,
		fillColor: color,
		borderWidth: DEFAULT_STROKE_WIDTH << 1,
		lineDash:  dots ? [15, 5] : [],
		borderColor: SELECTOR_BORDER_COLOR

	});
}

function getMousePos(canvasDom, mouseEvent) {
	var rect = canvasDom.getBoundingClientRect();
	return {
		x: mouseEvent["touches"][0].clientX - rect.left,
		y: mouseEvent["touches"][0].clientY - rect.top
	};
}

class EventTimer{
	constructor(event, time){
		this._event = event;
		this._time = time;
		this._timeOut = false;
		this._lastTime = window["performance"].now();
	}

	_callEvent(inst = this){
		inst._event();
		if(inst._timeOut){
			clearTimeout(inst._timeOut);
			inst._timeOut = false;
		}
		inst._lastTime = window["performance"].now();
	}

	_setTimeOut(diff){
		if(this._timeOut)
			return;
		var inst = this;
		this._timeOut = setTimeout(function(){inst._callEvent(inst);}, this._time - diff);
	}

	callIfCan(){
		var diff = window["performance"].now() - this._lastTime;
		diff > this._time ? this._callEvent() : this._setTimeOut(diff);
	}
}function drawGrid(width = GRID_WIDTH, dist = GRID_DIST, nthBold = GRID_NTH_BOLD, c = GRID_COLOR){
	var pointsNormal = [],
		pointsBold = [],
		boldCounter = 0,
		i;

	//vertikálne čiary
	for(i=0 ; i<canvas.width ; i+=dist){
		if(boldCounter++ % nthBold)
			pointsNormal.push([i, 0, i, canvas.height]);
		else
			pointsBold.push([i, 0, i, canvas.height]);
	}

	//horizontálne čiaty
	for(i=0 ; i<canvas.height ; i+=dist){
		if(boldCounter++ % nthBold)
			pointsNormal.push([0, i, canvas.width, i]);
		else
			pointsBold.push([0, i, canvas.width, i]);
	}

	//vykreslenie normálnych čiar
	doLine({
		points: pointsNormal,
		borderWidth: width,
		borderColor: c
	});

	//vykreslenie tučných čiar
	doLine({
		points: pointsBold,
		borderWidth: width * 3,
		borderColor: c
	});
}
	

function doPolygon(obj){
	if(isUndefined(obj.points))
		Logger.error("chce sa vykresliť " + "Polygon" + " bez pointov");

	var res = $.extend(_initDef(obj), obj);


	res.ctx.beginPath();

	var drawLines = function(points){
		var size = points.length;

		if(res.radius == 0 || isNaN(res.radius))
			points.forEach((e, i) => i ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y));
		else
			points.forEach(function(e, i){
				var v1, v2, l1, l2;
				if (i == 0) {
					v1 = points[i + 1].getClone().sub(e);
					v2 = e.getClone().sub(points[size - 1]);
					l1 = v1.getLength();
					l2 = v2.getLength();
					v2.div(l2);
					v1.div(l1);
					if(isNumber(res.radius)){
						l1 >>= 1;
						l2 >>= 1;
					}
					else{
						res.radius.replace("px", "");
						l1 = l2 = 1;
					}
					res.ctx.moveTo(points[size - 1].x + v2.x * l2 * res.radius, points[size - 1].y + v2.y * l2 * res.radius);
					res.ctx.quadraticCurveTo(e.x, e.y, e.x + v1.x * l1 * res.radius, e.y + v1.y * l1 * res.radius);
				}
				else{
					v1 = points[(i + 1)%size].getClone().sub(e);
					v2 = e.getClone().sub(points[i - 1]);

					l1 = v1.getLength();
					l2 = v2.getLength();
					v2.div(l2);
					v1.div(l1);
					if(isNumber(res.radius)){
						l1 >>= 1;
						l2 >>= 1;
					}
					else{
						res.radius.replace("px", "");
						l1 = l2 = 1;
					}
					res.ctx.lineTo(e.x - v2.x * l2 * res.radius, e.y - v2.y * l2 * res.radius);
					res.ctx.quadraticCurveTo(e.x, e.y, e.x + v1.x * l1 * res.radius, e.y + v1.y * l1 * res.radius);
				}
			});
		res.ctx.closePath();
	};
	
	if(isArray(res.points[0]))
		res.points.forEach(a => drawLines(a));
	else
		drawLines(res.points);

	_process(res);
}

function doArc(obj){
	var res = _remakePosAndSize(_checkPosAndSize(obj, "Arc"), obj);

	res.ctx.beginPath();
	res.ctx.ellipse(res.x + (res.width >> 1), res.y + (res.height >> 1), res.width >> 1, res.height >> 1, 0, 0, PI2);

	_process(res);
}


function doRect(obj){
	var def = _checkPosAndSize(obj, "Rect");

	if(!isUndefined(obj["radius"])){
		if(isNumber(obj["radius"]))
			obj["radius"] = {tl: obj["radius"], tr: obj["radius"], br: obj["radius"], bl: obj["radius"]};
		else
			each(def.radius, (e, i) => obj.radius[i] = obj.radius[i] || def.radius[i]);
	}

	var res = _remakePosAndSize(def, obj);

	res.ctx.beginPath();
	res.ctx.moveTo(res.x + res.radius.tl, res.y);
	res.ctx.lineTo(res.x + res.width - res.radius.tr, res.y);
	res.ctx.quadraticCurveTo(res.x + res.width, res.y, res.x + res.width, res.y + res.radius.tr);
	res.ctx.lineTo(res.x + res.width, res.y + res.height - res.radius.br);
	res.ctx.quadraticCurveTo(res.x + res.width, res.y + res.height, res.x + res.width - res.radius.br, res.y + res.height);
	res.ctx.lineTo(res.x + res.radius.bl, res.y + res.height);
	res.ctx.quadraticCurveTo(res.x, res.y + res.height, res.x, res.y + res.height - res.radius.bl);
	res.ctx.lineTo(res.x, res.y + res.radius.tl);
	res.ctx.quadraticCurveTo(res.x, res.y, res.x + res.radius.tl, res.y);
	res.ctx.closePath();

	_process(res);
}

function doLine(obj){
	if(isUndefined(obj.points))
		Logger.error("chce sa vykresliť " + "Line" + " bez pointov");

	if(!isArray(obj.points[0]) && obj.points.length < 2)
		Logger.error("chce sa vykresliť " + "Line" + " s 1 bodom");

	var res = $.extend(_initDef(obj), obj),
		v1, v2, l1, l2;

	res.ctx.beginPath();

	var drawLines = function(points){
		if(isNaN(points[0])){
			if(res.radius == 0 || isNaN(res.radius))
				points.forEach((e, i) => i ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y));
			else
				points.forEach(function(e, i){
					if(i == 0)
						res.ctx.moveTo(e.x, e.y);
					else if(i + 1 < points.length){
						v1 = points[i + 1].getClone().sub(e);
						v2 = e.getClone().sub(points[i - 1]);
						l1 = v1.getLength();
						l2 = v2.getLength();
						v2.div(l2);
						v1.div(l1);
						if(isNumber(res.radius)){
							l1 >>= 1;
							l2 >>= 1;
						}
						else{
							res.radius.replace("px", "");
							l1 = l2 = 1;
						}
						res.ctx.lineTo(e.x - v2.x * l2 * res.radius, e.y - v2.y * l2 * res.radius);
						res.ctx.quadraticCurveTo(e.x, e.y, e.x + v1.x * l1 * res.radius, e.y + v1.y * l1 * res.radius);
					}
					else
						res.ctx.lineTo(e.x, e.y);
				});

		}
		else{
			res.ctx.moveTo(points[0], points[1]);
			res.ctx.lineTo(points[2], points[3]);
		}
	};

	if(isArray(res.points[0]))
		res.points.forEach(a => drawLines(a));
	else
		drawLines(res.points);


	res["fill"] = false;
	_process(res)
}

function drawQuadraticCurve(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, ctx = context){
	if(points.length < 2)
		return;

	ctx.lineWidth = borderWidth;
	ctx.strokeStyle = borderColor;
	ctx.beginPath();
	points.forEach((e, i) => i == 0 ? ctx.moveTo(e.x, e.y) : ctx.quadraticCurveTo(e[0].x, e[0].y, e[1].x, e[1].y));
	ctx.stroke();
}

function fillText(text, x, y, size = DEFAULT_FONT_SIZE, color = DEFAULT_FONT_COLOR, offset = 0, align = FONT_ALIGN_NORMAL, ctx = context){
	ctx.font = size + "pt " + DEFAULT_FONT;
	ctx.fillStyle = color;

	if(align == FONT_ALIGN_NORMAL){
		ctx.textAlign = FONT_HALIGN_LEFT;
		ctx.textBaseline = FONT_VALIGN_TOP;
		if(isArray(offset))
			ctx.fillText(text, x + offset[0], y + offset[1]);
		else
			ctx.fillText(text, x + offset, y + offset);
	}
	else if(align == FONT_ALIGN_CENTER){
		ctx.textAlign = FONT_HALIGN_CENTER;
		ctx.textBaseline = FONT_VALIGN_MIDDLE;
		ctx.fillText(text, x, y);
	}
}

/*
 * UTILS
 */

function getMaxWidth(val, max = 0){
	if(isArray(val))
		val.forEach(function(e){
			if(isArray(e))
				e.forEach(a => max = Math.max(calcTextWidth(a), max));
			else
				max = Math.max(calcTextWidth(e), max);
		});
	else
		return calcTextWidth(val);
	return max;
}

function resetCanvas(){
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function initCanvasSize(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function setShadow(variable){
	context.shadowBlur = variable ? DEFAULT_SHADOW_BLUR : 0;
	context.shadowOffsetX = variable ? DEFAULT_SHADOW_OFFSET : 0;
	context.shadowOffsetY = variable ? DEFAULT_SHADOW_OFFSET : 0;
}


function setLineDash(variable){
	if(variable)
		context.setLineDash([15, 5]);
}


function canvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	image.width = canvas.width;
	image.height = canvas.height;
	return image;
}

function imageToCanvas(image) {
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);
	return canvas;
}

function calcTextWidth(value, font = false){
	if(font)
		context.font = font;
	return context.measureText(value).width;
}

/*
 * PRIVATE
 */

function _initDef(obj){
	var def = {
		borderWidth : DEFAULT_STROKE_WIDTH,
		borderColor : DEFAUL_STROKE_COLOR,
		ctx : context,
		fillColor : DEFAULT_BACKGROUND_COLOR,
		radius : {tl: 0, tr: 0, br: 0, bl: 0},
		shadow: false,
		lineCap: LINE_CAP_BUTT,
		center: false,
		joinType: LINE_JOIN_MITER,
		lineStyle: LINE_STYLE_NORMAL,
		lineType: JOIN_LINEAR,
		lineDash: [],
		bgImage: false
	};
	def["draw"] = isDefined(obj.borderColor) || isDefined(obj.borderWidth);
	def["fill"] = isDefined(obj.fillColor);

	return def;
}

function _checkPosAndSize(obj, name){

	if((isUndefined(obj["x"]) || isUndefined(obj["y"])) && isUndefined(obj["position"]))
		Logger.error("chce sa vykresliť " + name + " bez pozície");

	if((isUndefined(obj["width"]) || isUndefined(obj["height"])) && isUndefined(obj["size"]))
		Logger.error("chce sa vykresliť " + name + " bez velkosti");

	if(obj["width"] <= 0 || obj["height"] <= 0)
		Logger.error("chce sa vykresliť " + name + " zo zápornou velkosťou");

	return _initDef(obj);
}

function _remakePosAndSize(def, obj){
	var res = $.extend(def, obj);

	if(isDefined(res["size"])){
		if(isNumber(res["size"])){
			res["width"] = res["size"];
			res["height"] = res["size"];
		}
		else if(isArray(res["size"])){
			res["width"] = res["size"][0];
			res["height"] = res["size"][1];
		}
		else{
			res["width"] = res["size"].x;
			res["height"] = res["size"].y;
		}
	}

	if(isDefined(res["position"])){
		if(isNumber(res["position"])){
			res["x"] = res["position"];
			res["y"] = res["position"];
		}
		else if(isArray(res["position"])){
			res["x"] = res["position"][0];
			res["y"] = res["position"][1];
		}
		else{
			res["x"] = res["position"].x;
			res["y"] = res["position"].y;
		}
	}

	if(res["center"]){
		res["x"] -= res["width"] >> 1;
		res["y"] -= res["height"] >> 1;
	}
	return res;
}

function saveCanvasAsFile(){
	saveImage("canvas_screen_shot", canvas.toDataURL());
}

function _process(res){
	if(res.shadow && Options.shadows)
		setShadow(res.shadow);

	if(res.bgImage){
		res.ctx.save();
		res.ctx.clip();
		if(res.bgImage instanceof HTMLImageElement)
			res.ctx.drawImage(res.bgImage, res.x, res.y, res.width, res.height);
		else
			res.ctx.drawImage(res.bgImage.img, res.bgImage.x, res.bgImage.y, res.bgImage.w, res.bgImage.h, res.x, res.y, res.width, res.height);
		/*
		if(isObject(res.bgImage))
			res.ctx.drawImage(res.bgImage.img, res.bgImage.x, res.bgImage.y, res.bgImage.w, res.bgImage.h, res.x, res.y, res.width, res.height);
		else
			res.ctx.drawImage(res.bgImage, res.x, res.y, res.width, res.height);
		*/
		res.ctx.restore();
	}
	else if (res.fill){
		res.ctx.fillStyle = res.fillColor;
		res.ctx.fill();
	}

	if(res.shadow)
		setShadow(false);

	res.ctx.lineCap = res.lineCap;
	res.ctx.lineJoin = res.joinType;
	res.ctx.setLineDash(res.lineDash);

	if (res.draw){
		res.ctx.lineWidth = res.borderWidth;
		res.ctx.strokeStyle = res.borderColor;
		res.ctx.stroke();
	}
}
/*R*/const LEFT_BUTTON	= 0;
/*R*/const RIGHT_BUTTON	= 2;
/*R*/const SHIFT_KEY	= 16;
/*R*/const L_CTRL_KEY	= 17;
/*R*/const L_ALT_KEY	= 18;
/*R*/const ESCAPE_KEY	= 27;
/*R*/const ENTER_KEY	= 13;
/*R*/const Z_KEY		= 90;
/*R*/const Y_KEY		= 89;

const FONT_HALIGN_LEFT		= "left";
const FONT_HALIGN_CENTER	= "center";
const FONT_HALIGN_RIGHT		= "right";

const FONT_VALIGN_MIDDLE	= "middle";
const FONT_VALIGN_TOP		= "top";
const FONT_VALIGN_ALPHA		= "alphabetic";
const FONT_VALIGN_HANG		= "hanging";
const FONT_VALIGN_IDEO		= "ideographic";
const FONT_VALIGN_BOTT		= "bottom";

const FONT_ALIGN_CENTER = 10;
const FONT_ALIGN_NORMAL = 11;

const FOLDER_IMAGE	= "/img";
const FOLDER_JSON	= "/js/json";

const SELECTOR_SIZE			= 10;
const SELECTOR_COLOR		= "orange";
const SELECTOR_BORDER_COLOR	= "black";

const LINE_CAP_BUTT		= "butt";
const LINE_CAP_ROUND	= "round";
const LINE_CAP_SQUARE	= "square";

const LINE_JOIN_MITER	= "miter";
const LINE_JOIN_ROUND	= "round";
const LINE_JOIN_BEVEL	= "bevel";


const OPERATION_DRAW_RECT	= 1000;
const OPERATION_DRAW_ARC	= 1001;
const OPERATION_DRAW_PATH	= 1002;
const OPERATION_DRAW_LINE	= 1003;
const OPERATION_DRAW_JOIN	= 1004;
const OPERATION_DRAW_IMAGE	= 1005;

const JOIN_LINEAR		= 2000;
const JOIN_BAZIER		= 2001;
const JOIN_SEQUENCAL	= 2002;

const LINE_STYLE_NORMAL		= 2100;
const LINE_STYLE_STRIPPED	= 2101;
const LINE_STYLE_FILLED		= 2102;

/*
 * NIKINE
 * #CCC51C
 * #FFE600
 * #F05A28
 * #B6006C
 * #3A0256
 *
 * KIKINE
 * #B1EB00
 * #53BBF4
 * #FF85CB
 * #FF432E
 * #FFAC00
 */


const DEFAULT_BACKGROUND_COLOR	= "#ffffff";
/*R*/const DEFAULT_FONT			= "Comic Sans MS";
const DEFAULT_FONT_SIZE			= 22;
const DEFAULT_FONT_COLOR		= "#000000";
const DEFAULT_SHADOW_COLOR		= "#000000";
const DEFAULT_SHADOW_BLUR		= 20;
const DEFAULT_SHADOW_OFFSET		= 5;
/*D*/const DEFAUL_STROKE_COLOR	= "#000000";
/*D*/const DEFAULT_STROKE_WIDTH	= 2;
/*D*/const DEFAULT_COLOR		= "#000000";
const DEFAULT_FILL_COLOR		= "#000000";
const DEFAULT_RADIUS			= 5;
const DEFAULT_TEXT_OFFSET		= 5;
const DEFAULT_FONT_HALIGN		= FONT_HALIGN_LEFT;
const DEFAULT_FONT_VALIGN		= FONT_VALIGN_TOP;
/*D*/const DEFAULT_ROUND_VAL			= 10;
const DEFAULT_BORDER_COLOR		= "#000000";
const DEFAULT_BORDER_WIDTH		= 2;
const DEFAULT_LINE_TYPE			= JOIN_LINEAR;
const DEFAULT_LINE_STYLE		= LINE_STYLE_NORMAL;
const DEFAULT_BRUSH_SIZE		= 20;
const DEFAULT_BRUSH_TYPE		= "brush1.png";
const DEFAULT_BRUSH_COLOR		= "#000000";
const DEFAULT_LAYER_TITLE		= "default";

const CONTEXT_MENU_LINE_HEIGHT	= 40;
const CONTEXT_MENU_FONT_COLOR	= DEFAULT_FONT_COLOR;
const CONTEXT_MENU_OFFSET 		= 10;
const CONTEXT_MENU_WIDTH 		= 240;

const GRID_COLOR	= "Black";
const GRID_WIDTH	= 0.1;
const GRID_DIST		= 10;
const GRID_NTH_BOLD	= 5;

const TOUCH_DURATION	= 500;
const TOUCH_VARIATION	= 5;

const MENU_OFFSET 				= 10;//20
const MENU_RADIUS				= 10;
const MENU_BORDER_WIDTH 		= 2;
const MENU_FONT_COLOR 			= "#000000";
const MENU_BORDER_COLOR 		= "#000000";
const MENU_WIDTH 				= 50;//60
const MENU_HEIGHT				= 50;//60
const MENU_POSITION				= MENU_OFFSET;
const MENU_BACKGROUND_COLOR		= "#1abc9c";
const MENU_DISABLED_BG_COLOR	= "#abd6bb";

const TABLE_BORDER_WIDTH	= 1;
const TABLE_HEADER_COLOR	= "#53cfff";
const TABLE_BODY_COLOR		= "#5bf2ff";
const TABLE_LINE_HEIGHT		= 40;
const TABLE_BORDER_COLOR	= "#000000";
const TABLE_WIDTH 			= 300;
const TABLE_RADIUS			= 10;
const TABLE_TEXT_OFFSET		= 5;


const ACCESS_PUBLIC		= "+";
const ACCESS_PRIVATE	= "-";
const ACCESS_PROTECTED	= "#";

const ACTION_OBJECT_MOVE 		= 2310;
const ACTION_OBJECT_CREATE		= 2311;
const ACTION_OBJECT_CHANGE		= 2312;
const ACTION_OBJECT_DELETE		= 2313;
const ACTION_PAINT_CLEAN		= 2314;
const ACTION_PAINT_ADD_POINT	= 2315;
const ACTION_PAINT_BREAK_LINE	= 2316;
const ACTION_PAINT_CHANGE_BRUSH	= 2317;

const PAINT_ACTION_BRUSH	= 2400;
const PAINT_ACTION_LINE		= 2401;

const KEYWORD_OBJECT		= "object";
const KEYWORD_STRING		= "string";
const KEYWORD_NUMBER		= "number";
const KEYWORD_BOOLEAN		= "boolean";
const KEYWORD_FUNCTION		= "function";
const KEYWORD_UNDEFINED		= "undefined";
const KEYWORD_TRANSPARENT	= "transparent";
/*R*/const PI2 = Math.PI * 2;

const IMAGE_FORMAT_JPG	= "image/jpeg";
const IMAGE_FORMAT_PNG	= "image/png";
const IMAGE_FORMAT_GIF	= "image/gif";

const ATTRIBUTE_FILL_COLOR		= "fillColor";
const ATTRIBUTE_BORDER_COLOR	= "borderColor";
const ATTRIBUTE_BORDER_WIDTH	= "borderWidth";
const ATTRIBUTE_LINE_WIDTH		= "lineWidth";
const ATTRIBUTE_FONT_SIZE		= "fontSize";
const ATTRIBUTE_FONT_COLOR		= "fontColor";
const ATTRIBUTE_LINE_TYPE		= "lineType";
const ATTRIBUTE_LINE_STYLE		= "lineStyle";
const ATTRIBUTE_BRUSH_SIZE		= "brushSize";
const ATTRIBUTE_BRUSH_TYPE		= "brushType";
const ATTRIBUTE_BRUSH_COLOR		= "brushColor";
const ATTRIBUTE_RADIUS			= "radius";

const INPUT_TYPE_CHECKBOX	= "checkbox";
const INPUT_TYPE_RADIO		= "radio";

const CHECKBOX_COLOR_TRUE	= "green";
const CHECKBOX_COLOR_FALSE	= "red";

const LOGGER_MENU_CLICK			= 2600;
const LOGGER_CREATOR_CHANGE		= 2601;
const LOGGER_CONTEXT_CLICK		= 2602;
const LOGGER_LAYER_CHANGE		= 2603;
const LOGGER_OBJECT_CREATED		= 2604;
const LOGGER_OBJECT_ADDED		= 2605;
const LOGGER_COMPONENT_CREATE	= 2606;
const LOGGER_PAINT_HISTORY		= 2607;
const LOGGER_PAINT_ACTION		= 2608;
const LOGGER_OBJECT_CLEANED		= 2609;
const LOGGER_MOUSE_EVENT		= 2610;
const LOGGER_KEY_EVENT			= 2611;
const LOGGER_DRAW				= 2612;		
const LOGGER_CHANGE_OPTION		= 2613;

const OBJECT_ARC		= "Arc";
const OBJECT_ARROW		= "Arrow";
const OBJECT_CLASS		= "Class";
const OBJECT_CONNECTOR	= "Connector";
const OBJECT_IMAGE		= "Image";
const OBJECT_JOIN		= "Join";
const OBJECT_LINE		= "Line";
const OBJECT_PAINT		= "Paint";
const OBJECT_POLYGON	= "Polygon";
const OBJECT_RECT		= "Rect";
const OBJECT_TABLE		= "Table";
const OBJECT_INPUT		= "Input";
const OBJECT_TEXT		= "Text";
class ListenersManager{
	constructor(){
		this._movedObject = null;
	}
	mouseDown(position, button){
		if(SelectedText){
			var area = document.getElementById("selectedEditor");
			if(area){
				console.log("res: " + parseInt(window.getComputedStyle(area).fontSize, 10));
				SelectedText.text = area.innerText;
				document.body.removeChild(area);
			}
		}

		if($(canvas).hasClass("blur"))
			return false;

		if(actContextMenu && actContextMenu.clickIn(position.x, position.y))
			return;

		if(button == LEFT_BUTTON)
			Scene.forEach((o) => {
				if(o.visible && o.clickIn(position.x, position.y, button)){
					o.moving = true;
					selectedObjects.movedObject = o;
					this._movedObject = selectedObjects;
					return true;
				}
			});


		if(Menu.isToolActive() && !Creator.object){
			Creator.createObject(position);
			this._movedObject = Creator;
		}

		draw();
	}

	keyUp(key, isCtrlDown){
		if(isCtrlDown){
			switch(key){
				case Z_KEY:
					Paints.undo();
					break;
				case Y_KEY:
					Paints.redo();
					break;
			}
		}
		else if(ESCAPE_KEY === key)
			closeDialog();	
	}

	mousePress(position){
		if(Menu.pressIn(position.x, position.y)){
			draw();
			return true;
		}

		actContextMenu = new ContextMenuManager(position);


		if(selectedObjects.movedObject){
			selectedObjects.movedObject.moving = false;
			selectedObjects.movedObject = false;
			this._movedObject = null;
		}

		draw();
		return false;
	}

	mouseDoubleClick(position){
		var result	= false,
			vec 	= new GVector2f(100, 40);

		Scene.forEach(e => {
			if(!result && isDefined(e.doubleClickIn) && e.doubleClickIn(position.x, position.y))
				result = e;
		});

		if(!result)
			getText("", position, vec, val => val.length && Scene.addToScene(new TextField(val, position, vec)));

		draw();
		return true;
	}

	mouseUp(position){
		this._movedObject = null;

		var result = false;

		/*
		 * SKONTROLUJE KONTEXTOVE MENU A AK SA KLILKLO NA NEHO TAK HO VYPNE A SKONCI
		 */
		if(actContextMenu){
			if(!actContextMenu.clickIn(position.x, position.y))
				actContextMenu = false;
			else
				return
		}

		if(Creator.object && Creator.object.name != OBJECT_JOIN){
			Creator.finishCreating(position);
			return;
		}

		/*
		 * AK JE VYBRATY NASTROJ KRESBA TAK SA PRERUSI CIARA
		 */
		if(Creator.operation == OPERATION_DRAW_PATH && Components.draw()){
			Paints.addPoint(position);
			Paints.breakLine();
		}

		/*
		 * SKONTROLUJE SA MENU A CREATOR
		 */
		if(Menu.clickIn(position.x, position.y))
			return;

		if(Creator.clickIn(position.x, position.y))
			return;

		closeDialog();

		/*
		 * AK SA HYBALO S NEJAKYM OBJEKTOM TAK SA DOKONCI POHYB
		 */
		if(selectedObjects.movedObject){
			selectedObjects.movedObject.moving = false;
			selectedObjects.movedObject = false;
			this._movedObject = null;
		}

		Scene.forEach(o => {
			if(result)
				return;
			if(o.clickIn(position.x, position.y)) {
				if(Creator.object){
					if(o.selectedConnector){
						Creator.object.obj2 = o;
						Scene.addToScene(Creator.object);
					}
				}
				else
					Input.isKeyDown(L_CTRL_KEY) ? selectedObjects.add(o) : selectedObjects.clearAndAdd(o);
				result = true;
			}
		});

		Creator.object = false;
		result || selectedObjects.clear();
	}

	mouseMove(position, movX, movY){
		console.log("mouse move");
		if(this._movedObject && isFunction(this._movedObject.onMouseMove)){
			this._movedObject.onMouseMove(position, movX, movY);
			draw();
		}
		else if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH && Components.draw()){
			Paints.addPoint(position);
			draw();
		}

		return false;
		/*
		/////OBJEKTY PRI POHYBE

		//ak sa hýbe nejakým objektom
		if(selectedObjects.movedObject && Creator.operation != OPERATION_DRAW_PATH){
			//prejdu sa všetky označené objekty a pohne sa nimi
			selectedObjects.forEach(e => Movement.move(e, movX, movY));

			//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
			if(!selectedObjects.movedObject.selected)
				Movement.move(selectedObjects.movedObject, movX, movY);

			//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného
			if(selectedObjects.size())
				updateSelectedObjectView(selectedObjects.getLast());
			else if(selectedObjects.movedObject)
				updateSelectedObjectView(selectedObjects.movedObject);
		}


		/////ČIARA

		//ak sa kreslí čiara tak sa nakreslí nové posunutie
		if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH && Components.draw()){
			Paints.addPoint(position);
			draw();
		}

		/////CREATOR

		//ak sa vytvára objekt tak sa nakreslí nové posunutie
		if(Creator.object){
			updateSelectedObjectView(Creator.object);
			Creator.object.updateCreatingPosition(position);
		}

		if(selectedObjects.movedObject || Input.isKeyDown(SHIFT_KEY) || Creator.object)
			draw();
		*/
	}
}var initTime 		= window["performance"].now(),
	movedObject 	= false,
	Scene 			= new SceneManager(),
	Creator 		= new objectCreator(),
	Input 			= new InputManager(),
	selectedObjects = new ObjectsManager(),
	Menu 			= new MenuManager(),
	actContextMenu 	= false,
	Logger 			= new LogManager(),
	Listeners		= new ListenersManager(),
	timeLine		= new TimeLine(),
	EventHistory 	= new EventSaver(),
	Content			= new ContentManager(),
	FPS				= 60,
	Files			= new FileManager(),
	Project			= new ProjectManager("Gabriel Csollei"),
	Paints			= new PaintManager(),
	Task 			= null,
	Events 			= typeof EventManager !== KEYWORD_UNDEFINED ? new EventManager() : null,
	SelectedText	= null,
	Options 		= new OptionsManager(),
	drawEvent 		= new EventTimer(realDraw, 16),
	draw 			= () => drawEvent.callIfCan(),
	components		= {
		draw : true,
		share : true,
		watch : true,
		tools : true,
		save : true,
		load : true,
		screen : true,
		content : true,
		edit : true
	},
	drawMousePos, Layers, canvas, context, chatViewer;

var Components = {
	draw	: () => isDefined(components) && isDefined(components["draw"]) && components["draw"] === true,
	share	: () => isDefined(components) && isDefined(components["share"]) && components["share"] === true,
	watch	: () => isDefined(components) && isDefined(components["watch"]) && components["watch"] === true,
	tools	: () => isDefined(components) && isDefined(components["tools"]) && components["tools"] === true,
	save	: () => isDefined(components) && isDefined(components["save"]) && components["save"] === true,
	load	: () => isDefined(components) && isDefined(components["load"]) && components["load"] === true,
	screen	: () => isDefined(components) && isDefined(components["screen"]) && components["screen"] === true,
	content	: () => isDefined(components) && isDefined(components["content"]) && components["content"] === true,
	edit	: () => isDefined(components) && isDefined(components["edit"]) && components["edit"] === true
};

function sendMessage(message){
	if(typeof Watcher !== "undefined")
		Watcher.sendMessage(message, Project.autor);

	if(typeof Sharer !== "undefined" && Sharer.isSharing)
		Sharer.sendMessage(message, Project.autor);

	chatViewer.recieveMessage(message, Project.autor);
}

function ajax(url, options, dataType){
	if(isFunction(options)){
		options = {success: options};
		if(isString(dataType))
			options["dataType"] = dataType;
	}
	else if(!isObject(options))
		options = {};

	options["method"] = options["method"] || "GET";
	options["async"] = options["async"] || true;

	var start = 0;
	var xhttp = window.XMLHttpRequest ?  new XMLHttpRequest() :  new ActiveXObject("Microsoft.XMLHTTP");

	if(isFunction(options["abort"]))
		xhttp.onabort = options["abort"];
	if(isFunction(options["error"]))
		xhttp.onerror = options["error"];
	if(isFunction(options["progress"]))
		xhttp.onprogress = options["progress"];
	if(isFunction(options["timeout"]))
		xhttp.ontimeout = options["timeout"];
	if(isFunction(options["loadEnd"]))
		xhttp.onloadend = () => options["loadEnd"]((window["performance"].now() - start));
	if(isFunction(options["loadStart"]))
		xhttp.onloadstart = function(){
			options["loadStart"]();
			start = window["performance"].now();
		};
	if(isFunction(options["success"])){
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200 && isFunction(options["success"])){
				switch(options["dataType"]){
					case "json" :
						options["success"](JSON.parse(xhttp.responseText));
						break;
					case "html" :
						options["success"](new DOMParser().parseFromString(xhttp.responseText, "text/xml"));
						break;
					case "xml" :
						options["success"](new DOMParser().parseFromString(xhttp.responseText, "text/xml"));
						break;
					default :
						options["success"](xhttp.responseText)
				}
			}
		};
	}
	xhttp.open(options["method"], url, options["async"]);
	xhttp.send();
}

$.getJSON(FOLDER_JSON + "/context.json", data => ContextMenuManager.items = data);
$.getJSON(FOLDER_JSON + "/attributes.json", data => Entity.attr = data);


function init(){
	Scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));

	Scene.addToScene(new Line([new GVector2f(10, 400), new GVector2f(300, 450)], 5, "#66CCCC"));

	Scene.addToScene(new Arc(new GVector2f(600, 300), new GVector2f(50, 50), "#66CCCC"));

	Scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));
	Scene.addToScene(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "#00ff00"));

	Scene.addToScene(new Polygon([new GVector2f(1200, 100), new GVector2f(1150, 150), new GVector2f(1250, 150)], "#ff69b4"));
	Scene.addToScene(new Table(new GVector2f(800, 250), new GVector2f(200, 800), [["meno", "vek"], ["gabo", 21], ["maros", 35]]), "test2");

	loadImage(e => Scene.addToScene(new ImageObject(new GVector2f(300, 400), new GVector2f(300, 400), e)));



	var methods = {
		getArea: {
			name: "getArea",
			retType: "number",
			access: ACCESS_PUBLIC,
			args: "void"
		},
		getPosition:{
			name: "getPosition",
			retType: "GVector2f",
			access: ACCESS_PROTECTED,
			args: "void"
		}
	};

	var attrs = {
		x : {
			name: "x",
			access: ACCESS_PROTECTED,
			type: "number"
		},
		y : {
			name: "y",
			access: ACCESS_PROTECTED,
			type: "number"
		},
		width : {
			name: "width",
			access: ACCESS_PROTECTED,
			type: "number"
		},
		height : {
			name: "height",
			access: ACCESS_PROTECTED,
			type: "number"
		}
	};
	Scene.addToScene(new Class(new GVector2f(500, 150), new GVector2f(250, 250), "Rectange", attrs, methods));

	draw();
}

$(function(){
	/**
	 * DOLEZITE!!!
	 */
	canvas = document.getElementById("myCanvas");
	initCanvasSize();
	context = canvas.getContext("2d");

	$.getJSON(FOLDER_JSON + "/menu.json",function(data){
		Menu.init(data);
		$.getJSON(FOLDER_JSON + "/creator.json", data => {
			Creator.init(data);
			Paints.rePaintImage(Creator.brushSize, Creator.brushColor);
		});
	});

	Scene.createLayer();
	Scene.createLayer("rightMenu", "gui");
	Scene.createLayer("test2");
	console.log("stranka sa nacítala za: ", (window["performance"].now() - initTime) + " ms");

	Options.init();
	context.shadowColor = DEFAULT_SHADOW_COLOR;
	Input.initListeners(canvas);

	if(typeof Watcher !== KEYWORD_UNDEFINED)
		Project._autor = "Watcher";

	chatViewer = new ChatViewer(Project.title + "'s chat", Project.autor, sendMessage);
	if(typeof Watcher !== KEYWORD_UNDEFINED)
		chatViewer.show();

	Layers = new LayersViewer();
	Scene.addToScene(Layers, "rightMenu");
	Creator.view = new CreatorViewer(new GVector2f(Menu.position.x + (Menu.size.x + MENU_OFFSET) * 8 - MENU_OFFSET, Menu.position.y - MENU_OFFSET));

	draw();
});

function realDraw(){
	drawMousePos = new Date().getMilliseconds();
	if(!isObject(context))
		return Logger.notif("context počas kreslenia nieje definovaný");
	resetCanvas();

	if(Options.grid)
		drawGrid();

	Scene.draw();
	Creator.draw();
	Menu.draw();
	if(actContextMenu)
		actContextMenu.draw();
	Logger.log("kreslí sa všetko", LOGGER_DRAW);
	//timeLine.draw();
}