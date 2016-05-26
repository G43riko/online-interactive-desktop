class Entity{
	constructor(position = new GVector2f(), size = new GVector2f(), color = DEFAULT_COLOR){
		this._position = position;
		this._size = size;
		this._color = color;

		this._borderWidth 	= DEFAULT_STROKE_WIDTH;
		this._borderColor 	= DEFAUL_STROKE_COLOR;
		this._selected 		= false;
		this._visible 		= true;
		this._moving 		= false;
	}
	/**
	 * vráti true ak je šanca že bolo kliknuté na niektorú časť objektu
	 */
	clickInBoundingBox(x, y){
		return x + SELECTOR_SIZE > this.position.x && x - SELECTOR_SIZE < this.position.x + this.size.x && 
			   y + SELECTOR_SIZE > this.position.y && y - SELECTOR_SIZE < this.position.y + this.size.y;
	};


}