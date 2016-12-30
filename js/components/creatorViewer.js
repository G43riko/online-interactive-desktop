/*
	compatible: forEach, canvas 14.9.2016
*/
class CreatorViewer extends Entity{
	constructor(position = new GVector2f(100, 100), size = new GVector2f(400, 40), data = {}){
		super("CreatorViewer", position, size, data);
		this._items 		= [];
		this._canvas		= document.createElement("canvas");
		this._context 		= this._canvas.getContext('2d');
		
		Entity.changeAttr(this,{
			fillColor: MENU_BACKGROUND_COLOR,
			borderColor: MENU_BORDER_COLOR,
			borderWidth: MENU_BORDER_WIDTH,
			radius: MENU_RADIUS
		});
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	init(){
		this.size.x = (MENU_WIDTH + MENU_OFFSET) * getLength(Creator.items) + MENU_OFFSET;
		this.size.y = MENU_HEIGHT + (MENU_OFFSET << 1);

		this._canvas.width 	= this._size.x;
		this._canvas.height	= MENU_HEIGHT << 4;
		this._context 		= this._canvas.getContext('2d');

		var counter = 0;
		var posY 	= 0;
		each(Creator.items, function(e, i, arr){
			posY = 0;
			arr[i]["offset"] = counter;

			doRect({
				//bgColor: e.image,
				x: counter,
				y: posY,
				width: MENU_WIDTH,
				height: MENU_HEIGHT,
				radius: this._radius,
				borderColor: this._borderColor,
				fillColor: this._fillColor,
				borderWidth: this._borderWidth,
				ctx: this._context
			});

			if(isDefined(e["values"])){
				//e["values"].forEach(function(ee, ii){
				each(e["values"], function(ee, ii){
					if(posY > 0)
						doRect({
							//bgColor: e.image,
							x: counter,
							y: posY,
							width: MENU_WIDTH,
							height: MENU_HEIGHT,
							radius: this._radius,
							borderColor: this._borderColor,
							fillColor: this._fillColor,
							borderWidth: this._borderWidth,
							ctx: this._context
						});

					if(ee == Creator[i])
						arr[i]["selectedIndex"] = ii;

					this._drawIcon(i, ee, counter, posY);
					posY += MENU_HEIGHT;
				}, this);
			}
			else if(e["type"] = "bool"){

			}
			else if(i == ATTRIBUTE_FONT_COLOR){
				fillText("Abc", counter + (MENU_WIDTH >> 1), posY + (MENU_HEIGHT >> 1), DEFAULT_FONT_SIZE, Creator.fontColor, 0, FONT_ALIGN_CENTER, this._context);
			}
			else{
				arr[i]["selectedIndex"] = 0;
				this._drawIcon(i, Creator[i], counter, posY);
			}
			counter += MENU_WIDTH;
		}, this);
		this.changeOperation();
		//window.open(this._canvas.toDataURL("image/png"), '_blank');
	}

	_drawIcon(key, value, posX, posY, width = MENU_WIDTH, height = MENU_HEIGHT,  offset = 5){
		switch(key){
			case ATTRIBUTE_LINE_WIDTH :
				doLine({
					points: [posX + offset, posY + (height >> 1), posX + width - offset, posY + (height >> 1)],
					borderWidth: value,
					borderColor: MENU_BORDER_COLOR,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_RADIUS :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: 5,
					borderColor: MENU_BORDER_COLOR,
					radius: value,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_FILL_COLOR :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: 5,
					borderColor: MENU_BORDER_COLOR,
					fillColor: Creator[ATTRIBUTE_FILL_COLOR],
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BRUSH_TYPE:
				if(value === "line")
					doArc({
						position: [posX + (offset << 1), posY + (offset << 1)],
						size: [width - (offset << 2), height - (offset << 2)],
						fillColor: MENU_BORDER_COLOR,
						ctx: this._context
					});
				else
					doRect({
						position: [posX, posY ],
						size: [width, height],
						bgImage: Paints.getBrush(value),
						ctx: this._context
					});
				break;
			case ATTRIBUTE_BRUSH_COLOR :
				doArc({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					fillColor: Creator[ATTRIBUTE_BRUSH_COLOR],
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BRUSH_SIZE :
				doArc({
					position: [posX + (width >> 1), posY + (height >> 1)],
					size: [value , value ],
					center: true,
					fillColor: MENU_BORDER_COLOR,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BORDER_COLOR :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: 5,
					borderColor: Creator[ATTRIBUTE_BORDER_COLOR],
					ctx: this._context
				});
				break;
			case ATTRIBUTE_BORDER_WIDTH :
				doRect({
					position: [posX + (offset << 1), posY + (offset << 1)],
					size: [width - (offset << 2), height - (offset << 2)],
					borderWidth: value,
					borderColor: MENU_BORDER_COLOR,
					ctx: this._context
				});
				break;
			case ATTRIBUTE_FONT_SIZE :
				fillText("Abc", posX + (width >> 1), posY + (height >> 1), value, MENU_BACKGROUND_COLOR, 0, FONT_ALIGN_CENTER, this._context);
				break;
			default :
				fillText(key, posX + (width >> 1), posY + (height >> 1), 7, MENU_FONT_COLOR, 0, FONT_ALIGN_CENTER, this._context);
		}
	}

	clickIn(x, y){//TODO skúsiť prerobiť do čitatelnejšej formy
		if(y < this.position.y || x < this.position.x || x > this.position.x + this.size.x)
			return false;
		var counter =  this.position.x + MENU_OFFSET,
			click 	= false,
			num;
		//this._items.forEach(function(e, i, arr){
		each(this._items, function(e, i, arr){
			if(!click && x > counter && x < counter + MENU_WIDTH){
				if(y < this.position.y + MENU_OFFSET + MENU_HEIGHT){
					if(e["item"]["type"] == "color")
						pickUpColor(color => Creator.setOpt(e["key"], color));
					else
						arr[i]["itemsSelected"] = !e["itemsSelected"];
					click = true;
				}
				else if(e["itemsSelected"]){
					num = this.position.y + MENU_OFFSET;
					if(isDefined(e["item"]["values"]))
						//e["item"]["values"].forEach(function(ee, ii){
						each(e["item"]["values"], function(ee, ii){
							num += MENU_HEIGHT + MENU_OFFSET;
							if(!click && y > num && y < num + MENU_HEIGHT){
								Creator.setOpt(e["key"], ee);
								arr[i]["item"]["selectedIndex"] = ii;
								click = true;
								arr[i]["itemsSelected"] = !arr[i]["itemsSelected"];
							}
						});
				}
			}
			else if(e["itemsSelected"])
				arr[i]["itemsSelected"] = false;

			counter += MENU_OFFSET + MENU_WIDTH;
		}, this);
		return click;
	}

	static allowedOption(operation, allowed){
		switch(operation){
			case 1000:
				return isIn(OBJECT_RECT, allowed);
			case 1001:
				return isIn(OBJECT_ARC, allowed);
			case 1002:
				return isIn(OBJECT_PAINT, allowed);
			case 1003:
				return isIn(OBJECT_LINE, allowed);
			case 1004:
				return isIn(OBJECT_JOIN, allowed);
			case 1006:
				return isIn(OBJECT_RUBBER, allowed);
		}
		return false;
	}

	changeOperation(){
		this._items = [];
		each(Creator.items, function(e, i){
			if(!CreatorViewer.allowedOption(Creator.operation, e["allowedFor"]))
				return;

			this._items.push({
				item: e,
				key: i,
				itemsSelected: false
			});

		}, this);
	}

	draw(){
		var counter = MENU_OFFSET;
		//this._items.forEach(function(e){
		each(this._items, function(e){
			doRect({
				bgImage: {
					x: e["item"]["offset"],
					y: e["item"]["selectedIndex"] * MENU_HEIGHT,
					w: MENU_WIDTH,
					h: MENU_HEIGHT,
					img: this._canvas
				},
				x: this.position.x + counter,
				y: this.position.y + MENU_OFFSET,
				width: MENU_WIDTH,
				height: MENU_HEIGHT,
				radius: this._radius,
				borderColor: this._borderColor,
				borderWidth: this._borderWidth
			});

			fillText(e["key"], this.position.x + counter + (MENU_WIDTH >> 1), this.position.y + MENU_OFFSET + (MENU_HEIGHT >> 1), 7, MENU_FONT_COLOR, 0, FONT_ALIGN_CENTER);

			if(e["itemsSelected"] && isDefined(e["item"]["values"])){
				var num = this.position.y + MENU_OFFSET;
				//e["item"]["values"].forEach(function(ee, ii){
				each(e["item"]["values"], function(ee, ii){
					num += MENU_OFFSET + MENU_WIDTH;
					doRect({
						bgImage: {
							x: e["item"]["offset"],
							y: ii * MENU_HEIGHT,
							w: MENU_WIDTH,
							h: MENU_HEIGHT,
							img: this._canvas
						},
						x: this.position.x + counter,
						y: num,
						width: MENU_WIDTH,
						height: MENU_HEIGHT,
						radius: this._radius,
						borderColor: this._borderColor,
						borderWidth: this._borderWidth
					});
				},this);
			}


			counter += MENU_WIDTH + MENU_OFFSET;
		}, this);
	}
}