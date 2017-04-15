class Table extends Entity{
    /**
	 * @constructor
     * @param position
     * @param size
     * @param data
     */
	constructor(position, size, data){
		super(OBJECT_TABLE, position, size, {borderColor: shadeColor1(TABLE_HEADER_FILL_COLOR, -20), radius: TABLE_RADIUS});
		this._headerColor 	= TABLE_HEADER_FILL_COLOR;
		this.moveType 		= -1;
		this._bodyColor	 	= TABLE_BODY_FILL_COLOR;
        this._columnWidth 	= this._size.x;
		this._textOffset	= TABLE_FONT_OFFSET;
		this._lineHeight	= TABLE_LINE_HEIGHT;
		this._sumColumns	= [1];
		this._showSum		= true;
		this._fontSize 		= DEFAULT_FONT_SIZE;

		//ak su zadané dáta ako parameter tak ich nastavíme a vykonáme všetky potrebné operácie
		if(data){
			this.setData(data);
		}
	}

    /**
	 * Nastaví dáta v tabulke
	 *
     * @param data
     */
	setData(data = [[]]){
        this.data = data;
        this._columnWidth 	= this._size.x / this.data[0].length;
        this.size.x = this._size.x;
        let minHeight = data.length * this._lineHeight;

        this._calcMaxTextWidth();
		this._checkSize();
	}

    /**
	 * Getter hovoriaci o tom či sa má zobraziť riadok zo súčtom
	 *
     * @returns {boolean}
     */
	get showSum(){
		return this._sumColumns.length > 0 && this._showSum;
	}

    /**
	 * funkcia upradne pozísiu a veľkosť pri vytváraní tabulky
	 *
     * @param pos -aktuálna pozícia kurzora
     */
    updateCreatingPosition(pos){
        this.size.x = pos.x - this.position.x;
        this.size.y = pos.y - this.position.y;
    }

    /**
	 * Funckia vyčistí riadok/stlpec/tabulku
	 *
     * @param pos - index riadku alebo stĺpcu na zmazanie
     * @param type - typ či sa maže riadok, stlpec alebo tabulka
     */
	clear(pos, type){
		if(type == "row"){
			let row = parseInt((pos - this._position.y) / this._lineHeight);
			this.data[row].forEach(function(e, i){
				this.data[row][i] = "";
			}, this);
		}
		else if(type == "column"){
            let column = parseInt((pos - this._position.x) / this._columnWidth);
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

    /**
	 * Pridá nový riadok
	 *
     * @param y - pozícia riadku pod/nad ktorý sa má nový riadok pridať
     * @param type - či sa prídáva nad alebo bod aktualny riadok
     */
	addRow(y, type){
        let row = parseInt((y - this._position.y) / this._lineHeight),
			offset = 0;

		if(type == "below")
			offset++;

        let newRow = [];
		this.data[0].forEach(function(){
			newRow.push([""]);
		});
		this.data.splice(row + offset, 0, newRow);
		this._size.y = this.data.length * this._lineHeight;
		this._checkSize();
	}

    /**
     * Pridá nový stĺpec
     *
     * @param x - pozícia stĺpca vedla ktorého sa má nový stĺpec pridať
     * @param type - či sa prídáva v lavo alebo v pravod od aktualneho stĺpca
     */
	addColumn(x, type){
        let column = parseInt((x - this._position.x) / this._columnWidth),
			offset = 0;
		if(type == "right")
			offset++;

		this.data.forEach(function(e){
			e.splice(column + offset, 0, [""]);
		});

		this._columnWidth 	= this._size.x / this.data[0].length;
		this._checkSize();

	}

    /**
	 * Vymaže riadok z tabuľky
	 *
     * @param y - index riadku ktorý sa má vymazať
     */
	removeRow(y){
        let row = parseInt((y - this._position.y) / this._lineHeight);

		if(row > 0){
			this.data.splice(row, 1);
		}
		else{
			Logger.error(getMessage(MSG_TRY_REMOVE_TABLE_HEAD));
		}
		this._size.y = this.data.length * this._lineHeight;
		this._calcMaxTextWidth();

		if(this.data.length == 0)
			Scene.remove(this);
	}

    /**
     * Vymaže stĺpec z tabuľky
     *
     * @param x - index stĺpca ktorý sa má vymazať
     */
	removeColumn(x){
        let column = parseInt((x - this._position.x) / this._columnWidth);

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

        let pos = this.position,
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

    /**
	 * Funckia vypočíta šírku v pixeloch pre najdlhší reťazec v tabulke
	 *
     * @param value
     * @private
     */
	_calcMaxTextWidth(value){
        let w;
		context.font = this._fontSize + "pt " + DEFAULT_FONT_FAMILY;
		if(isString(value)){
			w = context.measureText(value).width + (this._textOffset << 1);
			if(w > this._maxTextWidth){
				this._maxTextWidth = w;
				return;
			}
		}
		this._maxTextWidth = 0;
		this.data.forEach(function(e){
			e.forEach(function(ee){
                let w = context.measureText(ee).width + (this._textOffset << 1);
				if(w > this._maxTextWidth)
					this._maxTextWidth = w;
			},this);
		}, this);
	}

    /**
	 * Funkcia vyráta skontroluje minimálnu šírku stĺpca a výšku riadku v tabulke
	 *
     * @private
     */
	_checkSize(){
		if(this.size.y < this._fontSize * 2 * this.data.length){
			this.size.y = this._fontSize * 2 * this.data.length;
        }

		this._lineHeight = this.size.y / this.data.length;
		this._columnWidth = Math.max(this.size.x / this.data[0].length, this._maxTextWidth);
		this.size.x = this._columnWidth * this.data[0].length;
	}

	doubleClickIn(x, y){
		if(!this.clickInBoundingBox(x, y) || this.locked)
			return false;

        let row = parseInt((y - this._position.y) / this._lineHeight),
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

	draw(ctx = context){
		//debugger;
		if(!this.data){
			doRect({
				position: this._position,
				size: this._size,
                fillColor: this._bodyColor,
                radius: this.radius,
                borderColor: this.borderColor,
                borderWidth: this.borderWidth,
			});
			return;
		}


        let i,
			j,
			posX = this._position.x,
			posY = this._position.y,
			points = [];

        let size = this._size.getClone();
		//ak je aspoň 1 stlpec pre sučet tak zväčšíme velkosť tabulky;


        if(this.showSum){
        	size.y += this._lineHeight;
        }



		if(this.moveType >= 0){
			this._checkSize();
        }

		//FILL HEADER
		//TODO pre fillText doplniť context do ktorého sa má kresliť
		doRect({
			position: this._position,
			width: size.x,
			height: this._lineHeight,
			radius: {tr: this.radius, tl: this.radius},
			fillColor: this._headerColor,
			shadow: this.moving && !this.locked,
			ctx: ctx
		});

		//FILL BODY
		doRect({
			x: this._position.x,
			y: this._position.y +  this._lineHeight,
			width: size.x,
			height: this._lineHeight * (this.data.length + (this.showSum ? 0 : - 1)),
			radius: {br: this.radius, bl: this.radius},
			fillColor: this._bodyColor,
			shadow: this.moving && !this.locked,
			ctx: ctx
		});

		//DRAW BORDER
		doRect({
			position: this._position,
			size: size,
			radius: this.radius,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth,
			ctx: ctx
		});

		///DRAW HEADER TEXT
		for(i=0 ; i<this.data[0].length ; i++) {
			if (i > 0)
				points.push([posX, this._position.y, posX, this._position.y + this.data.length * this._lineHeight + (this.showSum ? this._lineHeight : 0)]);
			fillText(this.data[0][i], posX + (this._columnWidth >> 1),  this._position.y + (this._lineHeight >> 1), this._fontSize, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
			posX += this._columnWidth;
		}

		//DRAW BODY TEXT
		for(i=1 ; i<this.data.length ; i++){
			posX = this._position.x;
			posY += this._lineHeight;
			if(i > 0){
				points.push([this._position.x, posY, this._position.x + this._size.x, posY]);
            }
			for(j=0 ; j<this.data[i].length ; j++) {
				fillText(this.data[i][j], posX + (this._columnWidth >> 1),  posY + (this._lineHeight >> 1), this._fontSize, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
				posX += this._columnWidth;
			}
		}

		//DRAW SUM COLUMNS
		if(this.showSum){
            posX = this._position.x;
            posY += this._lineHeight;
            points.push([posX, posY, posX + this._size.x, posY]);
			let results = [];
			each(this._sumColumns, (e, i) => {
				results[e] = 0;
				each(this.data, (ee, ii) => {
					let num = parseInt(ee[e]);
                    //console.log(ee[e]);
					if(!isNaN(num)){
                        results[e] += num;
					}
				})
			});
			//console.log(results);
			each(results, (e, i) => {
                fillText(e || (i == 0 ? "Súčet" : "-"), posX + (this._columnWidth >> 1),  posY + (this._lineHeight >> 1), this._fontSize, DEFAULT_FONT_COLOR, 0, FONT_ALIGN_CENTER);
                posX += this._columnWidth;
			});

		}

		//HORIZONTAL AND VERTICAL LINES
		doLine({
			points: points,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor,
			ctx: ctx
		});

		drawBorder(ctx, this);
	}
}