class ContexMenuManager{
	constructor(position, titles = [], parent = false, key = "undefined"){
		this._position 			= position;
		this._subMenu 			= false;
		this._parent 			= parent;
		this._key 				= key;
		this._textColor 		= CONTEXT_MENU_FONT_COLOR;
		this._selectedObject 	= parent ? parent._selectedObject : movedObject;
		this._titles 			= titles;

		if(this._titles.length == 0){
			if(movedObject){
				if(movedObject.name == "Arc" || movedObject.name == "Rect" || movedObject.name == "Polygon")
					this._addFields("changeFillColor", "changeBorderColor", "delete", "locked", "makeCopy");
				else if(movedObject.name == "Line")
					this._addFields("joinType", "lineCap", "lineStyle", "lineType", "makeCopy", "lineWidth", "delete");
				else if(movedObject.name == "Table")
					this._addFields("editTable", "locked", "delete", "makeCopy");
				else if(movedObject.name == "LayerViewer")
					this._addFields("visible", "deleteLayer", "renameLayer", "clearLayer");
				else if(movedObject.name == "Text")
					this._addFields("changeFillColor", "changeBorderColor", "delete", "locked", "verticalTextAlign", "horizontalTextAlign", "makeCopy");
			}
			this._addFields("clearWorkspace");
		}
		context.font = (30 - CONTEXT_MENU_OFFSET) + "pt " + DEFAULT_FONT;

		var hasExtension = false;

		if(titles.length > 0)
			titles.forEach(function(e, i, arr){
				if(e["type"] == "radio"){
					hasExtension = true;
					arr[i]["value"] = this._selectedObject["_" + this._key] == e["name"];
				}

				if(e["type"] == "checkbox"){
					hasExtension = true;
					if(e["key"] == "locked")
						arr[i]["value"] = movedObject.locked;
					else if(e["key"] == "visible")
						arr[i]["value"] = movedObject.visible;
				}

			}, this);

		this._menuWidth = getMaxWidth(this._titles.map(e => e["label"])) + (CONTEXT_MENU_OFFSET << 1);

		if(hasExtension)
			this._menuWidth += 30;

		this._size = new GVector2f(this._menuWidth, this._titles.length * CONTEXT_MENU_LINE_HEIGHT);
	};

	get position(){
		return this._position;
	};

	_addFields(){
		var res;
		objectToArray(arguments).forEach(function(e){
			res = ContexMenuManager.items[e];
			res["key"] = e;

			this._titles.push(res);
		}, this);
	};

	clickInBoundingBox(x, y){
		return x + SELECTOR_SIZE > this._position.x && x - SELECTOR_SIZE < this._position.x + this._menuWidth &&
			   y + SELECTOR_SIZE > this._position.y && y - SELECTOR_SIZE < this._position.y + this._titles.length * CONTEXT_MENU_LINE_HEIGHT;
	};

	draw(){
		if(this._position.x + this._menuWidth > canvas.width)
			this._position.x = canvas.width - this._menuWidth;

		if(this._position.y + this._titles.length * CONTEXT_MENU_LINE_HEIGHT >canvas.height)
			this._position.y = canvas.height - this._titles.length * CONTEXT_MENU_LINE_HEIGHT;

		var count = 0,
			pX = this._position.x,
			pY = this._position.y,
			menuWidth = this._menuWidth,
			posY,
			checkSize = 20,
			offset = (CONTEXT_MENU_LINE_HEIGHT - checkSize) >> 1;

		context.fillStyle = "rgb(153, 217, 234)";
		setShadow(true);
		context.roundRect(pX, pY, this._menuWidth, Object.keys(this._titles).length * CONTEXT_MENU_LINE_HEIGHT, MENU_RADIUS, true, false);
		setShadow(false);
		context.roundRect(pX, pY, this._menuWidth, Object.keys(this._titles).length * CONTEXT_MENU_LINE_HEIGHT, MENU_RADIUS, true, true);

		$.each(this._titles, function(i, e){
			context.fillStyle = DEFAULT_FONT_COLOR;
			posY = pY + count * CONTEXT_MENU_LINE_HEIGHT;
			if(count++ > 0)
				drawLine([pX, posY, pX + menuWidth, posY]);
			fillText(e["label"], pX, posY,  30 - CONTEXT_MENU_OFFSET, this._textColor, [CONTEXT_MENU_OFFSET, 0]);

			if(e["type"] == "checkbox"){
				context.fillStyle = e["value"] ? "green" : "red";
				context.roundRect(pX + menuWidth - offset - checkSize, posY + offset, checkSize, checkSize, 5, true, false);
			}
			else if(e["type"] == "radio"){
				if(e["value"])
					fillArc(pX + menuWidth - offset - checkSize, posY + offset, checkSize, checkSize);
				else
					drawArc(pX + menuWidth - offset - checkSize, posY + offset, checkSize, checkSize);
			}
			else if(e["type"] == "widthValue"){
				context.save();
				drawLine([pX + menuWidth - (checkSize << 2), posY + (CONTEXT_MENU_LINE_HEIGHT >> 1),
						  pX + menuWidth - offset, posY + (CONTEXT_MENU_LINE_HEIGHT >> 1)], e["name"]);
				context.restore();
			}
		});

		if(this._subMenu)
			this._subMenu.draw();
	};

