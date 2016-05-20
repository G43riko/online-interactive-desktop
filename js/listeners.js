function initListeners(){
	canvas.onclick = function(){draw();}
	window.onresize = function(){initCanvasSize(); draw();}
	window.orientationchange = function(){initCanvasSize(); draw();}
	
	canvas.onmousepress = function(e){
		console.log(e);
	}

	canvas.onmousedown = function(e){
		Input.buttonDown(e);
		mouseDown(new GVector2f(e.offsetX, e.offsetY), e.button);

		e.target.onmouseup = function(e){
			Input.buttonUp(e);
			mouseUp(new GVector2f(e.offsetX, e.offsetY), e.button);
		}
		e.target.onmousemove = function(e){
			Input.mouseMove(e);
			mouseMove(new GVector2f(e.offsetX, e.offsetY), new GVector2f(e.movementX, e.movementY));
		}
	}

	window.onkeydown = function(e){
		Input.keyDown(e.keyCode);

		e.target.onkeyup = function(e){
			Input.keyUp(e.keyCode);
		}
	}

	window.addEventListener('orientationchange', initCanvasSize, false);

	$(canvas).bind('contextmenu', function(e){
		return false;
	});



	canvas.addEventListener("touchstart", function(e){
		Input.buttonDown(LEFT_BUTTON);

		lastTouch = getMousePos(canvas, e);

		mouseDown(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
		e.target.addEventListener("touchmove", function(e){
			var mov = getMousePos(canvas, e);
			mov.x -=  lastTouch.x;
			mov.y -=  lastTouch.y;
			lastTouch = getMousePos(canvas, e);
			mouseMove(new GVector2f(lastTouch.x, lastTouch.y), new GVector2f(mov.x, mov.y));
			
		}, false);


		e.target.addEventListener("touchend", function(e){
			Input.buttonUp(LEFT_BUTTON);
			mouseUp(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
		}, false);
	}, false);

	/**
	 * IMPLEMENTATION
	 */

	function mouseDown(position, button){
		if(button == LEFT_BUTTON)
			Scene.forEach(function(o){
				if(typeof o.clickIn === 'function')
					if(o.clickIn(position.x, position.y)){
						o.moving = true;
						movedObject = o;
						return true;
					}
			})

		if(Input.isKeyDown(L_CTRL_KEY) && !creatingObject){
			switch(operation){
				case OPERATION_DRAW_RECT:
					creatingObject = new Rect(position, new GVector2f(0, 0), selectedColor);
					break;
				case OPERATION_DRAW_ARC:
					creatingObject = new Arc(position, new GVector2f(0, 0), selectedColor);
					break;
			}
			deselectAll(creatingObject);
		}
		
		draw();
	}

	function longTouch(){

	}

	function mouseUp(position, button){
		if(creatingObject){
			addToScene(creatingObject);
			creatingObject = false;
			return;
		}

		if(Menu.clickIn(position.x, position.y))
			return;

		if(operation == OPERATION_DRAW_PATH){
			layers["default"].objects[0].addPoint(position);
			layers["default"].objects[0].breakLine();
		}

		movedObject.moving = false;
		movedObject = false;

		//pozrie či je myš nad nejakým objektom a ak hej tak skončí
		if(Scene.forEach(function(o){
			if(typeof o.clickIn === 'function'){
				if(o.clickIn(position.x, position.y)){
					Input.isKeyDown(L_CTRL_KEY) ? selectObject(o) : deselectAll(o);
					return true;
				}
			}
		}))
			return;

		deselectAll();
		draw();
	}

	function mouseMove(position, movement){
		//ak sa hýbe nejakým objektom
		if(movedObject){
			//prejdu sa všetky označené objekty a pohne sa nimi
			selectedObjects.forEach(function(e){
				Movement.move(e, movement.x, movement.y);
			})
			//for(var i in selectedObjects)
			//	Movement.move(selectedObjects[i], movement.x, movement.y)

			//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
			if(!movedObject.selected)
				Movement.move(movedObject, movement.x, movement.y);

			//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného 
			if(selectedObjects.size() > 0)
				updateSelectedObjectView(selectedObjects.get(selectedObjects.size() - 1));
			else if(movedObject)
				updateSelectedObjectView(movedObject);
		}

		//ak sa kreslí čiara tak sa nakreslí nové posunutie
		if(Input.isKeyDown(LEFT_BUTTON) && operation == OPERATION_DRAW_PATH){
			layers["default"].objects[0].addPoint(position);
			draw();
		}

		//ak sa vytvára objekt tak sa nakreslí nový posunutie
		if(creatingObject){
			updateSelectedObjectView(creatingObject);
			creatingObject.size.x = position.x - creatingObject.position.x;
			creatingObject.size.y = position.y - creatingObject.position.y;
		}
		if(movedObject || Input.isKeyDown(SHIFT_KEY) || creatingObject)
			draw();
	}
}