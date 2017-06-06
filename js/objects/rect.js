class Rect extends Entity {
	constructor(position, size, fillColor){
		super(OBJECT_RECT, position, size, {
			fillColor: fillColor,
			moveType: -1
		});
		this._innerText	= "";
		this._isRhombus	= false;
		this.minSize 	= new GVector2f(SELECTOR_SIZE);
		if(!this._isRhombus){
			this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1));
        }
		//this._radius = Creator.radius;
		//console.log("creator: " + Creator.radius);
	}
    setCenterText(text){
		this._innerText = text;
	}
	setRhombus(val){
		this._isRhombus = val;
	}
//	set radius(val){
		//this._radius = parseFloat(val);
		/*
		if(this._radius < 1)
			this._radius *= 100;
		*/
//		this._checkRadius();
//	}

    /**
	 * Funkcia upravý pozíciu objektu pri vytváraní
	 *
     * @param {GVector2f} pos - nová pozícia objektu
     */
	updateCreatingPosition(pos){
		this.size.x = Math.abs(pos.x - this.position.x);
		this.size.y = Math.abs(pos.y - this.position.y);
	}

	_hover(x, y){
        if(this._mouseOver){
            setCursor(this._locked ? CURSOR_NOT_ALLOWED : CURSOR_POINTER);
			return true;
		}

		setCursor(CURSOR_DEFAULT);
		return false;
	}

	_clickIn(x, y){
		let vec = new GVector2f(x, y);
		this.moveType = -1;
		if(Input.isKeyDown(KEY_L_CTRL)){
			this.checkConnectors(vec);
			if(this._selectedConnector){
				return true;
			}
		}
		
		Entity.setMoveType(this, vec);

		return this.moveType >= 0;
	}

	_checkRadius(){
        let minRadius = Math.min(this.size.x, this.size.y) >> 1;
		return this._radius > minRadius ? minRadius : this._radius;
	}

	_draw(ctx){
		if(this._isRhombus){
			doPolygon({
				points: [new GVector2f(this._position.x + this._size.x / 2, this._position.y),
						 new GVector2f(this._position.x, this._position.y + this._size.y / 2),
						 new GVector2f(this._position.x + this._size.x / 2, this._position.y + this._size.y),
						 new GVector2f(this._position.x + this._size.x, this._position.y + this._size.y / 2)],
                fillColor: this.fillColor,
                shadow: this.moving && !this.locked,
                borderWidth: this.borderWidth,
                borderColor: this.borderColor,
                ctx: ctx
			})
		}
		else{
            doRect({
                position: this.position,
				size: this.size,
                fillColor: this.fillColor,
                shadow: this.moving && !this.locked,
                borderWidth: this.borderWidth,
                borderColor: this.borderColor,
                radius: this._checkRadius(),
                ctx: ctx
            });
		}

		if(this._innerText){
            doText({
                textHalign: FONT_HALIGN_CENTER,
                textValign: FONT_VALIGN_MIDDLE,
                fontSize: 14,
                fontColor: this._borderColor,
                text: this._innerText,
                x: this._position.x + this._size.x / 2,
                y: this._position.y + this._size.y / 2,
                ctx: ctx
            });
		}
		Entity.drawConnectors(this, ctx);

		drawBorder(ctx, this);
	}
}
