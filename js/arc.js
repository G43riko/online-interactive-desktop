function Arc(position, size, color) {
    this.position	= position;
    this.color 		= color;
    this.size 		= size;
};	

Arc.prototype.borderWidth 	= DEFAULT_STROKE_WIDTH;
Arc.prototype.borderColor 	= DEFAUL_STROKE_COLOR;
Arc.prototype.selected 		= false;
Arc.prototype.visible 		= true;
Arc.prototype.moving 		= false;
Arc.prototype.moveType 	= -1;

Arc.prototype.clickIn = function(x, y){
	this.moveType = -1;
	var pos = this.position; //new GVector2f(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
	if(new GVector2f(x, y).dist(pos.x + this.size.x / 2, pos.y) < SELECTOR_SIZE)
		this.moveType = 0;
	else if(new GVector2f(x, y).dist(pos.x + this.size.x, pos.y + this.size.y / 2) < SELECTOR_SIZE)
		this.moveType = 1;
	else if(new GVector2f(x, y).dist(pos.x + this.size.x / 2, pos.y + this.size.y) < SELECTOR_SIZE)
		this.moveType = 2;
	else if(new GVector2f(x, y).dist(pos.x, pos.y + this.size.y / 2) < SELECTOR_SIZE)
		this.moveType = 3;
	else if(new GVector2f(x, y).dist(pos.x + this.size.x, pos.y + this.size.y) < SELECTOR_SIZE)
		this.moveType = 5;
	else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
		this.moveType = 4;
	return this.moveType >= 0;
}

Rect.prototype.toString = function(){
	return Json.stringify({
		pX: this.position.x,
		pY: this.position.y,
		sX: this.size.x, 
		sY: this.size.y,
		bW: this.borderWidth,
		bC: this.borderColor,
		c: this.color,
		v: this.visible
	});
};

Arc.prototype.draw = function(){
	if(!this.visible)
		return;
	if(this.moving)
		setShadow(true);


	context.beginPath();
	context.fillStyle = this.color;
	//context.arc(this.position.x, this.position.y, Math.abs(this.size.x), Math.abs(this.size.y), 0, 2 * Math.PI);
	context.ellipse(this.position.x + this.size.x / 2,
					this.position.y + this.size.y / 2,
					Math.abs(this.size.x / 2), 
					Math.abs(this.size.y / 2), 
					0, 
					0, 
					Math.PI * 2);
	context.fill()

	if(this.moving)
		setShadow(false);

	if(this.selected){
		/*
		context.lineWidth = this.borderWidth;
		context.strokeStyle = this.borderColor;
		//context.arc(this.position.x, this.position.y, this.size.x, this.size.y, 0, 2 * Math.PI);
		context.ellipse(this.position.x + this.size.x / 2, 
						this.position.y + this.size.y / 2, 
						Math.abs(this.size.x / 2), 
						Math.abs(this.size.y / 2), 
						0, 
						0, 
						Math.PI * 2);
		context.stroke();
		*/

		drawBorder(this);
	}
}