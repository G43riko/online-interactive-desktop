var objects = [];
var layers = {};
var Scene = {};

function addToScene(object, layer = "default"){

	//if(layers.hasOwn)
	layers[layer].objects.push(object);
}

Scene.createLayer = function(title){
	layers[title] = new Layer(title);
}

