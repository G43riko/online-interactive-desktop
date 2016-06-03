var GVetor2fCounter = 0;
var GVetor2fCounterClone = 0;
class GVector2f{
	constructor(){
		GVetor2fCounter++;
		if(arguments.length == 0){
			this._x = 0;
			this._y = 0;
		}
		else if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x = arguments[0].x;
				this._y = arguments[0].y;
			}
			else{
				this._x = arguments[0];
				this._y = arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x = arguments[0];
			this._y = arguments[1];
		}
	}

	get x(){return this._x;}
	get y(){return this._y;}

	set x(val){this._x = val;}
	set y(val){this._y = val;}

	getLength(){
		return Math.sqrt(this._x * this._x + this._y * this._y);
	}

	getClone(){
		GVetor2fCounterClone++;
		return new GVector2f(this._x, this._y);
	}

	add(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x += arguments[0].x;
				this._y += arguments[0].y;
			}
			else{
				this._x += arguments[0];
				this._y += arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x += arguments[0];
			this._y += arguments[1];
		}
		return this
	}
	br(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x >>= arguments[0].x;
				this._y >>= arguments[0].y;
			}
			else{
				this._x >>= arguments[0];
				this._y >>= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x >>= arguments[0];
			this._y >>= arguments[1];
		}
		return this
	}

	bl(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x <<= arguments[0].x;
				this._y <<= arguments[0].y;
			}
			else{
				this._x <<= arguments[0];
				this._y <<= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x <<= arguments[0];
			this._y <<= arguments[1];
		}
		return this
	}

	div(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x /= arguments[0].x;
				this._y /= arguments[0].y;
			}
			else{
				this._x /= arguments[0];
				this._y /= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x /= arguments[0];
			this._y /= arguments[1];
		}
		return this
	}

	sub(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x -= arguments[0].x;
				this._y -= arguments[0].y;
			}
			else{
				this._x -= arguments[0];
				this._y -= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x -= arguments[0];
			this._y -= arguments[1];
		}
		return this
	}

	mul(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this._x *= arguments[0].x;
				this._y *= arguments[0].y;
			}
			else{
				this._x *= arguments[0];
				this._y *= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x *= arguments[0];
			this._y *= arguments[1];
		}
		return this
	}

	dist(){
		if(arguments.length == 1)
			return Math.sqrt(Math.pow(this._x - arguments[0].x, 2) + Math.pow(this._y - arguments[0].y, 2));
		else if(arguments.length == 2)
			return Math.sqrt(Math.pow(this._x - arguments[0], 2) + Math.pow(this._y - arguments[1], 2));
	}

	set(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])) {
				this._x = arguments[0].x;
				this._y = arguments[0].y;
			}
			else{
				this._x = arguments[0];
				this._y = arguments[0];
			}
		}
		else if(arguments.length == 2){
			this._x = arguments[0];
			this._y = arguments[1];
		}
		return this;
	}
}