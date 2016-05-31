class Line extends Entity{
	constructor(points, width, color) {
		super("Line", new GVector2f(), new GVector2f(), color);

		this.points 		= points;
		this._borderWidth 	= width;
		this.movingPoint	= -1;
		this._lineCap		= LINE_CAP_BUTT;
		this._joinType		= LINE_JOIN_MITER;
		this._lineStyle		= LINE_STYLE_NORMAL;
		this._lineType		= JOIN_LINEAR;

		if(points.length < 2){
			Logger.warn("vytvoril sa line ktory mal menej ako 2 body a tak sa maže");
			Scene.remove(this);
		}

		Entity.findMinAndMax(this.points, this.position, this.size);
	}

	set lineCap(val){this._lineCap = val;}
	set lineType(val){this._lineType = val;}
	set joinType(val){this._joinType = val;}
	set lineStyle(val){this._lineStyle = val;}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		this.points.forEach(function(e, i){
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE){
				this.points.splice(i, 1);
				Entity.findMinAndMax(this.points, this.position, this.size);
			}
		}, this);

		if(this.points.length < 2)
			Scene.remove(this);

		return true;
	};

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		this.movingPoint = -1;
		this.points.forEach(function(e,i, points){
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

		for(var i=1 ; i<this.points.length ; i++)
			if(Line.determineClick(this.points[i-1], this.points[i], x, y, 10))
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
			center = min.getClone().add(max).br(1);

			if(Math.abs(y - center.y) < maxDist)
				return true;
		}
		return false;
	};

	updateCreatingPosition(pos){
		var last = this.points[this.points.length - 1];
		last.x = pos.x;
		last.y = pos.y;
		this.findMinAndMax();
	};

	draw(){

		context.save();
		if (this.moving && !this.locked)
			setShadow(true);

		context.lineCap = this._lineCap;
		context.lineJoin = this._joinType;
		if(this._lineStyle == LINE_STYLE_STRIPPED)
		setLineDash(true);

		drawLine(this.points, this._borderWidth , this.fillColor, this._lineStyle);

		context.restore();

		context.lineWidth = DEFAULT_STROKE_WIDTH << 1;
		if(this.selected){
			drawBorder(this, {});
			drawSelectArc(this.points[0].x, this.points[0].y);
			for(var i=1 ; i<this.points.length ; i++){
				drawSelectArc(this.points[i].x, this.points[i].y);
				drawSelectArc((this.points[i].x + this.points[i - 1].x) >> 1, (this.points[i].y + this.points[i - 1].y) >> 1);
			}
		}
	};
}