class Text extends Entity{
	constructor(text, position, size, color = DEFAULT_FONT_COLOR){
		super("Text", position, size, DEFAULT_BACKGROUND_COLOR);
		this._text 		= text;
		this._textColor = color;
		this._fontSize 	= DEFAULT_FONT_SIZE;
		this.moveType 	= -1;
		this._align 	= FONT_ALIGN_LEFT;
		this._size.x 	= calcTextWidth(text, DEFAULT_FONT_SIZE + "pt " + DEFAULT_FONT) + (DEFAULT_TEXT_OFFSET << 1);
		this._minSize 	= this._size.getClone();
	};

	draw(){
		context.fillStyle = this._fillColor;
		context.lineWidth = this._borderWidth;

		if (this.moving && !this.locked)
			setShadow(true);

		context.roundRect(this._position.x, this._position.y, this._size.x, this._size.y, DEFAULT_RADIUS, false, true);

		if (this.moving)
			setShadow(false);

		context.roundRect(this._position.x, this._position.y, this._size.x, this._size.y, DEFAULT_RADIUS, true, false);

		if(this._align == FONT_ALIGN_LEFT)
			fillText2(this._text, this._position.x, this._position.y, this._fontSize, this._textColor, DEFAULT_TEXT_OFFSET);
		else if(this._align == FONT_ALIGN_RIGHT)
			fillText2(this._text,
					  this._position.x + this._size.x,
					  this._position.y,
					  this._fontSize,
					  this._textColor,
					  DEFAULT_TEXT_OFFSET,
					  this._align);
		else if(this._align == FONT_ALIGN_CENTER)
			fillText2(this._text,
					 this._position.x + (this._size.x >> 1),
					 this._position.y + (this._fontSize >> 1),
					 this._fontSize,
					 this._textColor,
					 DEFAULT_TEXT_OFFSET,
					 this._align);

		if(this.selected)
			drawBorder(this);
	};

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		var pos = this.position,
			vec = new GVector2f(x, y);

		if(vec.dist(pos.x + (this.size.x >> 1), pos.y) < SELECTOR_SIZE)
			this.moveType = 0;
		else if(vec.dist(pos.x + this.size.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this.moveType = 1;
		else if(vec.dist(pos.x +(this.size.x >> 1), pos.y + this.size.y) < SELECTOR_SIZE)
			this.moveType = 2;
		else if(vec.dist(pos.x, pos.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this.moveType = 3;
		else if(vec.dist(pos.x + this.size.x, pos.y + this.size.y) < SELECTOR_SIZE)
			this.moveType = 5;
		else if(x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
			this.moveType = 4;
		return this.moveType >= 0;
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