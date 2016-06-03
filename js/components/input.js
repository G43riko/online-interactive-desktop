class InputManager{
	constructor(){
		this._keys = [];
		this._timer = false;
		this._buttons = [];
		this.pressPosition = new GVector2f();
		this._mousePos = new GVector2f();
	};

	get mousePos(){
		return this._mousePos;
	}

	keyDown(val){
		this._keys[val] = true;
	};

	keyUp(val){
		this._keys[val] = false;
	};

	isKeyDown(val){
		return this._keys[val];
	};

	_checkPress(button){
		this._buttons[button] = false;
		canvas.onmousepress({
			position: Input.pressPosition,
			button: button
		});
		if(this._timer){}
			this._clearTimer();
	};

	_clearTimer(){
		clearTimeout(this._timer);
		this._timer = false;
	}

	mouseMove(val){
		this._mousePos.set(val.offsetX, val.offsetY);
		if(this._timer)
			if(this.pressPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION)
				this._clearTimer();
	};

	buttonDown(val){
		this._buttons[val.button] = true;
		var t = this;
		if (this._timer)
			this._clearTimer();
		this._timer = setTimeout(function(){t._checkPress(val.button)}, TOUCH_DURATION);
		this.pressPosition.set(val.offsetX, val.offsetY);
	};

	buttonUp(val){
		if (this._timer)
			this._clearTimer();
		this._buttons[val.button] = false;
	};

	isButtonDown(val){
		return this._buttons[val];
	};
}
