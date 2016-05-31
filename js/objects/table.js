class Table extends Entity{
	constructor(position, size, data){
		super("Table", position, size);
		this.data = data;
		this.headerColor 	= TABLE_HEADER_COLOR;
		this.moveType 		= -1;
		this._bodyColor	 	= TABLE_BODY_COLOR;
		this.textOffset		= TABLE_TEXT_OFFSET;
		this.columnWidth 	= this._size.x / this.data[0].length;
		this._lineHeight	= TABLE_LINE_HEIGHT;
		this.borderColor	= shadeColor1(TABLE_HEADER_COLOR, -20);

		this._size.set(this._size.x, data.length * this._lineHeight);


		this._calcMaxTextWidth();
	}

	clear(pos, type){
		if(type == "row"){
			var row = parseInt((pos - this._position.y) / this._lineHeight);
			this.data[row].forEach(function(e, i){
				this.data[row][i] = "";
			}, this);
		}
		else if(type == "column"){
			var column = parseInt((pos - this._position.x) / this.columnWidth);
			this.data.forEach(function(e){
				e[column] = "";
			});
		}
		else if(type == "table"){
			this.data.forEach(function(e){
				e.forEach(function(ee, i){
					e[i] = "";
				}, this);
			}, this);
		}
	}

	addRow(y, type){
		var row = parseInt((y - this._position.y) / this._lineHeight),
			offset = 0;

		if(type == "below")
			offset++;

		var newRow = [];
		this.data[0].forEach(function(){
			newRow.push([""]);
		});
		this.data.splice(row + offset, 0, newRow);
		this._size.y = this.data.length * this._lineHeight;
		this._checkSize();
	}

	addColumn(x, type){
		var column = parseInt((x - this._position.x) / this.columnWidth),
			offset = 0;
		if(type == "right")
			offset++;

		this.data.forEach(function(e){
			e.splice(column + offset, 0, [""]);
		});

		this.columnWidth 	= this._size.x / this.data[0].length;
		this._checkSize();

	}

	removeRow(y){
		var row = parseInt((y - this._position.y) / this._lineHeight);

		if(row > 0)
			this.data.splice(row, 1);
		else
			Logger.error("nemožeš vymazať hlavičku tabulky");
		this._size.y = this.data.length * this._lineHeight;
		this._calcMaxTextWidth();

		if(this.data.length == 0)
			Scene.remove(this);
	}

	removeColumn(x){
		var column = parseInt((x - this._position.x) / this.columnWidth);

		this.data.forEach(function(e){
			e.splice(column, 1);
		});
		this.columnWidth 	= this._size.x / this.data[0].length;
		this._calcMaxTextWidth();

		if(this.data[0].length == 0)
			Scene.remove(this);
	}

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
	}

	_calcMaxTextWidth(value = 0){
		var w;
		context.font = DEFAULT_FONT_SIZE + "pt " + DEFAULT_FONT;
		if(typeof value === "string"){
			w = context.measureText(value).width + (this.textOffset << 1);
			if(w > this._maxTextWidth){
				this._maxTextWidth = w;
				return;
			}
		}
		this._maxTextWidth = 0;
		this.data.forEach(function(e){
			e.forEach(function(ee){
				var w = context.measureText(ee).width + (this.textOffset << 1);
				if(w > this._maxTextWidth)
					this._maxTextWidth = w;
			},this);
		}, this);
	}

	_checkSize(){
		if(this.size.y < TABLE_LINE_HEIGHT * this.data.length)
			this.size.y = TABLE_LINE_HEIGHT * this.data.length;

		this._lineHeight = this.size.y / this.data.length;
		this.columnWidth = Math.max(this.size.x / this.data[0].length, this._maxTextWidth);
		this.size.x = this.columnWidth * this.data[0].length;
	}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y) || this.locked)
			return false;

		var row = parseInt((y - this._position.y) / this._lineHeight),
			column = parseInt((x - this._position.x) / this.columnWidth),
			posY = this._position.y + row * this._lineHeight + 1,
			posX = this._position.x + column * this.columnWidth + 1,
			w = this.columnWidth;

		getText(this.data[row][column], new GVector2f(posX, posY), new GVector2f(w, this._lineHeight).sub(4), function(val){
			this.data[row][column] = val;
			this._calcMaxTextWidth(val);
			this._checkSize();
		}, this);

		return true;
	}

	draw(){
		var i,
			j,
			posX,
			posY;


		if(this.moveType >= 0)
			this._checkSize();



		context.lineWidth = this.borderWidth;
		context.strokeStyle = this.borderColor;


		if (this.moving && !this.locked)
			setShadow(true);

		//FILL HEADER
		context.fillStyle = this.headerColor;
		context.roundRect(this._position.x, this._position.y, this._size.x, this._lineHeight, {tr: TABLE_RADIUS, tl: TABLE_RADIUS}, true, false);

		//FILL BODY
		context.fillStyle = this._bodyColor;
		context.roundRect(this._position.x, this._position.y + this._lineHeight, this._size.x, this._lineHeight * (this.data.length - 1), {br: TABLE_RADIUS, bl: TABLE_RADIUS}, true, false);

		if (this.moving)
			setShadow(false);

		//DRAW BORDER
		context.roundRect(this._position.x, this._position.y, this._size.x, this._lineHeight * this.data.length, MENU_RADIUS, false, true);


		///DRAW HEADER TEXT AND VERTICAL LINES
		posX = this._position.x;
		for(i=0 ; i<this.data[0].length ; i++) {
			if (i > 0)
				drawLine([posX, this._position.y, posX, this._position.y + this.data.length * this._lineHeight], this.borderWidth, this.borderColor);
			fillText(this.data[0][i], posX + (this.columnWidth >> 1),  this._position.y + (this._lineHeight >> 1), DEFAULT_FONT_SIZE, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
			posX += this.columnWidth;
		}

		//DRAW BODY TEXT AND HORIZONTAL LINES
		posY = this._position.y;
		for(i=1 ; i<this.data.length ; i++){
			posX = this._position.x;
			posY += this._lineHeight;
			if(i > 0)
				drawLine([this._position.x, posY, this._position.x + this._size.x, posY], this.borderWidth, this.borderColor);
			for(j=0 ; j<this.data[i].length ; j++) {
				fillText(this.data[i][j], posX + (this.columnWidth >> 1),  posY + (this._lineHeight >> 1), DEFAULT_FONT_SIZE, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
				posX += this.columnWidth;
			}
		}
		if(this._selected)
			drawBorder(this);
	}
}