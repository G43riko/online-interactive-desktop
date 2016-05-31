class MenuManager{
	constructor(){
		this._items 		= false;
		this.visibleSubMenu = false;
		this.toolActive 	= false;
		this._fontColor 	= MENU_FONT_COLOR;
	}

	set items(val){
		if(this._items)
			Logger.error("priraduje sa druhy krat menu");

		this._items = val;
	}

	isToolActive(){
		var tmp = this.toolActive;
		this.toolActive = false;
		return tmp;
	};

	_drawTools(x, y, backGroundColor){
		var off, count = 0;

		context.fillStyle = backGroundColor;

		$.each(this._items["tools"], function(i, e){
			x = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			off = e.sur;
			context.roundRect(x, y, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, true, true);
			MenuManager.drawIcon(i, x, y);
		});
	};

	_drawColors(x, y){
		var count = 0;
		colors.forEach(function(e){
			x = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x + MENU_WIDTH + MENU_OFFSET > canvas.width){
				count = 0;
				y += MENU_OFFSET + MENU_HEIGHT;
				x = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			}
			context.fillStyle = e;
			context.roundRect(x, y, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, true, true);
		});
	}

	draw(){
		var count = 0,
			posY = MENU_POSITION,
			posX,
			off;

		context.lineWidth = MENU_BORDER_WIDTH;
		context.strokeStyle = MENU_BORDER_COLOR;
		context.fillStyle = "rgb(153, 217, 234)";

		$.each(this._items["main"], function(i, e){
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			off = e.sur;

			context.save();

			if(Menu.visibleSubMenu == i)
				context.lineWidth = MENU_BORDER_WIDTH << 1;

			if(i == "colors"){
				context.fillStyle = Creator.color;
				context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, true, true);
			}
			else{
				if(i == "tools" && Menu.toolActive){
					setShadow(true);
					context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, true, false);
					setShadow(false);
				}
				context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, true, true);
				MenuManager.drawIcon(i, posX, posY);
			}
			context.restore();
		});

		if(!this.visibleSubMenu)
			return;

		posY += MENU_OFFSET + MENU_HEIGHT;
		if(this.visibleSubMenu == "tools")
			this._drawTools(posX, posY, "rgb(153, 217, 234)");
		else if(this.visibleSubMenu == "colors")
			this._drawColors(posX, posY);
	};

	_doPressAct(index){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this.visibleSubMenu = index;
				break;
		}
		return index;
	};

	_doClickAct(index){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this.toolActive = true;
				break;
			case "colors":
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
			case "arc":
				Creator.operation = OPERATION_DRAW_ARC;
				break;
		}
		return index;
	};

	pressIn(x, y){
		var count = 0,
			posY = MENU_POSITION,
			posX,
			result = false,
			menuInst = this;

		$.each(this._items["main"], function(i){
			if(result)
				return;
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				result = menuInst._doPressAct(i);
		});

		return result;
	};

	_clickInTools(x, y, posY){
		var result = false,
			count = 0,
			menuInst = this,
			posX;
		$.each(this._items["tools"], function(i){
			if(result)
				return;
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				result = menuInst._doClickAct(i);
		});
		return result;
	}

	_clickInColors(x, y, posY){
		var count = 0,
			result = false,
			posX;
		colors.forEach(function(e){
			if(result)
				return;
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(posX + MENU_WIDTH + MENU_OFFSET > canvas.width){
				count = 0;
				posY += MENU_OFFSET + MENU_HEIGHT;
				posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++
			}
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT){
				Creator.fillColor = e;
				result = true;
			}
		});
		return result;
	}

	clickIn(x, y){
		var posX,
			count = 0,
			posY = MENU_POSITION,
			menuInst = this,
			result = false,
			lastSubMenu = this.visibleSubMenu;

		$.each(this._items.main, function(i){
			if(result)
				return;
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				result = menuInst._doClickAct(i);
		});

		if(result)
			return result;

		posY += MENU_OFFSET + MENU_HEIGHT;
		this.visibleSubMenu = false;

		if(lastSubMenu == "tools")
			result = this._clickInTools(x, y, posY);
		else if(lastSubMenu == "colors")
			result = this._clickInColors(x, y, posY);

		return result;
	};

	static drawIcon(type, x, y, offset = 5, width = MENU_WIDTH, height = MENU_HEIGHT){
		switch(type){
			case "arc":
				drawArc(x + offset, y + offset, width - (offset << 1), height - (offset << 1));
				break;
			case "rect":
				drawRect(x + offset, y + offset, width - (offset << 1), height - (offset << 1));
				break;
			case "line":
				drawLine([new GVector2f(x + offset, y + offset),
						  new GVector2f(x + width - (offset << 1), y + (height >> 1)),
						  new GVector2f(x + offset, y +  height - (offset << 1)),
						  new GVector2f(x + width - (offset << 1), y + offset)]);
				break;
			case "text":
				fillText("TEXT", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER);
				break;
			case "ctrl":
				fillText("CTRL", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER);
				break;
			case "file":
				fillText("FILE", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER);
				break;
			case "options":
				fillText("OPT", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER);
				break;
			case "tools":
				fillText("TOOLS", x + (width >> 1), y + (height >> 1), height / 5, this._fontColor, 0, FONT_ALIGN_CENTER);
				break;
			case "help":
				fillText("HELP", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER);
				break;
			case "draw":
				drawQuadraticCurve([new GVector2f(x + offset, y + offset),
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + width - (offset << 1), y + (height >> 1))],
					[new GVector2f(x + offset, y + offset), new GVector2f(x + offset, y +  height - (offset << 1))],
					[new GVector2f(x + width - (offset << 1), y + (height >> 1)), new GVector2f(x + width - (offset << 1), y + offset)],
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + offset, y + offset)]]);
				break;
		}
	}
}