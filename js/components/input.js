/*
	compatible: bind, eventTarget, hashChange, touchEvents 14.9.2016
*/

class InputManager{
	constructor(){
		this._hist			= {};
		this._keys			= [];
		this._timer			= false;
		this._buttons		= [];
		this._mousePos		= new GVector2f();
		this._lastTouch		= false;
		this._pressPosition = new GVector2f();
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}

	get mousePos(){return this._mousePos;}

	_onResize(){
		//initCanvasSize();
		if(window.innerWidth < LIMIT_MIN_SCREEN_WIDTH){
			Logger.error(getMessage(MSG_MIN_SCREEN_WIDTH, LIMIT_MIN_SCREEN_WIDTH));
			return;
		}
		Project.content.onResize();
		
		Project.canvasManager.onResize();
		Project.scene.onScreenResize();

		if(isDefined(timeLine)){
			timeLine.onScreenResize();
		}

		if(isDefined(Layers)){
			Layers.onScreenResize();
		}

		draw();
	}

	_initWindowListeners(){
		window.onresize = this._onResize;
		if(STORE_DATA_ONUNLOAD){
			window.onunload = function(event){
				if(Project.scene.isEmpty()){
					localStorage.removeItem(RESTORE_KEY);
					return;
				}

				/*
				var result = {
					scene: Project.scene.toObject(),
					creator: Project.creator.toObject(),
					paint: Paints.toObject(),
					options : Project.options.toObject(),
					unloadTime: Date.now()
				};
				*/
				localStorage.setItem(RESTORE_KEY, JSON.stringify(Project.toObject()));
			};
		}
		window.orientationchange = this._onResize;
		if(ASK_BEFORE_UNLOAD){
			window.onbeforeunload= function(event){
				event.returnValue = getMessage(MSG_BEFORE_ONLOAD_TEXT);
			};
		}
		window.onhashchange = Project.listeners.hashChange;
		
		window.onkeydown = e => {
			this._keyDown(e.keyCode);

			if(!e.target.onkeyup){
				e.target.onkeyup = e => {
					this._keyUp(e.keyCode);
					e.target.onkeyup = false;
				};
			}
		};

		//window.addEventListener('orientationchange', initCanvasSize, false)
	}

