class MenuManager{
	constructor(position = new GVector2f(), size = new GVector2f(MENU_WIDTH, MENU_HEIGHT), key = "mainMenu", parent = null){
		if(parent != null)
			this._items = parent._allItems[key];

		this._key 				= key;
		this._parent 			= parent;
		this._toolActive 		= false;
		this._fontColor 		= MENU_FONT_COLOR;
		this._backgroundColor 	= "rgb(153, 217, 234)";
		this._position 			= position.add(MENU_OFFSET);
		this._offset 			= MENU_OFFSET;
		this._size 				= size;
		this._vertical 			= parent != null;

		this._canvas 			= parent == null ? document.createElement("canvas") : parent._canvas;
		this._tmpDrawArray		= [];

		this._visibleSubMenu 	= false;
		this._subMenus			= [];
	};

	init(data){
		var array = [],
			counter = new GVector2f(),
			inst = this,
			tmp;
		$.each(data, function(ii){
			array[ii] = [];
			$.each(data[ii], function(i, e){
				if(typeof e["values"] !== "undefined"){
					e.values.forEach(function(ee){
						tmp = {};
						tmp["visible"] = e["visible"];
						tmp["key"] = i.replace("XYZ ", "");
						if(counter.x > counter.y)
							counter.y++;
						else
							counter.x++;

						tmp["posX"] = counter.x;
						tmp["posY"] = counter.y;
						tmp["value"] = ee;
						inst._tmpDrawArray.push({
							x: counter.x,
							y: counter.y,
							value:  ee,
							key: i
						});
						array[ii].push(tmp);
					});
					return;
				}


				e["key"] = i;

				if(counter.x > counter.y)
					counter.y++;
				else
					counter.x++;

				e["posX"] = counter.x;
				e["posY"] = counter.y;
				inst._tmpDrawArray.push({
					x: counter.x,
					y: counter.y,
					key: i
				});

				array[ii].push(e);
			});
		});


		this._canvas.width 	= this._tmpDrawArray[this._tmpDrawArray.length - 1].x * this._size.x + this._size.x;
		this._canvas.height	= this._tmpDrawArray[this._tmpDrawArray.length - 1].y * this._size.y + this._size.y;
		this._context 		= this._canvas.getContext('2d');

		this._redraw();


		this._items 	= array["mainMenu"];
		this._allItems 	= array;

		this._subMenus["tools"]	= new MenuManager(new GVector2f(0, this._size.y + MENU_OFFSET), new GVector2f(this._size.x, this._size.y), "tools", this);
		this._subMenus["lineWidth"]	= new MenuManager(new GVector2f(6 * (this._size.x + MENU_OFFSET), this._size.y + MENU_OFFSET), new GVector2f(this._size.x, this._size.y), "lineWidth", this);
		this._subMenus["brushes"]	= new MenuManager(new GVector2f(6 * (this._size.x + MENU_OFFSET), this._size.y + MENU_OFFSET), new GVector2f(this._size.x, this._size.y), "brushes", this);
	}

	isToolActive(){
		var tmp = this._toolActive;
		this._toolActive = false;
		return tmp;
	};

	/*
	 * CLICK
	 */

	clickIn(x, y) {
		var posY = this._position.y,
			posX = this._position.x,
			result = false;

		if(this._visibleSubMenu)
			result = this._subMenus[this._visibleSubMenu].clickIn(x, y);

		this._visibleSubMenu = false;

		if(result)
			return result;

		this._items.forEach(function(e) {
			if (!e["visible"] || result)
				return false;

			if(x > posX && x < posX + this._size.x && y > posY && y < posY + this._size.y ){
				result = e;
				this._doClickAct(e);
			}

			if(this._vertical)
				posY += this._size.y + this._offset;
			else
				posX += this._size.x + this._offset;

		}, this);
		if(result)
			return result;

	};

	_doClickAct(val){
		var key = val.key;
		switch(key){
			case "tools":
				this._toolActive = "tools";
				break;
			case "color":
				pickUpColor(function(color){
					Creator.color = color;
				});
				break;
			case "draw":
				Creator.operation = OPERATION_DRAW_PATH;
				break;
			case "rect":
				Creator.operation = OPERATION_DRAW_RECT;
				break;
			case "line":
				Creator.operation = OPERATION_DRAW_LINE;
				break;
			case "brushes":
				this._visibleSubMenu = key;
				break;
			case "arc":
				Creator.operation = OPERATION_DRAW_ARC;
				break;
			case "defaultBrushes":
				Scene.paint.setImage(val.value);
				break;
			case "defaultWidth":
				Creator.lineWidth = val.value;
				this._parent._redraw();
				break;
			case "join":
				Creator.operation = OPERATION_DRAW_JOIN;
				break;
			case "lineWidth":
				this._visibleSubMenu = key;
				break;
		}
		if(this._parent != null){
			this._parent._items.find(e => e.key == "lineWidth").visible = key == "line" || key == "defaultWidth";
			this._parent._items.find(e => e.key == "brushes").visible = key == "draw" || key == "defaultBrushes";
		}
	}

