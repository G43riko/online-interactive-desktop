class Paint extends Entity{
	constructor(){
		super("Paint", new GVector2f(), new GVector2f());
		this._points 		= [Paint.defArray()];
		this._count 		= 0;
		this._canvas 		= document.createElement("canvas");
		this._canvas.width 	= canvas.width;
		this._canvas.height	= canvas.height;
		this._context 		= this._canvas.getContext('2d');
		this._action		= PAINT_ACTION_BRUSH;
		this._brush			= new BrushManager();
		this._editBackup	= [];
	}

	static defArray(){
		return {
			color: null,
			action: null,
			size: null,
			points: []
		}
	}

	get selectedImg(){
		return this._brush.selectedImage;
	}
	setImage(title){
		this._brush.selectedImage = title;
	}
	getImage(title){
		return this._brush.getBrush(title);
	}
	addImage(title){
		this._brush.addBrush(title);
	}

	animate(speed = 20, limit = this._points.length - 1){
		var points 	= this._points,
			i 		= 0,
			ii 		= 0,
			inst 	= this;
		this.cleanUp();

		var interval = setInterval(function(){
			if(i >= limit || i >= points.length - 1){
				clearInterval(interval);
				return;
			}
			inst.addPoint(points[i]["points"][ii], points[i]["color"]);
			if(ii++ == points[i]["points"].length - 1){
				inst.breakLine();
				i++;
				ii = 0;
			}
			draw();
		}, speed);
	}

	redraw(points, limit = points.length - 1){
		this.cleanUp();
		var res = [];
		points.forEach(function(e, i){
			if(i > limit)
				return;
			res.push(e);

			if(this._actColor != e["color"])
				this._brush.rePaintImage(Creator.brushSize, e["color"]);
			this._actColor = e["color"];

			e["points"].forEach(function(ee, ii, arr){
				if(ii)
					this._drawLine(ee, arr[ii - 1], this._actColor)
			}, this);
		}, this);
		this._points = res;
		if(points[points.length - 1]["points"].length)
			this.breakLine();
		draw();
	}

	undo(){
		if(isNull(this._points[this._points.length - 1]["color"]))
			this._points.pop();

		this._editBackup.push(this._points.pop());

		this.redraw(this._points);
	}

	redo(){
		if(this._editBackup.length == 0)
			return false;

		if(isNull(this._points[this._points.length - 1]["color"]))
			this._points.pop();
		this._points.push(this._editBackup.pop());
		this.redraw(this._points); // toto nemusí prepisovať celé
	}

	addPoint(point, color = "#000000"){
		var lastArr = this._points[this._points.length - 1],
			arr = lastArr["points"];

		this._editBackup = [];
		this._count++;
		if(isSharing())
			Sharer.paint.addPoint(point, color);

		if(this._actColor != color)
			this._brush.rePaintImage(Creator.brushSize, color);

		this._actColor = color;

		if(isNull(lastArr["color"])){
			lastArr["color"] = color;
			lastArr["action"] = this._action;
			lastArr["size"] = Creator.brushSize;
		}

		if(arr.length)
			this._drawLine(arr[arr.length - 1], point, color);

		arr.push(point);
	}

	_drawLine(pointA, pointB, color){
		if(this._action == PAINT_ACTION_LINE){
			this._context.lineCap 		= LINE_CAP_ROUND;
			this._context.lineWidth 	= this.borderWidth;
			this._context.strokeStyle	= color;
			this._context.beginPath();
			this._context.moveTo(pointA.x, pointA.y);
			this._context.lineTo(pointB.x, pointB.y);
			this._context.stroke();
		}
		else if(this._action == PAINT_ACTION_BRUSH){
			var dist 	= pointA.dist(pointB),
				angle 	= Math.atan2(pointA.x - pointB.x, pointA.y - pointB.y);
			for (var i = 0; i < dist; i++)
				this._context.drawImage(this._brush.selectedBrush,
					pointB.x + (Math.sin(angle) * i) - (Creator.brushSize >> 1),
					pointB.y + (Math.cos(angle) * i) - (Creator.brushSize >> 1),
					Creator.brushSize,
					Creator.brushSize);
		}
	}

	cleanUp(){
		this._points = [Paint.defArray()];
		this._points[this._actColor] = [[]];
		this._count = 0;
		this._context.clearRect(0, 0, canvas.width, canvas.height);
		if(isSharing())
			Sharer.paint.clean();
	}

	breakLine(){
		this._points.push(Paint.defArray());
		if(isSharing())
			Sharer.paint.breakLine();
	}

	draw() {
		if (!this.visible)
			return;
		context.drawImage(this._canvas, 0, 0);
	};
}