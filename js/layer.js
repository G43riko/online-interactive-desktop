function Layer(title){
	this.title = title;
}

Layer.prototype.objects = [];
Layer.prototype.visible = true;

Layer.prototype.draw = function(){
	if(!this.visible)
		return;
	for(var i in this.objects)
		if(typeof this.objects[i].draw === "function")
			this.objects[i].draw();
		else
			Logger.error("layer: " + this.title + ": kresli sa objekt ktorý nemá draw():", this.objects[i]);
}
