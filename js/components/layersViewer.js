class LayersViewer extends Entity{
	constructor(){
		super("LayerViewer", new GVector2f(1300, 100), new GVector2f(180, 500), "white");
		this._borderColor		= "blue";
		this._borderWidth		= 1;
		this._layerPanelHeight 	= 50;
		this._fontSize 			= 20;
		this._fontColor 		= "black";
		this._checkBoxSize 		= 30;
		this._checkYOffset 		= ((this._layerPanelHeight - this._checkBoxSize) >> 1);

		this._layers = {};

		var num = 2,
			inst = this;

		$.each(Scene._layers, (i, e) => inst.createLayer(num++, e));
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

		var i = this._getLayerOfYPos(y);

		if(typeof this._layers[i] !== "undefined")
			this._clickInLayer(i, x, y);

		return true;
	}

	_clickInLayer(order, x, y){
		/*
		if(x > this._position.x + this._size.x - this._checkBoxSize - this._checkYOffset &&
		   y > this._layers[order].posY + this._checkYOffset &&
		   y < this._layers[order].posY + this._checkYOffset + this._checkBoxSize &&
		   x < this._position.x + this._size.x - this._checkBoxSize - this._checkYOffset + this._checkBoxSize)
			this._layers[order].layer._visible = !this._layers[order].layer._visible;

		*/
	}

	_getLayerOfYPos(num){
		return parseInt((num - this.position.y) / this._layerPanelHeight);
	}

	clearLayer(num){
		var i = this._getLayerOfYPos(num);
		this._layers[i].layer.cleanUp();
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
			borderColor: this._borderColor
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
		var num = 2,
			inst = this;

		doRect({
			position: this.position,
			size: this.size,
			radius: MENU_RADIUS,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth
		});

		$.each(Scene._layers, (i, e) => inst._drawLayer(e, num++));
	}
}