class objectCreator{
	constructor(){
		this._object = false;
		this._color = DEFAULT_COLOR;
		this._operation = OPERATION_DRAW_RECT;
	}

	draw(){
		if(this._object)
			this._object.draw();
	}

	get object(){
		return this._object;
	}

	set object(val){
		this._object = val;
	}

	get color(){
		return this._color;
	}

	set color(val){
		this._color = val;
	}

	get operation(){
		return this._operation;
	}

	set operation(val){
		this._operation = val;
	}
}