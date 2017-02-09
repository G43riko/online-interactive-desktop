/*
	compatible:	canvas 14.9.2016
*/
class PaintManager{
	constructor(){
		this._brushes			= [];
		this._selectedImage		= null;
		this._selectedImageName	= null;
		this._selectedBrush		= null;
		this._action			= PAINT_ACTION_LINE;
		this._paintHistory		= [];
		this._undoHistory		= [];

		//this.paintEvents = [];
		//this.history = [];
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	static getId(){
		if(!PaintManager._idCounter){
			PaintManager._idCounter = 1;
		}

		return PaintManager._idCounter++;
	}


	/**
	 * Pridá nový bod na danú vrstvu
	 *
	 * @param position - súradnica nového body
	 * @param activeLayerName - názov vrstvy kde sa má bod pridať
	 */
	addPoint(position, activeLayerName = Layers.activeLayerName){
		Events.paintAddPoint(position, activeLayerName);
		var layer = Scene.getLayer(activeLayerName);
		if(layer){
			layer.paint.addPoint(position);
		}
	}

	findPathsForRemove(position, radius, activeLayerName = Layers.activeLayerName){
		//TODO bud aktualna ale všetky vrstvy, podla Creator.allLayers
		Scene.getLayer(activeLayerName).paint.findPathsForRemove(position, radius);
	}

	removeSelectedPaths(activeLayerName = Layers.activeLayerName){
		//TODO bud aktualna ale všetky vrstvy, podla Creator.allLayers
		Scene.getLayer(activeLayerName).paint.removeSelectedPaths();
	}

	/**
	 * Vyčistí vrstvu danú ako parameter alebo vyčistí aktualnu vrstvu
	 *
	 * @param activeLayerName - nazov vrstvy ktorá sa má vyčistiť
	 */
	cleanUp(activeLayerName = Layers.activeLayerName){
		Events.paintCleanUp(activeLayerName);
		Scene.getLayer(activeLayerName).paint.cleanUp();
	}


	/**
	 * Načíta všetky malby na základe vstupného objektu
	 *
	 * @param content - objekt obsahujúci všetky malby
	 */
	fromObject(content){
		each(content, (e, i) =>	{
			var layer = Scene.getLayer(i);
			if(!layer){
				layer = Scene.createLayer(i);
			}
			layer.paint.fromObject(e);
		});
	}


	fromObjectToSingleLayer(title, content){
		var layer = Scene.getLayer(title);
		each(content, e => layer.paint.fromObject(e, true));
	}

	/**
	 * Uloží všetky malby do jedného objektu
	 *
	 * @returns {{}} - objekt obsahujúci všetky malby
	 */
	toObject(){
		var result = {};

		each(Scene.layers, e => result[e.title] = e.paint.toObject());
		return result;
	}

	/**
	 * Pridá novú čiaru
	 * @param layer
	 * @param path
	 */
	addPath(layer, path){
		Scene.getLayer(layer).paint.addLine(path);
	}

	/**
	 * Preruší ťah štetcom
	 *
	 * @param activeLayerName - vrstva na ktorej sa má ťah prerušiť
	 */
	breakLine(activeLayerName = Layers.activeLayerName){
		this._paintHistory[this._paintHistory.length] = activeLayerName;
		this._undoHistory = [];
		var newPath = Scene.getLayer(activeLayerName).paint.breakLine();
		Events.paintBreakLine(activeLayerName);
		//Events.paintAddPath(activeLayerName, newPath);

		this._setButtons();
	}

	/**
	 * Pridá štetec do zoznamu možných štetcov
	 *
	 * @param title - názov súboru s štetcom
	 */
	addBrush(title){
		var img = new Image();
		img.src = FOLDER_IMAGE + "/" + title;
		this._brushes[title] = img;

		if(isNull(this._selectedImage)){
			this.selectedImage = title;
		}

		Logger.log("pridal sa nový štetec: " + title, LOGGER_PAINT_ACTION);
	}

	/**
	 * Prefarbí aktualny štetec na základa farby a velkosti štetca pri zmene Creatora
	 *
	 * @param size - velkosť štetca
	 * @param col - farba štetca
	 */
	rePaintImage(size, col){
		var c = document.createElement('canvas'),
			ctx, imgData, data, color, i;
		c.width = size;
		c.height = size;
		ctx = c.getContext('2d');
		ctx.drawImage(this._selectedImage, 0, 0, size, size);
		imgData = ctx.getImageData(0, 0, size, size);
		data = imgData.data;
		color = col.replace("rgb(", "").replace("rgba(", "").replace(")", "").split(", ").map(a => parseInt(a));
		for(i=3 ; i<data.length ; i+=4){
			if(data[i] === 0){
				continue;
			}
			data[i - 3] = color[0];
			data[i - 2] = color[1];
			data[i - 1] = color[2];
		}
		ctx.putImageData(imgData, 0, 0);
		this._selectedBrush = c;

		Events.paintBrushChange(size, col, this._selectedImageName);
	}

	drawLine(ctx, pointA, pointB, brushSize, brushColor, action, brushType){
		if(action == PAINT_ACTION_LINE){
			ctx.lineCap 		= LINE_CAP_ROUND;
			ctx.lineWidth 		= brushSize;
			ctx.strokeStyle	= brushColor;
			ctx.beginPath();
			ctx.moveTo(pointA.x, pointA.y);
			ctx.lineTo(pointB.x, pointB.y);
			ctx.stroke();
		}
		else if(action == PAINT_ACTION_BRUSH){
			var dist 	= pointA.dist(pointB),
				angle 	= Math.atan2(pointA.x - pointB.x, pointA.y - pointB.y);

			Creator.setOpt("brushColor", brushColor);
			Creator.setOpt("brushSize", brushSize);
			Creator.setOpt("brushType", brushType);

			for (var i = 0; i < dist; i++){
				ctx.drawImage(Paints.selectedBrush,
					pointB.x + (Math.sin(angle) * i) - (brushSize >> 1),
					pointB.y + (Math.cos(angle) * i) - (brushSize >> 1),
					brushSize,
					brushSize);
			}
		}
	}

	undo(){
		if(this._paintHistory.length === 0){
			return false;
		}
		var layer = this._paintHistory.pop();

		Scene.getLayer(layer).paint.undo();
		this._undoHistory[this._undoHistory.length] = layer;

		Events.paintUndo(layer);
		console.log(this._paintHistory.length, this._undoHistory.length);
		this._setButtons();
		draw();
	}

	redo(){
		if(this._undoHistory.length === 0){
			return false;
		}

		var layer = this._undoHistory.pop();
		Scene.getLayer(layer).paint.redo();
		this._paintHistory[this._paintHistory.length] = layer;

		Events.paintRedo(layer);
		this._setButtons();
		draw();
	}

	_setButtons(){
		Menu.disabled("mainMenu", "undo", this._paintHistory.length === 0);
		Menu.disabled("mainMenu", "redo", this._undoHistory.length === 0);
	}

	//GETTERS

	get selectedImage(){return this._selectedImage;}
	get selectedBrush(){return this._selectedBrush;}

	get action(){return this._action;}


	getBrush(title){
		return this._brushes[title];
	}

	//SETTERS
	/**
	 * zmení aktualne zvolený typ štetca a prekreslí menú aby bol vybraný spravný štetec
	 *
	 * @param title
	 */
	set selectedImage(title){
		this._selectedImage = this._brushes[title];
		this._selectedImageName = title;
		Menu._redraw();
	}

	set action(val){this._action = val;}
}