	initListeners(target){
		this._initWindowListeners();

		target.onclick = function(){draw();};
		target.onmouseleave = e => {
			this._allButtonsUp();
			Project.listeners.mouseLeave(new GVector2f(e.offsetX, e.offsetY));
		};
		target.onmousepress = function(e){
			return Project.listeners.mousePress(e.position.getClone(), e.button);
		};

		target.ondblclick = function(e){
			Project.listeners.mouseDoubleClick(new GVector2f(e.offsetX, e.offsetY), e.button);
		};

		target.onmousedown = e => {
			this._buttonDown(e);
			Project.listeners.mouseDown(new GVector2f(e.offsetX, e.offsetY), e.button);

			e.target.onmouseup = ee => {

				if(!this.isButtonDown(ee.button)){
					return  false;
				}
				this._buttonUp(ee);

				if(!Project.options.changeCursor){
					ee.target.onmousemove = false;
				}
				ee.target.onmouseup = false;

				//ak je to prave tlačitko tak sa spravame ako pri podržaní tlačítka dole
				if(ee.button === MOUSE_BUTTON_RIGHT){
                    Project.listeners.mouseDown(new GVector2f(ee.offsetX, ee.offsetY), MOUSE_BUTTON_LEFT);
                    Project.listeners.mousePress(new GVector2f(ee.offsetX, ee.offsetY));
				}
				else{
					Project.listeners.mouseUp(new GVector2f(ee.offsetX, ee.offsetY), ee.button);
                }
			};
			e.target.onmousemove = ee => {
				this._mouseMove(ee);
				Project.listeners.mouseMove(new GVector2f(ee.offsetX, ee.offsetY), 
											ee.movementX, 
											ee.movementY);
			};
		};

		target.oncontextmenu = () => false;


		target.addEventListener("touchstart", e => {
			e.preventDefault();
			this._lastTouch = glob.getMousePos(target, e);
			Input._buttonDown({button: LEFT_BUTTON, offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});

			Project.listeners.mouseDown(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
			
			e.target.addEventListener("touchmove", ee => {
				ee.preventDefault();
				Input._mouseMove({offsetX: this._lastTouch.x, offsetY: this._lastTouch.y});
                let mov = glob.getMousePos(target, ee);
				mov.x -=  this._lastTouch.x;
				mov.y -=  this._lastTouch.y;
				this._lastTouch = glob.getMousePos(target, ee);
				Project.listeners.mouseMove(new GVector2f(this._lastTouch.x, this._lastTouch.y), 
											mov.x, 
											mov.y);
				draw();
			}, false);


			e.target.addEventListener("touchend", (ee) => {
				ee.preventDefault();
				if(!Input.isButtonDown(LEFT_BUTTON)){
					return false;
				}
				Input._buttonUp({
					button: LEFT_BUTTON, 
					offsetX: this._lastTouch.x, 
					offsetY: this._lastTouch.y
				});
				Project.listeners.mouseUp(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
				draw();
			}, false);

			e.target.addEventListener("touchcancel", (ee) => {
				ee.preventDefault();
				if(!Input.isButtonDown(LEFT_BUTTON)){
					return false;
				}
				Input._buttonUp({
					button: LEFT_BUTTON, 
					offsetX: this._lastTouch.x, 
					offsetY: this._lastTouch.y
				});
				Project.listeners.mouseUp(new GVector2f(this._lastTouch.x, this._lastTouch.y), LEFT_BUTTON);
				draw();
			}, false);
		}, false);
	}

	_keyDown(val){
		this._keys[val] = true;
		Events.keyDown(val);
		Project.listeners.keyDown(val, this.isKeyDown(KEY_L_CTRL));
	}

	_keyUp(val){
		this._keys[val] = false;
		Events.keyUp(val);
		Project.listeners.keyUp(val, this.isKeyDown(KEY_L_CTRL));

		if(!this._hist[val]){
			this._hist[val] = 0;
		}

		this._hist[val]++;
	}

	isKeyDown(val){
		return this._keys[val];
	}

	_checkPress(button){
		if(SelectedText){
			return;
		}
		this._buttons[button] = false;
		canvas.onmousepress({
			position: this._pressPosition,
			button: button
		});
		Logger.log("podržané tlačítko myši ::" + button + "::" + this._pressPosition.x + "::"+ this._pressPosition.y, LOGGER_MOUSE_EVENT);

		if(this._timer){//TODO čo je toto?? :D
			this._clearTimer();
		}
	}

	_clearTimer(){
		clearTimeout(this._timer);
		this._timer = false;
	}

	_mouseMove(val){
		this._mousePos.set(val.offsetX, val.offsetY);
		Events.mouseMove(val.offsetX, val.offsetY);

		if(this._timer){
			if(this._pressPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION){
				this._clearTimer();
			}
		}
	}

	_allButtonsUp(){
		for(let i in this._buttons){
			this._buttons[i] = false;
		}
	}


	_buttonDown(val){
		this._buttons[val.button] = true;
		Events.mouseDown(val.button, val.offsetX, val.offsetY);

		if (this._timer){
			this._clearTimer();
		}
		this._timer = setTimeout(() => this._checkPress(val.button), TOUCH_DURATION);
		this._pressPosition.set(val.offsetX, val.offsetY);
	}

	_buttonUp(val){
		if (this._timer){
			this._clearTimer();
		}
		this._buttons[val.button] = false;
		Events.mouseUp(val.button, val.offsetX, val.offsetY);
	}

	isButtonDown(val){
		return this._buttons[val];
	}
}
