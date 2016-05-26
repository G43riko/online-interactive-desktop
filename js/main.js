var initTime = window.performance.now(),
	drawMousePos = false,
	movedObject = false,
	lastTouch = false,
	Scene = new SceneManager(),
	Creator = new objectCreator(),
	Input = new InputManager(),
	selectedObjects = new ObjectsManager(),
	Menu = new MenuManager(),
	actContextMenu = false,
	canvas, context;

$.getJSON("js/json/menu.json", function(data){
	Menu.items = data;
	draw();
});

$.getJSON("js/json/context.json", function(data){
	ContexMenuManager.items = data;
});

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
	/**
	 * OSTATNE
	 */

	var p = new Paint("black", 5);

	p.addPoint(new GVector2f(700, 20));
	p.addPoint(new GVector2f(600, 160));
	p.addPoint(new GVector2f(500, 390));
	p.breakLine();

	Scene.addToScene(p);

	Scene.addToScene(new Line([new GVector2f(10, 400), new GVector2f(300, 450)], 1, "aqua"));

	Scene.addToScene(new Arc(new GVector2f(600, 300), new GVector2f(50, 50), "aqua"));

	Scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "red"));
	Scene.addToScene(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "green"));

	j = new Join(Scene._layers["default"]._objects[3], Scene._layers["default"]._objects[4]);

	draw();
});


function draw(){
	//var startDraw = window.performance.now();
	drawMousePos = new Date().getMilliseconds();
	resetCanvas();

	drawGrid(0.1, 10, 50);

	j.draw();
	Scene.draw();
	Menu.draw();
	Creator.draw();

	if(actContextMenu)
		actContextMenu.draw();

	//console.log("nakreslilo sa za: ", (window.performance.now() - startDraw));
}