class Area{
	constructor(){
		this.clear();

		this._min = new GVector2f();
		this._max = new GVector2f();
	};

	get isCreating(){
		return this._isCreating;
	}

	clear(){
		this._points = [];
		this._isCreating = false;
	}

	_isPointIn(x, y){
		if(this._points < 2)
			return false;
		var countLeft = 0; 
		var countRight = 0;
		var unRecognized = [];
		each(this._points, function(a, i, arr){
			var b = arr[(i + 1) % arr.length];
			//ak prechadza hor. čiarov kde je bod
			if((a.y >= y && b.y < y) || (a.y <= y && b.y > y)){
				if(b.x > x && a.x > x)
					countRight++;
				else if(b.x < x && a.x < x)
					countLeft++;
				else{//nenachada sa ani nalavo ani napravo
					unRecognized.push([a.x, a.y, b.x, b.y]);
				}
			}
		});

		if(unRecognized.length == 0 && (countRight % 2 == 0 || countLeft % 2 == 0 ))
			return false;

		//TODO skontrolovať nerozpoznane čiary;

		return true;

	}

	hover(x, y){
		if(this._isCreating)
			return false;

		var val = x > this._min.x && y > this._min.y &&
				  x < this._max.x && y < this._max.y;

		if(val)
			val = this._isPointIn(x, y);
		setCursor(val ? CURSOR_POINTER : CURSOR_DEFAULT);
	}


	addPoint(position){
		var last = this._points[this._points.length - 1];
		
		doLine({
			points: [last.x, last.y, position.x, position.y],
			borderWidth: 5,
			borderColor: "blue"
		})

		this._min.x = Math.min(this._min.x, position.x);
		this._min.y = Math.min(this._min.y, position.y);
		this._max.x = Math.max(this._max.x, position.x);
		this._max.y = Math.max(this._max.y, position.y);

		this._points.push(position);
	};

	startCreate(position){
		this.clear();
		this._points.push(position);
		this._isCreating = true;
		this._min.set(position);
		this._max.set(position);
	};

	endCreate(position){
		this._points.push(position);
		this._isCreating = false;

		this._min.x = Math.min(this._min.x, position.x);
		this._min.y = Math.min(this._min.y, position.y);
		this._max.x = Math.max(this._max.x, position.x);
		this._max.y = Math.max(this._max.y, position.y);
	};

	draw(ctx = context){
		if(this._isCreating || this._points.length <= 3)
			return;

		doPolygon({
			points: this._points,
			borderWidth: 5,
			borderColor: "red"
		})

	}
}