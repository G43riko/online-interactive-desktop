class Entity{
	constructor(name, position = new GVector2f(), size = new GVector2f(), fillColor = DEFAULT_COLOR){
		this._position 		= position;
		this._size 			= size;
		this._name 			= name;
		this._fillColor 	= fillColor;
		this._borderWidth 	= 3;
		this._borderColor 	= shadeColor1(fillColor, -20);
		this._selected 		= false;
		this._visible 		= true;
		this._moving 		= false;
		this._locked		= false;
		this._minSize 		= false;
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

	get name(){return this._name;}
	get size(){return this._size;}
	get locked(){return this._locked;}
	get minSize(){return this._minSize;}
	get visible(){return this._visible;}
	get selected(){return this._selected;}
	get position(){return this._position;}
	get fillColor(){return this._fillColor;}
	get borderWidth(){return this._borderWidth;}
	get borderColor(){return this._borderColor;}


	set locked(val){this._locked = val};
	set selected(val){this._selected = val;}
	set fillColor(val){this._fillColor = val};
	set borderColor(val){this._borderColor = val};

}