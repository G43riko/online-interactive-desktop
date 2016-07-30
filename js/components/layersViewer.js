const BUTTON_NEW_LAYER 		= 100;
const BUTTON_DELETE_LAYER 	= 101;
const BUTTON_HIDE_PANEL 	= 102;

class LayersViewer extends Entity{
	constructor(){
		super("LayerViewer", new GVector2f(1300, 100), new GVector2f(180, 500));
		Entity.changeAttr(this, {
			fillColor: "white",
			borderColor: "blue",
			borderWidth: 2
		});
		this._layerPanelHeight 	= 50;
		this._fontSize 			= 20;
		this._fontColor 		= "black";
		this._checkBoxSize 		= 30;
		this._checkYOffset 		= ((this._layerPanelHeight - this._checkBoxSize) >> 1);
		this._activeLayer		= "default";
		this._layers 			= {};
		this._offset			= 1;
		this._buttonSize 		= 40;


		var num = this._offset;
		each(Scene._layers, e => this.createLayer(num++, e), this);
	}

	createLayer(order, layer){
		this._layers[order] = {
			posY: this.position.y + order * this._layerPanelHeight,
			posX: this.position.x,
			layer: layer
		};
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		var i = this._getLayerOfYPos(y),
			offsetX = (this.size.x - this._buttonSize * 3) >> 2,
			offsetY = (this._layerPanelHeight - this._buttonSize) >> 1,
			j, xx, yy;

		if(isDefined(this._layers[i]))
			this._clickInLayer(i, x, y);
		else if(i == 0 && false)
			for(j=0 ; i<3 ; j++){
				xx = this.position.x + this._buttonSize * j + offsetX * (j + 1);
				yy = this.position.y + offsetY;
				if(x > xx && y > yy && x < xx + this._buttonSize && y < yy + this._buttonSize){
					this._buttonClick(j);
					break;
				}
			}
		return true;
	}

	_buttonClick(order){
		switch(order){
			case 0:
				var title = this._offset + Scene.layersNumber;
				Scene.createLayer(title);
				this.createLayer(title, Scene.getLayer(title));
				break;
			case 1:
				break;
			case 2:
				break;
			default:
				Logger.error("neznáme tlačítko v layerManagerovy");
		}
	}

	_clickInLayer(order, x, y){
		this._activeLayer = this._layers[order].layer.title;
	}

	_getLayerOfYPos(num){
		return parseInt((num - this.position.y) / this._layerPanelHeight);
	}

	clearLayer(num){
		this._layers[this._getLayerOfYPos(num)].layer.cleanUp();
	}

	renameLayer(num){
		var i 		= this._getLayerOfYPos(num),
			layer 	= this._layers[i].layer;
		getText(layer.title, this.position.x, this.position.y + i * this._layerPanelHeight, val => layer.title = val);
	}

	toggleVisibilityOfLayer(num){
		var i = this._getLayerOfYPos(num);
		this._layers[i].layer.visible = !this._layers[i].layer.visible;
	}

	_drawLayer(layer, order){
		var checkColor 	= layer._visible ? "green" : "red",
			posY 		= this.position.y + order * this._layerPanelHeight;

		doRect({
			position: [this.position.x, posY],
			size: [this.size.x, this._layerPanelHeight],
			radius: MENU_RADIUS,
			draw: true,
			borderColor: this._borderColor,
			borderWidth: this.borderWidth,
			fillColor: this._activeLayer == layer.title ? "gray" : "white"
		});

		fillText(layer.title, this.position.x, posY, this._fontSize, this._fontColor, [7, 5]);

		doRect({
			x: this.position.x + this.size.x - this._checkBoxSize - this._checkYOffset,
			y: posY + this._checkYOffset,
			size: this._checkBoxSize,
			radius: 3,
			fillColor: checkColor,
			borderColor: this.borderColor
		});
	}

	draw(){
		var num = this._offset;

		doRect({
			position: this.position,
			size: this.size,
			radius: MENU_RADIUS,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth
		});



		var offsetX = (this.size.x - this._buttonSize * 3) >> 2,
			offsetY = (this._layerPanelHeight - this._buttonSize) >> 1,
			offset = 5,
			inst = this,
			getLinesSur = function (i, x, y){
				var list = [
					[
						[(inst._buttonSize >> 1) + x, offset + y, (inst._buttonSize >> 1) + x, inst._buttonSize - offset + y],
						[offset + x, (inst._buttonSize >> 1) + y, inst._buttonSize - offset + x, (inst._buttonSize >> 1) + y]
					],
					[
						[(offset << 1) + x, (offset << 1) + y, inst._buttonSize - (offset << 1) + x, inst._buttonSize - (offset << 1) + y],
						[inst._buttonSize - (offset << 1) + x , (offset << 1)+ y, (offset << 1) + x, inst._buttonSize - (offset << 1) + y]
					],
					[offset + x, (inst._buttonSize >> 1) + y, inst._buttonSize - offset + x, (inst._buttonSize >> 1) + y]
				];
				return list[i];
			};

		for(var i=0 ; i<3 ; i++){
			var x = this.position.x + this._buttonSize * i + offsetX * (i + 1);
			var y = this.position.y + offsetY;
			doArc({
				x: x,
				y: y,
				width: this._buttonSize,
				height: this._buttonSize,
				draw:true,
				borderColor: this.borderColor,
				borderWidth: this.borderWidth
			});
			doLine({
				points: getLinesSur(i, x, y),
				borderColor: this.borderColor,
				borderWidth: this.borderWidth
			})
		}

		each(Scene._layers, e => this._drawLayer(e, num++), this);
	}

	get activeLayer(){
		return Scene.getLayer(this._activeLayer);
	}
}

class Button{
	constructor(parent, x, y, type, _buttonSize = 40){
		this.__buttonSize = _buttonSize;
		this._parent = parent;
		this._type = type;
		this._x = x;
		this._y = y;
	}
}