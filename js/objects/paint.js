class Paint extends Entity{
	constructor(color, width){
		super("Paint", new GVector2f(), new GVector2f(), color);
		this.borderWidth = width;
		this._points = {color: [[]]};
		this._count 	= 0;
		this._actColor = color;
	}

	cleanUp(){
		this._points = {color: [[]]};
		this._count = 0;
	};

	addPoint(point, color = "black"){
		if (this._count == 0) {
			this.position.set(point);
			this.size.set(point);
		}
		else {
			this.position.x = Math.min(point.x, this.position.x);
			this.position.y = Math.min(point.y, this.position.y);
			this.size.x = Math.min(point.x, this.size.x);
			this.size.y = Math.min(point.y, this.size.y);
		}
		this._count++;


		this._actColor = color;
		if(!this._points.hasOwnProperty(this._actColor))
			this._points[this._actColor] = [[]];

		this._points[this._actColor][this._points[this._actColor].length - 1].push(point)
	};

	breakLine() {
		this._points[this._actColor].push([]);
	};

	draw() {
		if (!this.visible)
			return;

		context.lineWidth = this.borderWidth;
		$.each(this._points, function(color, e){
			context.beginPath();
			e.forEach(function (points2) {
				if (points2.length < 2)
					return;
				points2.forEach(function(point, i){
					if(i == 0)
						context.moveTo(point.x, point.y);
					else
						context.lineTo(point.x, point.y);
				});
			});
			context.strokeStyle = color;
			context.stroke();
		});
	};
}