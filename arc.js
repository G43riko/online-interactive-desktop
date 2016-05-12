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

Arc.prototype.clickIn = function(x, y){
	return this.position.dist(x, y) < this.size.x;
}

Arc.prototype.draw = function(){
	if(!this.visible)
		return;
	if(this.moving)
		setShadow(true);

	context.beginPath();
	context.fillStyle = this.color;
	context.arc(this.position.x, this.position.y, Math.abs(this.size.x), Math.abs(this.size.y), 0, 2 * Math.PI);
	context.fill()

	if(this.selected){
		context.lineWidth = this.borderWidth;
		context.strokeStyle = this.borderColor;
		context.arc(this.position.x, this.position.y, this.size.x, this.size.y, 0, 2 * Math.PI);
		context.stroke();
	}

	if(this.moving)
		setShadow(false);
}