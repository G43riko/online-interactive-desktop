class Arc extends Entity{
	constructor(position, size, fillColor){
		super(OBJECT_ARC, position, size, {
			fillColor: fillColor,
			minSize: new GVector2f(SELECTOR_SIZE),
			moveType: -1
		});
	}

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

	_draw(ctx){
		doArc({
			position: this.position,
			size: this.size,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			fill: this._fill !== false,
			borderWidth: this.borderWidth,
			shadow: this.moving && !this.locked,
			ctx: ctx
		});

		Entity.drawConnectors(this, ctx);
		
		drawBorder(ctx, this);
	}
}