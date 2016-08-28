class PaintManager{
	constructor(){
		this._brushes		= [];
		this._selectedImage	= null;
		this._selectedBrush	= null;
		this._action		= PAINT_ACTION_BRUSH;
		this._paintHistory	= [];
		this._undoHistory	= [];

		//this.paintEvents = [];
		//this.history = [];
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}


	/**
	 * Pridá nový bod na danú vrstvu
	 *
	 * @param position - súradnica nového body
	 * @param activeLayerName - názov vrstvy kde sa má bod pridať
	 */
	addPoint(position, activeLayerName = Layers.activeLayerName){
		if(isSharing())
			Sharer.paint.addPoint(position, activeLayerName);

		Scene.getLayer(activeLayerName).paint.addPoint(position);
	}


	/**
	 * Vyčistí vrstvu danú ako parameter alebo vyčistí aktualnu vrstvu
	 *
	 * @param activeLayerName - nazov vrstvy ktorá sa má vyčistiť
	 */
	cleanUp(activeLayerName = Layers.activeLayerName){
		if(isSharing())
			Sharer.paint.clean(activeLayerName);

		Scene.getLayer(activeLayerName).paint.cleanUp();
		Logger.log("Bol vyčistený objekt " + this.constructor.name, LOGGER_OBJECT_CLEANED);
	}


	/**
	 * Načíta všetky malby na základe vstupného objektu
	 *
	 * @param content - objekt obsahujúci všetky malby
	 */
	fromObject(content){
		each(content, (e, i) =>	Scene.getLayer(i).paint.fromObject(e));
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
	 * Preruší ťah štetcom
	 *
	 * @param activeLayerName - vrstva na ktorej sa má ťah prerušiť
	 */
	breakLine(activeLayerName = Layers.activeLayerName){
		if(isSharing())
			Sharer.paint.breakLine(activeLayerName);

		this._paintHistory.push(activeLayerName);

		Scene.getLayer(activeLayerName).paint.breakLine();

		Logger.log("bola ukončená čiara vo vrstve " + activeLayerName, LOGGER_PAINT_ACTION);
	}

	/**
	 * Pridá štetec do zoznamu možných štetcov
	 *
	 * @param title - názov súboru s štetcom
	 */
	addBrush(title){
		var img = new Image();
		img.src = "img/" + title;
		this._brushes[title] = img;

		if(isNull(this._selectedImage))
			this.selectedImage = title;
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
			if(data[i] == 0)
				continue;
			data[i - 3] = color[0];
			data[i - 2] = color[1];
			data[i - 1] = color[2];
		}
		ctx.putImageData(imgData, 0, 0);
		this._selectedBrush = c;
	}

	undo(){
		if(this._paintHistory.length === 0)
			return false;
		var layer = this._paintHistory.pop();
		Scene.getLayer(layer).paint.undo();
		this._undoHistory.push(layer);
		Logger.log("bolo zavolane undo na vrstvu " + layer, LOGGER_PAINT_HISTORY);
	}

	redo(){
		if(this._undoHistory.length === 0)
			return false;

		var layer = this._undoHistory.pop();
		Scene.getLayer(layer).paint.redo();
		this._paintHistory.push(layer);
		Logger.log("bolo zavolane redo na vrstvu " + layer, LOGGER_PAINT_HISTORY);
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
		Menu._redraw();
	}
}