class objectCreator{
	constructor(){
		this._object 		= false;
		this._fillColor 	= DEFAULT_FILL_COLOR;
		this._borderColor 	= DEFAULT_BORDER_COLOR;
		this._operation 	= OPERATION_DRAW_RECT;
		this._lineWidth 	= DEFAULT_STROKE_WIDTH;
	}

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
		}
		selectedObjects.clearAndAdd(this._object);
	}

	finishCreating(position){
		Scene.addToScene(this._object);
		this._object = false;
	}

	draw(){
		if(this._object)
			this._object.draw();
	}

	create(obj){
		var res = {};

		//AK NIEKTO POSLE JSON NAMIESTO OBJEKtU
		if(typeof obj === "string")
			obj = JSON.parse(obj);

		switch(obj._name){
			case "Rect" :
				res = new Rect();
				break;
			case "Arc" :
				res = new Arc();
				break;
			case "Table" :
				res = new Table();
				break;
			case "Text" :
				res = new Text("");
				break;
			case "Polygon" :
				res = new Polygon([0,0,0]);
				break;
			case "Line" :
				res = new Line([0,0,0]);
				break;
			default :
				Logger.error("snažíš sa vložiť objekt s neznámym menom: " + obj._name);
		}

		each(obj, function(e, i){
			if(isDefined(e["_x"]) && typeof isDefined(e["_y"]))
				res[i] = new GVector2f(e._x, e._y);
			else if(i == "data")
				res[i] = e.map(ee => ee.map(eee => eee));
			else if(i == "points")
				res[i] = e.map(ee => new GVector2f(ee._x, ee._y));
			else
				res[i] = e;
		});
		Scene.addToScene(res, obj.layer, false);
		draw();
	}

	get object(){return this._object;}
	get color(){return this._fillColor;}
	get operation(){return this._operation;}
	get lineWidth(){return this._lineWidth;}
	get borderColor(){return this._borderColor;}

	set object(val){this._object = val;}
	set color(val){this._fillColor = val;}
	set lineWidth(val){this._lineWidth = val;}
	set operation(val){this._operation = val;}
}