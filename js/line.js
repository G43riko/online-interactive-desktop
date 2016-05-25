function Line(points, width, color) {
	this.points = points;
	this.points.push(new GVector2f(points[0].x, points[0].y));
	this.color 	= color;
	this.width = width;
	this.findMinAndMax();
}

Line.prototype.borderWidth 	= DEFAULT_STROKE_WIDTH;
Line.prototype.borderColor 	= DEFAUL_STROKE_COLOR;
Line.prototype.selected 	= false;
Line.prototype.visible 		= true;
Line.prototype.moving 		= false;
Line.prototype.movingPoint	= -1;

Line.prototype.clickInBoundingBox = function(x, y){
	return x + SELECTOR_SIZE > this.position.x && x - SELECTOR_SIZE < this.position.x + this.size.x &&
		   y + SELECTOR_SIZE > this.position.y && y - SELECTOR_SIZE < this.position.y + this.size.y;
};

Line.prototype.clickIn = function(x, y){
	if(!this.clickInBoundingBox(x, y))
		return false;

	/*
	 this.points.forEach(function(e,i, points){
	 if(result)
	 return;
	 var intVal = parseInt(i);
	 if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE)
	 result = intVal;

	 else if(intVal + 1 < points.length &&
	 new GVector2f(x, y).dist((e.x + points[intVal + 1 + ""].x) >> 1,
	 (e.y + points[intVal + 1 + ""].y) >> 1) < SELECTOR_SIZE)
	 result = parseFloat(i) + 0.5;

	 });
	 this.movingPoint = result;
	 return result != false;
	 */

	for(var i in this.points){
		var intVal = parseInt(i);
		if(new GVector2f(x, y).dist(this.points[i]) < SELECTOR_SIZE){
			this.movingPoint = intVal;
			return true;
		}
		else if(intVal + 1 < this.points.length && 
			new GVector2f(x, y).dist((this.points[i].x + (this.points[intVal + 1 + ""].x) >> 1),
									 (this.points[i].y + (this.points[intVal + 1 + ""].y) >> 1)) < SELECTOR_SIZE){
			this.movingPoint = parseFloat(i) + 0.5;
			return true;
		}
	}
	return true;
};

Line.prototype.findMinAndMax = function(){
	var min = new GVector2f(this.points[0]);
	var max = new GVector2f(this.points[0]);
	for(var i=1 ; i<this.points.length ; i++){
		min.x = Math.min(this.points[i].x, min.x);
		min.y = Math.min(this.points[i].y, min.y);
		max.x = Math.max(this.points[i].x, max.x);
		max.y = Math.max(this.points[i].y, max.y);
	}
	this.position = min;
	this.size = new GVector2f(max.x - min.x, max.y - min.y);
};

Line.prototype.toString = function(){
	return Json.stringify({
		sX: this.width,
		bW: this.borderWidth,
		bC: this.borderColor,
		c: this.color,
		v: this.visible
	});
};

Line.prototype.updateCreatingPosition = function(pos){
	var last = this.points[this.points.length - 1];
	last.x = pos.x;
	last.y = pos.y;
	this.findMinAndMax();
};

Line.prototype.draw = function(){
	if(this.points.length < 2)
		return;
	var i;
	context.beginPath();
	context.moveTo(this.points[0].x, this.points[0].y);

	for(i=1 ; i<this.points.length ; i++)
		context.lineTo(this.points[i].x, this.points[i].y);


	context.lineWidth = this.width;
	context.strokeStyle = this.color;
	context.stroke();

	if(this.selected){
		drawSelectArc(this.points[0].x, this.points[0].y);
		for(i=1 ; i<this.points.length ; i++){
			drawSelectArc(this.points[i].x, this.points[i].y);
			drawSelectArc((this.points[i].x + this.points[i - 1].x) >> 1, (this.points[i].y + this.points[i - 1].y) >> 1);
		}
	}
	//drawBorder(this);
};
