/*
	compatible:	indexOf, canvas, canvasText, JSON parsing 14.9.2016
*/

glob.initTime	= Date.now();

let movedObject 	= false,
	Logger 			= new LogManager(),//samostatne lebo loguje aj Projekt preto nie v ňom
	Project			= new ProjectManager(PROJECT_AUTHOR),
	Scene 			= Project.scene,
	Creator 		= Project.creator,
	Input 			= Project.input,
	selectedObjects = Project.scene.objectManager,
	Menu 			= Project.topMenu,
	actContextMenu 	= false,//TODO presunuť do noveho objektu na spravu GUI
	Paints			= new PaintManager(),
	Task 			= null,//TODO presunúť do nejakého CONTENTU
	Events 			= typeof EventManager !== KEYWORD_UNDEFINED ? new EventManager() : null,
	SelectedText	= null,
	Options 		= Project.options,
	drawEvent 		= new EventTimer(realDraw, 1000 / FPS),
	pdrawEvent 		= new EventTimer(realPDraw, 1000 / FPS),
	area 			= null,
	Panel			= null,
	Connection		= Project.connection,
	draw 			= () => drawEvent.callIfCan(),
	pdraw 			= () => pdrawEvent.callIfCan(),
	//pcanvas, pcontext, drawMousePos, chatViewer,
	components, Layers, canvas, context, timeLine;


	//Gui 			= Project.gui,
	//Forms		 	= null,
	//Listeners		= Project.listeners,
	//EventHistory 	= new EventSaver(),
	//Content			= new ContentManager(),//TODO presunúť do nejakého CONTENTU
	//Files			= new FileManager(),//TODO presunúť do nejakého CONTENTU
	//TODO Layers presunuť do noveho objektu na spravu GUI

glob.setUpComponents = function(){
	components =  {
		draw : window.location.hash.indexOf(COMPONENT_DRAW) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		share : window.location.hash.indexOf(COMPONENT_SHARE) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		watch : window.location.hash.indexOf(COMPONENT_WATCH) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		tools : window.location.hash.indexOf(COMPONENT_TOOLS) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		save : window.location.hash.indexOf(COMPONENT_SAVE) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		load : window.location.hash.indexOf(COMPONENT_LOAD) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		screen : window.location.hash.indexOf(COMPONENT_SCREEN) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		content : window.location.hash.indexOf(COMPONENT_CONTENT) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		edit : window.location.hash.indexOf(COMPONENT_EDIT) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		layers : window.location.hash.indexOf(COMPONENT_LAYERS) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED,
		task : window.location.hash.indexOf(COMPONENT_TASK) >= 0 || typeof Watcher !== KEYWORD_UNDEFINED
	};
};

let Components = {
	draw	: () => isDefined(components) && isDefined(components.draw) && components.draw === true,
	share	: () => isDefined(components) && isDefined(components.share) && components.share === true,
	watch	: () => isDefined(components) && isDefined(components.watch) && components.watch === true,
	tools	: () => isDefined(components) && isDefined(components.tools) && components.tools === true,
	save	: () => isDefined(components) && isDefined(components.save) && components.save === true,
	load	: () => isDefined(components) && isDefined(components.load) && components.load === true,
	screen	: () => isDefined(components) && isDefined(components.screen) && components.screen === true,
	content	: () => isDefined(components) && isDefined(components.content) && components.content === true,
	layers	: () => isDefined(components) && isDefined(components.layers) && components.layers === true,
	task	: () => isDefined(components) && isDefined(components.task) && components.task === true,
	edit	: () => isDefined(components) && isDefined(components.edit) && components.edit === true
};

function sendMessage(message){
	if(typeof Watcher !== KEYWORD_UNDEFINED){
		Watcher.sendMessage(message, Project.autor);
	}

	if(typeof Sharer !== KEYWORD_UNDEFINED && Sharer.isSharing){
		Sharer.sendMessage(message, Project.autor);
	}

	//chatViewer.recieveMessage(message, Project.autor);
	Panel.recieveMessage(message, Project.autor);
}


