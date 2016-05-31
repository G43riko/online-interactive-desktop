function initListeners(){
	canvas.onclick = function(){draw();};
	window.onresize = function(){initCanvasSize(); draw();};
	window.orientationchange = function(){initCanvasSize(); draw();};
	window.onbeforeunload= function(event){
		event.returnValue = "Nazoaj chceš odísť s tejto stránky???!!!";
	};

	canvas.onmousepress = function(e){
		return mousePress(e.position.getClone(), e.button);
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
			mouseMove(new GVector2f(e.offsetX, e.offsetY), e.movementX, e.movementY);
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
		lastTouch = getMousePos(canvas, e);
		Input.buttonDown({button: LEFT_BUTTON, offsetX: lastTouch.x, offsetY: lastTouch.y});

		mouseDown(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
		e.target.addEventListener("touchmove", function(e){
			Input.mouseMove({offsetX: lastTouch.x, offsetY: lastTouch.y});
			var mov = getMousePos(canvas, e);
			mov.x -=  lastTouch.x;
			mov.y -=  lastTouch.y;
			lastTouch = getMousePos(canvas, e);
			mouseMove(new GVector2f(lastTouch.x, lastTouch.y), mov.x, mov.y);
			
		}, false);


		e.target.addEventListener("touchend", function(){
			if(!Input.isButtonDown(LEFT_BUTTON))
				return false;
			Input.buttonUp({button: LEFT_BUTTON, offsetX: lastTouch.x, offsetY: lastTouch.y});
			mouseUp(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
		}, false);

		e.target.addEventListener("touchcancel", function(){
			if(!Input.isButtonDown(LEFT_BUTTON))
				return false;
			Input.buttonUp({button: LEFT_BUTTON, offsetX: lastTouch.x, offsetY: lastTouch.y});
			mouseUp(new GVector2f(lastTouch.x, lastTouch.y), LEFT_BUTTON);
		}, false);

	}, false);

	/**
	 * IMPLEMENTATION
	 */

	function mouseDown(position, button){
		if($(canvas).hasClass("blur"))
			return false;

		if(actContextMenu)
			if(actContextMenu.clickIn(position.x, position.y))
				return;
		if(button == LEFT_BUTTON)
			Scene.forEach(function(o){
				if(o.clickIn(position.x, position.y, button)){
					o.moving = true;
					movedObject = o;
					return true;
				}
			});

		if(Menu.isToolActive() && !Creator.object)
			Creator.createObject(position);

		
		draw();
	}

	function mousePress(position){
		if(Menu.pressIn(position.x, position.y)){
			draw();
			return true;
		}

		actContextMenu = new ContexMenuManager(position);

		movedObject.moving = false;
		movedObject = false;

		draw();
		return false;
	}

	function mouseDoubleClick(position, button){
		var result = false,
			vec = new GVector2f(100, 40);

		Scene.forEach(function(e){
			if(result)
				return;
			if(typeof e.doubleClickIn !== "undefined" && e.doubleClickIn(position.x, position.y))
				result = e;

		});

		if(result === false)
			getText("", position, vec, function(val){
				if(val.length > 0)
					Scene.addToScene(new Text(val, position, vec));
			});
		draw();
		return true;
	}

	function mouseUp(position){
		var result = false;

		if(actContextMenu){
			if(!actContextMenu.clickIn(position.x, position.y))
				actContextMenu = false;
			else
				return
		}

		if(Creator.object){
			Scene.addToScene(Creator.object);
			Creator.object = false;
			return;
		}

		if(Menu.clickIn(position.x, position.y))
			return;

		closeDialog();

		if(Creator.operation == OPERATION_DRAW_PATH){
			Scene.paint.addPoint(position, Creator.color);
			Scene.paint.breakLine();
		}

		movedObject.moving = false;
		movedObject = false;

		Scene.forEach(function(o){
			if(result)
				return;
			if(o.clickIn(position.x, position.y)) {
				Input.isKeyDown(L_CTRL_KEY) ? selectedObjects.add(o) : selectedObjects.clearAndAdd(o);
				result = true;
			}
		});

		if(!result)
			selectedObjects.clear();
			//deselectAll();
	}

	function mouseMove(position, movX, movY){
		//ak sa hýbe nejakým objektom
		if(movedObject){
			//prejdu sa všetky označené objekty a pohne sa nimi
			selectedObjects.forEach(function(e){
				Movement.move(e, movX, movY);
			});
			//for(var i in selectedObjects)
			//	Movement.move(selectedObjects[i], movement.x, movement.y)

			//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
			if(!movedObject.selected)
				Movement.move(movedObject, movX, movY);

			//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného 
			if(selectedObjects.size() > 0)
				updateSelectedObjectView(selectedObjects.get(selectedObjects.size() - 1));
			else if(movedObject)
				updateSelectedObjectView(movedObject);
		}

		//ak sa kreslí čiara tak sa nakreslí nové posunutie
		if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH){
			Scene.paint.addPoint(position, Creator.color);
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