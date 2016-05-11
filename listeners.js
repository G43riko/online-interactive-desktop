function initListeners(){
	canvas.onmousedown = function(e){
		if(e.button == LEFT_BUTTON)
			for(var i in objects) //zoberie iba jeden??
				if(typeof objects[i].clickIn === 'function'){
					if(objects[i].clickIn(e.offsetX, e.offsetY)){
						objects[i].moving = true;
						movedObject = objects[i];
						return;
					}
				}
		isMoved = false;
		if(keys[L_CTRL_KEY] && !creatingObject)
			creatingObject = new Rect(new GVector2f(e.offsetX, e.offsetY), new GVector2f(0, 0), "blue");
	}

	canvas.onmouseup = function(e){

		if(creatingObject){
			objects.push(creatingObject);
			creatingObject = false;
		}


		objects[0].addPoint(new GVector2f(e.offsetX, e.offsetY));

		movedObject.moving = false;
		movedObject = false;

		for(var i in objects){
			if(typeof objects[i].clickIn === 'function'){
				if(objects[i].clickIn(e.offsetX, e.offsetY)){
					if(keys[L_CTRL_KEY])
						selectedObjects.push(objects[i]);
					else
						deselectAll(objects[i]);
					objects[i].selected = true;
					return;
				}
			}
		}
		deselectAll();
	}

	canvas.onmousemove = function(e){
		if(movedObject){
			isMoved = true;
			for(var i in selectedObjects)
				selectedObjects[i].move(e.movementX, e.movementY);
			if(!movedObject.selected)
				movedObject.move(e.movementX, e.movementY);
		}

		if(keys[SHIFT_KEY])
			objects[0].addPoint(new GVector2f(e.offsetX, e.offsetY));


		if(creatingObject){
			creatingObject.size.x = e.offsetX - creatingObject.position.x;
			creatingObject.size.y = e.offsetY - creatingObject.position.y;
		}
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