/*
	compatible:	 14.9.2016
*/
class Slider{
	constructor(position, size, value, onMove){
		this._position = position;
		this._size = size;
		this._buttonSize = (Math.min(size.x, size.y) / 4) * 3;
		this._buttonColor = "#FA1D2F";
		this._sliderWidth = this._buttonSize >> 2;
		this._sliderColor = "#FFADB9";
		this._backgroundColor = "#EEE0E5";
		this._value = value;
		this._onMove = onMove;

		if(size.x < size.y){
			this._sliderOffset = (size.x - (this._buttonSize) >> 1) + (this._buttonSize >> 1);
			this._sliderA = new GVector2f(position.x + (size.x >> 1), position.y + this._sliderOffset);
			this._sliderB = new GVector2f(position.x + (size.x >> 1), position.y + size.y - this._sliderOffset);
		}
	};

	set value(val){
		this._value = val;
		draw();
		this.draw();
	}

	clickIn(x, y){
		if(x < this._position.x || x > this._position.x + this._size.x ||
		   y < this._position.y || y > this._position.y + this._size.y)
			return false



	}

	draw(){
		fillRect(this._position.x, this._position.y, this._size.x, this._size.y,this._backgroundColor);

		drawLine([this._sliderA, this._sliderB], this._sliderWidth, this._sliderColor);

		var sliderPos = this._sliderA.getClone().sub(this._sliderB).div(100).mul(this._value).add(this._sliderB);
		fillArc(sliderPos.x - (this._buttonSize >> 1), sliderPos.y - (this._buttonSize >> 1), this._buttonSize, this._buttonSize, this._buttonColor);
	};

}