/*
	compatible: forEach, canvas, JSON parsing 14.9.2016
*/
class MenuManager{
	constructor(position = new GVector2f(), size = new GVector2f(MENU_WIDTH, MENU_HEIGHT), key = "mainMenu", parent = null){
		if(parent != null)
			this._items = parent._allItems[key];

		this._key 						= key;
		this._parent 					= parent;
		this._toolActive 				= false;
		this._fontColor 				= MENU_FONT_COLOR;
		//this._backgroundColor 		= "rgb(153, 217, 234)";
		this._backgroundColor 			= MENU_BACKGROUND_COLOR;
		this._disabledBackgroundColor 	= MENU_DISABLED_BG_COLOR;
		this._position 					= position.add(MENU_OFFSET);
		this._offset 					= MENU_OFFSET;
		this._size 						= size;
		this._vertical 					= parent != null;
		this._visibleElements			= 0;
		this._canvas 					= parent == null ? document.createElement("canvas") : parent._canvas;
		this._context					= null;
		this._tmpDrawArray				= [];
		this._visible 					= true;
		this._visibleSubMenu 			= false;
		this._subMenus					= {};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	get position(){return this._position;}
	get size(){return this._size;}
	set visible(val){this._visible = val;}

	hover(x, y){
		if(!this._visible)
			return false;

		var posY = this._position.y,
			posX = this._position.x,
			result = false;

		if(this._visibleSubMenu)
			result = this._subMenus[this._visibleSubMenu].hover(x, y);


		if(!result)
			//this._items.forEach(function(e) {
			each(this._items, function(e) {
				if (!e["visible"] || result)
					return false;

				if(x > posX && x < posX + this._size.x && y > posY && y < posY + this._size.y )
					result = e;

				if(this._vertical)
					posY += this._size.y + this._offset;
				else
					posX += this._size.x + this._offset;
			}, this);

		if(result){
			if(result.disabled)
				setCursor(CURSOR_NOT_ALLOWED);
			else
				setCursor(CURSOR_POINTER);
		}
		else
			setCursor(CURSOR_DEFAULT);

		return result !== false;
	}

	static _changeDataByComponents(data){
		if(!Components.tools() && Components.draw()) //ak je kreslenie a nie nastroje musí sa nastaviť kreslenie
			Creator.operation = OPERATION_DRAW_PATH;
		
		data["tools"]["draw"]["visible"] = Components.draw();
		//TODO undo a redo zmeniť lebo ho bude treba aj pri tool componente
		data["mainMenu"]["undo"]["visible"] = Components.draw();
		data["mainMenu"]["redo"]["visible"] = Components.draw();

		data["mainMenu"]["tools"]["visible"] = Components.tools();
		data["mainMenu"]["content"]["visible"] = Components.content();
		data["mainMenu"]["sharing"]["visible"] = Components.share();
		data["tools"]["image"]["visible"] = Components.load();

		if(!Components.load() && !Components.save() && !Components.screen() && !Components.task())
			data["mainMenu"]["file"]["visible"] = false;
		else{
			data["file"]["loadXML"]["visible"] = Components.load();
			data["file"]["saveXML"]["visible"] = Components.save();
			data["file"]["saveImg"]["visible"] = Components.screen();
			data["file"]["saveTask"]["visible"] = Components.task();
		}


		return data;
	}
	init(data){
		if(!MenuManager.dataBackup)
			MenuManager.dataBackup = JSON.stringify(data);

		data = MenuManager._changeDataByComponents(data);
		var array = [],
			counter = new GVector2f(),
			w = this._size.x + MENU_OFFSET,
			h = this._size.y + MENU_OFFSET,
			num = 0,
			store = {},
			tmp;

		this._visibleElements = 0;
		each(data, function(eee, ii){
			array[ii] = [];
			each(data[ii], function(e, i){
				if(isDefined(e["values"])){
					//e.values.forEach(function(ee){
					each(e.values, function(ee){
						tmp = {};
						tmp["visible"] = e["visible"];
						tmp["disabled"] = e["disabled"];
						tmp["key"] = i.replace("XYZ ", "");

						counter.x > counter.y && counter.y++ || counter.x++;

						tmp["posX"] = counter.x;
						tmp["posY"] = counter.y;
						tmp["value"] = ee;
						this._tmpDrawArray.push({
							x: counter.x,
							y: counter.y,
							value:  ee,
							key: i
						});
						array[ii].push(tmp);
					}, this);
					return;
				}

				e["key"] = i;

				counter.x > counter.y && counter.y++ || counter.x++;
				if(ii === "mainMenu" && e.visible)
					this._visibleElements++;
				
				e["posX"] = counter.x;
				e["posY"] = counter.y;
				this._tmpDrawArray.push({
					x: counter.x,
					y: counter.y,
					key: i
				});

				array[ii].push(e);
			}, this);

			if(isIn(ii, "tools", "file", "content", "sharing"))
				store[ii] = num;
			if(ii !== "mainMenu" && data["mainMenu"][ii]["visible"])
				num++;
		}, this);
		this._canvas.width 	= this._tmpDrawArray[this._tmpDrawArray.length - 1].x * this._size.x + this._size.x;
		this._canvas.height	= this._tmpDrawArray[this._tmpDrawArray.length - 1].y * this._size.y + this._size.y;
		this._context 		= this._canvas.getContext('2d');

		this._redraw();


		this._items 	= array["mainMenu"];
		this._allItems 	= array;

		each(store, (e, i) => {
			this._subMenus[i] = new MenuManager(new GVector2f(e * w, h), new GVector2f(this._size.x, this._size.y), i, this);
		}, this);

		if(Creator.view)
			Creator.view.position.x = this.position.x + (this.size.x + MENU_OFFSET) * this.visibleElements - MENU_OFFSET
		draw();
	}

	get visibleElements(){
		return this._visibleElements;
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
		if(!this._visible)
			return false;

		var posY = this._position.y,
			posX = this._position.x,
			result = false;

		if(this._visibleSubMenu)
			result = this._subMenus[this._visibleSubMenu].clickIn(x, y);

		this._visibleSubMenu = false;

		if(result)
			return result;

		//this._items.forEach(function(e) {
		each(this._items, function(e) {
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

	disabled(menu, button, value){
		var check = (e, i, arr) => {
			if(e.key === button)
					arr[i].disabled = typeof value === KEYWORD_UNDEFINED ? !e.disabled : value;
		}
		if(this._key == menu)
			each(this._items, check);
		else if(isDefined(this._subMenus[menu]))
			each(this._subMenus[menu]._items, check);
	}

	_doClickAct(val){
		var key = val.key;

		if(val.disabled){
			Logger.log("Klikol v menu na disablovanu položku " + key, LOGGER_MENU_CLICK);
			return;
		}

		Logger.log("Klikol v menu na položku " + key, LOGGER_MENU_CLICK);
		if(isIn(key, "file", "content", "sharing")){
			this._visibleSubMenu = key;
			return;
		}
		switch(key){
			case "tools":
				this._toolActive = "tools";
				break;
			case "color":
				pickUpColor(color => Creator.setOpt(ATTRIBUTE_FILL_COLOR, color));
				break;
			case "options":
				showOptions();
				break;
			case "draw":
				Creator.operation = OPERATION_DRAW_PATH;
				break;
			case "rect":
				Creator.operation = OPERATION_DRAW_RECT;
				break;
			case "image":
				Creator.operation = OPERATION_DRAW_IMAGE;
				break;
			case "line":
				Creator.operation = OPERATION_DRAW_LINE;
				break;
			case "startShare":
				showSharingOptions();
				break;
			case "loadLocalImage":
				Content.setContentImage();
				break;
			case "loadLocalHTML":
				Content.setContentHTML();
				break;
			case "undo":
				Paints.undo();
				break;
			case "copyUrl":
				Sharer.copyUrl();
				break;
			case "redo":
				Paints.redo();
				break;
			case "saveImg":
				//saveCanvasAsFile();
				showSavingOptions();
				break;
			case "watch":
				window.open(Sharer.getWatcherUrl(), '_blank');
				break;
			case "saveTask":
				saveSceneAsTask();
				break;
			case "stopShare":
				Sharer.stopShare();
				break;
			case "saveXML":
				//saveSceneAsFile();
				showXmlSavingOptions();
				break;
			case "loadXML":
				loadSceneFromFile();
				break;
			case "arc":
				Creator.operation = OPERATION_DRAW_ARC;
				break;
			case "defaultBrushes":
				Paints.setImage(val.value);
				break;
			case "defaultWidth":
				Creator.setOpt(ATTRIBUTE_LINE_WIDTH, val.value);
				this._parent._redraw();
				break;
			case "join":
				Creator.operation = OPERATION_DRAW_JOIN;
				break;
			case "lineWidth":
				this._visibleSubMenu = key;
				break;
		}
	}

	/*
	 * PRESS
	 */

	_doPressAct(index, pos){
		if(!index)
			return false;
		switch(index){
			case "tools":
				this._visibleSubMenu = index;
				break;
			case "file":
				actContextMenu = new ContextMenuManager(pos, [], false, "file");
				break;
		}
		return index;
	};

	pressIn(x, y){
		if(!this._visible)
			return false;
		var posY = this._position.y,
			posX = this._position.x,
			result = false;

		if(this._visibleSubMenu)
			result = this._subMenus[this._visibleSubMenu].clickIn(x, y);

		if(result)
			return result;

		//this._items.forEach(function(e) {
		each(this._items, function(e) {
			if (!e["visible"] || result)
				return false;

			if(x > posX && x < posX + this._size.x && y > posY && y < posY + this._size.y ){
				result = e;
				this._doPressAct(e.key, new GVector2f(x, y));
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
		if(!this._items || !this._visible)
			return;
		var posY = this._position.y,
			posX = this._position.x;


		context.lineWidth = MENU_BORDER_WIDTH;
		context.strokeStyle = MENU_BORDER_COLOR;
		context.fillStyle = this._backgroundColor;

		//this._items.forEach(function(e){
		each(this._items, function(e){
			if(!e["visible"])
				return;
			var bgColor = e["disabled"] ? this._disabledBackgroundColor : this._backgroundColor;
			if(e["key"] == "color" )
				bgColor = Creator.color;
			doRect({
				position: [posX, posY],
				size: this._size,
				radius: MENU_RADIUS,
				fillColor: bgColor,
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
		//this._tmpDrawArray.forEach(function(e){
		each(this._tmpDrawArray, function(e){			
			this._drawIcon(e, e.x * this._size.x, e.y * this._size.y, 5, this._size.x, this._size.y, this._fontColor);
		}, this);

		Logger.log("prekresluje sa " + this.constructor.name, LOGGER_DRAW);
	}

	_drawIcon(type, x, y, offset = 5, width = this._size.x, height = this._size.y, strokeColor = DEFAUL_STROKE_COLOR, strokeWidth = DEFAULT_STROKE_WIDTH){
		var img;
		switch(type.key){
			case "arc":
				doArc({
					position: [x + offset, y + offset],
					size: [width - (offset << 1), height - (offset << 1)],
					borderColor: strokeColor,
					borderWidth: strokeWidth,
					ctx: this._context
				});
				break;
			case "rect":
				doRect({
					position: [x + offset, y + offset],
					size: [width - (offset << 1), height - (offset << 1)],
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				break;
			case "line":
				doLine({
					points: [new GVector2f(x + offset, y + offset),
							 new GVector2f(x + width - (offset << 1), y + (height >> 1)),
							 new GVector2f(x + offset, y +  height - (offset << 1)),
							 new GVector2f(x + width - (offset << 1), y + offset)],
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				break;
			case "text":
				fillText("TEXT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "ctrl":
				fillText("CTRL", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "file":
				fillText("FILE", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "content":
				fillText("CONT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "undo":
				fillText("UNDO", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "redo":
				fillText("REDO", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "watch":
				fillText("WATCH", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "copyUrl":
				fillText("LINK", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "shareOptions":
				fillText("OPT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "stopShare":
				fillText("STOP", x + (width >> 1), y + (height >> 1), height  / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "startShare":
				fillText("START", x + (width >> 1), y + (height >> 1), height  / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "sharing":
				fillText("SHARE", x + (width >> 1), y + (height >> 1), height / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadLocalImage":
				fillText("locImg", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadLocalHTML":
				fillText("locHTML", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadExternalImage":
				fillText("extImg", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadExternalHTML":
				fillText("extHTML", x + (width >> 1), y + (height >> 1), height / 6, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "saveImg":
				fillText("SAVE IMG", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "saveXML":
				fillText("SAVE XML", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "saveTask":
				fillText("SAVE TASK", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "loadXML":
				fillText("LOAD XML", x + (width >> 1), y + (height >> 1), height >> 3, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "options":
				fillText("OPT", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "table":
				var lines = 4;
				var line = (height - (offset << 1)) / lines;
				var points = [[x + (width >> 1), y + offset, x + (width >> 1), y - offset + height]];
				for(var i=1, data = line ; i<lines ; i++, data += line)
					points.push([x + offset, y + offset + data, x - offset + width, y + offset + data]);

				doRect({
					position: [x + offset, y + offset],
					size: [width - (offset << 1), height - (offset << 1)],
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				
				doLine({
					points: points,
					borderWidth: strokeWidth,
					borderColor: strokeColor,
					ctx: this._context
				});
				//fillText("TAB", x + (width >> 1), y + (height >> 1), height >> 2, this._fontColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "class":
				fillText("CLASS", x + (width >> 1), y + (height >> 1), height / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "image":
				fillText("IMG", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "tools":
				fillText("TOOLS", x + (width >> 1), y + (height >> 1), height / 5, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "polygon":
				fillText("POLY", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;

			case "help":
				fillText("HELP", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
			case "defaultWidth":
				doLine({
					points: [x + offset, y + (height >> 1), x + width - offset, y + (height >> 1)],
					borderWidth: type.value,
					borderColor: strokeColor,
					ctx: this._context
				});
				break;
			case "brushes":
				img = Paints.selectedImg;
				if(img == null)
					return;
				this._context.drawImage(img, 0, 0, img.width, img.height, x , y, width, height);
				break;
			case "lineWidth":
				doLine({
					points: [x + offset, y + (height >> 1), x + width - offset, y + (height >> 1)],
					borderWidth: Creator.lineWidth,
					borderColor: this._fontColor,
					ctx: this._context
				});

				break;
			case "defaultBrushes":
				Paints.addBrush(type.value);
				img = Paints.getBrush(type.value);
				this._context.drawImage(img, 0, 0, img.width, img.height, x , y, width, height);
				break;
			case "draw":
				drawQuadraticCurve([new GVector2f(x + offset, y + offset),
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + width - (offset << 1), y + (height >> 1))],
					[new GVector2f(x + offset, y + offset), new GVector2f(x + offset, y +  height - (offset << 1))],
					[new GVector2f(x + width - (offset << 1), y + (height >> 1)), new GVector2f(x + width - (offset << 1), y + offset)],
					[new GVector2f(x + offset, y +  height - (offset << 1)), new GVector2f(x + offset, y + offset)]], strokeWidth, strokeColor, this._context);
				break;
			case "join":
				fillText("JOIN", x + (width >> 1), y + (height >> 1), height >> 2, strokeColor, 0, FONT_ALIGN_CENTER, this._context);
				break;
		}
	}
}