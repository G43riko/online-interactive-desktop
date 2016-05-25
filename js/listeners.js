function initListeners(){
	canvas.onclick = function(){draw();};
	window.onresize = function(){initCanvasSize(); draw();};
	window.orientationchange = function(){initCanvasSize(); draw();};
	
	window.onbeforeunload= function(event){
		event.returnValue = "Nazoaj chceš odísť s tejto stránky???!!!";
	};

	/*
	window.onwheel = function(e) {
		var offset = e.deltaY / 10000;
		zoom += offset;
		context.scale(zoom, zoom);
		draw();
	};
	*/

	canvas.onmousepress = function(e){
		return mousePress(e.position, e.button);
	};

	canvas.ondblclick = function(e){
		mouseDoubleClick(new GVector2f(e.offsetX, e.offsetY), e.button);
	};

	canvas.onmousedown = function(e){
		Input.buttonDown(e);
		mouseDown(new GVector2f(e.offsetX, e.offsetY), e.button);

		e.target.onmouseup = function(e){
			if(!Input.isButtonDown(e.button))
				return  false;
			Input.buttonUp(e);
			mouseUp(new GVector2f(e.offsetX, e.offsetY), e.button);
		};
		e.target.onmousemove = function(e){
			Input.mouseMove(e);
			mouseMove(new GVector2f(e.offsetX, e.offsetY), new GVector2f(e.movementX, e.movementY));
		}
	};

	window.onkeydown = function(e){
		Input.keyDown(e.keyCode);

		e.target.onkeyup = function(e){
			Input.keyUp(e.keyCode);
		}
	};

	window.addEventListener('orientationchange', initCanvasSize, false);

	$(canvas).bind('contextmenu', function(){
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


		e.target.addEventListener("touchend", function(){
			if(!Input.isButtonDown(LEFT_BUTTON))
				return false;
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

				if(o.clickIn(position.x, position.y, button)){
					o.moving = true;
					movedObject = o;
					return true;
				}
			});

		if(Menu.isToolActive() && !Creator.object){
			switch(Creator.operation){
				case OPERATION_DRAW_RECT:
					Creator.object = new Rect(position, new GVector2f(), Creator.color);
					break;
				case OPERATION_DRAW_ARC:
					Creator.object = new Arc(position, new GVector2f(), Creator.color);
					break;
				case OPERATION_DRAW_LINE:
					Creator.object = new Line([position], 5, Creator.color);
					break;
			}
			deselectAll(Creator.object);
		}
		
		draw();
	}

	function mousePress(position){
		if(Menu.pressIn(position.x, position.y)){
			draw();
			return true;
		}
		return false;
	}

	function mouseDoubleClick(position, button){

	}

	function mouseUp(position){
		if(Creator.object){
			Scene.addToScene(Creator.object);
			Creator.object = false;
			return;
		}

		if(Menu.clickIn(position.x, position.y))
			return;

		if(Creator.operation == OPERATION_DRAW_PATH){
			layers["default"].objects[0].addPoint(position);
			layers["default"].objects[0].breakLine();
		}

		movedObject.moving = false;
		movedObject = false;


		var result = false;
		Scene.forEach(function(o){
			if(result)
				return;
			if(o.clickIn(position.x, position.y)) {
				Input.isKeyDown(L_CTRL_KEY) ? selectedObjects.add(o) : deselectAll(o);
				result = true;
			}
		});

		if(!result)
			deselectAll();
	}

	function mouseMove(position, movement){
		//ak sa hýbe nejakým objektom
		if(movedObject){
			//prejdu sa všetky označené objekty a pohne sa nimi
			selectedObjects.forEach(function(e){
				Movement.move(e, movement.x, movement.y);
			});
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
		if(Input.isKeyDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH){
			layers["default"].objects[0].addPoint(position);
			draw();
		}

		//ak sa vytvára objekt tak sa nakreslí nový posunutie
		if(Creator.object){
			updateSelectedObjectView(Creator.object);
			Creator.object.updateCreatingPosition(position);
		}
		if(movedObject || Input.isKeyDown(SHIFT_KEY) || Creator.object)
			draw();
	}
}