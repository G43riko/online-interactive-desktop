var initTime 		= window.performance.now(),
	movedObject 	= false,
	Scene 			= new SceneManager(),
	Creator 		= new objectCreator(),
	Input 			= new InputManager(),
	selectedObjects = new ObjectsManager(),
	Menu 			= new MenuManager(),
	actContextMenu 	= false,
	Logger 			= new LogManager(),
	Listeners		= new ListenersManager(),
	timeLine		= new TimeLine(),
	EventHistory 	= new EventSaver(),
	Content			= new ContentManager(),
	FPS				= 60,
	components		= {
		draw : true,
		share : true,
		watch : true,
		tools : true,
		save : true,
		load : true,
		screen : true,
		content : true,
		edit : true
	}, canvas, context;

var componentDraw		= () => isDefined(components) && isDefined(components["draw"]) && components["draw"] === true,
	componentShare		= () => isDefined(components) && isDefined(components["share"]) && components["share"] === true,
	componentWatch		= () => isDefined(components) && isDefined(components["watch"]) && components["watch"] === true,
	componentTools		= () => isDefined(components) && isDefined(components["tools"]) && components["tools"] === true,
	componentSave		= () => isDefined(components) && isDefined(components["save"]) && components["save"] === true,
	componentLoad		= () => isDefined(components) && isDefined(components["load"]) && components["load"] === true,
	componentScreen		= () => isDefined(components) && isDefined(components["screen"]) && components["screen"] === true,
	componentContent	= () => isDefined(components) && isDefined(components["content"]) && components["content"] === true,
	componentEdit		= () => isDefined(components) && isDefined(components["edit"]) && edit["draw"] === true;

function ajax(url, options){
	if(typeof options !== "object")
		options = {};

	options["method"] = options["method"] || "GET";
	options["async"] = options["async"] || true;

	var start = 0;
	xhttp = window.XMLHttpRequest ?  new XMLHttpRequest() :  new ActiveXObject("Microsoft.XMLHTTP");

	xhttp.onabort = options["abort"];
	xhttp.onerror = options["error"];
	xhttp.onprogress = options["progress"];
	xhttp.ontimeout = options["timeout"];
	xhttp.onloadend = () => options["loadEnd"]((window.performance.now() - start));
	xhttp.onloadstart = function(){
		options["loadStart"]();
		start = window.performance.now();
	};
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200 && isFunction(options["success"]))
			switch(options["dataType"]){
				case "json" :
					options["success"](JSON.parse(xhttp.responseText));
					break;
				case "html" :
					options["success"](new DOMParser().parseFromString(xhttp.responseText, "text/xml"));
					break;
				case "xml" :
					options["success"](new DOMParser().parseFromString(xhttp.responseText, "text/xml"));
					break;
				default :
					options["success"](xhttp.responseText)
			}

	};
	xhttp.open(options["method"], url, options["async"]);
	xhttp.send();
}

$.getJSON("js/json/menu.json",function(data){
	Menu.init(data);
	$.getJSON("js/json/creator.json", data => Creator.init(data));
});
$.getJSON("js/json/context.json", data => ContextMenuManager.items = data);
$.getJSON("js/json/attributes.json", data => Entity.attr = data);


function init(){
	Scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));

	Scene.addToScene(new Line([new GVector2f(10, 400), new GVector2f(300, 450)], 5, "#66CCCC"));

	Scene.addToScene(new Arc(new GVector2f(600, 300), new GVector2f(50, 50), "#66CCCC"));

	Scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));
	Scene.addToScene(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "#00ff00"));

	Scene.addToScene(new Polygon([new GVector2f(1200, 100), new GVector2f(1150, 150), new GVector2f(1250, 150)], "#ff69b4"));
	Scene.addToScene(new Table(new GVector2f(800, 250), new GVector2f(200, 800), [["meno", "vek"], ["gabo", 21], ["maros", 35]]), "test2");

	loadImage(e => Scene.addToScene(new ImageObject(e, new GVector2f(300, 400), new GVector2f(300, 400))));



	var methods = {
		getArea: {
			name: "getArea",
			retType: "number",
			access: PUBLIC_ACCESS,
			args: "void"
		},
		getPosition:{
			name: "getPosition",
			retType: "GVector2f",
			access: PROTECTED_ACCESS,
			args: "void"
		}
	};

	var attrs = {
		x : {
			name: "x",
			access: PROTECTED_ACCESS,
			type: "number"
		},
		y : {
			name: "y",
			access: PROTECTED_ACCESS,
			type: "number"
		},
		width : {
			name: "width",
			access: PROTECTED_ACCESS,
			type: "number"
		},
		height : {
			name: "height",
			access: PROTECTED_ACCESS,
			type: "number"
		}
	};


	Scene.addToScene(new Class(new GVector2f(500, 150), new GVector2f(250, 250), "Rectange", attrs, methods));
	draw();
}

function saveSceneAsFile(){
	saveFile("scene_backup", Scene.toString());
}

function loadSceneFromFile(){
	loadFile(function(content){
		JSON.parse(content).forEach(e => Creator.create(e));
	});
}

$(function(){
	/**
	 * DOLEZITE!!!
	 */
	Scene.createLayer("default");
	Scene.createLayer("rightMenu");
	Scene.createLayer("test2");
	console.log("stranka sa nacítala za: ", (window.performance.now() - initTime) + " ms");
	canvas = document.getElementById("myCanvas");
	initCanvasSize();
	Entity._ides = [];

	context = canvas.getContext("2d");

	context.shadowColor = DEFAULT_SHADOW_COLOR;
	Input.initListeners(canvas);

	Scene.addToScene(new LayersViewer(), "rightMenu");
	Creator.view = new CreatorViewer(new GVector2f(Menu.position.x + (Menu.size.x + MENU_OFFSET) * 6 - MENU_OFFSET, Menu.position.y - MENU_OFFSET));

	draw();
});

var drawEvent = new EventManager(realDraw, 16),
	draw = () => drawEvent.callIfCan();

function realDraw(){
	drawMousePos = new Date().getMilliseconds();
	resetCanvas();
	drawGrid(0.1, 10, 50);

	Scene.draw();
	Creator.draw();
	Menu.draw();
	if(actContextMenu)
		actContextMenu.draw();

	//timeLine.draw();
}
