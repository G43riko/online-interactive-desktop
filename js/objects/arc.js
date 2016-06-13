class Arc extends Entity{
	constructor(position, size, color){
		super("Arc", position, size, color);
		this.moveType 	= -1;
		this.minSize 	= new GVector2f(SELECTOR_SIZE);
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

		if (x > this.position.x && y > this.position.y && x < this.position.x + this.size.x && y < this.position.y + this.size.y)
			this.moveType = 4;
		else if (vec.dist(this.position.x + (this.size.x >> 1), this.position.y) < SELECTOR_SIZE)
			this.moveType = 0;
		else if (vec.dist(this.position.x + this.size.x, this.position.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this.moveType = 1;
		else if (vec.dist(this.position.x + (this.size.x >> 1), this.position.y + this.size.y) < SELECTOR_SIZE)
			this.moveType = 2;
		else if (vec.dist(this.position.x, this.position.y + (this.size.y >> 1)) < SELECTOR_SIZE)
			this.moveType = 3;
		else if (vec.dist(this.position.x + this.size.x, this.position.y + this.size.y) < SELECTOR_SIZE)
			this.moveType = 5;
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