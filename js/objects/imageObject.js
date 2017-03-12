class ImageObject extends Entity{
	constructor(position, size, image, data){
		super(OBJECT_IMAGE, position, size, data);
		this._radius = 20;

        this._image = image || null;

		if(isString(this._image)){
            this._image = new Image();
            this._image.src = image;
		}
		
		//if(!image)
		//	loadImage(e => this._image = e);
	}

	set image(img){this._image = img;}

	updateCreatingPosition(pos){
		this.size.x = pos.x - this.position.x;
		this.size.y = pos.y - this.position.y;
	}

	clickIn(x, y){
		if (!this.clickInBoundingBox(x, y)){
			return false;
		}

		let vec = new GVector2f(x, y);
		this.moveType = -1;

		this.checkConnectors(vec);
		if(this._selectedConnector){
			return true;
		}

		Entity.setMoveType(this, vec);

		return this.moveType >= 0;
	}

	_draw(ctx = context){
		//context.drawImage(this._image, this.position.x, this.position.y, this.size.x, this.size.y);
		doRect({
			bgImage: this._image || false,
			fill: this._image === null,
			position: this._position,
			size: this.size,
			radius: this.radius,
			//draw: true,
			shadow: this.moving && !this.locked,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor,
			ctx: ctx
		});

		drawBorder(ctx, this);
	}
}