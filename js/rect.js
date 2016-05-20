function Rect(position, size, color) {
	this.position 	= position;
	this.color 		= color;
	this.size 		= size;
};

Rect.prototype.borderWidth 	= DEFAULT_STROKE_WIDTH;
Rect.prototype.borderColor 	= DEFAUL_STROKE_COLOR;
Rect.prototype.selected 	= false;
Rect.prototype.visible 		= true;
Rect.prototype.moving 		= false;
Rect.prototype.moveType 	= -1;

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

Rect.prototype.loadData = function(text){
	var data = JSON.parse(text);

	this.position.x = data.pX;
	this.position.y = data.pY;
	this.size.x = data.sX;
	this.size.y = data.sY;
	this.borderWidth = data.bW;
	this.borderColor = data.bC;
	this.color = data.c;
	this.visible = data.v;

	draw();
}

Rect.prototype.clickIn = function(x, y){
	this.moveType = -1;
	if(new GVector2f(x, y).dist(this.position.x + this.size.x / 2, this.position.y) < SELECTOR_SIZE)
		this.moveType = 0;
	else if(new GVector2f(x, y).dist(this.position.x + this.size.x, this.position.y + this.size.y / 2) < SELECTOR_SIZE)
		this.moveType = 1;
	else if(new GVector2f(x, y).dist(this.position.x + this.size.x / 2, this.position.y + this.size.y) < SELECTOR_SIZE)
		this.moveType = 2;
	else if(new GVector2f(x, y).dist(this.position.x, this.position.y + this.size.y / 2) < SELECTOR_SIZE)
		this.moveType = 3;
	else if(new GVector2f(x, y).dist(this.position.x + this.size.x, this.position.y + this.size.y) < SELECTOR_SIZE)
		this.moveType = 5;
	else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
		this.moveType = 4;
	return this.moveType >= 0;
}

Rect.prototype.draw = function(){
	if(!this.visible)
		return;
	if(this.moving)
		setShadow(true);

	context.fillStyle = this.color;
	context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

	if(this.moving)
		setShadow(false);
	
	if(this.selected){
		drawBorder(this);
	}

};
