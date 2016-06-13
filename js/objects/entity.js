class Entity{
	constructor(name, position = new GVector2f(), size = new GVector2f(), fillColor = DEFAULT_COLOR){
		this._position 			= position;
		this._size 				= size;
		this._name 				= name;
		this._fillColor 		= fillColor;
		this._borderWidth 		= 3;
		this._borderColor 		= shadeColor1(fillColor, -20);
		this._selected 			= false;
		this._visible 			= true;
		this._moving 			= false;
		this._locked			= false;
		this._minSize 			= false;
		this._selectedConnector = false;
		this._layer				= "default";
		this._connectors 		= [new GVector2f(0.5, 0), new GVector2f(0.5, 1), new GVector2f(0, 0.5), new GVector2f(1, 0.5)];
		this._id				= Entity.getId();
	}

	static getId(){
		var id;
		do
			id = parseInt(Math.random() * 1000000);
		while(typeof Entity._ides[id] !== "undefined");
		Entity._ides[id] = 1;
		return id;
	}



	addConnector(){
		objectToArray(arguments).forEach(function(e){
			this._connectors.push(e);
		}, this);
	}

	/**
	 * vráti true ak je šanca že bolo kliknuté na niektorú časť objektu
	 */
	clickInBoundingBox(x, y, obj = this){
		return x + SELECTOR_SIZE > obj._position.x && x - SELECTOR_SIZE < obj._position.x + obj._size.x &&
			   y + SELECTOR_SIZE > obj._position.y && y - SELECTOR_SIZE < obj._position.y + obj._size.y;
	};

	clickIn(x, y){
		return false;
	};

	draw(){};

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
		if(Creator.operation != OPERATION_DRAW_JOIN)
			return;

		obj._connectors.forEach(function(e){
			drawConnector(e, obj);
		});
	};

	static clone(obj){
		var copy = Object.create(obj.__proto__);

		$.each(obj, function(i, e){
			if(e.constructor.name == "GVector2f")
				copy[i] = e.getClone();
			else if(i == "data"){
				copy[i] = [];
				e.forEach(function(ee){
					var tmp = [];
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
	set fillColor(val){this._fillColor = val;}
	set borderWidth(val){this._borderWidth = val;}
	set borderColor(val){this._borderColor = val;}
	set selectedConnector(val){this._selectedConnector = val;}

}