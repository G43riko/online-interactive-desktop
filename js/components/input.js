class InputManager{
	constructor(){
		this._keys = [];
		this._timer = false;
		this._buttons = [];
		this._pressPosition = new GVector2f();
		this._mousePos = new GVector2f();
		this._lastTouch = false;
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	get mousePos(){return this._mousePos;}

	_initWindowListeners(){
		var inst = this;
		window.onresize = function(){
			initCanvasSize();
			draw();
		};

		window.orientationchange = function(){
			initCanvasSize();
			draw();
		};

		window.onbeforeunload= function(event){
			event.returnValue = "Nazoaj chceš odísť s tejto stránky???!!!";
		};

		window.onkeydown = function(e){
			inst._keyDown(e.keyCode);

			e.target.onkeyup = function(e){
				inst._keyUp(e.keyCode);
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
			inst._buttonDown(e);
			Listeners.mouseDown(new GVector2f(e.offsetX, e.offsetY), e.button);

			e.target.onmouseup = function(e){
				if(!inst.isButtonDown(e.button))
					return  false;
				inst._buttonUp(e);
				Listeners.mouseUp(new GVector2f(e.offsetX, e.offsetY), e.button);
			};
			e.target.onmousemove = function(e){
				inst._mouseMove(e);
				Listeners.mouseMove(new GVector2f(e.offsetX, e.offsetY), e["movementX"], e["movementY"]);
			}
		};

		$(target).bind('contextmenu', function(){
			return false;
		});


		target.addEventListener("touchstart", function(e){
			this._lastTouch = getMousePos(target, e);
			Input._buttonDown({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});

			Listeners.mouseDown(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
			e.target.addEventListener("touchmove", function(e){
				Input._mouseMove({offsetX: inst._lastTouch.x, offsetY: inst._lastTouch.y});
				var mov = getMousePos(target, e);
				mov.x -=  inst._lastTouch.x;
				mov.y -=  inst._lastTouch.y;
				inst._lastTouch = getMousePos(target, e);
				Listeners.mouseMove(new GVector2f(inst._lastTouch.x, inst._lastTouch.y), mov.x, mov.y);

			}, false);


			e.target.addEventListener("touchend", function(){
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input._buttonUp({button: LEFT_BUTTON, offsetX: inst._lastTouch.x, offsetY: inst._lastTouch.y});
				Listeners.mouseUp(new GVector2f(inst._lastTouch.x, inst._lastTouch.y), LEFT_BUTTON);
			}, false);

			e.target.addEventListener("touchcancel", function(){
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input._buttonUp({button: LEFT_BUTTON, offsetX: inst._lastTouch.x, offsetY: inst._lastTouch.y});
				Listeners.mouseUp(new GVector2f(inst._lastTouch.x, inst._lastTouch.y), LEFT_BUTTON);
			}, false);

		}, false);
	}

	_keyDown(val){
		this._keys[val] = true;

		Logger.log("stlačené klavesa " + val, LOGGER_KEY_EVENT);
	};

	_keyUp(val){
		this._keys[val] = false;
		Listeners.keyUp(val, this.isKeyDown(L_CTRL_KEY));
		Logger.log("pustená klavesa " + val, LOGGER_KEY_EVENT);
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
		Logger.log("podržané tlačítko myši ::" + button + "::" + inst._pressPosition.x + "::"+ inst._pressPosition.y, LOGGER_MOUSE_EVENT);

		if(this._timer){}
		this._clearTimer();
	};

	_clearTimer(){
		clearTimeout(this._timer);
		this._timer = false;
	};

	_mouseMove(val){
		this._mousePos.set(val.offsetX, val.offsetY);

		if(typeof Sharer === "object" && Sharer.isSharing)
			Sharer.mouseChange();
		if(this._timer)
			if(this._pressPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION)
				this._clearTimer();
	};

	_buttonDown(val){
		this._buttons[val.button] = true;
		if(val.button == LEFT_BUTTON && typeof Sharer === "object" && Sharer.isSharing)
				Sharer.mouseChange();

		var t = this;
		if (this._timer)
			this._clearTimer();
		this._timer = setTimeout(function(){t._checkPress(val.button)}, TOUCH_DURATION);
		this._pressPosition.set(val.offsetX, val.offsetY);

		Logger.log("stlačené tlačítko myši ::" + val.button + "::" + val.offsetX + "::"+ val.offsetY, LOGGER_MOUSE_EVENT);
	};

	_buttonUp(val){
		if (this._timer)
			this._clearTimer();
		this._buttons[val.button] = false;
		if(val.button == LEFT_BUTTON && typeof Sharer === "object" && Sharer.isSharing)
			Sharer.mouseChange();
		Logger.log("pustené tlačítko myši ::" + val.button + "::" + val.offsetX + "::"+ val.offsetY, LOGGER_MOUSE_EVENT);
	};

	isButtonDown(val){
		return this._buttons[val];
	};
}
