/*
	compatible:	indexOf, canvas, canvasText, JSON parsing 14.9.2016
*/
"use strict";

var initTime 		= Date.now(),
	movedObject 	= false,
	Logger 			= new LogManager(),//samostatne lebo loguje aj Projekt preto nie v ňom
	Project			= new ProjectManager("Gabriel Csollei"),
	Scene 			= Project.scene,
	Creator 		= Project.creator,
	Input 			= Project.input,
	selectedObjects = Project.scene.objectManager,
	Menu 			= Project.topMenu,
	actContextMenu 	= false,//TODO presunuť do noveho objektu na spravu GUI
	Listeners		= new ListenersManager(),
	//EventHistory 	= new EventSaver(),
	Content			= new ContentManager(),//TODO presunúť do nejakého CONTENTU
	Files			= new FileManager(),//TODO presunúť do nejakého CONTENTU
	Paints			= new PaintManager(),
	Task 			= null,//TODO presunúť do nejakého CONTENTU
	Events 			= typeof EventManager !== KEYWORD_UNDEFINED ? new EventManager() : null,
	SelectedText	= null,
	Gui 			= Project.gui,
	Options 		= Project.options,
	drawEvent 		= new EventTimer(realDraw, 1000 / FPS),
	area 			= null,
	Panel			= null,
	Forms		 	= null,
	Connection		= Project.connection,
	draw 			= () => drawEvent.callIfCan(),
	//TODO Layers presunuť do noveho objektu na spravu GUI
	components, drawMousePos, Layers, canvas, context, chatViewer, timeLine;

function setUpComponents(){
	components =  {
		draw : window.location.hash.indexOf(COMPONENT_DRAW) >= 0 || typeof Watcher !== "undefined",
		share : window.location.hash.indexOf(COMPONENT_SHARE) >= 0 || typeof Watcher !== "undefined",
		watch : window.location.hash.indexOf(COMPONENT_WATCH) >= 0 || typeof Watcher !== "undefined",
		tools : window.location.hash.indexOf(COMPONENT_TOOLS) >= 0 || typeof Watcher !== "undefined",
		save : window.location.hash.indexOf(COMPONENT_SAVE) >= 0 || typeof Watcher !== "undefined",
		load : window.location.hash.indexOf(COMPONENT_LOAD) >= 0 || typeof Watcher !== "undefined",
		screen : window.location.hash.indexOf(COMPONENT_SCREEN) >= 0 || typeof Watcher !== "undefined",
		content : window.location.hash.indexOf(COMPONENT_CONTENT) >= 0 || typeof Watcher !== "undefined",
		edit : window.location.hash.indexOf(COMPONENT_EDIT) >= 0 || typeof Watcher !== "undefined",
		layers : window.location.hash.indexOf(COMPONENT_LAYERS) >= 0 || typeof Watcher !== "undefined",
		task : window.location.hash.indexOf(COMPONENT_TASK) >= 0 || typeof Watcher !== "undefined"
	}
}

var Components = {
	draw	: () => isDefined(components) && isDefined(components["draw"]) && components["draw"] === true,
	share	: () => isDefined(components) && isDefined(components["share"]) && components["share"] === true,
	watch	: () => isDefined(components) && isDefined(components["watch"]) && components["watch"] === true,
	tools	: () => isDefined(components) && isDefined(components["tools"]) && components["tools"] === true,
	save	: () => isDefined(components) && isDefined(components["save"]) && components["save"] === true,
	load	: () => isDefined(components) && isDefined(components["load"]) && components["load"] === true,
	screen	: () => isDefined(components) && isDefined(components["screen"]) && components["screen"] === true,
	content	: () => isDefined(components) && isDefined(components["content"]) && components["content"] === true,
	layers	: () => isDefined(components) && isDefined(components["layers"]) && components["layers"] === true,
	task	: () => isDefined(components) && isDefined(components["task"]) && components["task"] === true,
	edit	: () => isDefined(components) && isDefined(components["edit"]) && components["edit"] === true
};

function sendMessage(message){
	if(typeof Watcher !== "undefined")
		Watcher.sendMessage(message, Project.autor);

	if(typeof Sharer !== "undefined" && Sharer.isSharing)
		Sharer.sendMessage(message, Project.autor);

	//chatViewer.recieveMessage(message, Project.autor);
	Panel.recieveMessage(message, Project.autor);
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
						options["success"](new DOMParser().parseFromString(xhttp.responseText, FORMAT_FILE_XML));
						break;
					case "xml" :
						options["success"](new DOMParser().parseFromString(xhttp.responseText, FORMAT_FILE_XML));
						break;
					default :
						options["success"](xhttp.responseText)
				}
			}
		};
	}
	//console.log(options);
	xhttp.open(options["method"], url, options["async"]);
	xhttp.send();
}
ajax(FOLDER_JSON + "/context.json", data => ContextMenuManager.items = data, "json");
//$.getJSON(FOLDER_JSON + "/context.json", data => ContextMenuManager.items = data);
//ajax(FOLDER_JSON + "/attributes.json", data => Entity.attr = data, "JSON");
$.getJSON(FOLDER_JSON + "/attributes.json", data => Entity.attr = data);


