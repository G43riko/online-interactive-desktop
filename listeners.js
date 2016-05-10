function initListeners(){
	canvas.onmousedown = function(e){
		if(e.button == LEFT_BUTTON)
			for(var i in objects) //zoberie iba jeden??
				if(objects[i].clickIn(e.offsetX, e.offsetY)){
					objects[i].selected = true;
					selectedObject = objects[i];
					break;
				}
	}

	canvas.onmouseup = function(e){
		selectedObject.selected = false;
		selectedObject = false;
	}

	canvas.onmousemove = function(e){
		if(selectedObject)
			selectedObject.move(e.movementX, e.movementY);
	}

	$(canvas).bind('contextmenu', function(e){
    return false;
}); 
}