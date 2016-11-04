class Paint extends Entity{
	constructor(){
		super(OBJECT_PAINT, new GVector2f(), new GVector2f());
		this._points 		= [Paint.defArray()];
		this._count 		= 0;
		this._canvas		= new CanvasManager();
		this.onScreenResize();
		this._editBackup	= [];
	}

	onScreenResize(){
		this._canvas.setCanvasSize(canvas.width, canvas.height);
		this.redraw(this._points);
	}
	static defArray(){
		return {
			color: null,
			action: null,
			size: null,
			type: null,
			points: [],
			min: null,
			max: null,
			forRemove: false
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

			e["points"].forEach(function(ee, ii, arr){
				if(ii)
					Paints.drawLine(this._canvas.context, ee, arr[ii - 1], e["size"], e["color"], e["action"], e["type"]);
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


	animateLine(line, time = 0){
		if(time === 0){
			//console.log("pred: ", this._points);
			//console.log("last: ", last);
			if(this._points[this._points.length - 1]["points"].length > 0){
				this._points.push(line);

				//console.log("a");
			}
			else{
				this._points[this._points.length - 1] = line;
				this._points.push(Paint.defArray());
				//console.log("b");
			}
			//console.log("po: ", this._points);
			this.redraw(this._points);
		}
		draw();
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
			lastArr["min"] = point.getClone();
			lastArr["max"] = point.getClone();
		}

		if(arr.length)
			Paints.drawLine(this._canvas.context, arr[arr.length - 1], point, Creator.brushSize, Creator.brushColor, Paints.action, Creator.brushType);
		lastArr["min"].x = Math.min(lastArr["min"].x, point.x);
		lastArr["min"].y = Math.min(lastArr["min"].y, point.y);
		lastArr["max"].x = Math.max(lastArr["max"].x, point.x);
		lastArr["max"].y = Math.max(lastArr["max"].y, point.y);
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
		else{
			this._points.push(Paint.defArray());
			return this._points[this._points.length - 2];
		}
		return false;
	}

	findPathsForRemove(pos){
		//TODO dorobiť na porovnávanie čiarok pretože toto porovnáva len body a pri rýchlich pohyboch to nemusí trafiť
		var pointsToRemove = [];
		each(this._points, (e, i) => {
			if(!e["forRemove"] && e["min"] && e["max"]){
				var offset = (Creator.brushSize >> 1) + (e["size"] >> 1);
				if(pos.x + offset > e["min"].x - e["size"] && pos.y + offset > e["min"].y &&
				   pos.x - offset < e["max"].x + e["size"] && pos.y - offset < e["max"].y ){
					each(e["points"], ee => {
						if(!e["forRemove"] && ee.dist(pos) < Creator.brushSize){//TODO tu má byť asi offset
							e["forRemove"] = true;
							pointsToRemove.push({
								line: e, 
								points: [],
								lineIndex: i
							});
						}
					});
				}
			}
		});
		return false;
		if(pointsToRemove.length){//ak existuje čiara ktorá sa má vymazať
			console.log(pointsToRemove);
			each(pointsToRemove, (e) => {
				var line1Points = [];
				var line2Points = [];
				each(e.line.points, (ee) => {
					if(ee.dist(pos) < Creator.brushSize)
						e.points.push(ee);
					else{
						if(e.points) // druha čast
							line1Points.push(ee);
						else // prvá časť
							line2Points.push(ee);
					}
				})
				//vymaže povodnu čiaru
				console.log(e.line.points, e.points, line1Points, line2Points)
				this._points.splice(e.lineIndex, 1);
				//vytvorí prvú čast
				var line1 = {};
				line1["action"] = e.line["action"];
				line1["color"] = e.line["color"];
				line1["forRemove"] = false;
				//line1["max"]; //TODO dopočítať
				//line1["min"]; //TODO dopočítať
				line1["points"] = line1Points;
				line1["size"] = e.line["size"];
				line1["type"] = e.line["type"];
				this._points.push(line1);
				console.log(line1, this._points);
				this.redraw(this._points);
			})
		}
		
	}

	removeSelectedPaths(){
		var i = this._points.length;
		while (i--)
			if(this._points[i]["forRemove"])
				this._points.splice(i, 1);
		/*
		each(this._points, (e, i, arr) => {
			if(e["forRemove"]){
				arr.splice(i, 1);
			}
		});
		*/
		this.redraw(this._points);
	}

	draw(ctx = context) {
		if (!this.visible)
			return;
		ctx.drawImage(this._canvas.canvas, 0, 0);
		/*
		each(this._points, e => {
			if(!isNull(e["min"]) && e["points"].length > 4)
				doRect({
					x: e["min"].x,
					y: e["min"].y,
					width: e["max"].x - e["min"].x,
					height: e["max"].y - e["min"].y,
					borderColor: "black",
					ctx: ctx
				})
		})
		*/
	};
}