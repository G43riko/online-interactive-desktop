class ContextMenuManager{
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
				if(isIn(movedObject.name, "Rect", "Polygon"))
					this._addFields("changeFillColor", "changeBorderColor", "delete", "locked", "makeCopy", "radius");
				else if(movedObject.name ==  "Arc")
					this._addFields("changeFillColor", "changeBorderColor", "delete", "locked", "makeCopy");
				else if(movedObject.name == "Line")
					this._addFields("joinType", "lineCap", "lineStyle", "lineType", "makeCopy", "lineWidth", "delete", "arrowEndType", "arrowStartType", "radius");
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
			res = ContextMenuManager.items[e];
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
			inst = this,
			posY = pY,
			checkSize = 20,
			offset = (CONTEXT_MENU_LINE_HEIGHT - checkSize) >> 1;

		doRect({
			position:[pX, pY],
			width: this._menuWidth,
			height: Object.keys(this._titles).length * CONTEXT_MENU_LINE_HEIGHT,
			radius: MENU_RADIUS,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth,
			fillColor: "rgb(153, 217, 234)",
			shadow: true,
			draw: true
		});

		$.each(this._titles, function(i, e){
			context.fillStyle = DEFAULT_FONT_COLOR;
			posY = pY + count * CONTEXT_MENU_LINE_HEIGHT;
			if(count++ > 0)
				doLine({points: [pX, posY, pX + menuWidth, posY], draw: true});

			if(inst._subMenu && e["key"] == inst._subMenu._key)
				fillText(e["label"], pX, posY,  30 - CONTEXT_MENU_OFFSET, inst._textColor);
			else
				fillText(e["label"], pX, posY,  30 - CONTEXT_MENU_OFFSET, inst._textColor, [CONTEXT_MENU_OFFSET, 0]);

			if(e["type"] == "checkbox")
				doRect({
					x: pX + menuWidth - offset - checkSize,
					y: posY + offset,
					size: checkSize,
					radius: 5,
					borderColor: this.borderColor,
					borderWidth: this.borderWidth,
					fillColor: e["value"] ? "green" : "red",
					draw: true
				});
			else if(e["type"] == "radio")
				doArc({
					x: pX + menuWidth - offset - checkSize,
					y: posY + offset,
					size: checkSize,
					borderColor: DEFAULT_FONT_COLOR,
					fillColor: DEFAULT_FONT_COLOR,
					draw: !e["value"],
					fill: e["value"]
				});
			else if(e["type"] == "widthValue")
				doLine({
					points: [pX + menuWidth - (checkSize << 2), posY + (CONTEXT_MENU_LINE_HEIGHT >> 1),
							 pX + menuWidth - offset, posY + (CONTEXT_MENU_LINE_HEIGHT >> 1)],
					borderWidth: e["name"]
				});
		});

		if(this._subMenu)
			this._subMenu.draw();
	};

	_doClickAct(opt) {
		var act = opt.key;
		switch (act) {
			case "changeFillColor":
				pickUpColor(color => Entity.changeAttr(this._selectedObject, "fillColor", color), this);
				actContextMenu = false;
				break;
			case "changeBorderColor":
				pickUpColor(color => Entity.changeAttr(this._selectedObject, "borderColor", color), this);
				actContextMenu = false;
				break;
			case "delete":
				if (this._selectedObject)
					Scene.remove(this._selectedObject);
				actContextMenu = false;
				break;
			case "locked":
				this._selectedObject.locked = !this._selectedObject.locked;
				ContextMenuManager.items["locked"].value = this._selectedObject.locked;
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
			case "makeCopy":
				Entity.clone(this._selectedObject);
				actContextMenu = false;
				break;
			default:
				if(opt.group == "roundRadius"){
					Entity.changeAttr(this._selectedObject, "radius", opt.name, false);
					actContextMenu = false;
				}
				else if(opt.group == "lineCapValue"){
					this._selectedObject.lineCap = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "joinTypeValue"){
					this._selectedObject.joinType = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "lineStyleValue"){
					this._selectedObject.lineStyle = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "widthValue"){
					Entity.changeAttr(this._selectedObject, "borderWidth", opt.name);
					//this._selectedObject.borderWidth = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "arrowEndType"){
					this._selectedObject.arrowEndType = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "arrowStartType"){
					this._selectedObject.arrowStartType = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "valignValue"){
					this._selectedObject.verticalTextAlign = opt.name;
					actContextMenu = false;
				}
				else if(opt.group == "halignValue"){
					this._selectedObject.horizontalTextAlign = opt.name;
					actContextMenu = false;
				}

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
			this._subMenu = new ContextMenuManager(pos, objectToArray(this._titles[i]["fields"]), this, this._titles[i]["key"]);
		}
		else
			this._subMenu = false;

		this._doClickAct(this._titles[i]);

		return true;

	};
}