function ajax(url, options, dataType){
	if(isFunction(options)){
		options = {success: options};
		if(isString(dataType)){
			options.dataType = dataType;
		}
	}
	else if(!isObject(options)){
		options = {};
	}

	options.method = options.method || "GET";
	options.async = options.async || true;

    let start = 0;
    let xhttp = window.XMLHttpRequest ?  new XMLHttpRequest() :  new ActiveXObject("Microsoft.XMLHTTP");

	if(isFunction(options.abort)){
		xhttp.onabort = options.abort;
	}
	if(isFunction(options.error)){
		xhttp.onerror = options.error;
	}
	if(isFunction(options.progress)){
		xhttp.onprogress = options.progress;
	}
	if(isFunction(options.timeout)){
		xhttp.ontimeout = options.timeout;
	}
	if(isFunction(options.loadEnd)){
		xhttp.onloadend = () => options.loadEnd((Date.now() - start));
	}
	if(isFunction(options.loadStart)){
		xhttp.onloadstart = function(){
			options.loadStart();
			start = Date.now();
		};
	}
	if(isFunction(options.success)){
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200 && isFunction(options.success)){
				switch(options.dataType){
					case "json" :
						options.success(JSON.parse(xhttp.responseText));
						break;
					case "html" :
						options.success(new DOMParser().parseFromString(xhttp.responseText, FORMAT_FILE_XML));
						break;
					case "xml" :
						options.success(new DOMParser().parseFromString(xhttp.responseText, FORMAT_FILE_XML));
						break;
					default :
						options.success(xhttp.responseText);
				}
			}
		};
	}
	//console.log(options);
	xhttp.open(options.method, url, options.async);
	xhttp.send();
}
ajax(FOLDER_JSON + "/context.json", data => ContextMenuManager.items = data, "json");
//$.getJSON(FOLDER_JSON + "/context.json", data => ContextMenuManager.items = data);
//ajax(FOLDER_JSON + "/attributes.json", data => Entity.attr = data, "JSON");
$.getJSON(FOLDER_JSON + "/attributes.json", data => Entity.attr = data);


glob.init = function(){
	Project.scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));

	Project.scene.addToScene(new Line([new GVector2f(10, 400), new GVector2f(300, 450)], 5, "#66CCCC"));

	Project.scene.addToScene(new Arc(new GVector2f(600, 300), new GVector2f(50, 50), "#66CCCC"));

	Project.scene.addToScene(new Rect(new GVector2f(800, 50), new GVector2f(100, 100), "#ff0000"));
	Project.scene.addToScene(new Rect(new GVector2f(250, 250), new GVector2f(100, 100), "#00ff00"));

	Project.scene.addToScene(new Polygon([new GVector2f(1200, 100), 
										  new GVector2f(1150, 150), 
										  new GVector2f(1250, 150)], "#ff69b4"));
	Project.scene.addToScene(new Table(new GVector2f(800, 250), 
									   new GVector2f(200, 800), 
									   [["meno", "vek"], ["gabo", 21], ["maros", 35]]), "test2");

	loadImage(e => Project.scene.addToScene(new ImageObject(new GVector2f(300, 400), 
															new GVector2f(300, 400), e)));



    let methods = {
		getArea: {
			name: "getArea",
			retType: KEYWORD_NUMBER,
			access: ACCESS_PUBLIC,
			args: KEYWORD_VOID
		},
		getPosition:{
			name: "getPosition",
			retType: "GVector2f",
			access: ACCESS_PROTECTED,
			args: KEYWORD_VOID
		}
	};

    let attrs = {
		x : {
			name: "x",
			access: ACCESS_PROTECTED,
			type: KEYWORD_NUMBER
		},
		y : {
			name: "y",
			access: ACCESS_PROTECTED,
			type: KEYWORD_NUMBER
		},
		width : {
			name: "width",
			access: ACCESS_PROTECTED,
			type: KEYWORD_NUMBER
		},
		height : {
			name: "height",
			access: ACCESS_PROTECTED,
			type: KEYWORD_NUMBER
		}
	};
	Project.scene.addToScene(new Class(new GVector2f(500, 150), 
									   new GVector2f(250, 250), 
									   "Rectange", 
									   attrs, 
									   methods));
	draw();
};

/*
function setVisibilityData(data){
	Project.topMenu.visible = data.showTopMenu;
}
*/

ajax(FOLDER_JSON + "/forms.json", data => {
	Project.setForm(data);
    let formList = {
		shareForm 	: "sharingForm",
		optionsForm : "optionsForm",
		watchForm 	: "watchForm",
		saveXmlForm : "saveXmlForm",
		saveForm 	: "saveImgForm"
	};
	each(formList, function(e, i){
        let form = document.getElementById(i);
		if(form){
			form.appendChild(Project.form.createForm(e));
		}
	});

	Project.options.init();
}, "json");

