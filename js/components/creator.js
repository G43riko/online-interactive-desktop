class objectCreator{
	constructor(){
		this._object = false;
		this._fillColor = DEFAULT_COLOR;
		this._operation = OPERATION_DRAW_RECT;
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
				this._object = new Line([position, position.getClone()], 5, this._fillColor);
				break;
		}
		selectedObjects.clearAndAdd(this._object);
	}

	draw(){
		if(this._object)
			this._object.draw();
	}

	get object(){return this._object;}
	get color(){return this._fillColor;}
	get operation(){return this._operation;}

	set object(val){this._object = val;}
	set color(val){this._fillColor = val;}
	set operation(val){this._operation = val;}
}