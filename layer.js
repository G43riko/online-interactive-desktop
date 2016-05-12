function Layer(title){
	this.title = title;
}

Layer.prototype.objects = [];
Layer.prototype.visible = true;

Layer.prototype.draw = function(){
	if(!this.visible)
		return;
	for(var i in this.objects)
		this.objects[i].draw();
}
