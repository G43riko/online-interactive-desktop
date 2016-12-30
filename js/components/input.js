/*
	compatible: bind, eventTarget, hashChange, touchEvents 14.9.2016
*/

class InputManager{
	constructor(){
		this._keys = [];
		this._timer = false;
		this._buttons = [];
		this._pressPosition = new GVector2f();
		this._mousePos = new GVector2f();
		this._lastTouch = false;
		this._hist = {};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	};

	get mousePos(){return this._mousePos;}

	_onResize(){
		Project.canvasManager.onResize();
		//initCanvasSize();

		Scene.onScreenResize();

		if(isDefined(timeLine))
			timeLine.onScreenResize();

		if(isDefined(Layers))
			Layers.onScreenResize();

		draw();
	}

	_initWindowListeners(){
		window.onresize = this._onResize;

		window.orientationchange = this._onResize;

		window.onbeforeunload= function(event){
			event.returnValue = "Nazoaj chceš odísť s tejto stránky???!!!";
		};
		window.onhashchange = Listeners.hashChange;
		
		window.onkeydown = e => {
			this._keyDown(e.keyCode);

			if(!e.target.onkeyup)
				e.target.onkeyup = e => {
					this._keyUp(e.keyCode);
					e.target.onkeyup = false;
				}
		};

		//window.addEventListener('orientationchange', initCanvasSize, false)
	}

	initListeners(target){
		this._initWindowListeners();

		target.onclick = function(){draw();};

		target.onmousepress = function(e){
			return Listeners.mousePress(e.position.getClone(), e.button);
		};

		target.ondblclick = function(e){
			Listeners.mouseDoubleClick(new GVector2f(e.offsetX, e.offsetY), e.button);
		};

		target.onmousedown = e => {
			this._buttonDown(e);
			Listeners.mouseDown(new GVector2f(e.offsetX, e.offsetY), e.button);

			e.target.onmouseup = ee => {

				if(!this.isButtonDown(ee.button))
					return  false;
				this._buttonUp(ee);

				if(!Options.changeCursor)
					ee.target.onmousemove = false;
				ee.target.onmouseup = false;

				Listeners.mouseUp(new GVector2f(ee.offsetX, ee.offsetY), ee.button);
			};
			e.target.onmousemove = ee => {
				this._mouseMove(ee);
				Listeners.mouseMove(new GVector2f(ee.offsetX, ee.offsetY), ee["movementX"], ee["movementY"]);
			}
		};

		$(target).bind('contextmenu', () => false);


		target.addEventListener("touchstart", e => {
			e.preventDefault();
			this._lastTouch = getMousePos(target, e);
			Input._buttonDown({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});

			Listeners.mouseDown(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
			
			e.target.addEventListener("touchmove", ee => {
				ee.preventDefault();
				Input._mouseMove({offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});
				var mov = getMousePos(target, ee);
				mov.x -=  this._lastTouch.x;
				mov.y -=  this._lastTouch.y;
				this._lastTouch = getMousePos(target, ee);
				Listeners.mouseMove(new GVector2f(this._lastTouch.x, this._lastTouch.y), mov.x, mov.y);
				draw();
			}, false);


			e.target.addEventListener("touchend", (ee) => {
				ee.preventDefault();
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input._buttonUp({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});
				Listeners.mouseUp(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
				draw();
			}, false);

			e.target.addEventListener("touchcancel", (ee) => {
				ee.preventDefault();
				if(!Input.isButtonDown(LEFT_BUTTON))
					return false;
				Input._buttonUp({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});
				Listeners.mouseUp(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
				draw();
			}, false);
		}, false);
	}

	_keyDown(val){
		this._keys[val] = true;
		Events.keyDown(val);
		Listeners.keyDown(val, this.isKeyDown(L_CTRL_KEY));
	};

	_keyUp(val){
		this._keys[val] = false;
		Events.keyUp(val);
		Listeners.keyUp(val, this.isKeyDown(L_CTRL_KEY));

		if(!this._hist[val])
			this._hist[val] = 0;

		this._hist[val]++;
	};

	isKeyDown(val){
		return this._keys[val];
	};

	_checkPress(button){
		if(SelectedText)
			return;
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
		Events.mouseMove(val.offsetX, val.offsetY);

		if(this._timer)
			if(this._pressPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION)
				this._clearTimer();
	};

	_buttonDown(val){
		this._buttons[val.button] = true;
		Events.mouseDown(val.button, val.offsetX, val.offsetY);

		var t = this;
		if (this._timer)
			this._clearTimer();
		this._timer = setTimeout(function(){t._checkPress(val.button)}, TOUCH_DURATION);
		this._pressPosition.set(val.offsetX, val.offsetY);
	};

	_buttonUp(val){
		if (this._timer)
			this._clearTimer();
		this._buttons[val.button] = false;
		Events.mouseUp(val.button, val.offsetX, val.offsetY);
	};

	isButtonDown(val){
		return this._buttons[val];
	};
}
