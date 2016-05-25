class InputManager{
	constructor(){
		this.keys = [];
		this.timer = false;
		this.pressPosition = false;
		this.button = [];
	};
	keyDown(val){
		this.keys[val] = true;
	};
	keyUp(val){
		this.keys[val] = false;
	};
	isKeyDown(val){
		return this.keys[val];
	};
	checkPress(button){
		this.button[button] = false;
		canvas.onmousepress({
			position: Input.presPosition,
			button: button
		});
	};
	mouseMove(val){
		if(this.timer)
			if(this.presPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION)
				clearTimeout(this.timer);
	};
	buttonDown(val){
		this.button[val.button] = true;
		if (this.timer)
			clearTimeout(this.timer);
		this.timer = setTimeout(function(){Input.checkPress(val.button)}, TOUCH_DURATION);
		this.presPosition = new GVector2f(val.offsetX, val.offsetY);
	};
	buttonUp(val){
		if (this.timer)
			clearTimeout(this.timer);
		this.button[val.button] = false;
	};

	isButtonDown(val){
		return this.button[val];
	};
}
