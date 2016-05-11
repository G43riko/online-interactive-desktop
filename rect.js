function Rect(position, size, color) {
    this.position = position;
    this.size = size;
    this.color = color;
};

Rect.prototype.moving = false;
Rect.prototype.selected = false;

Rect.prototype.clickIn = function(x, y){
	return x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y;
}

Rect.prototype.draw = function(){
	if(this.moving)
		setShadow(true);

	context.fillStyle = this.color;
	context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

	if(this.selected){
		context.lineWidth = DEFAULT_STROKE_WIDTH;
		context.strokeStyle = DEFAUL_STROKE_COLOR;
		context.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
	}

	if(this.moving)
		setShadow(false);
};

Rect.prototype.move = function(x, y){
	this.position.x += x;
	this.position.y += y;
}