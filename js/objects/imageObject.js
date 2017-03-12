class ImageObject extends Entity{
	constructor(position, size, image, data){
		super(OBJECT_IMAGE, position, size, data);

		Entity.changeAttr(this, {radius: 20});

        this._image = image || null;

		if(isString(this._image)){
            this._image = new Image();
            this._image.src = image;
		}
	}

    _hover(x, y){
        this._mouseOver = this.clickInBoundingBox(x, y);
        if(this._mouseOver){
            setCursor(this._locked ? CURSOR_NOT_ALLOWED : CURSOR_POINTER);
            return true;
        }

        setCursor(CURSOR_DEFAULT);
        return false;
    }

	set image(img){this._image = img;}

	updateCreatingPosition(pos){
		this.size.x = pos.x - this.position.x;
		this.size.y = pos.y - this.position.y;
	}

	_clickIn(x, y){
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