class TextField extends Entity{
	constructor(text, position, size, fontColor = DEFAULT_FONT_COLOR){
		super("Text", position, size, {
			fillColor: DEFAULT_FILL_COLOR,
			radius: DEFAULT_RADIUS,
			fontColor: fontColor,
			fontSize: DEFAULT_FONT_SIZE,
			moveType: -1,
			taskResult: false,
			highlight: false,
            fontOffset: DEFAULT_FONT_OFFSET,
            verticalTextAlign: FONT_VALIGN_TOP,
            horizontalTextAlign: FONT_HALIGN_LEFT,
			text: text || "",
			link: false
		});//TODO premenovať na input
		this.size.x 				= calcTextWidth(text, this._fontSize + "pt " + DEFAULT_FONT_FAMILY) + (DEFAULT_FONT_OFFSET << 1);
		this.minSize 				= this.size.getClone();
		this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1))
	}

    _hover(x, y){
        this._mouseOver = this.clickInBoundingBox(x, y);
        if(this._mouseOver){
            setCursor(this._locked ? CURSOR_NOT_ALLOWED : CURSOR_POINTER);
            return true;
        }

        setCursor(CURSOR_DEFAULT);
        return false;
    }

	get moveType(){return this._moveType;}
	get text(){return this._text;}
	get taskResult(){return this._taskResult;}

	set taskResult(val){this._taskResult = val;}
	set moveType(val){this._moveType = val;}
	set verticalTextAlign(val){this._verticalTextAlign = val;}
	set horizontalTextAlign(val){this._horizontalTextAlign = val;}

	_draw(ctx = context){
		let pos = this.position.getClone();

		doRect({
			shadow: this.moving && !this.locked,
			position: this.position,
			size: this.size,
			radius: this.radius,
			fillColor: this.fillColor,
			borderWidth: this._borderWidth,
			borderColor: !this._highlight ? DEFAULT_BORDER_COLOR : this._highlight == HIGHTLIGHT_CORRECT ? "green" : "red",
			draw: true,
			fill: true,
			ctx: ctx
		});


		ctx.textAlign = this._horizontalTextAlign;
		ctx.textBaseline = this._verticalTextAlign;
		ctx.fillStyle = this._fontColor;
		ctx.font = this._fontSize + "pt " + DEFAULT_FONT_FAMILY;
		
		if(this._horizontalTextAlign == FONT_HALIGN_LEFT){
			pos.x += this._fontOffset;
		}
		else if(this._horizontalTextAlign == FONT_HALIGN_CENTER){
			pos.x += this.size.x >> 1;
		}
		else if(this._horizontalTextAlign == FONT_HALIGN_RIGHT){
			pos.x += this.size.x - this._fontOffset;
		}

		if(this._verticalTextAlign == FONT_VALIGN_MIDDLE){
			pos.y += this.size.y >> 1;
		}
		else if(this._verticalTextAlign == FONT_VALIGN_BOTT){
			pos.y += this.size.y - this._fontOffset;
		}

		ctx.fillText(this._text, pos.x, pos.y);

		drawBorder(ctx, this);
		Entity.drawConnectors(this, ctx);
	}

	_clickIn(x, y){
		let pos = this.position,
			vec = new GVector2f(x, y);


		this.checkConnectors(vec);
		if(this._selectedConnector){
			return true;
		}

		if(vec.dist(pos.x + (this.size.x >> 1), pos.y) < SELECTOR_SIZE){
			this._moveType = 0;
		}
		else if(vec.dist(pos.x + this.size.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE){
			this._moveType = 1;
		}
		else if(vec.dist(pos.x +(this.size.x >> 1), pos.y + this.size.y) < SELECTOR_SIZE){
			this._moveType = 2;
		}
		else if(vec.dist(pos.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE){
			this._moveType = 3;
		}
		else if(vec.dist(pos.x + this.size.x, pos.y + this.size.y) < SELECTOR_SIZE){
			this._moveType = 5;
		}
		else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y){
			this._moveType = 4;
		}
		return this._moveType >= 0;
	}

	_doubleClickIn(x, y){
		//ak sa nekliklo na element vrátime false
		if(!this.clickInBoundingBox(x, y)){
			return false;
		}

		//zobrazíme input pre vstup a nastavíme callback
		getText(this._text, new GVector2f(x, y), this._size.getClone().sub(4), val => {
			//ak je prázdny tak ho zmažeme
			if(val.length == 0){
				Scene.remove(this);
			}

			//nastavíme hodnotu
			this.text = val;

			//ak je nastavený výsledok tak sa zvýrazný správnosť odpovede
			if(this._taskResult){
                this._highlight = this._taskResult == val ? HIGHTLIGHT_CORRECT : HIGHTLIGHT_WRONG;
			}
		});

		//vrátime trie
		return true;
	}

	set text(val){
		this._text = val;
        this._size.x = calcTextWidth(val, this._fontSize + "pt " + DEFAULT_FONT_FAMILY) + (DEFAULT_FONT_OFFSET << 1);
	}
}