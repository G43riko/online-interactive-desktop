/*
	compatible: 14.9.2016
*/
class TimeLine{
	constructor(val = 75, maxVal = 100, minVal = 0){
		this.onScreenResize();
		this._slideHeight 		= TIMELINE_SLIDER_HEIGHT;
		this._slideColor 		= TIMELINE_SLIDER_COLOR;
		this._sliderOffset 		= TIMELINE_SLIDER_OFFSET;
		this._buttonColor 		= TIMELINE_BUTTON_COLOR;
		this._buttonSize		= TIMELINE_BUTTON_SIZE;
		this._buttonBorderColor = TIMELINE_BUTTON_BORDER_COLOR;
		this._maxVal 			= maxVal;
		this._minVal			= minVal;
		this.value 				= val;
		
		this._sliderPosition	= this._calcSliderPosition();


		//this._minVal = this._maxVal = Date.now();

		/*
		setInterval(() => {
			this._maxVal = Date.now();
			this._val = Date.now();
			draw();
		}, 1000);
		*/
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	_clickInBoundingBox(x, y){
		return x > this._position.x && x < this._position.x + this._size.x &&
			   y > this._position.y && y < this._position.y + this._size.y;
	};

	clickIn(x, y){
		if(!this._clickInBoundingBox(x, y, this))
			return false;

		var pos = [this._sliderOffset + this._sliderPosition, this._position.y + (this._size.y >> 1)];


		return Math.sqrt(Math.pow(x - pos[0], 2) + Math.pow(y - pos[1], 2)) < this._buttonSize;

	}

	_calcSliderPosition(){
		return ((this._size.x - (this._sliderOffset << 1)) / (this._maxVal - this._minVal)) * (this._val - this._minVal);
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

	onScreenResize(width = window.innerWidth, height = window.innerHeight){
		this._position 			= new GVector2f(0, window.innerHeight - TIMELINE_HEIGHT);
		this._size 				= new GVector2f(window.innerWidth, TIMELINE_HEIGHT);
	}

	onMouseMove(pos){
		if(pos.x < this._position.x + this._sliderOffset)
			pos.x = this._position.x + this._sliderOffset;
		if(pos.x > this._position.x + this._size.x - this._sliderOffset)
			pos.x = this._position.x + this._size.x - this._sliderOffset

		this._sliderPosition = pos.x - this._sliderOffset;
		this._val = ((this._sliderPosition - this._position.x) / (this._size.x - (this._sliderOffset << 1))) * this._maxVal;
	}

	set value(val){
		this._val = val;
		this._sliderPosition = this._calcSliderPosition();
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
			y: this._position.y + ((this._size.y - this._slideHeight) >> 1),
			width: this._size.x - (this._sliderOffset << 1),
			height: this._slideHeight,
			fillColor: this._slideColor
		});

		doArc({
			x: this._sliderOffset + this._sliderPosition,
			y: this._position.y + (this._size.y >> 1),
			width: this._buttonSize,
			center: true,
			height: this._buttonSize,
			fillColor: this._buttonColor,
			borderColor: this._buttonBorderColor
		})
	}
}