var initTime = window.performance.now();

var keys = [];
var objects = [];
var selectedObjects = [];
var creatingObject = false;
var movedObject = false;
var isMoved = false;



$(function(){
	console.log("stranka sa nacítala za: ", (window.performance.now() - initTime) + " ms");

	canvas = document.getElementById("myCanvas");
	canvas.width = window.innerWidth - 4;
	canvas.height = window.innerHeight - 4;
	context = canvas.getContext("2d");
	context.shadowColor = DEFAULT_SHADOW_COLOR;

	var p = new Paint("black", 5);

	p.addPoint(new GVector2f(100, 20));
	p.addPoint(new GVector2f(200, 160));
	p.addPoint(new GVector2f(500, 90));

	objects.push(p);

//	objects.push(new Rect(new GVector2f(50, 50), new GVector2f(100, 100), "red"));
//	objects.push(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "green"));
	
	initListeners();

	mainLoop();
});

function mainLoop(){
	resetCanvas();
	
	for(var i in objects)
		objects[i].draw();

	if(creatingObject)
		creatingObject.draw();

/*
	context.beginPath();
	context.moveTo(100, 20);

	// line 1
	context.lineTo(200, 160);
	// line 2
	context.lineTo(500, 90);

	context.lineWidth = 5;
	context.strokeStyle = 'blue';
	context.stroke();
*/
	requestAnimationFrame(mainLoop);
}