	/*
	 * PRESS
	 */

	_doPressAct(index){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this._visibleSubMenu = index;
				break;
		}
		return index;
	};

	pressIn(x, y){
		var posY = this._position.y,
			posX = this._position.x,
			result = false;

		if(this._visibleSubMenu)
			result = this._subMenus[this._visibleSubMenu].clickIn(x, y);

		if(result)
			return result;

		this._items.forEach(function(e) {
			if (!e["visible"] || result)
				return false;

			if(x > posX && x < posX + this._size.x && y > posY && y < posY + this._size.y ){
				result = e;
				this._doPressAct(e.key);
			}

			if(this._vertical)
				posY += this._size.y + this._offset;
			else
				posX += this._size.x + this._offset;

		}, this);
		if(result)
			return result;
	};

	/*
	 * DRAW
	 */

	draw(){
		if(!this._items)
			return;
		var posY = this._position.y,
			posX = this._position.x;


		context.lineWidth = MENU_BORDER_WIDTH;
		context.strokeStyle = MENU_BORDER_COLOR;
		context.fillStyle = this._backgroundColor;

		this._items.forEach(function(e){
			if(!e["visible"])
				return;

			doRect({
				x: posX,
				y: posY,
				size: this._size,
				radius: MENU_RADIUS,
				fillColor: e["key"] == "color" ? Creator.color : this._backgroundColor,
				borderWidth: MENU_BORDER_WIDTH,
				borderColor: MENU_BORDER_COLOR
			});

			context.drawImage(this._canvas, e["posX"] * this._size.x, e["posY"] * this._size.y, this._size.x, this._size.y, posX, posY, this._size.x, this._size.y);

			if(this._vertical)
				posY += this._size.y + this._offset;
			else
				posX += this._size.x + this._offset;
		}, this);


		if(this._visibleSubMenu)
			this._subMenus[this._visibleSubMenu].draw();
	};

	_redraw(){
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this._tmpDrawArray.forEach(function(e){
			this._drawIcon(e, e.x * this._size.x, e.y * this._size.y, 5, this._size.x, this._size.y);
		}, this);
	}

	_drawIcon(type, x, y, offset = 5, width = this._size.x, height = this._size.y, strokeColor = DEFAUL_STROKE_COLOR, strokeWidth = DEFAULT_STROKE_WIDTH){
		var img;
		switch(type.key){
			case "arc":
				drawArc(x + offset, y + offset, width - (offset << 1), height - (offset << 1), strokeWidth, strokeColor, this._context);
				break;
			case "rect":
				doRect({
					x: x + offset,
					y: y + offset,
					width: width - (offset << 1),
					height: height - (offset << 1),
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				break;
			case "line":
				drawLine([new GVector2f(x + offset, y + offset),
					new GVector2f(x + width - (offset << 1), y + (height >> 1)),
					new GVector2f(x + offset, y +  height - (offset << 1)),
					new GVector2f(x + width - (offset << 1), y + offset)], DEFAULT_STROKE_WIDTH, "black", JOIN_LINEAR, this._context);
				break;
			case "text":
				fillText("TEXT", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "ctrl":
				fillText("CTRL", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "file":
				fillText("FILE", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "options":
				fillText("OPT", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "tools":
				fillText("TOOLS", x + (width >> 1), y + (height >> 1), height / 5, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "help":
				fillText("HELP", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "defaultWidth":
				drawLine([x + offset, y + (height >> 1), x + width - offset, y + (height >> 1)], type.value, "black", JOIN_LINEAR, this._context);
				break;
			case "brushes":
				img = Scene.paint.selectedImg;
				if(img == null)
					return;
				this._context.drawImage(img, 0, 0, img.width, img.height, x , y, width, height);
				break;
			case "lineWidth":
				drawLine([x + offset, y + (height >> 1), x + width - offset, y + (height >> 1)], Creator.lineWidth, "black", JOIN_LINEAR, this._context);
				break;
			case "defaultBrushes":
				Scene.paint.addImage(type.value);
				img = Scene.paint.getImage(type.value);
				this._context.drawImage(img, 0, 0, img.width, img.height, x , y, width, height);
				break;
			case "draw":
				drawQuadraticCurve([new GVector2f(x + offset, y + offset),
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + width - (offset << 1), y + (height >> 1))],
					[new GVector2f(x + offset, y + offset), new GVector2f(x + offset, y +  height - (offset << 1))],
					[new GVector2f(x + width - (offset << 1), y + (height >> 1)), new GVector2f(x + width - (offset << 1), y + offset)],
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + offset, y + offset)]], DEFAULT_STROKE_WIDTH, "black", this._context);
				break;
			case "join":
				fillText("JOIN", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
		}
	}
}