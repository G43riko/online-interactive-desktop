function Paint(color, width) {
    this.color = color;
    this.width = width;
    this.points = [[]];
};

Paint.prototype.addPoint = function(point){
	this.points[this.points.length - 1].push(point);
}

Paint.prototype.breakLine = function(){
	this.points.push([]);
}

Paint.prototype.draw = function(){
	context.beginPath();
	for(var i in this.points){
		var points2 = this.points[i];
		context.moveTo(points2[0].x, points2[0].y);
		for(var j=1 ; j<points2.length ; j++){
			var points3 = points2[j];
			context.lineTo(points3.x, points3.y);
		}
	}


	context.lineWidth = this.width;
	context.strokeStyle = this.color;
	context.stroke();
}