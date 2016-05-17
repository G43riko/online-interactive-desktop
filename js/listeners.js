function initListeners(){
	canvas.onclick = function(){draw();}
	canvas.onresize = function(){initCanvasSize();}
	canvas.orientationchange = function(){initCanvasSize();}
	canvas.onmouseup = function(e){mouseUp(e.offsetX, e.offsetY, e.button);}
	canvas.onmousedown = function(e){mouseDown(e.offsetX, e.offsetY, e.button);}
	canvas.onmousemove = function(e){mouseMove(e.offsetX, e.offsetY, e.movementX, e.movementY);}

	window.onkeydown = function(e){
		keys[e.keyCode] = true;
	}
	window.onkeyup = function(e){
		keys[e.keyCode] = false;
	}

	$(canvas).bind('contextmenu', function(e){
		return false;
	}); 

	function mouseDown(posX, posY, button){
		buttons[button] = true;
		if(button == LEFT_BUTTON)
			for(var i in layers["default"].objects) //zoberie iba jeden??
				if(typeof layers["default"].objects[i].clickIn === 'function'){
					if(layers["default"].objects[i].clickIn(posX, posY)){
						layers["default"].objects[i].moving = true;
						movedObject = layers["default"].objects[i];
						return;
					}
				}
		isMoved = false;
		if(keys[L_CTRL_KEY] && !creatingObject)
			switch(operation){
				case OPERATION_DRAW_RECT:
					creatingObject = new Rect(new GVector2f(posX, posY), new GVector2f(0, 0), selectedColor);
					break;
				case OPERATION_DRAW_ARC:
					creatingObject = new Arc(new GVector2f(posX, posY), new GVector2f(0, 0), selectedColor);
					break;
			}
			
		draw();
	}

	function mouseUp(posX, posY, button){
		buttons[button] = false;
		if(creatingObject){
			addToScene(creatingObject);
			creatingObject = false;
		}

		if(operation == OPERATION_DRAW_PATH){
			layers["default"].objects[0].addPoint(new GVector2f(posX, posY));
			layers["default"].objects[0].breakLine();
		}

		movedObject.moving = false;
		movedObject = false;

		for(var i in layers["default"].objects){
			if(typeof layers["default"].objects[i].clickIn === 'function'){
				if(layers["default"].objects[i].clickIn(posX, posY)){
					if(keys[L_CTRL_KEY])
						selectObject(layers["default"].objects[i])
					else
						deselectAll(layers["default"].objects[i]);
					return;
				}
			}
		}
		deselectAll();
		draw();
	}

	function mouseMove(posX, posY, movX, movY){
		if(movedObject){
			isMoved = true;
			for(var i in selectedObjects)
				Movement.move(selectedObjects[i], movX, movY)
			if(!movedObject.selected)
				Movement.move(movedObject, movX, movY)
		}

		if(buttons.hasOwnProperty(LEFT_BUTTON) && buttons[LEFT_BUTTON] && operation == OPERATION_DRAW_PATH){
			layers["default"].objects[0].addPoint(new GVector2f(posX, posY));
			draw();
		}


		if(creatingObject){
			creatingObject.size.x = posX - creatingObject.position.x;
			creatingObject.size.y = posY - creatingObject.position.y;
		}
		if(movedObject || keys[SHIFT_KEY] || creatingObject)
			draw();
	}
}