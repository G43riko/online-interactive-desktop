var initTime = window.performance.now();

var keys = [];
var buttons = [];
var selectedObjects = [];
var creatingObject = false;
var movedObject = false;
var isMoved = false;
var operation = OPERATION_DRAW_RECT;

$(function(){
	/**
	 * DOLEZITE!!!
	 */
	Scene.createLayer("default");
	console.log("stranka sa nacítala za: ", (window.performance.now() - initTime) + " ms");
	
	canvas = document.getElementById("myCanvas");
	var tmpC = $(canvas);

	canvas.width = tmpC.width();
	canvas.height = tmpC.height();

	context = canvas.getContext("2d");
	context.shadowColor = DEFAULT_SHADOW_COLOR;

	initListeners();

	/**
	 * OSTATNE
	 */

	var p = new Paint("black", 5);

	p.addPoint(new GVector2f(100, 20));
	p.addPoint(new GVector2f(200, 160));
	p.addPoint(new GVector2f(500, 90));

	addToScene(p);

	addToScene(new Arc(new GVector2f(600, 100), new GVector2f(50, 50), "aqua"));

	addToScene(new Rect(new GVector2f(50, 50), new GVector2f(100, 100), "red"));
	addToScene(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "green"));
	

	mainLoop();
});

function draw(){
	resetCanvas();

	for(var i in layers)
		layers[i].draw();

	if(creatingObject)
		creatingObject.draw();
}

function mainLoop(){
	draw();
	//requestAnimationFrame(mainLoop);
}

