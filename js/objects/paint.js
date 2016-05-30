class Paint extends Entity{
	constructor(color, width){
		super("Paint", new GVector2f(), new GVector2f(), color);
		this.width 	= width;
		this.points = [[]];
		this.count 	= 0;
	}

	cleanUp(){
		this.points = [[]];
		this.count = 0;
	};

	addPoint(point){
		if (this.count == 0) {
			this.position.set(point);
			this.size.set(point);
		}
		else {
			this.position.x = Math.min(point.x, this.position.x);
			this.position.y = Math.min(point.y, this.position.y);
			this.size.x = Math.min(point.x, this.size.x);
			this.size.y = Math.min(point.y, this.size.y);
		}
		this.count++;
		this.points[this.points.length - 1].push(point);
	};

	breakLine() {
		this.points.push([]);
	};

	draw() {
		var j;
		if (!this.visible)
			return;

		context.beginPath();
		this.points.forEach(function (points2) {
			if (points2.length < 2)
				return;
			context.moveTo(points2[0].x, points2[0].y);
			for (j = 1; j < points2.length; j++)
				context.lineTo(points2[j].x, points2[j].y);
		});
		context.lineWidth = this.width;
		context.strokeStyle = this.fillColor;
		context.stroke();
	};
}