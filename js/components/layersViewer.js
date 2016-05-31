class LayersViewer extends Entity{
	constructor(){
		super("LayerViewer", new GVector2f(1300, 100), new GVector2f(180, 500), "white");
		this._boderColor = "blue";
		this._boderWidth = 1;

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



		if(this._layers.hasOwnProperty(i))
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

		context.roundRect(this._position.x, posY, this._size.x, this._layerPanelHeight, MENU_RADIUS, false, true);
		fillText(layer.title, this._position.x, posY, this._fontSize, this._fontColor, [7, 5]);


		context.fillStyle = checkColor;
		context.roundRect(this._position.x + this._size.x - this._checkBoxSize - this._checkYOffset,
						  posY + this._checkYOffset,
						  this._checkBoxSize,
						  this._checkBoxSize,
						  3, 
						  true, true);		

	}

	draw(){
		context.save();
		context.fillStyle = this._fillColor;
		context.lineWidth = this._boderWidth;
		context.strokeStyle = this._boderColor;
		context.roundRect(this._position.x, this._position.y, this._size.x, this._size.y, MENU_RADIUS, true, true);

		var num = 2,
			inst = this;

		$.each(Scene._layers, function(i, e){
			inst._drawLayer(e, num++);
		});
		

		context.restore();
	}
}