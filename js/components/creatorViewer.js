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
			fillColor: MENU_FILL_COLOR,
			borderColor: MENU_BORDER_COLOR,
			borderWidth: MENU_BORDER_WIDTH,
			radius: MENU_RADIUS
		});
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}
	init(){
		let counter = 0,
			posY 	= 0;
		this.size.x = (MENU_WIDTH + MENU_OFFSET) * getLength(Creator.items) + MENU_OFFSET;
		this.size.y = MENU_HEIGHT + (MENU_OFFSET << 1);

		this._canvas.width 	= this._size.x;
		this._canvas.height	= MENU_HEIGHT << 4;
		this._context 		= this._canvas.getContext('2d');

		each(Creator.items, function(e, i, arr){
			posY = 0;
			arr[i].offset = counter;

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

			if(isDefined(e.values)){
				//e.values.forEach(function(ee, ii){
				each(e.values, function(ee, ii){
					if(posY > 0){
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
					}
					if(ee == Creator[i]){
						arr[i].selectedIndex = ii;
					}

					this._drawIcon(i, ee, counter, posY);
					posY += MENU_HEIGHT;
				}, this);
			}
			else if(e.type === "bool"){
				arr[i].selectedIndex = 0;
				this._drawIcon(i, e.value, counter, posY);
			}
			else if(i == ATTRIBUTE_FONT_COLOR){
				fillText("Abc", 
						 counter + (MENU_WIDTH >> 1), 
						 posY + (MENU_HEIGHT >> 1), 
						 DEFAULT_FONT_SIZE, 
						 Creator.fontColor, 
						 0, 
						 FONT_ALIGN_CENTER, 
						 this._context);
			}
			else{
				arr[i].selectedIndex = 0;
				this._drawIcon(i, Creator[i], counter, posY);
			}
			counter += MENU_WIDTH;
		}, this);
		this.changeOperation();
		//window.open(this._canvas.toDataURL("image/png"), '_blank');
	}

	_drawBool(value, posX, posY, width, height, offset){
        let center = posY + height >> 1;

		if(value){
			doLine({
				points:[new GVector2f(posX + offset, center),
						new GVector2f(posX + offset + width / 4, center + offset * 3),
						new GVector2f(posX + width - offset, center - offset * 2)],
				borderWidth: MENU_BORDER_WIDTH << 2,
				borderColor: CHECKBOX_COLOR_TRUE,
				ctx: this._context
			});
		}
		else{
			doLine({
				points:[[new GVector2f(posX + offset, posY + offset),
						 new GVector2f(posX + width - offset, posY + height - offset)],
						[new GVector2f(posX + offset, posY + height - offset),
						 new GVector2f(posX + width - offset, posY + offset)]],
				borderWidth: MENU_BORDER_WIDTH << 2,
				borderColor: CHECKBOX_COLOR_FALSE,
				ctx: this._context
			});
		}
	}

	_drawIcon(key, value, posX, posY, width = MENU_WIDTH, height = MENU_HEIGHT,  offset = 5){
		switch(key){
			case "allLayers" :
				this._drawBool(value, posX, posY, width, height, offset);
				break;
			case "controll" :
				this._drawBool(value, posX, posY, width, height, offset);
				break;
			case ATTRIBUTE_LINE_WIDTH :
				doLine({
					points: [posX + offset, 
							 posY + (height >> 1), 
							 posX + width - offset, 
							 posY + (height >> 1)],
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
				if(value === "line"){
					doArc({
						position: [posX + (offset << 1), posY + (offset << 1)],
						size: [width - (offset << 2), height - (offset << 2)],
						fillColor: MENU_BORDER_COLOR,
						ctx: this._context
					});
				}
				else if(value === "fur"){
                    let points = [];
                    let centerX = posX + width / 2;
                    let centerY = posY + height / 2;
                    let sizeX = (width - offset * 2);
                    let sizeY = (height - offset * 2);
					for(let i=0 ; i<100 ; i++){
                        let valX = sizeX * (Math.random() - 0.5);
                        let valY = sizeY * (Math.random() - 0.5);
						points[points.length] = [centerX + valX, 
												 centerY + valY, 
												 centerX - valX, 
												 centerY - valY];
					}
					doLine({
						points: points,
						borderWidth: 1,
						borderColor: MENU_BORDER_COLOR,
						ctx: this._context
					});
				}
				else{
					doRect({
						position: [posX, posY ],
						size: [width, height],
						bgImage: Paints.getBrush(value),
						ctx: this._context
					});
				}
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
				fillText("Abc", 
						 posX + (width >> 1), 
						 posY + (height >> 1), 
						 value, 
						 MENU_FILL_COLOR, 
						 0, 
						 FONT_ALIGN_CENTER, 
						 this._context);
				break;
			default :
				fillText(key, 
						 posX + (width >> 1), 
						 posY + (height >> 1), 
						 7, 
						 MENU_FONT_COLOR, 
						 0, 
						 FONT_ALIGN_CENTER, 
						 this._context);
		}
	}

	_clickOn(x, y){
		if(y < this.position.y || x < this.position.x || x > this.position.x + this.size.x){
			return false;
		}
        let counter =  this.position.x + MENU_OFFSET,
			click 	= null,
			num;
		each(this._items, function(e, i, arr){
			if(!click && x > counter && x < counter + MENU_WIDTH){
				if(y < this.position.y + MENU_OFFSET + MENU_HEIGHT){
					click = e;
				}
				else if(e.itemsSelected){
					num = this.position.y + MENU_OFFSET;
					if(isDefined(e.item.values)){
						each(e.item.values, function(ee, ii){
							num += MENU_HEIGHT + MENU_OFFSET;
							if(!click && y > num && y < num + MENU_HEIGHT){
								click = e;
								e.item.selectedIndex = ii;
							}
						});
					}
				}
			}
			else if(e.itemsSelected){
				arr[i].itemsSelected = false;
			}

			counter += MENU_OFFSET + MENU_WIDTH;
		}, this);
		return click;
	}

	clickIn(x, y, doAct = true){//TODO skúsiť prerobiť do čitatelnejšej formy
        let inst = this,
			e = this._clickOn(x, y);
		if(!e){
			return false;
		}
		if(!doAct && e){
			return true;
		}
		if(isDefined(e.item.values)){
			Creator.setOpt(e.key, e.item.values[e.item.selectedIndex]);
			e.itemsSelected = !e.itemsSelected;
		}
		else if(e.item.type == "color"){
			pickUpColor(color => Creator.setOpt(e.key, color));
		}
		else if(e.item.type == "bool"){
			e.item.value = !e.item.value;
			if(e.key === "controll"){
				Creator._controllPress = e.item.value;
			}
			if(e.key === "allLayers"){
				Creator._allLayers = e.item.value;
			}
			inst.init();
			draw();
		}
		return true;
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
			case 1007:
				return isIn(OBJECT_AREA, allowed);
		}
		return false;
	}

	changeOperation(){
		this._items = [];
		each(Creator.items, function(e, i){
			if(!CreatorViewer.allowedOption(Creator.operation, e.allowedFor)){
				return;
			}
			this._items[this._items.length] = {
				item: e,
				key: i,
				itemsSelected: false
			};

		}, this);
	}

	draw(){
        let counter = MENU_OFFSET;
		//this._items.forEach(function(e){
		each(this._items, function(e){
			doRect({
				bgImage: {
					x: e.item.offset,
					y: e.item.selectedIndex * MENU_HEIGHT,
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

			fillText(e.key, 
					 this.position.x + counter + (MENU_WIDTH >> 1), 
					 this.position.y + MENU_OFFSET + (MENU_HEIGHT >> 1), 
					 7, 
					 MENU_FONT_COLOR, 
					 0, 
					 FONT_ALIGN_CENTER);

			if(e.itemsSelected && isDefined(e.item.values)){
                let num = this.position.y + MENU_OFFSET;
				//e.item.values.forEach(function(ee, ii){
				each(e.item.values, function(ee, ii){
					num += MENU_OFFSET + MENU_WIDTH;
					doRect({
						bgImage: {
							x: e.item.offset,
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