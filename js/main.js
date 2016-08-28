var initTime 		= window["performance"].now(),
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
	Files			= new FileManager(),
	Project			= new ProjectManager("Gabriel Csollei"),
	Paints			= new PaintManager(),
	Task 			= null,
	SelectedText	= null,
	Options 		= new OptionsManager(),
	drawEvent 		= new EventManager(realDraw, 16),
	draw 			= () => drawEvent.callIfCan(),
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
	},
	drawMousePos, Layers, canvas, context, chatViewer;

var Components = {
	draw	: () => isDefined(components) && isDefined(components["draw"]) && components["draw"] === true,
	share	: () => isDefined(components) && isDefined(components["share"]) && components["share"] === true,
	watch	: () => isDefined(components) && isDefined(components["watch"]) && components["watch"] === true,
	tools	: () => isDefined(components) && isDefined(components["tools"]) && components["tools"] === true,
	save	: () => isDefined(components) && isDefined(components["save"]) && components["save"] === true,
	load	: () => isDefined(components) && isDefined(components["load"]) && components["load"] === true,
	screen	: () => isDefined(components) && isDefined(components["screen"]) && components["screen"] === true,
	content	: () => isDefined(components) && isDefined(components["content"]) && components["content"] === true,
	edit	: () => isDefined(components) && isDefined(components["edit"]) && components["edit"] === true
};

function sendMessage(message){
	if(typeof Watcher !== "undefined")
		Watcher.sendMessage(message, Project.autor);

	if(typeof Sharer !== "undefined" && Sharer.isSharing)
		Sharer.sendMessage(message, Project.autor);

	chatViewer.recieveMessage(message, Project.autor);
}

function ajax(url, options, dataType){
	if(isFunction(options)){
		options = {success: options};
		if(isString(dataType))
			options["dataType"] = dataType;
	}
	else if(!isObject(options))
		options = {};

	options["method"] = options["method"] || "GET";
	options["async"] = options["async"] || true;

	var start = 0;
	var xhttp = window.XMLHttpRequest ?  new XMLHttpRequest() :  new ActiveXObject("Microsoft.XMLHTTP");

	if(isFunction(options["abort"]))
		xhttp.onabort = options["abort"];
	if(isFunction(options["error"]))
		xhttp.onerror = options["error"];
	if(isFunction(options["progress"]))
		xhttp.onprogress = options["progress"];
	if(isFunction(options["timeout"]))
		xhttp.ontimeout = options["timeout"];
	if(isFunction(options["loadEnd"]))
		xhttp.onloadend = () => options["loadEnd"]((window["performance"].now() - start));
	if(isFunction(options["loadStart"]))
		xhttp.onloadstart = function(){
			options["loadStart"]();
			start = window["performance"].now();
		};
	if(isFunction(options["success"])){
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200 && isFunction(options["success"])){
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
			}
		};
	}
	xhttp.open(options["method"], url, options["async"]);
	xhttp.send();
}

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

	loadImage(e => Scene.addToScene(new ImageObject(new GVector2f(300, 400), new GVector2f(300, 400), e)));



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

$(function(){
	/**
	 * DOLEZITE!!!
	 */
	canvas = document.getElementById("myCanvas");
	initCanvasSize();
	context = canvas.getContext("2d");

	$.getJSON("js/json/menu.json",function(data){
		Menu.init(data);
		$.getJSON("js/json/creator.json", data => {
			Creator.init(data);
			Paints.rePaintImage(Creator.brushSize, Creator.brushColor);
		});
	});

	Scene.createLayer();
	Scene.createLayer("rightMenu", "gui");
	Scene.createLayer("test2");
	console.log("stranka sa nacítala za: ", (window["performance"].now() - initTime) + " ms");

	Options.init();
	context.shadowColor = DEFAULT_SHADOW_COLOR;
	Input.initListeners(canvas);

	if(typeof Watcher !== "undefined")
		Project._autor = "Watcher";

	chatViewer = new ChatViewer(Project.title + "'s chat", Project.autor, sendMessage);
	if(typeof Watcher !== "undefined")
		chatViewer.show();

	Layers = new LayersViewer();
	Scene.addToScene(Layers, "rightMenu");
	Creator.view = new CreatorViewer(new GVector2f(Menu.position.x + (Menu.size.x + MENU_OFFSET) * 8 - MENU_OFFSET, Menu.position.y - MENU_OFFSET));

	draw();
});

function realDraw(){
	drawMousePos = new Date().getMilliseconds();
	if(!isObject(context))
		return Logger.notif("context počas kreslenia nieje definovaný");
	resetCanvas();

	if(Options.grid)
		drawGrid(0.1, 10, 50);

	Scene.draw();
	Creator.draw();
	Menu.draw();
	if(actContextMenu)
		actContextMenu.draw();
	Logger.log("kreslí sa všetko", LOGGER_DRAW);
	//timeLine.draw();
}