/*
	compatible:	forEach 14.9.2016
*/
class ObjectsManager{
	constructor(){
		this._movedObject = false;
		this._objects = [];
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}

	get firstObject(){
		return this._objects[0];
	}

	size(){
		return this._objects.length;
	}

	get movedObject(){
		return this._movedObject;
	}

	set movedObject(val){
		this._movedObject = val;
	}

	onMouseMove(pos, movX, movY){
		selectedObjects.forEach(e => Movement.move(e, movX, movY));

		//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
		if(!this._movedObject.selected){
			Movement.move(this._movedObject, movX, movY);
		}

		//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného
		if(selectedObjects.size()){
			updateSelectedObjectView(selectedObjects.getLast());
		}
		else if(this._movedObject){
			updateSelectedObjectView(this._movedObject);
		}
	}

	deleteAll(){
		each(this._objects, Scene.remove);
	}

	selectAll(){
		Scene.forEach(this.add);
	}

	add(o){
		if((isDefined(o.locked) && o.locked) || !o || this._objects.indexOf(o) >= 0){
			return;
		}
		this._objects[this._objects.length] = o;

		o.selected = true;

		updateSelectedObjectView(o);
	}

	get(i){
		return this._objects.hasOwnProperty(i) ? this._objects[i] : false;
	}

	getLast(){
		return this._objects[this.size() - 1];
	}

	clear(){
		//this._objects.forEach(function(e){
		each(this._objects, e => {
			if(isDefined(e.moveType)){
				e.moveType = -1;
			}
			e.selected = false;
		});
		this._objects = [];
	}

	clearAndAdd(o){
		this.clear();
		this.add(o);
	}

	forEach(e){
		each(this._objects, e);
	}
}