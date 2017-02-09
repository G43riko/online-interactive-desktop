class Join extends Entity{
	constructor(obj1, type = JOIN_LINEAR){
		super(OBJECT_JOIN);
		this._obj1 				= obj1;
		this._obj1_connector 	= obj1.selectedConnector;
		this._obj2 				= null;
		this._obj2_connector 	= null;
		this._lineType 			= type;
		Entity.changeAttr(this, {borderColor: "blue", borderWidth: 5});

		this._tmpPos 			= obj1.position.getClone();
	}

	set obj2(val){
		this._obj2 = val;
		this._obj2_connector = val.selectedConnector;
		this._obj1.selectedConnector = false;
		this._obj2.selectedConnector = false;
	}

	set type(val){
		this._lineType = val;
		draw();
	}

	updateCreatingPosition(pos){
		this._tmpPos.set(pos);
	}

	draw(ctx = context){
		if(this._obj1.position == null){
			Logger.warn(getMessage(MSG_TRY_DRAW_WRONG_JOIN));
			Scene.remove(this);
			return;
		}

		var obj1pos = this._obj1.position.getClone().add(this._obj1.size.getClone().mul(this._obj1_connector)),
			obj2pos,
			array = [];


		if(this._obj2 != null){
			obj2pos = this._obj2.position.getClone().add(this._obj2.size.getClone().mul(this._obj2_connector));
		}
		else{
			obj2pos = this._tmpPos;
		}

		array.push(obj1pos);

		if(this._lineType != JOIN_LINEAR){
			var center = obj1pos.getClone().add(obj2pos).br(1),
				diff = obj1pos.getClone().sub(obj2pos);

			diff.x = Math.abs(diff.x);
			diff.y = Math.abs(diff.y);


			if(diff.x > diff.y) {
				if (this._lineType == JOIN_SEQUENCAL) {
					array.push(new GVector2f(center.x, obj1pos.y));
					array.push(new GVector2f(center.x, obj2pos.y));
					array.push(obj2pos);
				}
				else if (this._lineType == JOIN_BAZIER){
					array.push([new GVector2f(center.x, obj1pos.y),new GVector2f(center.x, obj2pos.y), obj2pos]);
				}
			}
			else if(diff.x <= diff.y){
				if(this._lineType == JOIN_SEQUENCAL) {
					array.push(new GVector2f(obj1pos.x, center.y));
					array.push(new GVector2f(obj2pos.x, center.y));
					array.push(obj2pos);
				}
				else if(this._lineType == JOIN_BAZIER)
					array.push([new GVector2f(obj1pos.x, center.y), new GVector2f(obj2pos.x, center.y), obj2pos]);
			}
		}
		else{
			array.push(obj2pos);
		}

		if(this._lineType == JOIN_BAZIER){
			drawBazierCurve(array, this.borderWidth, this.borderColor);
		}
		else{
			doLine({points: array, borderWidth: this.borderWidth, borderColor: this.borderColor, ctx: ctx});
		}
	}
}