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

		this._minimalized		= false;
		this._layerPanelHeight 	= 50;
		this._fontSize 			= 20;
		this._fontColor 		= "black";
		this._checkBoxSize 		= 30;
		this._checkYOffset 		= ((this._layerPanelHeight - this._checkBoxSize) >> 1);
		this._activeLayer		= "default";
		this._layers 			= {};
		this._offset			= 1;
		this._buttonSize 		= 40;
		this._layersCount 		= 0;

		each(Scene._layers, e => this.createLayer(e), this);
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	_toggleMinimalize(){
		this._minimalized = !this._minimalized;
	}

	/**
	 * vytvorý novú vrstvu v LayerVieweri a v scéne
	 *
	 * @param title - názov vrstvy
	 */
	createLayer(layer){
		var order = this._offset + this._layersCount++;
		this._layers[layer.title] = {
			posY: this._layerPanelHeight * order,
			offset : order,
			posX: this.position.x,
			layer: layer
		};
	}

	clickIn(x, y){
		if(!this.clickInBoundingBox(x, y) || !Input.isButtonDown(LEFT_BUTTON))
			return false;
		var i = this._getLayerOfYPos(y),
			offsetX = (this.size.x - this._buttonSize * 3) >> 2,
			offsetY = (this._layerPanelHeight - this._buttonSize) >> 1,
			j, xx, yy;

		if(i !== 0 && this._minimalized)
			return false;

		if(i == 0){
			for(j=0 ; j<3 ; j++){
				xx = this.position.x + this._buttonSize * j + offsetX * (j + 1);
				yy = this.position.y + offsetY;
				if(x > xx && y > yy && x < xx + this._buttonSize && y < yy + this._buttonSize){
					this._buttonClick(j);
					break;
				}
			}
		}
		else 
			each(this._layers, function(e){
				if(e.offset === i)
					this._activeLayer = e.layer.title;
			}, this);
		return true;
	}


	/**
	 * Vymaže vrstvu s LayerViewera a zo scény
	 *
	 * @param title - názov vrstvy ktorá sa má vymazař
	 */
	deleteLayer(title){
		each(this._layers, function(e){
			if(e.offset > this._layers[title].offset){
				e.offset--;
				e.posY -= this._layerPanelHeight;
			}

			if(e.offset === this._layers[title].offset)
				this._activeLayer = e.layer.title;
		}, this);

		this._layersCount--;

		/*
		 * Ak sa maže posledná vrstva nastaví sa ako aktualna defaultná vrstva
		 */
		if(this._activeLayer === title)
			this._activeLayer = "default";

		delete this._layers[title];
	}

	/**
	 * Vykoná operácie po kliknutí na tlačítko
	 *
	 * @param order - poradie tlačítka na ktorá bolo kliknuté
	 * @private
	 */
	_buttonClick(order){
		switch(order){
			case 0://create layer
				this._minimalized || Scene.createLayer("layer" + (this._offset + this._layersCount));
				break;
			case 1://remove layer
				this._minimalized || Scene.deleteLayer(this._activeLayer);
				break;
			case 2:
				this._toggleMinimalize();
				break;
			default:
				Logger.error("neznáme tlačítko v layerManagerovy");
		}
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

		each(this._layers, function(e){
			if(e.offset === i)
				e.layer.visible = !e.layer.visible;
		}, this);
		//this._layers[i].layer.visible = !this._layers[i].layer.visible;
	}

	_drawLayer(layer){
		var checkColor 	= layer.layer._visible ? "green" : "red",
			//posY 		= this.position.y + order * this._layerPanelHeight;
			posY 		= this.position.y + layer.posY;
		doRect({
			position: [this.position.x, posY],
			size: [this.size.x, this._layerPanelHeight],
			radius: MENU_RADIUS,
			draw: true,
			borderColor: this._borderColor,
			borderWidth: this.borderWidth,
			fillColor: this._activeLayer == layer.layer.title ? "gray" : "white"
		});

		fillText(layer.layer.title, this.position.x, posY, this._fontSize, this._fontColor, [7, 5]);

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
		doRect({
			position: this.position,
			width: this.size.x,
			height: this._minimalized ? this._layerPanelHeight : this.size.y,
			//size: this.size,
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
		if(!this._minimalized)
			each(this._layers, e => this._drawLayer(e), this);
	}
	get activeLayerName(){
		return this._activeLayer;
	}
	get activeLayer(){
		return Scene.getLayer(this.activeLayerName);
	}
}