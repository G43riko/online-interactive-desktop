class LayersViewer extends Entity{
	constructor(){
		super("LayerViewer", new GVector2f(1300, 100), new GVector2f(180, 500), "white");
		this._borderColor = "blue";
		this._borderWidth = 1;

		this._layerPanelHeight = 50;
		this._fontSize = 20;
		this._fontColor = "black";
		this._checkBoxSize = 30;
		this._checkYOffset = ((this._layerPanelHeight - this._checkBoxSize) >> 1);

		this._layers = {};

		var num = 2,
			inst = this;

		$.each(Scene._layers, function(i, e){
			inst.createLayer(num++, e)
		});
	}

	createLayer(order, layer){
		this._layers[order] = {
			posY: this._position.y + order * this._layerPanelHeight,
			posX: this._position.x,
			layer: layer
		};
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y))
			return false;

		var i = parseInt((y - this._position.y) / this._layerPanelHeight);

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

	clearLayer(num){
		var i = parseInt((num - this._position.y) / this._layerPanelHeight);
		this._layers[i].layer.cleanUp();
	}

	renameLayer(num){
		var i = parseInt((num - this._position.y) / this._layerPanelHeight),
			layer = this._layers[i].layer;
		getText(layer.title, this._position.x, this._position.y + i *  this._layerPanelHeight, function(val){
			layer.title = val;
		})
	}

	toggleVisibilityOfLayer(num){
		var i = parseInt((num - this._position.y) / this._layerPanelHeight);
		this._layers[i].layer.visible = !this._layers[i].layer.visible;
	}

	_drawLayer(layer, order){
		var checkColor = layer._visible ? "green" : "red",
			posY = this._position.y + order * this._layerPanelHeight;

		doRect({
			x: this._position.x,
			y: posY,
			width: this._size.x,
			height: this._layerPanelHeight,
			radius: MENU_RADIUS,
			draw: true,
			borderColor: this._borderColor
		});

		fillText(layer.title, this._position.x, posY, this._fontSize, this._fontColor, [7, 5]);


		doRect({
			x: this._position.x + this._size.x - this._checkBoxSize - this._checkYOffset,
			y: posY + this._checkYOffset,
			width: this._checkBoxSize,
			height: this._checkBoxSize,
			radius: 3,
			fillColor: checkColor,
			borderColor: this._borderColor
		});


	}

	draw(){
		context.save();

		doRect({
			position: this._position,
			size: this._size,
			radius: MENU_RADIUS,
			fillColor: this._fillColor,
			borderColor: this._borderColor,
			borderWidth: this._borderWidth
		});


		var num = 2,
			inst = this;

		$.each(Scene._layers, function(i, e){
			inst._drawLayer(e, num++);
		});
		

		context.restore();
	}
}