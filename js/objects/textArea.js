class TextArea extends Entity{
	constructor(text, position, size, fontColor = DEFAULT_FONT_COLOR){
		super("Text", position, size, {"fillColor": DEFAULT_BACKGROUND_COLOR, radius: DEFAULT_RADIUS});
		this._text 		= text || "";
		this._textColor = fontColor;
		this._fontSize 	= DEFAULT_FONT_SIZE;
		this._moveType 	= -1;
		this._verticalTextAlign = FONT_VALIGN_TOP;
		this._horizontalTextAlign = FONT_HALIGN_LEFT;
		this._fontOffset = DEFAULT_TEXT_OFFSET;
		this._selected = false;
		this._padding = 20;
		this._lineHeight = 30;

		this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1))
	}

	_blur(){
		this._selected = false;
		SelectedText = null;
	}

	set text(val){
		console.log(val);
		this._text = val.split("\n");
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y)){
			if(this._selected)
				this._blur();
			return false;
		}

		this._selected = true;
		SelectedText = this;

		var pos = this.position,
			vec = new GVector2f(x, y);

		var area = document.getElementById("selectedEditor");
		
		if(area){
			document.body.removeChild(area);
		}

		area = document.createElement("div");
		area.setAttribute("id", "selectedEditor");
		area.setAttribute("contenteditable", "true");
		area.style["top"] = this._position.y + "px";
		area.style["left"] = this._position.x + "px";
		area.style["width"] = this._size.x + "px";
		area.style["height"] = this._size.y + "px";
		area.style["backgroundColor"] = this._fillColor;
		area.style["borderRadius"] = this._radius + "px";
		area.style["padding"] = this._padding + "px";
		area.style["color"] = this._textColor;
		area.style["zIndex"] = 100000;

		area.style["font"] = this._fontSize + "pt " + DEFAULT_FONT;

		document.body.insertBefore(area, document.getElementById("myCanvas"));

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

	draw(){
		var pos = this.position.getClone();

		doRect({
			shadow: this.moving && !this.locked,
			position: this.position,
			size: this.size,
			radius: this.radius,
			fillColor: this.fillColor,
			borderWidth: this._borderWidth,
			draw: true,
			fill: true
		});

		context.textAlign = this._horizontalTextAlign;
		context.textBaseline = this._verticalTextAlign;
		context.fillStyle = this._textColor;
		context.font = this._fontSize + "pt " + DEFAULT_FONT;

		var offsetY = this._padding;
		each(this._text, e => {
			//console.log(offsetY + "kreslí sa: "+ this._fontSize);
			context.fillText(e, pos.x + this._padding, pos.y + offsetY);
			offsetY += this._lineHeight* 1.40	;//29 * 1.41;//this._fontSize * 1.333333 *2;
		})
	}
}