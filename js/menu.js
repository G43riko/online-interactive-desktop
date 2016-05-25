var Menu = {
	items: false,
	visibleSubMenu: false,
	image: new Image(),
	toolActive: false,
	isToolActive: function(){
		var tmp = this.toolActive;
		this.toolActive = false;
		return tmp;
	},
	init: function(){
		this.image.src = "img/icon.png"
	},
	showSubMenu: function(index){
		if(index == "main" || !this.items.hasOwnProperty(index))
			return;

		this.visibleSubMenu = index;
	},
	draw: function(){
		var count = 0,
			posY = MENU_POSITION,
			i,
			posX,
			off;

		context.lineWidth = MENU_BORDER_WIDTH;
		context.strokeStyle = MENU_BORDER_COLOR;

		for(i in this.items.main){
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(this.items.main.hasOwnProperty(i))
				off = this.items.main[i].sur;
			context.save();

			if(this.visibleSubMenu == i)
				context.lineWidth = MENU_BORDER_WIDTH * 2;
			if(i == "tools" && this.toolActive)
				setShadow(true);
			if(i == "colors"){
				context.fillStyle = Creator.color;
				context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, true, true);
				context.restore();
				continue;
			}
			context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, false, true);
			context.clip();
			context.drawImage(this.image, off.x, off.y, 40, 40, posX, posY, MENU_WIDTH, MENU_HEIGHT);
			context.restore();
		}
		if(!this.visibleSubMenu)
			return;

		count = 0;
		posY += MENU_OFFSET + MENU_HEIGHT;
		if(this.visibleSubMenu == "tools"){
			for(i in this.items["tools"]){
				posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
				off = this.items[this.visibleSubMenu][i].sur;
				context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, false, true);
				context.save();
				context.clip();
				context.drawImage(this.image, off.x, off.y, 40, 40, posX, posY, MENU_WIDTH, MENU_HEIGHT);
				context.restore();
			}
		}
		else if(this.visibleSubMenu == "colors"){
			for(i in colors){
				posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
				if(posX + MENU_WIDTH + MENU_OFFSET > canvas.width){
					count = 0;
					posY += MENU_OFFSET + MENU_HEIGHT;
					posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++
				}
				if(colors.hasOwnProperty(i))
					context.fillStyle = colors[i];
				context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, true, true);
			}
		}
	},
	doPressAct: function(index){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this.visibleSubMenu = index;
				break;
		}
		return index;
	},
	doClickAct: function(index){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this.toolActive = true;
				break;
			case "colors":
				this.visibleSubMenu = index;
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
	},
	pressIn:function(x, y){
		var count = 0,
			posY = MENU_POSITION,
			posX,
			result = false;
			menuInst = this;
			lastSubMenu = this.visibleSubMenu;

		$.each(this.items.main, function(i){
			if(result)
				return;
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				result = menuInst.doPressAct(i);
		});

		return result;
		/*
		for(var i in this.items.main){
			var posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				return this.doPressAct(i);
		}
		return false;
		*/
	},
	clickIn:function(x, y){
		var i,
			posX,
			count = 0,
			posY = MENU_POSITION,
			lastSubMenu = this.visibleSubMenu;
		for(i in this.items.main){
			posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				return this.doClickAct(i);
		}

		posY += MENU_OFFSET + MENU_HEIGHT;
		count = 0;
		this.visibleSubMenu = false;

		if(lastSubMenu == "tools"){
			for(i in this.items[lastSubMenu]){
				posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
				if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
					return this.doClickAct(i);
			}
		}
		else if(lastSubMenu == "colors"){
			for(i in colors){
				posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
				if(posX + MENU_WIDTH + MENU_OFFSET > canvas.width){
					count = 0;
					posY += MENU_OFFSET + MENU_HEIGHT;
					posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++
				}
				if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT){
					if(colors.hasOwnProperty(i))
					Creator.color = colors[i];
					return true;
				}
			}
		}
		return false;
	}
};