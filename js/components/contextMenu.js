class ContexMenuManager{
	constructor(position, object = false){
		this._position = position;
		this._object = object;
		this._titles = ContexMenuManager.items;
		this._selectedIndex = false;
		this._selectedI = 0;

	};

	clickInBoundingBox(x, y){
		return x + SELECTOR_SIZE > this._position.x && x - SELECTOR_SIZE < this._position.x + CONTEXT_MENU_WIDTH &&
			   y + SELECTOR_SIZE > this._position.y && y - SELECTOR_SIZE < this._position.y + Object.keys(this._titles).length * CONTEXT_MENU_LINE_HEIGHT;
	};

	drawLevel(array, pX, pY){
		var count = 0;
		context.fillStyle = "rgb(153, 217, 234)";
		setShadow(true);
		context.roundRect(pX, pY, CONTEXT_MENU_WIDTH, Object.keys(array).length * CONTEXT_MENU_LINE_HEIGHT, MENU_RADIUS, true, false);
		setShadow(false);
		context.roundRect(pX, pY, CONTEXT_MENU_WIDTH, Object.keys(array).length * CONTEXT_MENU_LINE_HEIGHT, MENU_RADIUS, true, true);

		$.each(array, function(i, e){
			context.fillStyle = DEFAULT_TEXT_COLOR;
			var posY = pY + count * CONTEXT_MENU_LINE_HEIGHT;
			if(count++ > 0)
				drawLine([new GVector2f(pX, posY), new GVector2f(pX + CONTEXT_MENU_WIDTH, posY)]);
			fillText(e["name"], pX + CONTEXT_MENU_OFFSET, posY,0 , CONTEXT_MENU_LINE_HEIGHT,  30);
		});

		if(this._selectedIndex && this._selectedIndex != array){
			if(pX + (CONTEXT_MENU_WIDTH << 1) > canvas.width)
				pX -= CONTEXT_MENU_WIDTH << 1;

			this.drawLevel(this._selectedIndex, pX + CONTEXT_MENU_WIDTH,
												pY + this._selectedI * CONTEXT_MENU_LINE_HEIGHT);
		}
	}

	draw(){
		if(this._position.x + CONTEXT_MENU_WIDTH > canvas.width)
			this._position.x = canvas.width - CONTEXT_MENU_WIDTH;

		this.drawLevel(this._titles, this._position.x, this._position.y);
		return;
	};

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;
		var counter = 0,
			i = parseInt((y - this._position.y) / CONTEXT_MENU_LINE_HEIGHT);
		for(var j in this._titles){
			if(counter++ == i)
				if(this._titles[j].hasOwnProperty("fields")){
					this._selectedI = i;
					this._selectedIndex = this._titles[j]["fields"];
					return true;
				}
		}
		this._selectedI = 0;
		this._selectedIndex = false;
		return true;

	};
}