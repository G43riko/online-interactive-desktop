class Line extends Entity{
	constructor(points, width, fillColor, targetA = null, targetB = null) {
		super(OBJECT_LINE, new GVector2f(), new GVector2f(), {fillColor: fillColor, borderWidth: width});
		this._points 			= points;
		this.movingPoint		= -1;
		this._lineCap			= LINE_CAP_BUTT;
		this._joinType			= LINE_JOIN_MITER;
		this._lineStyle			= LINE_STYLE_NORMAL;
		this._lineType			= JOIN_LINEAR;
		this._arrow 			= new Image();
		this._arrow.src 		= "img/arrow.png";
		this._arrowEndType		= 0;
		this._arrowStartType	= 0;
		this.targetA 			= targetA;
		this.targetB 			= targetB;

		this._startText = null;
		/*
		this._startText = {
			text: "startText",
			dist: 70,
			angle: Math.PI / 2
		};
		*/
		this._text_A = "začiatok 10%";
		this._text_B = "koniec 90%";

		if(points.length < 2){
			Logger.warn("vytvoril sa line ktory mal menej ako 2 body a tak sa maže");
			Scene.remove(this);
		}
		Entity.findMinAndMax(this._points, this.position, this.size);
	}

	setStartText(text, dist = 0, angle = 0, ctx = context){
		if(arguments.length === 0 || !isString(text) || text.length === 0){
			this._startText = null;
			return;
		}
		var fontSize = 10;
		this._startText = {
			text: text,
			dist: dist,
			fontSize: fontSize,
			angle: angle,
			textWidth : CanvasHandler.calcTextWidth(ctx, text, fontSize + "pt Comic Sans MS")
		};

		if(this._startText.dist === 0){
			this._startText.dist = this._startText.textWidth;
		}
	}

	get points(){return this._points;}

	set lineCap(val){this._lineCap = val;}
	set arrowEndType(val){this._arrowEndType = val;}
	set lineType(val){this._lineType = val;}
	set joinType(val){this._joinType = val;}
	set lineStyle(val){this._lineStyle = val;}
	set arrowStartType(val){this._arrowStartType = val;}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y)){
			return false;
		}

		this._points.forEach(function(e, i){
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE){
				this._points.splice(i, 1);
				Entity.findMinAndMax(this._points, this.position, this.size);
			}
		}, this);

		//TODO determineClick ak niečo vráti tak sa vytvorí text

		if(this._points.length < 2){
			Scene.remove(this);
		}

		return true;
	}

	_clickIn(x, y){
		this.movingPoint = -1;

		if(this._startText !== null){
			var final = this._points[this._points.length - 1].getClone();
			var semiFinal = this._points[this._points.length - 2].getClone();
			var vector = semiFinal.sub(final).normalize();
			var angle = this._startText.angle;
			var newVector = new GVector2f(vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
				vector.x * Math.sin(angle) + vector.y * Math.cos(angle));
			var position = final.add(newVector.mul(this._startText.dist));
			if(position.dist(new GVector2f(x, y)) < this._startText.textWidth){
				console.log("aaaaaaaaaanooooooooo");
			}
		}


		this._points.forEach(function(e,i, points){
			if(this.movingPoint >= 0){
				return true;
			}
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE){
				this.movingPoint = i;
			}
			else if(i + 1 < points.length &&
				new GVector2f(x, y).dist((e.x + (points[i + 1].x) >> 1),
					(e.y + (points[i + 1].y) >> 1)) < SELECTOR_SIZE){
				this.movingPoint = parseFloat(i) + 0.5;
			}
		}, this);
		if(this.movingPoint >= 0){
			return this.movingPoint >= 0;
		}

		for(var i=1 ; i<this._points.length ; i++){
			if(Line.determineClick(this._points[i-1], this._points[i], x, y, 10)){
				return true;
			}
		}
		return false;
	}

	set targetB(val){
		var object = val ? val.id : "";
		if(this._targetB == object){
			return;
		}
		this._targetB			= object;
		this._targetLayerB		= val ? val.layer : "";
		this._targetConnectionB	= val ? val.selectedConnector : "";
	}

	set targetA(val){
		var object = val ? val.id : "";
		if(this._targetA == object){
			return;
		}
		this._targetA			= object;
		this._targetLayerA		= val ? val.layer : "";
		this._targetConnectionA	= val ? val.selectedConnector : "";
	}

	setTarget(val){
		if(this.movingPoint === 0){
			this.targetA = val;
		}
		else if(this.movingPoint == this.points.length - 1){
			this.targetB = val;
		}
	}

	static determineClick(p1, p2, x, y, maxDist){
		if(x < Math.min(p1.x, p2.x) || x > Math.max(p1.x, p2.x) || y < Math.min(p1.y, p2.y) || y > Math.max(p1.y, p2.y)){
			return false;
		}

		var dist = p1.dist(p2),
			log = Math.ceil(Math.log2(dist)),
			min,
			max,
			center,
			i;
		if(p1.x < p2.x){
			min = p1.getClone();
			max = p2.getClone();
		}
		else{
			min = p2.getClone();
			max = p1.getClone();
		}
		center = min.getClone().add(max).br(1);
		for(i=0 ; i<log ; i++){
			if(x > center.x){
				min = center;
			}
			else{
				max = center;
			}
			center = min.add(max).br(1);

			if(Math.abs(y - center.y) < maxDist){
				return true;
			}
		}
		return false;
	}

	updateCreatingPosition(pos){
		this._points[this._points.length - 1].set(pos);
		Entity.findMinAndMax(this._points, this.position, this.size);
	}

	draw(ctx = context){
		var obj, size = this._points.length;

		if(this._targetA){
			obj = Project.scene.getObject(this._targetLayerA, this._targetA);
			if(obj){
				this._points[0].set(obj.getConnectorPosition(this._targetConnectionA));
			}
			else{
				this.targetA = obj;
			}
		}

		if(this._targetB){
			obj = Project.scene.getObject(this._targetLayerB, this._targetB);
			if(obj){
				this._points[size - 1].set(obj.getConnectorPosition(this._targetConnectionB));
			}
			else{
				this.targetB = obj;
			}
		}
		if(this._targetA || this._targetB){
			Entity.findMinAndMax(this._points, this.position, this.size);
		}

		if(isNumber(this._radius) && this._radius > 1){
			this._radius += "";
		}

		doLine({
			shadow: this.moving && !this.locked,
			lineCap: this._lineCap,
			joinType: this._joinType,
			lineStyle: this._lineStyle,
			points: this._points,
			borderWidth: this.borderWidth,
			borderColor: this.fillColor,
			radius: this.radius,
			lineDash: this._lineStyle == LINE_STYLE_STRIPPED ? [15, 5] : [],
			ctx: ctx
		});

		Arrow.drawArrow(ctx, this._points[1], this._points[0], this, this._arrowEndType);
		Arrow.drawArrow(ctx, this._points[size - 2], this._points[size - 1], this, this._arrowStartType);

		var point, offset;

		//text_B
		var first = this._points[0].getClone();
		var second = this._points[1].getClone();
		offset = CanvasHandler.calcTextWidth(ctx, this._text_B, "10pt Comic Sans MS");
		point = first.add(second.sub(first).normalize().mul((offset >> 1) + 10));
		doRect({
			position: point,
			fillColor: "white",
			width: offset,
			height: 10,
			center: true,
			ctx: ctx
		});
		ctx.fillStyle = "black";
		ctx.textAlign = FONT_HALIGN_CENTER;
		ctx.textBaseline = FONT_VALIGN_MIDDLE;
		ctx.fillText(this._text_B, point.x, point.y);

		if(isObject(this._startText) && this._startText !== null){
			var final = this._points[this._points.length - 1].getClone();
			var semiFinal = this._points[this._points.length - 2].getClone();
			var vector = semiFinal.sub(final).normalize();
			var angle = this._startText.angle;
			var newVector = new GVector2f(vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
										  vector.x * Math.sin(angle) + vector.y * Math.cos(angle));
			var position = final.add(newVector.mul(this._startText.dist));
			doRect({
				position: position,
				fillColor: "white",
				width: this._startText.textWidth,
				height: this._startText.fontSize,
				center: true,
				ctx: ctx
			});
			ctx.fillStyle = "black";
			ctx.textAlign = FONT_HALIGN_CENTER;
			ctx.textBaseline = FONT_VALIGN_MIDDLE;
			ctx.fillText(this._startText.text, position.x, position.y);
		}
		/*
		if(isObject(this._startText)){
			var final = this._points[this._points.length - 1].getClone();
			var semiFinal = this._points[this._points.length - 2].getClone();
			var vector = semiFinal.sub(final).normalize();
			var angle = this._startText.angle;
			var newVector = new GVector2f(vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
										  vector.x * Math.sin(angle) + vector.y * Math.cos(angle));
			var textWidth = CanvasHandler.calcTextWidth(ctx, this._startText.text, "10pt Comic Sans MS");
			var position = final.add(newVector.mul(this._startText.dist));
			doRect({
				position: position,
				fillColor: "white",
				width: textWidth,
				height: 10,
				center: true,
				ctx: ctx
			});
			ctx.fillStyle = "black";
			ctx.textAlign = FONT_HALIGN_CENTER;
			ctx.textBaseline = FONT_VALIGN_MIDDLE;
			ctx.fillText(this._startText.text, position.x, position.y);
		}
		*/

		/*
		//text_A
		var last = this._points[this._points.length - 1].getClone();
		var subLast = this._points[this._points.length - 2].getClone();
		offset = CanvasHandler.calcTextWidth(ctx, this._text_A, "10pt Comic Sans MS");
		point = last.add(subLast.sub(last).normalize().mul((offset >> 1) + 10));
		doRect({
			position: point,
			fillColor: "white",
			width: offset,
			height: 10,
			center: true,
			ctx: ctx
		});
		ctx.fillStyle = "black";
		ctx.textAlign = FONT_HALIGN_CENTER;
		ctx.textBaseline = FONT_VALIGN_MIDDLE;
		ctx.fillText(this._text_A, point.x, point.y);
		*/


		context.lineWidth = DEFAULT_BORDER_WIDTH << 1;
		if(this.selected){
			drawBorder(ctx, this, {});
			drawSelectArc(ctx, this._points[0].x, this._points[0].y);
			for(var i=1 ; i<size ; i++){
				drawSelectArc(ctx, this._points[i].x, this._points[i].y);
				drawSelectArc(ctx, (this._points[i].x + this._points[i - 1].x) >> 1, (this._points[i].y + this._points[i - 1].y) >> 1);
			}
		}
	}
}