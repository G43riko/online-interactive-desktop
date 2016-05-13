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

Rect.prototype.clickIn = function(x, y){
	return x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y;
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
		context.lineWidth = this.borderWidth;
		context.strokeStyle = this.borderColor;
		context.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
	}

};
