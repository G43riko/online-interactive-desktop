class InputManager{
	constructor(){
		this._keys = [];
		this._timer = false;
		this._buttons = [];
		this._pressPosition = new GVector2f();
		this._mousePos = new GVector2f();

	};
	/*
	get mousePos(){
		return this._mousePos;
	}
	*/

	_initWindowListeners(){
		var inst = this;
		window.onresize = function(){initCanvasSize(); draw();};
		window.orientationchange = function(){initCanvasSize(); draw();};
		window.onbeforeunload= function(event){
			event.returnValue = "Nazoaj chceš odísť s tejto stránky???!!!";
		};

		window.onkeydown = function(e){
			inst.keyDown(e.keyCode);

			e.target.onkeyup = function(e){
				inst.keyUp(e.keyCode);
			}
		};

		window.addEventListener('orientationchange', initCanvasSize, false)
	}

	initListeners(target){
		var inst = this;
		this._initWindowListeners();

		target.onclick = function(){draw();};

		target.onmousepress = function(e){
			return Listeners.mousePress(e.position.getClone(), e.button);
		};

		target.ondblclick = function(e){
			Listeners.mouseDoubleClick(new GVector2f(e.offsetX, e.offsetY), e.button);
		};

		target.onmousedown = function(e){
			inst.buttonDown(e);
			Listeners.mouseDown(new GVector2f(e.offsetX, e.offsetY), e.button);

			e.target.onmouseup = function(e){
				if(!inst.isButtonDown(e.button))
					return  false;
				inst.buttonUp(e);
				Listeners.mouseUp(new GVector2f(e.offsetX, e.offsetY), e.button);
			};
			e.target.onmousemove = function(e){
				inst.mouseMove(e);
				Listeners.mouseMove(new GVector2f(e.offsetX, e.offsetY), e.movementX, e.movementY);
			}
		};



		$(target).bind('contextmenu', function(){
			return false;
		});


		target.addEventListener("touchstart", function(e){
			lastTouch = getMousePos(target, e);
			Input.buttonDown({button: LEFT_BUTTON, offsetX: lastTouch.x, offsetY: lastTouch.y});

			Listeners.mouseDown(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
			e.target.addEventListener("touchmove", function(e){
				Input.mouseMove({offsetX: lastTouch.x, offsetY: lastTouch.y});
				var mov = getMousePos(target, e);
				mov.x -=  lastTouch.x;
				mov.y -=  lastTouch.y;
				lastTouch = getMousePos(target, e);
				Listeners.mouseMove(new GVector2f(lastTouch.x, lastTouch.y), mov.x, mov.y);

			}, false);


			e.target.addEventListener("touchend", function(){
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input.buttonUp({button: LEFT_BUTTON, offsetX: lastTouch.x, offsetY: lastTouch.y});
				Listeners.mouseUp(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
			}, false);

			e.target.addEventListener("touchcancel", function(){
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input.buttonUp({button: LEFT_BUTTON, offsetX: lastTouch.x, offsetY: lastTouch.y});
				Listeners.mouseUp(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
			}, false);

		}, false);
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
		var inst = this;
		this._buttons[button] = false;
		canvas.onmousepress({
			position: inst._pressPosition,
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
			if(this._pressPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION)
				this._clearTimer();
	};

	buttonDown(val){
		this._buttons[val.button] = true;
		var t = this;
		if (this._timer)
			this._clearTimer();
		this._timer = setTimeout(function(){t._checkPress(val.button)}, TOUCH_DURATION);
		this._pressPosition.set(val.offsetX, val.offsetY);
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
