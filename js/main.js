var initTime = window.performance.now();

Creator = {
	creatingObject: false,
	selectedColor: DEFAULT_COLOR,
	operation: OPERATION_DRAW_RECT
}

creatingObject = false;
movedObject = false;
isMoved = false;
selectedColor = DEFAULT_COLOR;
operation = OPERATION_DRAW_RECT;

$.getJSON("js/json/menu.json", function(data){
	Menu.items = data;
})

$(function(){
	/**
	 * DOLEZITE!!!
	 */
	Scene.createLayer("default");
	console.log("stranka sa nacítala za: ", (window.performance.now() - initTime) + " ms");
	canvas = document.getElementById("myCanvas");
	initCanvasSize();

	context = canvas.getContext("2d");


	context.roundRect = roundRect;


	context.shadowColor = DEFAULT_SHADOW_COLOR;
	initListeners();

	Menu.init();
	/**
	 * OSTATNE
	 */

	var p = new Paint("black", 5);

	p.addPoint(new GVector2f(100, 20));
	p.addPoint(new GVector2f(200, 160));
	p.addPoint(new GVector2f(500, 90));
	p.breakLine();

	addToScene(p);

	addToScene(new Arc(new GVector2f(600, 100), new GVector2f(50, 50), "aqua"));

	addToScene(new Rect(new GVector2f(50, 50), new GVector2f(100, 100), "red"));
	addToScene(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "green"));
	
	draw();
});


function draw(){
	resetCanvas();

	drawGrid(0.1, 10, 50);

	for(var i in layers)
		layers[i].draw();

	if(creatingObject)
		creatingObject.draw();

	Menu.draw();
}

function mainLoop(){
	draw();
	//requestAnimationFrame(mainLoop);
}