function init(){
	Project.scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));

	Project.scene.addToScene(new Line([new GVector2f(10, 400), new GVector2f(300, 450)], 5, "#66CCCC"));

	Project.scene.addToScene(new Arc(new GVector2f(600, 300), new GVector2f(50, 50), "#66CCCC"));

	Project.scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));
	Project.scene.addToScene(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "#00ff00"));

	Project.scene.addToScene(new Polygon([new GVector2f(1200, 100), new GVector2f(1150, 150), new GVector2f(1250, 150)], "#ff69b4"));
	Project.scene.addToScene(new Table(new GVector2f(800, 250), new GVector2f(200, 800), [["meno", "vek"], ["gabo", 21], ["maros", 35]]), "test2");

	loadImage(e => Project.scene.addToScene(new ImageObject(new GVector2f(300, 400), new GVector2f(300, 400), e)));



	var methods = {
		getArea: {
			name: "getArea",
			retType: "number",
			access: ACCESS_PUBLIC,
			args: "void"
		},
		getPosition:{
			name: "getPosition",
			retType: "GVector2f",
			access: ACCESS_PROTECTED,
			args: "void"
		}
	};

	var attrs = {
		x : {
			name: "x",
			access: ACCESS_PROTECTED,
			type: "number"
		},
		y : {
			name: "y",
			access: ACCESS_PROTECTED,
			type: "number"
		},
		width : {
			name: "width",
			access: ACCESS_PROTECTED,
			type: "number"
		},
		height : {
			name: "height",
			access: ACCESS_PROTECTED,
			type: "number"
		}
	};
	Project.scene.addToScene(new Class(new GVector2f(500, 150), new GVector2f(250, 250), "Rectange", attrs, methods));

	draw();
}

function setVisibilityData(data){
	Project.topMenu.visible = data.showTopMenu;
}

ajax(FOLDER_JSON + "/forms.json", data => {
	Forms = new FormManager(data);
	var formList = {
		shareForm : "sharingForm",
		optionsForm : "optionsForm",
		watchForm : "watchForm",
		saveXmlForm : "saveXmlForm",
		saveForm : "saveImgForm"
	};
	each(formList, function(e, i){
		var form = document.getElementById(i);
		if(form)
			form.appendChild(Forms.createForm(e));
	});

	Project.options.init();
}, "json");

$.ajax({
	dataType: "json",
	url: "/js/json/config_user.json",
	//async: false,
	success : function(data){
		console.log("constants: ", setConstants(data.environmentOptions));
		setVisibilityData(data.visibilityOptions);
	}
});

var loading = function(){
	/////DOLEZITE!!!
	Listeners.hashChange();
	area = new Area();
	Project.initCanvas();
	canvas = Project.canvas;
	context = Project.context;

	//if(typeof ConnectionManager === "function")
	//	Connection = new ConnectionManager();
	Project._connection = new ConnectionManager();

	$.getJSON(FOLDER_JSON + "/menu.json",function(data){
		Project.topMenu.init(data);
		$.getJSON(FOLDER_JSON + "/creator.json", data2 => {
			Creator.init(data2);
			Paints.rePaintImage(Creator.brushSize, Creator.brushColor);
			draw();
		});
	});
	Panel = new PanelManager();

	Project.scene.createLayer();
	Project.scene.createLayer("rightMenu", "gui");
	Project.scene.createLayer("test2");

	Project.context.shadowColor = DEFAULT_SHADOW_COLOR;
	Project.input.initListeners(Project.canvas);

	if(typeof Sharer !== "undefined")
		chatViewer = new ChatViewer(Project.title + "'s chat", Project.autor, sendMessage);

	Layers = new LayersViewer();
	Project.scene.addToScene(Layers, "rightMenu");
	var xOffset = Project.topMenu.position.x + (Project.topMenu.size.x + MENU_OFFSET) * Project.topMenu.visibleElements - MENU_OFFSET;
	Creator.view = new CreatorViewer(new GVector2f(Project.topMenu.visible ? xOffset : MENU_OFFSET, Project.topMenu.position.y - MENU_OFFSET));

	console.log("stranka sa nacítala za: ", (Date.now() - initTime) + " ms");
	console.log("to by malo byť: " + window["performance"].now() + " ms");
	
	draw();
};

$(function(){
	loading();
});
function realDraw(){
	if((typeof Watcher !== KEYWORD_UNDEFINED && !Watcher.connected) || !Project.context || !isObject(Project.context))
		return;
	Project.increaseDrawCounter();
	drawMousePos = new Date().getMilliseconds();
	CanvasHandler.clearCanvas(Project.context);
	if(Project.options.grid)
		drawGrid();

	if(Creator.operation == OPERATION_AREA && area)
		area.draw();

	Project.scene.draw();
	Creator.draw();
	Project.topMenu.draw();
	if(actContextMenu)
		actContextMenu.draw();
	Logger.log("kreslí sa všetko", LOGGER_DRAW);
	if(typeof timeLine !== KEYWORD_UNDEFINED && timeLine)
		timeLine.draw();

	Project.context.font = "30px Comic Sans MS";
	Project.context.fillStyle = "red";
	Project.context.fillText("draw(ms): " + (new Date().getMilliseconds() - drawMousePos), window.innerWidth - 100, 15);
}