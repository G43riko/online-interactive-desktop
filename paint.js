function Paint(color, width) {
    this.color = color;
    this.width = width;
    this.points = [[]];
};

Paint.prototype.addPoint = function(point){
	this.points[this.points.length - 1].push(point);
}

Paint.prototype.visible = true;

Paint.prototype.breakLine = function(){
	this.points.push([]);
}

Paint.prototype.draw = function(){
	if(!this.visible)
		return;

	context.beginPath();
	for(var i in this.points){
		var points2 = this.points[i];
		if(points2.length == 0)
			continue;
		context.moveTo(points2[0].x, points2[0].y);
		for(var j=1 ; j<points2.length ; j++)
			context.lineTo(points2[j].x, points2[j].y);
	}
	context.lineWidth = this.width;
	context.strokeStyle = this.color;
	context.stroke();

}