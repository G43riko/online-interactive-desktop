var objects = [];
var layers = {};
var Scene = {};

function addToScene(object, layer = "default"){
	if(!layers.hasOwnProperty(layer))
		Logger.error("ide sa načítať neexistujúca vrstva: " + layer);
	layers[layer].objects.push(object);
}

Scene.createLayer = function(title){
	if(layers.hasOwnProperty(title))
		Logger.error("ide sa vytvoriť vrstva ktorá už existuje: " + layer);
	layers[title] = new Layer(title);
}

