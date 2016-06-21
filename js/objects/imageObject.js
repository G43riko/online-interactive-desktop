class ImageObject extends Entity{
	constructor(image, position, size, data){
		super("Image", position, size, data);
		this._radius = 20;
		this._image = image;
	}

	clickIn(x, y){
		if (!this.clickInBoundingBox(x, y))
			return false;

		var vec = new GVector2f(x, y);
		this.moveType = -1;

		this.checkConnectors(vec);
		if(this._selectedConnector)
			return true;

		Entity.setMoveType(this, vec);

		return this.moveType >= 0;
	};

	draw(){
		//context.drawImage(this._image, this.position.x, this.position.y, this.size.x, this.size.y);

		doArc({
			bgImage: this._image,
			position: this._position,
			size: this.size,
			radius: this.radius,
			draw: true,
			shadow: this.moving && !this.locked,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor
		});

		drawBorder(this);
	}
}