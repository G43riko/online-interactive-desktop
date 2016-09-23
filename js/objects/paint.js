class Paint extends Entity{
	constructor(){
		super(OBJECT_PAINT, new GVector2f(), new GVector2f());
		this._points 		= [Paint.defArray()];
		this._count 		= 0;

		this._canvas		= new CanvasManager();
		this.onScreenResize();
		this._action		= PAINT_ACTION_BRUSH;
		this._editBackup	= [];
	}

	onScreenResize(){
		this._canvas.setCanvasSize(canvas.width, canvas.height);
	}
	static defArray(){
		return {
			color: null,
			action: null,
			size: null,
			type: null,
			points: []
		}
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
			//inst.addPoint(points[i]["points"][ii], points[i]["color"]);
			Creator.setOpt(ATTRIBUTE_BRUSH_COLOR, points[i]["color"]);
			Creator.setOpt(ATTRIBUTE_BRUSH_SIZE, points[i]["size"]);
			Creator.setOpt(ATTRIBUTE_BRUSH_TYPE, points[i]["type"]);
			inst.addPoint(points[i]["points"][ii]);

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
			if(i > limit || isNull(e["color"]))
				return;
			res.push(e);


			if(Creator.brushColor !== e["color"])
				Creator.setOpt("brushColor", e["color"]);
			if(Creator.brushSize !== e["size"])
				Creator.setOpt("brushSize", e["size"]);
			if(Creator.brushType !== e["type"])
				Creator.setOpt("brushType", e["type"]);

			e["points"].forEach(function(ee, ii, arr){
				if(ii)
					this._drawLine(ee, arr[ii - 1], this._actColor)
			}, this);
		}, this);
		this._points = res;
		if(points.length > 0 && points[points.length - 1]["points"].length)
			this.breakLine();
		Logger.log("prekresluje sa " + this.constructor.name, LOGGER_DRAW);
	}

	undo(){
		if(this._points.length === 1)
			return false;

		if(isNull(this._points[this._points.length - 1]["color"]))
			this._points.pop();

		this._editBackup.push(this._points.pop());

		this.redraw(this._points);
		if(this._points.length === 0)
			this._points.push(Paint.defArray());
	}

	redo(){
		if(this._editBackup.length == 0)
			return false;

		if(isNull(this._points[this._points.length - 1]["color"]))
			this._points.pop();
		this._points.push(this._editBackup.pop());
		this.redraw(this._points); // toto nemusí prepisovať celé
	}


	/**
	 * Pridá nový pod do malby podla aktualne nakresleneho štetca
	 *
	 * @param point
	 */
	addPoint(point){
		if(this._points.length === 0)
			this._points.push(Paint.defArray());

		var lastArr = this._points[this._points.length - 1],
			arr = lastArr["points"];

		this._editBackup = [];
		this._count++;

		if(isNull(lastArr["color"])){ //TODO toto nižšie sa bude asi stále prepisovať
			lastArr["color"] = Creator.brushColor;
			lastArr["action"] = Paints.action;
			lastArr["type"] = Creator.brushType;
			lastArr["size"] = Creator.brushSize;
		}

		if(arr.length)
			this._drawLine(arr[arr.length - 1], point);
		arr.push(point);
	}

	fromObject(content){
		each(content, ee => each(ee["points"], (e, i , arr) => arr[i] = new GVector2f(e._x, e._y)));

		each(content, ee => {
			each(ee["points"], (e, i , arr) => {
				arr[i] = new GVector2f(e._x, e._y);
			})
		});
		this.redraw(content);
	}

	toObject(){
		return this._points;
	}

	_drawLine(pointA, pointB){
		if(this._action == PAINT_ACTION_LINE){
			this._canvas.context.lineCap 		= LINE_CAP_ROUND;
			this._canvas.context.lineWidth 		= this.borderWidth;
			this._canvas.context.strokeStyle	= Creator.brushColor;
			this._canvas.context.beginPath();
			this._canvas.context.moveTo(pointA.x, pointA.y);
			this._canvas.context.lineTo(pointB.x, pointB.y);
			this._canvas.context.stroke();
		}
		else if(this._action == PAINT_ACTION_BRUSH){
			var dist 	= pointA.dist(pointB),
				angle 	= Math.atan2(pointA.x - pointB.x, pointA.y - pointB.y);
			for (var i = 0; i < dist; i++)
				this._canvas.context.drawImage(Paints.selectedBrush,
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
		this._canvas.context.clearRect(0, 0, canvas.width, canvas.height);
		Logger.log("Bol vyčistený objekt " + this.constructor.name, LOGGER_OBJECT_CLEANED);
	}

	breakLine(){
		if(this._points.length === 0)
			this._points.push(Paint.defArray());
		else if(this._points[this._points.length - 1].points.length < 2)
			this._points[this._points.length - 1] = Paint.defArray();
		else
			this._points.push(Paint.defArray());
	}

	draw(ctx = context) {
		if (!this.visible)
			return;
		ctx.drawImage(this._canvas.canvas, 0, 0);
	};
}