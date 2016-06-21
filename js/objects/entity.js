class Entity{
	/*name, position, size, /*attr*/
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
		this._radius 			= 0;
		this._layer				= "default";

		if(isUndefined(this._connectors))
			this._connectors 	= [new GVector2f(0.5, 0), new GVector2f(0.5, 1), new GVector2f(0, 0.5), new GVector2f(1, 0.5)];
		
		if(isUndefined(this._id))
			this._id			= Entity.getId();

		Entity.changeAttr(this, data);

		if(isUndefined(this._borderWidth))
			this._borderWidth 	= Creator.lineWidth;

		if(isUndefined(this._fillColor))
			this._fillColor 	= Creator.color;

		if(isUndefined(this._borderColor))
			this._borderColor 	= shadeColor1(this._fillColor, -20);
	}

	static getId(){
		var id;
		do
			id = parseInt(Math.random() * 1000000);
		while(isDefined(Entity._ides[id]));
		Entity._ides[id] = 1;
		return id;
	}

	addConnector(){
		objectToArray(arguments).forEach(e => this._connectors.push(e), this);
	}

	/**
	 * vráti true ak je šanca že bolo kliknuté na niektorú časť objektu
	 */
	clickInBoundingBox(x, y, obj = this){
		return x + SELECTOR_SIZE > obj._position.x && x - SELECTOR_SIZE < obj._position.x + obj._size.x &&
			   y + SELECTOR_SIZE > obj._position.y && y - SELECTOR_SIZE < obj._position.y + obj._size.y;
	};

	clickIn(x, y){return false;};

	draw(){};

	static setAttr(obj, attr, val){
		if(isUndefined(Entity["attr"]) || isDefined(Entity["attr"]["Entity"][attr]) || isDefined(Entity["attr"][obj.name][attr]))
			obj["_" + attr] = val;
		else
			Logger.error("k objektu " + obj.name + " sa snaží priradiť neplatný atribút: " + attr);
	}

	static changeAttr(obj, data, val){
		if(typeof data == "object")
			each(data, (e, i) => Entity.setAttr(obj, i, e));
		else 
			Entity.setAttr(obj, data, val);
		return obj;
	}

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

	static drawConnectors(obj){
		if(Creator.operation != OPERATION_DRAW_JOIN && (Creator.operation != OPERATION_DRAW_LINE || !Menu.isToolActive()))
			return;

		obj._connectors.forEach(e => drawConnector(e, obj));
	};

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

	static clone(obj){
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
		Scene.addToScene(copy);
	}

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