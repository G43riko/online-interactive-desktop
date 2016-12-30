const MINIMAL_DIAGONAL = 10;

class Area{
	constructor(){
		this.clear();
		this._name = OBJECT_AREA;
		this._moving = false;
		this._min = new GVector2f();
		this._max = new GVector2f();
		this._offset = new GVector2f()
	};

	get name(){
		return this._name;
	}

	get moving(){
		return this._moving;
	}

	move(x, y){
		this._offset.add(x, y);
	}

	set moving(val){
		this._moving = val;
		if(!val){
			each(this._points, (e) => {
				e.x += this._offset.x;
				e.y += this._offset.y;
			});
			this._min.add(this._offset);
			this._max.add(this._offset);
			this._offset.set(0, 0);
		}
	}

	get isCreating(){
		return this._isCreating;
	}

	clear(){
		this._points = [];
		this._isCreating = false;
	}

	get isReady(){
		return this._min && this._max && this._min.dist(this._max) > MINIMAL_DIAGONAL;
	}

	removeSelected(onBorder, revert = false){
		var inst = this;
		var size = this._max.getClone().sub(this._min);
		Project.scene.forEach(function(e){

			var tl = inst._isPointIn(e.position.x, e.position.y),
				tr = inst._isPointIn(e.position.x + e.size.x, e.position.y),
				bl = inst._isPointIn(e.position.x, e.position.y + e.size.y),
				br = inst._isPointIn(e.position.x + e.size.x, e.position.y + e.size.y);

			if(onBorder){//ak sa maže aj z hranice tak stačí aby bol 1 roh vo vnutry
				if(tl || tr || bl || br){
					Scene.remove(e);
				}
			}
			else{
				if(tl && tr && bl && br){//ináč musia byť všetky
					Scene.remove(e);
				}
			}

		})
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

		var val = x > this._min.x && y > this._min.y && x < this._max.x && y < this._max.y;

		if(val)
			val = this._isPointIn(x, y);
		setCursor(val ? CURSOR_POINTER : CURSOR_DEFAULT);
		return val !== false;
	}

	clickIn(x, y){
		return this._isPointIn(x, y);
	}

	addPoint(position){
		var last = this._points[this._points.length - 1];
		
		doLine({
			points: [last.x, last.y, position.x, position.y],
			borderWidth: 5,
			borderColor: "blue"
		});

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
			offset: this._offset,
			borderWidth: 5,
			borderColor: "red"
		})

	}
}