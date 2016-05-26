class Join{
	constructor(obj1, obj2, type = JOIN_BAZIER){
		this.obj1 = obj1;
		this.obj2 = obj2;
		this._type = type;
		this.borderColor = "blue";
		this.borderWidth = 10;
	};
	set type(val){
		this._type = val;
		draw();
	}
	draw(){
		var obj1pos = this.obj1.position.add(this.obj1.size.br(1)),
			obj2pos = this.obj2.position.add(this.obj2.size.br(1)),
			array = [];

		array.push(obj1pos);

		if(this._type != JOIN_LINEAR){
			var center = obj1pos.add(obj2pos).br(1),
				diff = obj1pos.sub(obj2pos);

			diff.x = Math.abs(diff.x);
			diff.y = Math.abs(diff.y);


			if(diff.x > diff.y) {
				if (this._type == JOIN_SEQUENCAL) {
					array.push(new GVector2f(center.x, obj1pos.y));
					array.push(new GVector2f(center.x, obj2pos.y));
					array.push(obj2pos);
				}
				else if (this._type == JOIN_BAZIER)
					array.push([new GVector2f(center.x, obj1pos.y),new GVector2f(center.x, obj2pos.y), obj2pos]);
			}
			else if(diff.x <= diff.y){
				if(this._type == JOIN_SEQUENCAL) {
					array.push(new GVector2f(obj1pos.x, center.y));
					array.push(new GVector2f(obj2pos.x, center.y));
					array.push(obj2pos);
				}
				else if(this._type == JOIN_BAZIER)
					array.push([new GVector2f(obj1pos.x, center.y), new GVector2f(obj2pos.x, center.y), obj2pos]);
			}
		}
		else
			array.push(obj2pos);

		if(this._type == JOIN_BAZIER)
			drawBazierCurve(array, this.borderWidth, this.borderColor);
		else
			drawLine(array, this.borderWidth, this.borderColor);
	};
}