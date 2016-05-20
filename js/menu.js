var Menu = {
	items: false,
	visibleSubMenu: false,
	image: new Image(),
	init: function(){
		this.image.src = "img/icon.png"
	},
	showSubMenu: function(index){
		if(index == "main" || !this.items.hasOwnProperty(index))
			return;

		this.visibleSubMenu = index;
	},
	draw: function(){
		var count = 0;

		context.lineWidth = MENU_BORDER_WIDTH;
		context.strokeStyle = MENU_BORDER_COLOR;
		var posY = MENU_POSITION;

		for(var i in this.items.main){
			var posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			var off = this.items.main[i].sur;
			if(this.visibleSubMenu == i)
				context.lineWidth = MENU_BORDER_WIDTH * 2;
			context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, false, true);
			context.save();
			context.clip();
			context.drawImage(this.image, off.x, off.y, 40, 40, posX, posY, MENU_WIDTH, MENU_HEIGHT);
			context.restore();
			if(this.visibleSubMenu == i)
				context.lineWidth = MENU_BORDER_WIDTH;
		}
		if(!this.visibleSubMenu)
			return;

		count = 0;
		posY += MENU_OFFSET + MENU_HEIGHT;
		for(var i in this.items[this.visibleSubMenu]){
			var posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			var off = this.items[this.visibleSubMenu][i].sur;
			context.roundRect(posX, posY, MENU_WIDTH, MENU_HEIGHT, MENU_RADIUS, false, true);
			context.save();
			context.clip();
			context.drawImage(this.image, off.x, off.y, 40, 40, posX, posY, MENU_WIDTH, MENU_HEIGHT);
			context.restore();
		}
	},
	doPressAct: function(index){
		if(!index)
			return false;

		draw();
		return index;
	},
	doClickAct: function(index){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this.visibleSubMenu = index;
				break;
			case "draw":
				operation = OPERATION_DRAW_PATH;
				break;
			case "rect":
				operation = OPERATION_DRAW_RECT;
				break;
			case "arc":
				operation = OPERATION_DRAW_ARC;
				break;
		}
		draw();
		return index;
	},
	clickIn:function(x, y){
		var count = 0;
		var posY = MENU_POSITION;
		var lastSubMenu = this.visibleSubMenu;
		for(var i in this.items.main){
			var posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				return this.doClickAct(i);
		}

		posY += MENU_OFFSET + MENU_HEIGHT;
		count = 0;
		this.visibleSubMenu = false;

		for(var i in this.items[lastSubMenu]){
			var posX = MENU_POSITION + (MENU_WIDTH + MENU_OFFSET) * count++;
			if(x > posX && y > posY && x < posX + MENU_WIDTH && y < posY + MENU_HEIGHT)
				return this.doClickAct(i);
		}

		return false;
	}
}