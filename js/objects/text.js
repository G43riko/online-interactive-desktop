class Text extends Entity{
	constructor(text, position, size, fontColor = DEFAULT_FONT_COLOR){
		super("Text", position, size, {"fillColor": DEFAULT_BACKGROUND_COLOR, radius: DEFAULT_RADIUS});
		this._text 		= text;
		this._textColor = fontColor;
		this._fontSize 	= DEFAULT_FONT_SIZE;
		this._moveType 	= -1;
		this.size.x 	= calcTextWidth(text, DEFAULT_FONT_SIZE + "pt " + DEFAULT_FONT) + (DEFAULT_TEXT_OFFSET << 1);
		this.minSize 	= this.size.getClone();
		this._verticalTextAlign = FONT_VALIGN_TOP;
		this._horizontalTextAlign = FONT_HALIGN_LEFT;
		this._fontOffset = DEFAULT_TEXT_OFFSET;

		this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1))
	};

	get moveType(){
		return this._moveType;
	}

	set moveType(val){
		this._moveType = val;
	}

	set verticalTextAlign(val){
		this._verticalTextAlign = val;
	}

	set horizontalTextAlign(val){
		this._horizontalTextAlign = val;
	}

	draw(){
		var pos = this.position.getClone();

		context.fillStyle = this._fillColor;
		context.lineWidth = this._borderWidth;

		doRect({
			shadow: this.moving && !this.locked,
			position: this.position,
			size: this.size,
			radius: this.radius,
			fillColor: this.fillColor,
			draw: true,
			fill: true
		});


		context.textAlign = this._horizontalTextAlign;
		context.textBaseline = this._verticalTextAlign;
		context.fillStyle = this._textColor;

		if(this._horizontalTextAlign == FONT_HALIGN_LEFT)
			pos.x += this._fontOffset;
		else if(this._horizontalTextAlign == FONT_HALIGN_CENTER)
			pos.x += this.size.x >> 1;
		else if(this._horizontalTextAlign == FONT_HALIGN_RIGHT)
			pos.x += this.size.x - this._fontOffset;

		if(this._verticalTextAlign == FONT_VALIGN_MIDDLE)
			pos.y += this.size.y >> 1;
		else if(this._verticalTextAlign == FONT_VALIGN_BOTT)
			pos.y += this.size.y - this._fontOffset;

		context.fillText(this._text, pos.x, pos.y);

		drawBorder(this);
		Entity.drawConnectors(this);
	};

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		var pos = this.position,
			vec = new GVector2f(x, y);


		this.checkConnectors(vec);
		if(this._selectedConnector)
			return true;

		if(vec.dist(pos.x + (this.size.x >> 1), pos.y) < SELECTOR_SIZE)
			this._moveType = 0;
		else if(vec.dist(pos.x + this.size.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this._moveType = 1;
		else if(vec.dist(pos.x +(this.size.x >> 1), pos.y + this.size.y) < SELECTOR_SIZE)
			this._moveType = 2;
		else if(vec.dist(pos.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this._moveType = 3;
		else if(vec.dist(pos.x + this.size.x, pos.y + this.size.y) < SELECTOR_SIZE)
			this._moveType = 5;
		else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
			this._moveType = 4;
		return this._moveType >= 0;
	};

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		getText(this._text, new GVector2f(x, y), this._size.getClone().sub(4), function(val){
			if(val.length == 0)
				Scene.remove(this);
			this._text = val;
			this._size.x = calcTextWidth(val) + (DEFAULT_TEXT_OFFSET << 1);
		}, this);

		return true;
	};





}