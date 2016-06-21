class Rect extends Entity {
	constructor(position, size, fillColor){
		super("Rect", position, size, {fillColor: fillColor});
		this.moveType 	= -1;
		this._radius	= 0;
		this.minSize 	= new GVector2f(SELECTOR_SIZE);
		this.addConnector(new GVector2f(0, 0), new GVector2f(1, 0),new GVector2f(0, 1),new GVector2f(1, 1))
	}

	set radius(val){
		this._radius = parseFloat(val);
		if(this._radius < 100)
			this._radius *= 100;
		this._checkRadius();
	}

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

	_checkRadius(){
		if(this._radius > Math.min(this.size.x, this.size.y) >> 1)
			this._radius = Math.min(this.size.x, this.size.y) >> 1;
	}

	draw(){
		if (!this.visible)
			return;

		this._checkRadius();

		doRect({
			position: this.position,
			size: this.size,
			fillColor: this.fillColor,
			shadow: this.moving && !this.locked,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor,
			radius: this._radius
		});

		Entity.drawConnectors(this);

		drawBorder(this);
	}
}
