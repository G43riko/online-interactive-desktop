var initTime = window.performance.now();

var objects = [];
var selectedObject = false;

$(function(){
	console.log("stranka sa nacítala za: ", (window.performance.now() - initTime) + " ms");

	canvas = document.getElementById("myCanvas");
	context = canvas.getContext("2d");
	context.shadowColor = DEFAULT_SHADOW_COLOR;

	objects.push(new Rect(new GVector2f(50, 50), new GVector2f(100, 100), "red"));
	objects.push(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "green"));
	
	initListeners();

	mainLoop();

	document.onkeydown = function(e){
		console.log(e.keyCode, e);
	}
});

function mainLoop(){
	resetCanvas();
	
	for(var i in objects)
		objects[i].draw();
	

	requestAnimationFrame(mainLoop);
}

