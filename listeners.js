function initListeners(){
	canvas.onmousedown = function(e){
		console.log(e);
		if(e.button == LEFT_BUTTON)
			for(var i in layers["default"].objects) //zoberie iba jeden??
				if(typeof layers["default"].objects[i].clickIn === 'function'){
					if(layers["default"].objects[i].clickIn(e.offsetX, e.offsetY)){
						layers["default"].objects[i].moving = true;
						movedObject = layers["default"].objects[i];
						return;
					}
				}
		isMoved = false;
		if(keys[L_CTRL_KEY] && !creatingObject)
			switch(operation){
				case OPERATION_DRAW_RECT:
					creatingObject = new Rect(new GVector2f(e.offsetX, e.offsetY), new GVector2f(0, 0), "blue");
					break;
				case OPERATION_DRAW_ARC:
					creatingObject = new Arc(new GVector2f(e.offsetX, e.offsetY), new GVector2f(0, 0), "orange")
					break;
			}
			
		draw();
	}

	canvas.onclick = function(){
		draw();
	}

	canvas.onmouseup = function(e){
		if(creatingObject){
			addToScene(creatingObject);
			creatingObject = false;
		}


		layers["default"].objects[0].addPoint(new GVector2f(e.offsetX, e.offsetY));

		if(layers["default"].objects[0].points[layers["default"].objects[0].points.length - 1].length >= 5)
			layers["default"].objects[0].breakLine();

		movedObject.moving = false;
		movedObject = false;

		for(var i in layers["default"].objects){
			if(typeof layers["default"].objects[i].clickIn === 'function'){
				if(layers["default"].objects[i].clickIn(e.offsetX, e.offsetY)){
					if(keys[L_CTRL_KEY])
						selectedObjects.push(layers["default"].objects[i]);
					else
						deselectAll(layers["default"].objects[i]);
					layers["default"].objects[i].selected = true;
					return;
				}
			}
		}
		deselectAll();
		draw();
	}

	canvas.onmousemove = function(e){
		if(movedObject){
			isMoved = true;
			for(var i in selectedObjects)
				Movement.move(selectedObjects[i], e.movementX, e.movementY)
			if(!movedObject.selected)
				Movement.move(movedObject, e.movementX, e.movementY)
		}

		if(keys[SHIFT_KEY])
			layers["default"].objects[0].addPoint(new GVector2f(e.offsetX, e.offsetY));


		if(creatingObject){
			creatingObject.size.x = e.offsetX - creatingObject.position.x;
			creatingObject.size.y = e.offsetY - creatingObject.position.y;
		}
		if(movedObject || keys[SHIFT_KEY] || creatingObject)
			draw();
	}



	window.onkeydown = function(e){
		keys[e.keyCode] = true;
	}

	window.onkeyup = function(e){
		keys[e.keyCode] = false;
	}

	$(canvas).bind('contextmenu', function(e){
		return false;
	}); 
}