var GVetor2fCounter = 0;
var GVetor2fCounterClone = 0;
class GVector2f{
	constructor(){
		GVetor2fCounter++;
		if(arguments.length == 0){
			this.x = 0;
			this.y = 0;
		}
		else if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this.x = arguments[0].x;
				this.y = arguments[0].y;
			}
			else{
				this.x = arguments[0];
				this.y = arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x = arguments[0];
			this.y = arguments[1];
		}
	}

	getLength(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	getClone(){
		GVetor2fCounterClone++;
		return new GVector2f(this.x, this.y);
	}

	add(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this.x += arguments[0].x;
				this.y += arguments[0].y;
			}
			else{
				this.x += arguments[0];
				this.y += arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x += arguments[0];
			this.y += arguments[1];
		}
		return this
	}
	br(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this.x >>= arguments[0].x;
				this.y >>= arguments[0].y;
			}
			else{
				this.x >>= arguments[0];
				this.y >>= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x >>= arguments[0];
			this.y >>= arguments[1];
		}
		return this
	}

	bl(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this.x <<= arguments[0].x;
				this.y <<= arguments[0].y;
			}
			else{
				this.x <<= arguments[0];
				this.y <<= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x <<= arguments[0];
			this.y <<= arguments[1];
		}
		return this
	}

	div(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this.x /= arguments[0].x;
				this.y /= arguments[0].y;
			}
			else{
				this.x /= arguments[0];
				this.y /= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x /= arguments[0];
			this.y /= arguments[1];
		}
		return this
	}

	sub(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this.x -= arguments[0].x;
				this.y -= arguments[0].y;
			}
			else{
				this.x -= arguments[0];
				this.y -= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x -= arguments[0];
			this.y -= arguments[1];
		}
		return this
	}

	mul(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])){
				this.x *= arguments[0].x;
				this.y *= arguments[0].y;
			}
			else{
				this.x *= arguments[0];
				this.y *= arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x *= arguments[0];
			this.y *= arguments[1];
		}
		return this
	}

	dist(){
		if(arguments.length == 1)
			return Math.sqrt(Math.pow(this.x - arguments[0].x, 2) + Math.pow(this.y - arguments[0].y, 2));
		else if(arguments.length == 2)
			return Math.sqrt(Math.pow(this.x - arguments[0], 2) + Math.pow(this.y - arguments[1], 2));
	}

	set(){
		if(arguments.length == 1){
			if(isNaN(arguments[0])) {
				this.x = arguments[0].x;
				this.y = arguments[0].y;
			}
			else{
				this.x = arguments[0];
				this.y = arguments[0];
			}
		}
		else if(arguments.length == 2){
			this.x = arguments[0];
			this.y = arguments[1];
		}
		return this;
	}
}