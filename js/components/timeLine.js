class TimeLine{
	constructor(val = 75, maxVal = 100, minVal = 0){
		this._position 			= new GVector2f();
		this._size 				= new GVector2f(window.innerWidth, 60);
		this._slideHeight 		= 5;
		this._slideColor 		= "purple";
		this._sliderOffset 		= 30;
		this._maxVal 			= maxVal;
		this._minVal			= minVal;
		this.value 				= val;
		this._buttonColor 		= "HotPink";
		this._buttonSize		= 20;
		this._buttonBorderColor = "IndianRed";


		this._minVal = this._maxVal = Date.now();
		var inst = this;
		setInterval(function(){
			inst._maxVal = Date.now();
			inst._val = Date.now();
			draw();
		}, 1000)
	}

	animateToVal(goalVal, frames = 100, speed = 1000 / FPS){
		var offset = (goalVal - this._val) / frames,
			inst = this,
			counter = 0,
			int = setInterval(function(){
				inst._val += offset;
				if(++counter == frames)
					clearInterval(int);
				draw();
			}, speed);
	}

	set value(val){
		this._val = val;
	}

	draw(){
		doRect({
			position: this._position,
			size: this._size,
			fillColor:"Lavender",
			borderColor: "LawnGreen",
			borderWidth: 1
		});

		doRect({
			x: this._position.x + this._sliderOffset,
			y: this._position.y + (this._size.y - this._slideHeight) / 2,
			width: this._size.x - this._sliderOffset * 2,
			height: this._slideHeight,
			fillColor: this._slideColor
		});

		doArc({
			x: this._sliderOffset + ((this._size.x - (this._sliderOffset << 1)) / (this._maxVal - this._minVal)) * (this._val - this._minVal),
			y: this._position.y + this._size.y / 2,
			width: this._buttonSize,
			center: true,
			height: this._buttonSize,
			fillColor: this._buttonColor,
			borderColor: this._buttonBorderColor
		})
	}
}