/*
$.ajax({
	dataType: "json",
	url: "/js/json/config_user.json",
	//async: false,
	success : function(data){
		console.log("constants: ", setConstants(data.environmentOptions));
		setVisibilityData(data.visibilityOptions);
	}
});
*/

glob.loading = function(){
	//	testCompatibility();
	try{
		/////DOLEZITE!!!
		Project.listeners.hashChange();
		area = new Area();
		Project.initCanvas();


		canvas = Project.canvas;
		context = Project.context;
		pcanvas = Project.canvasManager.pCanvas.canvas;
		pcontext = Project.canvasManager.pCanvas.context;
		
		//if(typeof ConnectionManager === "function")
		//	Connection = new ConnectionManager();
		//Project._connection = new ConnectionManager();

		$.getJSON(FOLDER_JSON + "/menu.json",function(data){
			try{
				Project.topMenu.init(data);
			}
			catch(e){
				Logger.exception(getMessage(MSG_INIT_MENU_ERROR), e);
			}
			$.getJSON(FOLDER_JSON + "/creator.json", data2 => {
				try{
					Creator.init(data2);
					Paints.rePaintImage(Creator.brushSize, Creator.brushColor);
					draw();
				}
				catch(e){
					Logger.exception(getMessage(MSG_INIT_CREATOR_ERROR), e);
				}
			});
		});

		//PanelManager = new PanelManager();

		Project.scene.createLayer();
		//Project.scene.createLayer("rightMenu", "gui");
		Project.scene.createLayer("test2");

		Project.context.shadowColor = DEFAULT_SHADOW_COLOR;
		Project.input.initListeners(Project.canvas);

		//if(typeof Sharer !== KEYWORD_UNDEFINED){
		//	chatViewer = new ChatViewer(Project.title + "'s chat", Project.autor, sendMessage);
		//}

		Layers = new LayersViewer({element: G.byId("layerViewerPlaceholder"), visible: Components.layers()});
		//Project.scene.addToScene(Layers, "rightMenu");
        let xOffset = Project.topMenu.position.x + (Project.topMenu.size.x + MENU_OFFSET) * Project.topMenu.visibleElements - MENU_OFFSET;
		Creator.view = new CreatorViewer(new GVector2f(Project.topMenu.visible ? xOffset : MENU_OFFSET, Project.topMenu.position.y - MENU_OFFSET));

		console.log("stranka sa nacítala za: ", (Date.now() - glob.initTime) + " ms");
			
		draw();


		if(ASK_FOR_RESTORE_DATA && localStorage.hasOwnProperty(RESTORE_KEY)){
            let data = JSON.parse(localStorage.getItem(RESTORE_KEY));
			if(Date.now() - data.unloadTime < LIMIT_MAXIMUM_LOCAL_DATA_TIME){
				if(confirm(getMessage(MSG_LOAD_OLD_PROJECT))){
					Project.fromObject(data);
					/*
					Paints.fromObject(data.paint);
					Project.scene.fromObject(data.scene);
					Project.creator.fromObject(data.creator);
					Project.options.fromObject(data.options);
					*/
				}
			}
		}

	}
	catch(e){
		console.log(e);
		Logger.exception(getMessage(MSG_LOADING_ERROR), e);
	}
};

//$(loading);
function realPDraw(){
	Project.canvasManager.pCanvas.clearCanvas();
	if(Project.connection){
		Project.connection.pdraw(pcontext);
	}
	Project.scene.pdraw(pcontext);
}

function realDraw(){
	try{
		if((typeof Watcher !== KEYWORD_UNDEFINED && !Watcher.connected) || !Project.context || !isObject(Project.context)){
			return;
		}
		Project.increaseDrawCounter();
		CanvasHandler.clearCanvas(Project.context);
		if(Project.options.grid){
			glob.drawGrid();
		}

		if(Creator.operation == OPERATION_AREA && area){
			area.draw();
		}

		Project.scene.draw();
		Creator.draw();
		Project.topMenu.draw();
		if(actContextMenu){
			actContextMenu.draw();
		}
		Logger.log("kreslí sa všetko", LOGGER_DRAW);
		if(typeof timeLine !== KEYWORD_UNDEFINED && timeLine){
			timeLine.draw();
		}
	}
	catch(e){
		Logger.exception(getMessage(MSG_ERROR_DRAW), e);
	}
	/*
	Project.context.font = "30px " + DEFAULT_FONT_FAMILY;
	Project.context.fillStyle = "red";
	Project.context.fillText("draw(ms): " + (new Date().getMilliseconds() - drawMousePos), window.innerWidth - 100, 15);
	*/
}