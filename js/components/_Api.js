
class Api{
	constructor(scene){
		Api._objects = [OBJECT_ARC, OBJECT_ARROW, OBJECT_CLASS, OBJECT_IMAGE, OBJECT_JOIN, OBJECT_LINE, OBJECT_PAINT, OBJECT_POLYGON, OBJECT_RECT, OBJECT_TABLE, OBJECT_INPUT, OBJECT_TEXT, OBJECT_GRAPH, OBJECT_RUBBER, OBJECT_AREA];
		this._scene = scene;
	};

	_parseGVector2f(object){
		if(!isObject(object)){
			return null;
		}

		let x = object.x || object._x;
        let y = object.y || object._y;
		if(isNumber(x) && isNumber(y)){
			return new GVector2f(x, y);
		}
		return null;
	}

	_getError(msg){
		return msg;
	}

	createObject(params){
		/********************************************************
		//SPOLOCNE KONTROLY
		********************************************************/
		if(!isObject(params)){
			return this.getError("Argument musí byť objekt");
		}
		if(isUndefined(params.type)){
			return this.getError("parameter type musí byť zadaný");
		}
		if(!isIn(params.type, Api._objects)){
			return this.getError(params.type + " je neznámy typ objektu");
		}

		if(isUndefined(params.position)){
			return this.getError("parameter position musí byť zadaný");
		}
		if(isUndefined(params.size)){
			return this.getError("parameter size musí byť zadaný");
		}

        let position = this._parseGVector2f(params.position);
		if(!position){
			return this.getError("parameter position musí byť valídny Vector2f");
		}

        let size = this._parseGVector2f(params.size);
		if(!size){
			return this.getError("parameter size musí byť valídny Vector2f");
		}

        let fillColor = params.fillColor || DEFAULT_FILL_COLOR;
        let borderColor = params.borderColor || DEFAULT_BORDER_COLOR;

		/********************************************************
		//SPOLOCNE KONTROLY
		********************************************************/
	}

	changeObject(params){
		if(!isObject(params)){
			return this.getError("Argument musí byť objekt");
		}

		if(!isObject(params.attributes)){
			return this.getError("Parameter attributes musí byť objekt");	
		}

		if(!isString(params.id)){
			return this.getError("Parameter id musí byť string");	
		}

		if(!isString(params.layer)){
			return this.getError("Parameter layer musí byť string");	
		}
        let object = null;
		try{
			object = this._scene.getObject(params.layer, params.id);
		}
		catch(e){
			object = null
		}
		if(!object){
			return this.getError("Objekt sa nepodarilo nájsť");	
		}
		Entity.changeAttr(object, params.attributes);
	}
}