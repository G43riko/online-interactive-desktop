/*
	compatible: 14.9.2016
*/

const BUTTON_NEW_LAYER 		= 100;
const BUTTON_DELETE_LAYER 	= 101;
const BUTTON_HIDE_PANEL 	= 102;

class LayersViewer extends Entity{
	constructor(position, size){
		size = size ||  new GVector2f(LAYERS_PANEL_WIDTH, window.innerHeight - (LAYERS_PANEL_OFFSET << 1));
		position = position || new GVector2f(window.innerWidth - size.x - LAYERS_PANEL_OFFSET, LAYERS_PANEL_OFFSET);

		super("LayerViewer", position, size);
		Entity.changeAttr(this, {
			fillColor: MENU_BACKGROUND_COLOR,
			borderColor: MENU_BORDER_COLOR,
			borderWidth: 2,
			visible: Components.layers()
		});

		this._buttonFillColor 	= MENU_DISABLED_BG_COLOR;
		this._activeLayerColor  = MENU_DISABLED_BG_COLOR;
		this._minimalized		= false;
		this._layerPanelHeight 	= LAYERS_LINE_HEIGHT;
		this._fontSize 			= LAYERS_FONT_SIZE;
		this._fontColor 		= MENU_FONT_COLOR;
		this._checkBoxSize 		= LAYERS_CHECKBOX_SIZE;
		this._checkYOffset 		= ((this._layerPanelHeight - this._checkBoxSize) >> 1);
		this._activeLayer		= DEFAULT_LAYER_TITLE;
		this._layers 			= {};
		this._offset			= 1;
		this._buttonSize 		= LAYERS_BUTTON_SIZE;
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
	 * @param layer - novovytvorená vrstva
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

	/**
	 * Funkia upraví pozíciu a veľkosť viewera pri zmene rozlíšenia
	 */
	onScreenResize(){
		/*
		if(this._size.x > window.innerWidth)
			this._size.x = window.innerWidth;
		if(this._size.y > window.innerHeight)
			this._size.y = window.innerHeight;
		*/

		if(this._position.x < 0)
			this._position.x = 0;
		else if(this._position.x + this._size.x > window.innerWidth)
			this._position.x = window.innerWidth - this._size.x;

		if(this._position.y < 0)
			this._position.y = 0;
		else if(this._position.y + this._size.y > window.innerHeight)
			this._position.y = window.innerHeight - this._size.y;
	}

	_clickIn(x, y){
		if(!Input.isButtonDown(LEFT_BUTTON))
			return false;
		var i = this._getLayerOfYPos(y);

		if(i !== 0 && this._minimalized)
			return false;

		if(i == 0){
			this._buttonClick(this._getButtonNumber(x, y));
		}
		else 
			each(this._layers, function(e){
				if(e.offset === i)
					this._activeLayer = e.layer.title;
			}, this);
		return true;
	}

	/**
	 * Vráti poradie klinuteho tlačítka(počíta od 0) alebo vráti -1
	 *
	 * @param x
	 * @param y
	 * @returns {number}
	 * @private
	 */
	_getButtonNumber(x, y){
		var offsetX = (this.size.x - this._buttonSize * 3) >> 2,
			offsetY = (this._layerPanelHeight - this._buttonSize) >> 1,
			xx, yy;
		for(var j=0 ; j<3 ; j++){
			xx = this.position.x + this._buttonSize * j + offsetX * (j + 1);
			yy = this.position.y + offsetY;
			if(x > xx && y > yy && x < xx + this._buttonSize && y < yy + this._buttonSize){
				return j;
			}
		}
		return -1;
	}

	_hover(x, y){
		var i = this._getLayerOfYPos(y);
		if(i !== 0 && this._minimalized)
			return false;

		if(i == 0){
			var button = this._getButtonNumber(x, y);
			if(isIn(button, 0, 1, 2))
				setCursor(CURSOR_POINTER);
		}
		else{
			//TODO kontrola tlačítiek
		}
		//setCursor(CURSOR_DEFAULT);
		return false;
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
			this._activeLayer = DEFAULT_LAYER_TITLE;

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

	_doOnLayerByY(num, func){
		var i = this._getLayerOfYPos(num);
		each(this._layers, function(e){
			if(e.offset === i)
				func(e);
		}, this);
	}

	animateLayer(num){
		this._doOnLayerByY(num, e => e.layer.paint.animate());
	}

	clearPaint(num){
		this._doOnLayerByY(num, e => e.layer.paint.cleanUp());
	}

	clearLayer(num){
		this._doOnLayerByY(num, e => e.layer.cleanUp());
	}

	renameLayer(num){
		this._doOnLayerByY(num, e => e.layer.rename());
	}

	toggleVisibilityOfPaint(num){
		this._doOnLayerByY(num, e => e.layer.drawPaint = !e.layer.drawPaint);
	}

	toggleVisibilityOfLayer(num){
		this._doOnLayerByY(num, e => e.layer.visible = !e.layer.visible);
	}

	_drawLayer(layer){
		var checkColor 	= layer.layer._visible ? CHECKBOX_COLOR_TRUE : CHECKBOX_COLOR_FALSE,
			//posY 		= this.position.y + order * this._layerPanelHeight;
			posY 		= this.position.y + layer.posY;
		doRect({
			position: [this.position.x, posY],
			size: [this.size.x, this._layerPanelHeight],
			radius: MENU_RADIUS,
			draw: true,
			borderColor: this._borderColor,
			borderWidth: this.borderWidth,
			fill: this._activeLayer == layer.layer.title,
			fillColor: this._activeLayerColor
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

	_draw(){
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
				borderWidth: this.borderWidth,
				fillColor: this._buttonFillColor
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