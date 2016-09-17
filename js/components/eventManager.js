/*
	compatible:  14.9.2016
*/
class EventManager{
	constructor(){
		this._history = [];

	}

	paintAddPoint(position, activeLayerName){//PaintManager.addPoint
		if(isSharing())
			Sharer.paint.addPoint(position, activeLayerName);
	}

	paintBreakLine(activeLayerName){//PaintManager.breakLine
		if(isSharing())
			Sharer.paint.breakLine(activeLayerName);
		Logger.log("bola ukončená čiara vo vrstve " + activeLayerName, LOGGER_PAINT_ACTION);
	}

	paintCleanUp(activeLayerName){//PaintManager.cleanUp
		if(isSharing())
			Sharer.paint.clean(activeLayerName);
		Logger.log("Bol vyčistený objekt " + this.constructor.name, LOGGER_OBJECT_CLEANED);
	}

	paintBrushChange(size, color, imageTitle){//PaintManager
		Logger.log("Bol prekreslený štetec " + size + ", " + color + ", " + imageTitle, LOGGER_PAINT_HISTORY);

	}

	paintUndo(layer){//PaintManager
		Logger.log("bolo zavolane undo na vrstvu " + layer, LOGGER_PAINT_HISTORY);
	}

	paintRedo(layer){//PaintManager
		Logger.log("bolo zavolane redo na vrstvu " + layer, LOGGER_PAINT_HISTORY);
	}

	layerCreate(title, type){//Scene.createLayer
		Logger.log("Vytvorila sa vrstva " + title + "typu: " + type, LOGGER_LAYER_CHANGE);
	}

	layerDelete(title){//Scene
		Logger.log("Vymazala sa vrstva " + title, LOGGER_LAYER_CHANGE);
	}

	creatorChange(key, val){//Creator.setOpt
		if(isSharing())
			Sharer.changeCreator(key, val);
		Logger.log("Creatorovi sa nastavuje " + key + " na " + val, LOGGER_CREATOR_CHANGE);
	}

	objectAdded(resend, object){//Scene.addToScene
		if(resend && isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_CREATE);
	}

	objectChange(object, attribute){//Entity.setAttr
		if(isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_CHANGE, [attribute]);
	}

	objectDeleted(resend, object){//Scene.remove
		if(resend && isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_DELETE);
	}

	objectMove(object){//Utils.Movement.move
		if(isSharing())
			Sharer.objectChange(object, ACTION_OBJECT_MOVE);
	}

	sceneCleanUp(){//Scene.cleanUp

	}

	loadScene(){//Scene

	}
}