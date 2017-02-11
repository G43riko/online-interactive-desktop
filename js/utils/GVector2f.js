/*
	compatible:	14.9.2016
*/

var GVector2fCounter = 0;
var GVector2fCounterClone = 0;

class GVector2f{
	constructor(){
		GVector2fCounter++;
		if(arguments.length === 0){
			this._x = 0;
			this._y = 0;
		}
		else if(arguments.length === 1){
			if(isNaN(arguments[0])){
				this._x = arguments[0].x;
				this._y = arguments[0].y;
			}
			else{
				this._x = this._y = arguments[0];
			}
		}
		else if(arguments.length === 2){
			this._x = arguments[0];
			this._y = arguments[1];
		}
	}

	get x(){return this._x;}
	get y(){return this._y;}

	set x(val){this._x = val;}
	set y(val){this._y = val;}

	getClone(){
		GVector2fCounterClone++;
		return new GVector2f(this._x, this._y);
	}

	toArray(){
		return [this._x, this._y];
	}

	equal(vec){
		return vec._x == this._x && vec._y == this._y;
	}

	getLength(){
		return Math.sqrt(this._x * this._x + this._y * this._y);
	}

	normalize(){
		return this.div(this.getLength());
	}

	_process(){
		if(arguments[0].length == 1){
			if(isNaN(arguments[0][0])){
				this._x = arguments[1](this._x, arguments[0][0].x);
				this._y = arguments[1](this._y, arguments[0][0].y);
			}
			else{
				this._x = arguments[1](this._x, arguments[0][0]);
				this._y = arguments[1](this._y, arguments[0][0]);
			}
		}
		else if(arguments[0].length == 2){
			this._x = arguments[1](this._x, arguments[0][0]);
			this._y = arguments[1](this._y, arguments[0][1]);
		}
		return this;
	}
	round(){
		this._x = Math.round(this._x);
		this._y = Math.round(this._y);
		return this;
	}

	static angle(v1, v2){
		var v1Len = v1.length();
		var v2Len = v2.length();
		var dotProduct = (v1.x / v1Len) * (v2.x / v2Len) + 
						 (v1.y / v1Len) * (v2.y / v2Len);
		return Math.acos(dotProduct) * (180 / Math.PI);
	}

	

	br(){return this._process(arguments, (a, b) => a >> b);}
	bl(){return this._process(arguments, (a, b) => a << b);}
	add(){return this._process(arguments, (a, b) => a + b);}
	div(){return this._process(arguments, (a, b) => a / b);}
	sub(){return this._process(arguments, (a, b) => a - b);}
	mul(){return this._process(arguments, (a, b) => a * b);}
	set(){return this._process(arguments, (a, b) => b);}
	
	length(){
		return Math.sqrt(this._x * this._x + this._y * this._y);
	}

	dist(){
		if(arguments.length == 1){
			return Math.sqrt(Math.pow(this._x - arguments[0].x, 2) + Math.pow(this._y - arguments[0].y, 2));
		}
		else if(arguments.length == 2){
			return Math.sqrt(Math.pow(this._x - arguments[0], 2) + Math.pow(this._y - arguments[1], 2));
		}
	}

}