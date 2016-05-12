function GVector2f(x, y){
	this.x = x;
	this.y = y;
};

GVector2f.prototype.dist = function(x, y){
	return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
}



Movement = {};
Movement.move = function(object, x, y){
	if(object.position !== undefined){
		object.position.x += x;
		object.position.y += y;
	}
}

function deselectAll(object = false){
	for(var j in selectedObjects)
		selectedObjects[j].selected = false;
	selectedObjects = object ? [object] : [];
}