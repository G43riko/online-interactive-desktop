class Arc extends Entity{
	constructor(position, size, fillColor){
		super("Arc", position, size, {fillColor: fillColor, minSize: new GVector2f(SELECTOR_SIZE)});
		this.moveType 	= -1;
	};

	updateCreatingPosition(pos){
		this.size.x = pos.x - this.position.x;
		this.size.y = pos.y - this.position.y;
	};

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
		if (!this.visible)
			return;

		doArc({
			position: this.position,
			size: this.size,
			fillColor: this.fillColor,
			borderColor: this.borderColor,
			borderWidth: this.borderWidth,
			shadow: this.moving && !this.locked
		});

		drawBorder(this);

		Entity.drawConnectors(this);
	};
}