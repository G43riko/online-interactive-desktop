class Line extends Entity{
	constructor(points, width, color) {
		super("Line", new GVector2f(), new GVector2f(), color);

		this.points 			= points;
		this._borderWidth		= width;
		this.movingPoint		= -1;
		this._lineCap			= LINE_CAP_BUTT;
		this._joinType			= LINE_JOIN_MITER;
		this._lineStyle			= LINE_STYLE_NORMAL;
		this._lineType			= JOIN_LINEAR;
		this._radius			= 0;
		this._arrow 			= new Image();
		this._arrow.src 		= "img/arrow.png";
		this._arrowEndType		= 0;
		this._arrowStartType	= 0;

		if(points.length < 2){
			Logger.warn("vytvoril sa line ktory mal menej ako 2 body a tak sa maže");
			Scene.remove(this);
		}

		Entity.findMinAndMax(this.points, this.position, this.size);
	}



	set radius(val){this._radius = val;}

	set lineCap(val){this._lineCap = val;}
	set arrowEndType(val){this._arrowEndType = val;}
	set lineType(val){this._lineType = val;}
	set joinType(val){this._joinType = val;}
	set lineStyle(val){this._lineStyle = val;}
	set arrowStartType(val){this._arrowStartType = val;}

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
			center = min.add(max).br(1);

			if(Math.abs(y - center.y) < maxDist)
				return true;
		}
		return false;
	};

	updateCreatingPosition(pos){
		this.points[this.points.length - 1].set(pos);
		Entity.findMinAndMax(this.points, this.position, this.size);
	};

	static getArrowPoints(pFrom, pTo, length = 30, angle = Math.PI / 6){
		var vec = pTo.getClone().sub(pFrom).normalize();
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		var result = [[pTo.x - (vec.x * cos - vec.y * sin) * length,
					   pTo.y - (vec.x * sin + vec.y * cos) * length,
					   pTo.x,
					   pTo.y]];

		result.push([pTo.x + (-vec.x * cos - vec.y * sin) * length,
					 pTo.y + (vec.x * sin - vec.y * cos) * length,
					 pTo.x,
					 pTo.y]);

		return result;
	}

	draw(){
		var size = this.points.length;
		//var res = Line.getArrowPoints(this.points[this.points.length - 2], this.points[this.points.length - 1], this._length, this._angle);
		//res = res.concat(Line.getArrowPoints(this.points[1], this.points[0], this._length, this._angle));
		//res.push(this.points);
		
		doLine({
			shadow: this.moving && !this.locked,
			lineCap: this._lineCap,
			joinType: this._joinType,
			lineStyle: this._lineStyle,
			//points: res,
			points: this.points,
			borderWidth: this.borderWidth,
			borderColor: this.fillColor,
			radius: this._radius,
			lineDash: this._lineStyle == LINE_STYLE_STRIPPED ? [15, 5] : []
		});

		Arrow.drawArrow(this.points[1], this.points[0], this, this._arrowEndType);
		Arrow.drawArrow(this.points[size - 2], this.points[size - 1], this, this._arrowStartType);

		context.lineWidth = DEFAULT_STROKE_WIDTH << 1;
		if(this.selected){
			drawBorder(this, {});
			drawSelectArc(this.points[0].x, this.points[0].y);
			for(var i=1 ; i<size ; i++){
				drawSelectArc(this.points[i].x, this.points[i].y);
				drawSelectArc((this.points[i].x + this.points[i - 1].x) >> 1, (this.points[i].y + this.points[i - 1].y) >> 1);
			}
		}
		/*
		context.save();
		context.translate(this.points[0].x, this.points[0].y);
		context.rotate(Math.PI + Math.atan2(this.points[1].y - this.points[0].y, this.points[1].x - this.points[0].x));
		context.drawImage(this._arrow, -40, -20, 40, 40);
		context.restore();
		*/
	};
}