function Paint(color, width) {
    this.color = color;
    this.width = width;
    this.points = [[]];
    this.min = this.max = false;
}

Paint.prototype.addPoint = function(point){
	if(!this.min && !this.max){
		this.min = new GVector2f(point);
		this.max = new GVector2f(point);
	}
	else{
		this.min.x = Math.min(point.x, this.min.x);
		this.min.y = Math.min(point.y, this.min.y);
		this.max.x = Math.min(point.x, this.max.x);
		this.max.y = Math.min(point.y, this.max.y);
	}
	this.points[this.points.length - 1].push(point);
};

Paint.prototype.clickInBoundingBox = function(x, y){
	if(!this.min && !this.max)
		return false;
	return x + SELECTOR_SIZE / 2 > this.min.x && x - SELECTOR_SIZE / 2 < this.min.x + this.max.x && 
		   y + SELECTOR_SIZE / 2 > this.min.y && y - SELECTOR_SIZE / 2 < this.min.y + this.max.y;
};

Paint.prototype.clickIn = function(){

};

Paint.prototype.visible = true;

Paint.prototype.breakLine = function(){
	this.points.push([]);
};

Paint.prototype.draw = function(){
	var j;
	if(!this.visible)
		return;
	
	context.beginPath();
	this.points.forEach(function(points2){
		if(points2.length == 0)
			return;
		context.moveTo(points2[0].x, points2[0].y);
		for(j=1 ; j<points2.length ; j++)
			context.lineTo(points2[j].x, points2[j].y);
	});
	/*
	for(var i in this.points){
		var points2 = this.points[i];
		if(points2.length == 0)
			continue;
		context.moveTo(points2[0].x, points2[0].y);
		for(var j=1 ; j<points2.length ; j++)
			context.lineTo(points2[j].x, points2[j].y);
	}
	*/
	context.lineWidth = this.width;
	context.strokeStyle = this.color;
	context.stroke();

};