	_doClickAct(act){
		switch(act){
			case "changeFillColor":
				pickUpColor(function(color){
					this._selectedObject.fillColor = color;
					actContextMenu = false;
				}, this);
				break;
			case "changeBorderColor":
				pickUpColor(function(color){
					this._selectedObject.borderColor = color;
					actContextMenu = false;
				}, this);
				break;
			case "delete":
				if(this._selectedObject)
					Scene.remove(this._selectedObject);
				actContextMenu = false;
				break;
			case "locked":
				this._selectedObject.locked = !this._selectedObject.locked;
				ContexMenuManager.items["locked"].value = this._selectedObject.locked;
				actContextMenu = false;
				break;
			case "clearWorkspace":
				Scene.cleanUp();
				actContextMenu = false;
				break;
			case "removeRow":
				this._selectedObject.removeRow(this._parent.position.y);
				actContextMenu = false;
				break;
			case "removeColumn":
				this._selectedObject.removeColumn(this._parent.position.x);
				actContextMenu = false;
				break;
			case "addRowBelow":
				this._selectedObject.addRow(this._parent.position.y, "below");
				actContextMenu = false;
				break;
			case "addRowAbove":
				this._selectedObject.addRow(this._parent.position.y, "above");
				actContextMenu = false;
				break;
			case "addColumnToRight":
				this._selectedObject.addColumn(this._parent.position.x, "right");
				actContextMenu = false;
				break;
			case "addColumnToLeft":
				this._selectedObject.addColumn(this._parent.position.x, "left");
				actContextMenu = false;
				break;
			case "buttCap":
				this._selectedObject.lineCap = LINE_CAP_BUTT;
				actContextMenu = false;
				break;
			case "roundCap":
				this._selectedObject.lineCap = LINE_CAP_ROUND;
				actContextMenu = false;
				break;
			case "squareCap":
				this._selectedObject.lineCap = LINE_CAP_SQUARE;
				actContextMenu = false;
				break;
			case "miterJoin":
				this._selectedObject.joinType = LINE_JOIN_MITER;
				actContextMenu = false;
				break;
			case "roundJoin":
				this._selectedObject.joinType = LINE_JOIN_ROUND;
				actContextMenu = false;
				break;
			case "bevelJoin":
				this._selectedObject.joinType = LINE_JOIN_BEVEL;
				actContextMenu = false;
				break;
			case "clearRow":
				this._selectedObject.clear(this._parent.position.y, "row");
				actContextMenu = false;
				break;
			case "clearColumn":
				this._selectedObject.clear(this._parent.position.x, "column");
				actContextMenu = false;
				break;
			case "clearTable":
				this._selectedObject.clear(null, "table");
				actContextMenu = false;
				break;
			case "visible":
				this._selectedObject.toggleVisibilityOfLayer(this._position.y);
				actContextMenu = false;
				break;
			case "clearLayer":
				this._selectedObject.clearLayer(this.position.y);
				actContextMenu = false;
				break;
			case "renameLayer":
				this._selectedObject.renameLayer(this.position.y);
				actContextMenu = false;
				break;
			case "alphabeticVAlign":
				this._selectedObject.verticalTextAlign = FONT_VALIGN_ALPHA;
				actContextMenu = false;
				break;
			case "middleVAlign":
				this._selectedObject.verticalTextAlign = FONT_VALIGN_MIDDLE;
				actContextMenu = false;
				break;
			case "topVAlign":
				this._selectedObject.verticalTextAlign = FONT_VALIGN_TOP;
				actContextMenu = false;
				break;
			case "bottomVAlign":
				this._selectedObject.verticalTextAlign = FONT_VALIGN_BOTT;
				actContextMenu = false;
				break;
			case "leftHAlign":
				this._selectedObject.horizontalTextAlign = FONT_HALIGN_LEFT;
				actContextMenu = false;
				break;
			case "centerHAlign":
				this._selectedObject.horizontalTextAlign = FONT_HALIGN_CENTER;
				actContextMenu = false;
				break;
			case "rightHAlign":
				this._selectedObject.horizontalTextAlign = FONT_HALIGN_RIGHT;
				actContextMenu = false;
				break;
			case "strippedLine":
				this._selectedObject.lineStyle = LINE_STYLE_STRIPPED;
				actContextMenu = false;
				break;
			case "normalLine":
				this._selectedObject.lineStyle = LINE_STYLE_NORMAL;
				actContextMenu = false;
				break;
			case "makeCopy":
				Entity.clone(this._selectedObject);
				actContextMenu = false;
				break;
			case "1pxWidth":
				this._selectedObject.borderWidth = 1;
				actContextMenu = false;
				break;
			case "2pxWidth":
				this._selectedObject.borderWidth = 2;
				actContextMenu = false;
				break;
			case "5pxWidth":
				this._selectedObject.borderWidth = 5;
				actContextMenu = false;
				break;
			case "10pxWidth":
				this._selectedObject.borderWidth = 10;
				actContextMenu = false;
				break;
			case "20pxWidth":
				this._selectedObject.borderWidth = 20;
				actContextMenu = false;
				break;
		}
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return this._subMenu ? this._subMenu.clickIn(x, y) : false;

		var i = parseInt((y - this._position.y) / CONTEXT_MENU_LINE_HEIGHT);

		if(typeof this._titles[i] !== "undefined" && this._titles[i].hasOwnProperty("fields")){
			var pos = this._position.getClone().add(this._menuWidth, i * CONTEXT_MENU_LINE_HEIGHT);
			if(pos.x + this._menuWidth > canvas.width)
				pos.x -= this._menuWidth << 1;
			this._subMenu = new ContexMenuManager(pos,
												  objectToArray(this._titles[i]["fields"]), this, this._titles[i]["key"]);
		}
		else
			this._subMenu = false;

		this._doClickAct(this._titles[i].key);

		return true;

	};
}