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
		this._brushColor	= DEFAULT_BRUSH_COLOR;
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

	finishCreating(){
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
		var result = Entity.create(obj, false);
		if(result){
			Scene.addToScene(result, result.layer, false);
			draw();
		}
		return result;
	}

	set(key, val){
		if(key[0] != "_")
			key = "_" + key;

		this[key] = val;

		if(key === "_brushType"){
			if(val !== "line")
				Scene.paint.setImage(val);
		}

		if(isIn(key, "_fillColor", "_borderColor", "_fontColor", "_color", "_brushColor") && isDefined(this._view))
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
	get brushColor(){return this._brushColor;}

	set object(val){this._object = val;}
	set operation(val){this._operation = val; this._view.changeOperation()}
}