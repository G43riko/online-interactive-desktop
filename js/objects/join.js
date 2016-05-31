class Join extends Entity{
	constructor(obj1, obj2, type = JOIN_BAZIER){
		super("Join");
		this.obj1 			= obj1;
		this.obj2 			= obj2;
		this._lineStyle 	= type;
		this._borderColor 	= "blue";
		this._borderWidth 	= 10;
	};

	set obj1(val){this._obj1 = val;}
	set obj2(val){this._obj2 = val;}
	set type(val){
		this._lineStyle = val;
		draw();
	};

	draw(){
		if(this._obj1.position == null || this._obj2.position == null){
			Scene.remove(this);
			return;
		}

		var obj1pos = this._obj1.position.getClone().add(this._obj1.size.getClone().br(1)),
			obj2pos = this._obj2.position.getClone().add(this._obj2.size.getClone().br(1)),
			array = [];

		array.push(obj1pos);

		if(this._lineStyle != JOIN_LINEAR){
			var center = obj1pos.getClone().add(obj2pos).br(1),
				diff = obj1pos.getClone().sub(obj2pos);

			diff.x = Math.abs(diff.x);
			diff.y = Math.abs(diff.y);


			if(diff.x > diff.y) {
				if (this._lineStyle == JOIN_SEQUENCAL) {
					array.push(new GVector2f(center.x, obj1pos.y));
					array.push(new GVector2f(center.x, obj2pos.y));
					array.push(obj2pos);
				}
				else if (this._lineStyle == JOIN_BAZIER)
					array.push([new GVector2f(center.x, obj1pos.y),new GVector2f(center.x, obj2pos.y), obj2pos]);
			}
			else if(diff.x <= diff.y){
				if(this._lineStyle == JOIN_SEQUENCAL) {
					array.push(new GVector2f(obj1pos.x, center.y));
					array.push(new GVector2f(obj2pos.x, center.y));
					array.push(obj2pos);
				}
				else if(this._lineStyle == JOIN_BAZIER)
					array.push([new GVector2f(obj1pos.x, center.y), new GVector2f(obj2pos.x, center.y), obj2pos]);
			}
		}
		else
			array.push(obj2pos);

		if(this._lineStyle == JOIN_BAZIER)
			drawBazierCurve(array, this.borderWidth, this.borderColor);
		else
			drawLine(array, this.borderWidth, this.borderColor);
	};
}