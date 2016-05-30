class ContexMenuManager{
	constructor(position, titles = [], parent = false){
		this._position = position;
		this._titles = titles;
		this._subMenu = false;
		this._parent = parent;
		this._textColor = CONTEXT_MENU_FONT_COLOR;
		this.selectedObject = parent ? parent.selectedObject : movedObject;

		if(this._titles.length == 0){
			if(movedObject){
				if(movedObject.name == "Arc" || movedObject.name == "Rect" || movedObject.name == "Text" || movedObject.name == "Polygon"){
					ContexMenuManager.items["locked"].value = movedObject.locked;
					this._titles.push(ContexMenuManager.items["changeFillColor"],
									  ContexMenuManager.items["changeBorderColor"],
									  ContexMenuManager.items["delete"],
									  ContexMenuManager.items["locked"]);
				}
				else if(movedObject.name == "Line"){
					this._titles.push(ContexMenuManager.items["joinType"],
									  ContexMenuManager.items["capType"],
									  ContexMenuManager.items["joinType"]);
				}
				else if(movedObject.name == "Table"){
					this._titles.push(ContexMenuManager.items["editTable"],
									  ContexMenuManager.items["locked"],
									  ContexMenuManager.items["delete"]);
				}
				else if(movedObject.name == "LayerViewer"){
					this._titles.push(ContexMenuManager.items["visible"],
									  ContexMenuManager.items["deleteLayer"],
									  ContexMenuManager.items["renameLayer"],
									  ContexMenuManager.items["clearLayer"]);
				}


			}
			this._titles.push(ContexMenuManager.items["clearWorkspace"]);
		}
		context.font = (30 - CONTEXT_MENU_OFFSET) + "pt " + DEFAULT_FONT;
		this._menuWidth = getMaxWidth(this._titles.map(e => e["name"])) + (CONTEXT_MENU_OFFSET << 1);
		this._size = new GVector2f(this._menuWidth, this._titles.length * CONTEXT_MENU_LINE_HEIGHT);
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
			menuWidth = this._menuWidth;

		context.fillStyle = "rgb(153, 217, 234)";
		setShadow(true);
		context.roundRect(pX, pY, this._menuWidth, Object.keys(this._titles).length * CONTEXT_MENU_LINE_HEIGHT, MENU_RADIUS, true, false);
		setShadow(false);
		context.roundRect(pX, pY, this._menuWidth, Object.keys(this._titles).length * CONTEXT_MENU_LINE_HEIGHT, MENU_RADIUS, true, true);

		$.each(this._titles, function(i, e){
			context.fillStyle = DEFAULT_FONT_COLOR;
			var posY = pY + count * CONTEXT_MENU_LINE_HEIGHT;
			if(count++ > 0)
				drawLine([pX, posY, pX + menuWidth, posY]);
			fillText2(e["name"], pX, posY,  30 - CONTEXT_MENU_OFFSET, this._textColor, CONTEXT_MENU_OFFSET);

			if(e["type"] == "checkbox"){
				var checkSize = 30;
				var offset = (CONTEXT_MENU_LINE_HEIGHT - checkSize) >> 1;
				context.fillStyle = e["value"] ? "green" : "red";
				context.roundRect(pX + this._menuWidth - offset - checkSize, posY + offset, checkSize, checkSize, 5, true, false);
			}
		});

		if(this._subMenu)
			this._subMenu.draw();
	};

	doClickAct(act){
		switch(act){
			case "Change fill color":
				pickUpColor(function(color){
					this.selectedObject.fillColor = color;
					actContextMenu = false;
				}, this);
				break;
			case "Change border color":
				pickUpColor(function(color){
					this.selectedObject.borderColor = color;
					actContextMenu = false;
				}, this);
				break;
			case "Delete":
				if(this.selectedObject)
					Scene.remove(this.selectedObject);
				actContextMenu = false;
				break;
			case "Locked":
				this.selectedObject.locked = !this.selectedObject.locked;
				ContexMenuManager.items["locked"].value = this.selectedObject.locked;
				actContextMenu = false;
				break;
			case "Clear workspace":
				Scene.cleanUp();
				actContextMenu = false;
				break;
			case "Remove row":
				this.selectedObject.removeRow(this._parent._position.y);
				actContextMenu = false;
				break;
			case "Remove column":
				this.selectedObject.removeColumn(this._parent._position.x);
				actContextMenu = false;
				break;
			case "Add row below":
				this.selectedObject.addRow(this._parent._position.y, "below");
				actContextMenu = false;
				break;
			case "Add row above":
				this.selectedObject.addRow(this._parent._position.y, "above");
				actContextMenu = false;
				break;
			case "Add column right":
				this.selectedObject.addColumn(this._parent._position.x, "right");
				actContextMenu = false;
				break;
			case "Add column left":
				this.selectedObject.addColumn(this._parent._position.x, "left");
				actContextMenu = false;
				break;
			case "Butt":
				this.selectedObject.lineCap = LINE_CAP_BUTT;
				actContextMenu = false;
				break;
			case "Round":
				this.selectedObject.lineCap = LINE_CAP_ROUND;
				actContextMenu = false;
				break;
			case "Square":
				this.selectedObject.lineCap = LINE_CAP_SQUARE;
				actContextMenu = false;
				break;
			case "Clear row":
				this.selectedObject.clear(this._parent._position.y, "row");
				actContextMenu = false;
				break;
			case "Clear column":
				this.selectedObject.clear(this._parent._position.x, "column");
				actContextMenu = false;
				break;
			case "Clear table":
				this.selectedObject.clear(null, "table");
				actContextMenu = false;
				break;
			case "Visible":
				this.selectedObject.toggleVisibilityOfLayer(this._position.y);
				actContextMenu = false;
				break;
			case "Clear layer":
				this.selectedObject.clearLayer(this._position.y);
				actContextMenu = false;
				break;
			case "Rename layer":
				this.selectedObject.renameLayer(this._position.y);
				actContextMenu = false;
				break;
		}
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return this._subMenu ? this._subMenu.clickIn(x, y) : false;

		var i = parseInt((y - this._position.y) / CONTEXT_MENU_LINE_HEIGHT);

		if(this._titles[i].hasOwnProperty("fields")){
			var pos = this._position.getClone().add(this._menuWidth, i * CONTEXT_MENU_LINE_HEIGHT);
			if(pos.x + this._menuWidth > canvas.width)
				pos.x -= this._menuWidth << 1;
			this._subMenu = new ContexMenuManager(pos,
												  objectToArray(this._titles[i]["fields"]), this);
		}
		else
			this._subMenu = false;

		this.doClickAct(this._titles[i].name);

		return true;

	};
}