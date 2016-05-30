class Arc extends Entity{
	constructor(position, size, color){
		super("Arc", position, size, color);
		this.moveType 	= -1;
		this._minSize 	= new GVector2f(SELECTOR_SIZE);
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

		if (this.moving && !this.locked)
			setShadow(true);

		fillArc(this.position.x, this.position.y, this.size.x, this.size.y, this.fillColor);

		if (this.moving)
			setShadow(false);

		drawArc(this.position.x, this.position.y, this.size.x, this.size.y, this.borderWidth, this.borderColor);

		if (this.selected)
			drawBorder(this);
	};
}