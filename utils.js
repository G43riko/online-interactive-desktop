function GVector2f(x, y){
	this.x = x;
	this.y = y;
};

Movement = {};
Movement.move = function(object, x, y){
	object.position.x += x;
	object.position.y += y;
}

function deselectAll(object = false){
	for(var j in selectedObjects)
		selectedObjects[j].selected = false;
	selectedObjects = object ? [object] : [];
}