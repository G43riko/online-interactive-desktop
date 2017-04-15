class Polygon extends Entity{
	constructor(points, color){
		super(OBJECT_POLYGON, new GVector2f(), new GVector2f(), {
			fillColor: color,
			points: points,
            movingPoint: -1
		});
		//this.points 		= points;
		//this.movingPoint	= -1;
		if(points.length < 3){
			Logger.warn(getMessage(MSG_POLYGON_WITH_TOO_LESS_POINTS));
			Scene.remove(this);
		}

		Entity.findMinAndMax(points, this.position, this.size);
	}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y)){
			return false;
		}

		this._points.forEach(function(e, i){
			if(new GVector2f(x, y).dist(e) < SELECTOR_SIZE){
				this._points.splice(i, 1);
				Entity.findMinAndMax(this._points, this._position, this.size);
			}
		}, this);

		if(this._points.length < 3){
			Scene.remove(this);
		}

		return true;
	}

	clickIn(x, y) {
		if (!this.clickInBoundingBox(x, y)){
			return false;
		}

		this.movingPoint = -1;
        let vec = new GVector2f(x, y);
		this._points.forEach(function(e,i, points){
			if(this.movingPoint >= 0){
				return true;
			}
			if(vec.dist(e) < SELECTOR_SIZE){
				this.movingPoint = i;
			}
			else if(i < points.length && vec.dist((e.x + (points[(i + 1) % points.length].x) >> 1),
													  (e.y + (points[(i + 1) % points.length].y) >> 1)) < SELECTOR_SIZE){
				this.movingPoint = parseFloat(i) + 0.5;
			}
		}, this);

		if(this.movingPoint >= 0){
			return true;
		}

        return this._isPointIn(x, y);
	}

	get points(){
		return this._points;
	}

    updateCreatingPosition(pos){
        this._points[this._points.length - 1].set(pos);
        //G.last(this._points).set(pos);
		let thirdPoint = this._points[1];
		let dir = this._points[0].getClone().sub(pos);
		let center = this._points[0].getClone().add(pos).div(2);

		let length = Math.sin(Math.PI / 3) * dir.length();
        dir.set(dir.y, -dir.x).normalize();
		thirdPoint.set(center.add(dir.mul(length)));

        Entity.findMinAndMax(this._points, this.position, this.size);
    }

    _hover(x, y){
        let val = this._isPointIn(x, y);
        setCursor(val ? CURSOR_POINTER : CURSOR_DEFAULT);
        return val !== false;
    }

    _isPointIn(x, y){
        if(this._points < 2){
            return false;
        }
        let countLeft = 0;
        let countRight = 0;
        let unRecognized = [];
        each(this._points, function(a, i, arr){
            let b = arr[(i + 1) % arr.length];
            //ak prechadza hor. čiarov kde je bod
            if((a.y >= y && b.y < y) || (a.y <= y && b.y > y)){
                if(b.x > x && a.x > x){
                    countRight++;
                }
                else if(b.x < x && a.x < x){
                    countLeft++;
                }
                else{//nenachada sa ani nalavo ani napravo
                    unRecognized.push([a.x, a.y, b.x, b.y]);
                }
            }
        });

        if(unRecognized.length === 0 && (countRight % 2 === 0 || countLeft % 2 === 0 )){
            return false;
        }

        //TODO skontrolovať nerozpoznane čiary;

        return true;
    }

	draw(ctx = context){
		doPolygon({
			shadow: this.moving && !this.locked,
			points: this._points,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth,
			//radius: this.radius,
			ctx: ctx
		});
		if(this.selected){
			drawBorder(ctx, this, {});
			for(let i=0 ; i<this._points.length ; i++){
                let min = i - 1;
				if(i === 0){
					min = this._points.length - 1;
				}
				drawSelectArc(ctx, this._points[i].x, this._points[i].y);
				drawSelectArc(ctx, (this._points[i].x + this._points[min].x) >> 1, (this._points[i].y + this._points[min].y) >> 1);
			}
		}

	}
}