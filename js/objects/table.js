class Table extends Entity{
	constructor(position, size, data = [[]]){
		super(OBJECT_TABLE, position, size, {borderColor: shadeColor1(TABLE_HEADER_COLOR, -20), radius: TABLE_RADIUS});
		this.data = data;
		this._headerColor 	= TABLE_HEADER_COLOR;
		this.moveType 		= -1;
		this._bodyColor	 	= TABLE_BODY_COLOR;
		this._textOffset	= TABLE_TEXT_OFFSET;
		this._columnWidth 	= this._size.x / this.data[0].length;
		this._lineHeight	= TABLE_LINE_HEIGHT;

		this._fontSize 		= DEFAULT_FONT_SIZE;

		this.size.set(this._size.x, data.length * this._lineHeight);
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
			var column = parseInt((pos - this._position.x) / this._columnWidth);
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
		var column = parseInt((x - this._position.x) / this._columnWidth),
			offset = 0;
		if(type == "right")
			offset++;

		this.data.forEach(function(e){
			e.splice(column + offset, 0, [""]);
		});

		this._columnWidth 	= this._size.x / this.data[0].length;
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
		var column = parseInt((x - this._position.x) / this._columnWidth);

		this.data.forEach(function(e){
			e.splice(column, 1);
		});
		this._columnWidth 	= this._size.x / this.data[0].length;
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
		context.font = this._fontSize + "pt " + DEFAULT_FONT;
		if(typeof value === "string"){
			w = context.measureText(value).width + (this._textOffset << 1);
			if(w > this._maxTextWidth){
				this._maxTextWidth = w;
				return;
			}
		}
		this._maxTextWidth = 0;
		this.data.forEach(function(e){
			e.forEach(function(ee){
				var w = context.measureText(ee).width + (this._textOffset << 1);
				if(w > this._maxTextWidth)
					this._maxTextWidth = w;
			},this);
		}, this);
	}

	_checkSize(){
		if(this.size.y < this._fontSize * 2 * this.data.length)
			this.size.y = this._fontSize * 2 * this.data.length;

		this._lineHeight = this.size.y / this.data.length;
		this._columnWidth = Math.max(this.size.x / this.data[0].length, this._maxTextWidth);
		this.size.x = this._columnWidth * this.data[0].length;
	}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y) || this.locked)
			return false;

		var row = parseInt((y - this._position.y) / this._lineHeight),
			column = parseInt((x - this._position.x) / this._columnWidth),
			posY = this._position.y + row * this._lineHeight + 1,
			posX = this._position.x + column * this._columnWidth + 1,
			w = this._columnWidth;

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
			posX = this._position.x,
			posY = this._position.y,
			points = [];


		if(this.moveType >= 0)
			this._checkSize();

		//FILL HEADER

		doRect({
			position: this._position,
			width: this._size.x,
			height: this._lineHeight,
			radius: {tr: this.radius, tl: this.radius},
			fillColor: this._headerColor,
			shadow: this.moving && !this.locked
		});

		//FILL BODY
		doRect({
			x: this._position.x,
			y: this._position.y +  this._lineHeight,
			width: this._size.x,
			height: this._lineHeight * (this.data.length - 1),
			radius: {br: this.radius, bl: this.radius},
			fillColor: this._bodyColor,
			shadow: this.moving && !this.locked
		});

		//DRAW BORDER
		doRect({
			position: this._position,
			size: this._size,
			radius: this.radius,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth
		});

		///DRAW HEADER TEXT
		for(i=0 ; i<this.data[0].length ; i++) {
			if (i > 0)
				points.push([posX, this._position.y, posX, this._position.y + this.data.length * this._lineHeight]);
			fillText(this.data[0][i], posX + (this._columnWidth >> 1),  this._position.y + (this._lineHeight >> 1), this._fontSize, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
			posX += this._columnWidth;
		}

		//DRAW BODY TEXT
		for(i=1 ; i<this.data.length ; i++){
			posX = this._position.x;
			posY += this._lineHeight;
			if(i > 0)
				points.push([this._position.x, posY, this._position.x + this._size.x, posY]);
			for(j=0 ; j<this.data[i].length ; j++) {
				fillText(this.data[i][j], posX + (this._columnWidth >> 1),  posY + (this._lineHeight >> 1), this._fontSize, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
				posX += this._columnWidth;
			}
		}

		//HORIZONTAL AND VERTICAL LINES
		doLine({
			points: points,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor
		});

		drawBorder(this);
	}
}