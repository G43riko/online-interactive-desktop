/*
	compatible:  14.9.2016
*/
class EventManager{
	constructor(){
		this._history = [];
	}

	paintAddPoint(position, activeLayerName){//PaintManager.addPoint
		if(Project.connection){
			Project.connection.paint.addPoint(position, activeLayerName);
		}
	}
	paintAddPath(activeLayerName, path){//PaintManager.breakLine
		//if(Project.connection && path)
		//	Project.connection.paint.addPath(activeLayerName, path);
	}

	paintBreakLine(activeLayerName){//PaintManager.breakLine
		if(Project.connection){
			Project.connection.paint.breakLine(activeLayerName);
		}

		Logger.log("bola ukončená čiara vo vrstve " + activeLayerName, LOGGER_PAINT_ACTION);
	}

	paintCleanUp(activeLayerName){//PaintManager.cleanUp
		if(Project.connection){
			Project.connection.paint.clean(activeLayerName);
		}

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
		if(Project.connection){
			Project.connection.layer.create(title, type);
		}
		Logger.log("Vytvorila sa vrstva: " + title + "typu: " + type, LOGGER_LAYER_CHANGE);
	}

	layerDelete(title){//Scene
		if(Project.connection){
			Project.connection.layer.delete(title);
		}
		Logger.log("Vymazala sa vrstva: " + title, LOGGER_LAYER_CHANGE);
	}

	layerRaster(title){//Scene.makeRaster
		Logger.log("vrstva " + title + " bola rastrovaná", LOGGER_LAYER_RASTERED);
	}

	layerCleanUp(title){//Layer.cleanUp
		if(Project.connection){
			Project.connection.layer.clean(title);
		}
		Logger.log("Bola vyčistená vrstva: " + title, LOGGER_LAYER_CLEANED);
	}
	layerRename(oldTitle, newTitle){//Layer.rename
		if(Project.connection){
			Project.connection.layer.rename(oldTitle, newTitle);
		}
		Logger.log("Bola premenovaná vrstva: " + oldTitle + " na " + newTitle, LOGGER_LAYER_RENAMED);
	}

	creatorChange(key, val){//Creator.setOpt
		if(Project.connection){
			Project.connection.creatorChange(key, val);
		}

		Logger.log("Creatorovi sa nastavuje " + key + " na " + val, LOGGER_CREATOR_CHANGE);
	}

	objectAdded(resend, object){//Scene.addToScene
		if(resend && Project.connection){
			Project.connection.object.create(object);
		}
		Logger.log("Vytvára sa objekt ", LOGGER_OBJECT_CREATED);
	}

	objectChange(object, attribute){//Entity.setAttr
		if(Project.connection){
			Project.connection.object.change(object, attribute);
		}
	}

	objectDeleted(resend, object){//Scene.remove
		if(resend && Project.connection){
			Project.connection.object.delete(object);
		}
	}

	objectMove(object){//Utils.Movement.move

		if(Project.connection){
			Project.connection.object.move(object);
		}
	}

	sceneCleanUp(){//Scene.cleanUp

	}

	loadScene(){//Scene

	}

	keyDown(key){
		if(Project.connection){
			Project.connection.input.keyDown(key);
		}
		Logger.log("stlačené klavesa " + key, LOGGER_KEY_EVENT);
	}
	keyUp(key){
		if(Project.connection){
			Project.connection.input.keyUp(key);
		}
		Logger.log("pustená klavesa " + key, LOGGER_KEY_EVENT);
	}

	mouseMove(x, y){//Input._mouseMove
		if(isSharing()){
			Sharer.mouseChange(x, y);
		}
	}
	mouseDown(key, x, y){//Input._buttonDown
		Logger.log("stlačené tlačítko myši ::" + key + "::" + x + "::"+ y, LOGGER_MOUSE_EVENT);

		if(isSharing()){
			Sharer.mouseChange(key);
		}
	}
	mouseUp(key, x, y){//Input._buttonUp
		Logger.log("pustené tlačítko myši ::" + key + "::" + x + "::"+ y, LOGGER_MOUSE_EVENT);
		if(isSharing()){
			Sharer.mouseChange(key);
		}
	}
}