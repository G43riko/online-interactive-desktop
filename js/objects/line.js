class Line extends Entity{
	constructor(points, width, fillColor, targetA = null, targetConnectionA = null) {
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
		this._targetA			= targetA;
		this._targetConnectionA	= targetConnectionA;
		this._targetB			= null;
		this._targetConnectionB	= null;

		if(points.length < 2){
			Logger.warn("vytvoril sa line ktory mal menej ako 2 body a tak sa maže");
			Scene.remove(this);
		}
		Entity.findMinAndMax(this._points, this.position, this.size);
	}

	get points(){return this._points;}

	set lineCap(val){this._lineCap = val;}
	set arrowEndType(val){this._arrowEndType = val;}
	set lineType(val){this._lineType = val;}
	set joinType(val){this._joinType = val;}
	set lineStyle(val){this._lineStyle = val;}
	set arrowStartType(val){this._arrowStartType = val;}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		this._points.forEach(function(e, i){
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE){
				this._points.splice(i, 1);
				Entity.findMinAndMax(this._points, this.position, this.size);
			}
		}, this);

		if(this._points.length < 2)
			Scene.remove(this);

		return true;
	};

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		this.movingPoint = -1;
		this._points.forEach(function(e,i, points){
			if(this.movingPoint >= 0)
				return true;
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE)
				this.movingPoint = i;
			else if(i + 1 < points.length &&
				new GVector2f(x, y).dist((e.x + (points[i + 1].x) >> 1),
					(e.y + (points[i + 1].y) >> 1)) < SELECTOR_SIZE)
				this.movingPoint = parseFloat(i) + 0.5;
		}, this);

		if(this.movingPoint >= 0)
			return this.movingPoint >= 0;

		for(var i=1 ; i<this._points.length ; i++)
			if(Line.determineClick(this._points[i-1], this._points[i], x, y, 10))
				return true;


		return false;
	};

	static determineClick(p1, p2, x, y, maxDist){
		if(x < Math.min(p1.x, p2.x) || x > Math.max(p1.x, p2.x) || y < Math.min(p1.y, p2.y) || y > Math.max(p1.y, p2.y))
			return false;

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
			if(x > center.x)
				min = center;
			else
				max = center;
			center = min.add(max).br(1);

			if(Math.abs(y - center.y) < maxDist)
				return true;
		}
		return false;
	};

	updateCreatingPosition(pos){
		this._points[this._points.length - 1].set(pos);
		Entity.findMinAndMax(this._points, this.position, this.size);
	};

	draw(){
		var size = this._points.length;

		if(isNumber(this._radius) && this._radius > 1)
			this._radius += "";

		doLine({
			shadow: this.moving && !this.locked,
			lineCap: this._lineCap,
			joinType: this._joinType,
			lineStyle: this._lineStyle,
			points: this._points,
			borderWidth: this.borderWidth,
			borderColor: this.fillColor,
			radius: this.radius,
			lineDash: this._lineStyle == LINE_STYLE_STRIPPED ? [15, 5] : []
		});

		Arrow.drawArrow(this._points[1], this._points[0], this, this._arrowEndType);
		Arrow.drawArrow(this._points[size - 2], this._points[size - 1], this, this._arrowStartType);

		context.lineWidth = DEFAULT_STROKE_WIDTH << 1;
		if(this.selected){
			drawBorder(this, {});
			drawSelectArc(this._points[0].x, this._points[0].y);
			for(var i=1 ; i<size ; i++){
				drawSelectArc(this._points[i].x, this._points[i].y);
				drawSelectArc((this._points[i].x + this._points[i - 1].x) >> 1, (this._points[i].y + this._points[i - 1].y) >> 1);
			}
		}
	};
}