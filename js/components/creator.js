class objectCreator{
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
		this._radius		= DEFAULT_RADIUS;
		this._items 		= null;
		this._view			= null;
	}

	set view(val){
		this._view = val;

		if(this._items !== null)
			this.init()
	}

	init(data = false){
		if(this._items === null && data !== false)
			this._items = data;

		if(this._view !== null)
			this._view.init();
	}

	get items(){return this._items;}

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

		if(this._view !== null && this._items !== null)
			this._view.draw();
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

	set(key, val){
		if(key[0] != "_")
			key = "_" + key;

		this[key] = val;

		if(isIn(key, "_fillColor", "_borderColor", "_fontColor") && isDefined(this._view))
			this._view.init();

	}

	clickIn(x, y){
		return isDefined(this._view) ? this._view.clickIn(x, y) : false;
	}

	get object(){return this._object;}
	get radius(){return this._radius;}
	get color(){return this._fillColor;}
	get fillColor(){return this._fillColor;}
	get fontSize(){return this._fontSize;}
	get fontColor(){return this._fontColor;}
	get operation(){return this._operation;}
	get lineWidth(){return this._lineWidth;}
	get borderColor(){return this._borderColor;}
	get borderWidth(){return this._borderWidth;}
	get lineType(){return this._lineType;}
	get lineStyle(){return this._lineStyle;}
	get brushSize(){return this._brushSize;}
	get brushType(){return this._brushType;}

	set object(val){this._object = val;}
	set color(val){this._fillColor = val;}
	set lineWidth(val){this._lineWidth = val;}
	set operation(val){this._operation = val; this._view.changeOperation()}
}