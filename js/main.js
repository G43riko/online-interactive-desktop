/*
 compatible: indexOf, canvas, canvasText, JSON parsing 14.9.2016
 */

glob.initTime   = Date.now();

let movedObject     = false,
    Logger          = new LogManager(),//samostatne lebo loguje aj Projekt preto nie v ňom
    Project         = new ProjectManager(PROJECT_AUTHOR),
    Scene           = Project.scene,
    Creator         = Project.creator,
    Input           = Project.input,
    selectedObjects = Project.scene.objectManager,
    Menu            = Project.topMenu,
    actContextMenu  = false,//TODO presunuť do noveho objektu na spravu GUI
    Paints          = new PaintManager(),
    Task            = null,//TODO presunúť do nejakého CONTENTU
    Events          = typeof EventManager !== KEYWORD_UNDEFINED ? new EventManager() : null,
    SelectedText    = null,
    Options         = Project.options,
    drawEvent       = new EventTimer(realDraw, 1000 / FPS),
    pdrawEvent      = new EventTimer(realPDraw, 1000 / FPS),
    area            = null,
    Panel           = null,
    Connection      = Project.connection,
    draw            = () => drawEvent.callIfCan(),
    pdraw           = () => pdrawEvent.callIfCan(),
    //pcanvas, pcontext, drawMousePos, chatViewer,
    components, Layers, canvas, context, timeLine;


//Gui           = Project.gui,
//Forms         = null,
//Listeners     = Project.listeners,
//EventHistory  = new EventSaver(),
//Content           = new ContentManager(),//TODO presunúť do nejakého CONTENTU
//Files         = new FileManager(),//TODO presunúť do nejakého CONTENTU
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
    draw    : () => isDefined(components) && isDefined(components.draw) && components.draw === true,
    share   : () => isDefined(components) && isDefined(components.share) && components.share === true,
    watch   : () => isDefined(components) && isDefined(components.watch) && components.watch === true,
    tools   : () => isDefined(components) && isDefined(components.tools) && components.tools === true,
    save    : () => isDefined(components) && isDefined(components.save) && components.save === true,
    load    : () => isDefined(components) && isDefined(components.load) && components.load === true,
    screen  : () => isDefined(components) && isDefined(components.screen) && components.screen === true,
    content : () => isDefined(components) && isDefined(components.content) && components.content === true,
    layers  : () => isDefined(components) && isDefined(components.layers) && components.layers === true,
    task    : () => isDefined(components) && isDefined(components.task) && components.task === true,
    edit    : () => isDefined(components) && isDefined(components.edit) && components.edit === true
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

glob.tests = function(){
    //spracovanie formularu pre uloženie obrazku
    processImageData({test: true});

    //Rect, Line, Arc, Polygon, Table, Class
    this.init();
};

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
        shareForm   : "sharingForm",
        optionsForm : "optionsForm",
        watchForm   : "watchForm",
        saveXmlForm : "saveXmlForm",
        saveForm    : "saveImgForm"
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
    //  testCompatibility();
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
        //  Connection = new ConnectionManager();
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
        //  chatViewer = new ChatViewer(Project.title + "'s chat", Project.autor, sendMessage);
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

    let query = glob.queryString();

    if(query.demo === "b"){
        Examples.Distance();
    }
    else if(query.demo === "a"){
        Examples.Newton();
    }
    else if(query.demo === "c"){
        glob.initGraphs();
    }
};

function realPDraw(){
    CanvasHandler.clearCanvas(pcontext);
    //Project.canvasManager.pCanvas.clearCanvas();
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

let Examples = {
    Newton: (data = {mintWidth: 1000, minHeight: 650}) => {
        /********INIT********/
        let floorHeight = data.floorHeight || 555,
            angle = 45,
            layerName = data.layerName || "Physics task #1",
            rockWeight = data.rockWight || 20;
        let person      = new ImageObject(new GVector2f(450, floorHeight - 255), new GVector2f(100, 250), "img/examples/pulling.jpg");
        let floor       = new Line([new GVector2f(0, floorHeight), new GVector2f(window.innerWidth, floorHeight)], 10, "black");
        let rock        = new Rect(new GVector2f(800, floorHeight - 55), new GVector2f(100, 50), "#ffffff");
        let hint        = new Rect(new GVector2f(50, 150), new GVector2f(100, 50), "#ffffff");
        let connector   = new Line([new GVector2f(), new GVector2f()], 2, "#000000");
        let arrowMG     = new Line([new GVector2f(), new GVector2f()], 3, "blue");
        let arrowFN     = new Line([new GVector2f(), new GVector2f()], 3, "blue");
        let arrowFK     = new Line([new GVector2f(), new GVector2f()], 3, "blue");
        Scene.storeItem("person", person);
        Scene.storeItem("floor", floor);
        Scene.storeItem("rock", rock);
        Scene.storeItem("hint", hint);
        Scene.storeItem("connector", connector);
        Scene.storeItem("arrowMG", arrowMG);
        Scene.storeItem("arrowFN", arrowFN);
        Scene.storeItem("arrowFK", arrowFK);

        /********ARROWS********/
        Entity.changeAttr(Scene.getItem("arrowMG"), {
            visible : false,
            fontColor : "black",
            arrowEndType: LINE_END_ARROW_CLASSIC
        }).setCenterText("m.g");

        Entity.changeAttr(Scene.getItem("arrowFN"), {
            visible : false,
            fontColor : "black",
            arrowEndType: LINE_END_ARROW_CLASSIC
        }).setCenterText("Fn");

        Entity.changeAttr(Scene.getItem("arrowFK"), {
            visible : false,
            fontColor : "black",
            arrowEndType: LINE_END_ARROW_CLASSIC
        }).setCenterText("Fk");

        /********PERSON********/

        Scene.getItem("person").addDrawFunction("drawHeight", function(ctx){
            let positionX = this.position.x - 20;
            doLine({
                points: [positionX, this.position.y + (this.size.y >> 1), positionX, this.position.y + this.size.y],
                borderWidth: this.borderWidth,
                borderColor: "black",
                ctx: ctx
            });
            doText({
                textHalign: FONT_HALIGN_RIGHT,
                fontSize: 15,
                fontColor: "black",
                text: (this.size.y >> 1) + "CM",
                x: positionX,
                y: this.position.y + (this.size.y >> 2) * 3,
                ctx: ctx
            });
        });

        Entity.changeAttr(Scene.getItem("person"), {
            selectors: {tc: 1},
            movementType: MOVEMENT_HORIZONTAL,
            onChange: function(){
                if(this.position.x < 80){
                    this.position.x = 80;
                }

                if(this.position.x > Scene.getItem("rock").position.x - 150){
                    this.position.x = Scene.getItem("rock").position.x - 150;
                }

                let pos = Scene.getItem("connector").positionB.getClone().sub(Scene.getItem("connector").positionA);
                angle = Math.atan2(pos.y, pos.x);

                Scene.getItem("connector").setCenterText(Scene.getItem("connector").positionA.dist(Scene.getItem("connector").positionB).toFixed(2) + "cm");
            }
        }).change();

        /********HINT********/
        Entity.changeAttr(Scene.getItem("hint"), {
            movementType: MOVEMENT_NONE,
            selectable: false
        });

        (function(){
            let hintCounter = 0;
            let texts = ["Hint", "Hint2", "Hint3"];
            Scene.getItem("hint").onClick = function(){
                hintCounter++;
                if(hintCounter === 1){
                    let rockCenter = Scene.getItem("rock").center;
                    Scene.getItem("arrowMG").positionB.set(rockCenter);
                    Scene.getItem("arrowMG").positionA.set(Scene.getItem("arrowMG").positionB.x, Scene.getItem("arrowMG").positionB.y + 100);
                    Entity.changeAttr(Scene.getItem("arrowMG"), {visible: true});

                    Scene.getItem("arrowFK").positionB.set(Scene.getItem("rock").position.getClone().add(Scene.getItem("rock").size));
                    Scene.getItem("arrowFK").positionA.set(Scene.getItem("arrowFK").positionB.x + 100, Scene.getItem("arrowFK").positionB.y - 5);
                    Scene.getItem("arrowFK").positionB.y -= 5;
                    Entity.changeAttr(Scene.getItem("arrowFK"), {visible: true});

                    Scene.getItem("arrowFN").positionB.set(rockCenter.add(10));
                    Scene.getItem("arrowFN").positionA.set(Scene.getItem("arrowFN").positionB.x, Scene.getItem("arrowFN").positionB.y - 100);
                    Entity.changeAttr(Scene.getItem("arrowFN"), {visible: true});
                }
                else if(hintCounter === 2){
                    let formula = new TextField("Fn + Fk + FT + G = 0", new GVector2f(window.innerWidth - 350, 160), new GVector2f(45));
                    Project.scene.addToScene(Entity.changeAttr(formula, {
                        locked: true,
                        onResize: () => formula.position.x = window.innerWidth - 350
                    }), "Physics task #1");
                }
                else if(hintCounter === 3){
                    each(["Fk = Trecia sila", "m = Hmotnosť", "g = gravitácia"], (e, i) => {
                        let formula = new TextField(e, new GVector2f(window.innerWidth - 350, 240 + i * 60), new GVector2f(45));
                        Project.scene.addToScene(Entity.changeAttr(formula, {
                            locked: true,
                            onResize: () => formula.position.x = window.innerWidth - 350
                        }), "Physics task #1");
                    });
                }
                if(hintCounter === texts.length){
                    Entity.changeAttr(this, {
                        fillColor: "#adadad",
                        locked: true,
                        onClick: null
                    });
                }
            };
            Scene.getItem("hint").addDrawFunction("drawWeight", function(ctx){
                doText({
                    textHalign: FONT_HALIGN_CENTER,
                    textValign: FONT_VALIGN_MIDDLE,
                    fontSize: 20,
                    text: texts[hintCounter % 3],
                    x: Scene.getItem("hint").position.x + (Scene.getItem("hint").size.x >> 1),
                    y: Scene.getItem("hint").position.y + (Scene.getItem("hint").size.y >> 1),
                    ctx: ctx
                });
            });
        })();

        /********ROCK********/
        Scene.getItem("rock").addDrawFunction("drawWeight", function(ctx){
            doText({
                textHalign: FONT_HALIGN_CENTER,
                textValign: FONT_VALIGN_MIDDLE,
                fontSize: 20,
                text: rockWeight + "KG",
                x: this.position.x + (this.size.x >> 1),
                y: this.position.y + (this.size.y >> 1),
                ctx: ctx
            });
        });

        Scene.getItem("rock").addDrawFunction("drawAngle", function(ctx){
            doText({
                textHalign: FONT_HALIGN_RIGHT,
                fontSize: 10,
                text: (angle * 180 / Math.PI).toFixed(2) + "°",
                x: this.position.x - 3,
                y: this.position.y + this.size.y - 5,
                ctx: ctx
            });

            //je tu toto a nie doArc lebo chcem aj začiatočnú čiaru
            CanvasHandler.setLineDash(ctx);
            ctx.lineWidth = DEFAULT_BORDER_WIDTH;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y + (this.size.y >> 1));
            ctx.arc(this.position.x, this.position.y + (this.size.y >> 1), 40, Math.PI, Math.PI + angle);
            ctx.stroke();
        });

        Entity.changeAttr(Scene.getItem("rock"), {
            movementType: MOVEMENT_HORIZONTAL,
            selectors: {},
            onChange: function(){
                if(this.position.x > window.innerWidth - 105){
                    this.position.x = window.innerWidth - 105;
                }
                if(this.position.x < Scene.getItem("person").position.x + 150){
                    this.position.x = Scene.getItem("person").position.x + 150;
                }

                let pos = Scene.getItem("connector").positionB.getClone().sub(Scene.getItem("connector").positionA);
                let rockCenter = this.center;

                angle = Math.atan2(pos.y, pos.x);

                Scene.getItem("arrowFN").positionA.x = Scene.getItem("arrowFN").positionB.x = rockCenter.x + 10;
                Scene.getItem("arrowMG").positionA.x = Scene.getItem("arrowMG").positionB.x = rockCenter.x;

                Scene.getItem("arrowFK").positionA.x = this.position.x + this.size.x + 100;
                Scene.getItem("arrowFK").positionB.x = this.position.x + this.size.x;


                Scene.getItem("connector").setCenterText(Scene.getItem("connector").positionA.dist(Scene.getItem("connector").positionB).toFixed(2) + "cm");
            }
        }).change();

        /********OTHERS********/
        let result = new TextField("Vaša odpoveď", new GVector2f(400, 160), new GVector2f(45));
        let text = new TextField("Akou silou musí pôsobiť Fridrich na kváder aby ním pohol?", new GVector2f(50, 100), new GVector2f(45));

        Entity.changeAttr(result, {taskResult: "gabo"});
        Entity.changeAttr(text, {locked: true});
        Entity.changeAttr(Scene.getItem("floor"), {
            locked : true,
            onResize: () => this.positionB.set(window.innerWidth, floorHeight)
        });
        Entity.changeAttr(Scene.getItem("connector"), {locked: true});

        /********APPEND********/
        Project.scene.createLayer(layerName, LAYER_TASK);
        Project.scene.addToScene([
        	text,
			Scene.getItem("hint"),
			Scene.getItem("connector"),
			Scene.getItem("person"),
			Scene.getItem("rock"),
			Scene.getItem("floor"),
			Scene.getItem("arrowMG"),
			Scene.getItem("arrowFK"),
			Scene.getItem("arrowFN"),
			result
		], layerName);

        //toto musí byť až za pridanim všetkych veci do sceny aby sa nastavila spravna vrstva
        Scene.getItem("connector").connectATo(Scene.getItem("person"), 3);
        Scene.getItem("connector").connectBTo(Scene.getItem("rock"), 2);
        draw();
    },
    Distance: () => {
        /********INIT********/
        let floorHeight = 505, rockHeight = 200, angle = 0;
        let floor       = new Line([new GVector2f(0, floorHeight), new GVector2f(window.innerWidth, floorHeight)], 10, "black");
        let rock        = new Rect(new GVector2f(0, floorHeight - rockHeight - 5), new GVector2f(300, rockHeight), "#ffffff");
        let direction   = new Line([new GVector2f(275, 225), new GVector2f(500, 150)], 2, "#000000");
        let person      = new ImageObject(new GVector2f(200, floorHeight - rockHeight - 155), new GVector2f(80, 150), "img/examples/throwing.png");

        /********PERSON********/
        Entity.changeAttr(person, {
            locked: true,
            borderColor: undefined,
            borderWidth: undefined
        });

        /********FLOOR********/

        Entity.changeAttr(floor, {
            locked: true
        });

        /********DIRECTION********/
        direction.setCenterText("4N");

        direction.addDrawFunction("drawPower", function(ctx){
            ctx.strokeStyle = "#000000";
            CanvasHandler.setLineDash(ctx, []);
            ctx.beginPath();
            ctx.moveTo(direction.points[0].x, direction.points[0].y);
            ctx.arc(direction.points[0].x, direction.points[0].y, 80, 0, Math.PI + angle, angle > 0);
            ctx.stroke();
        });

        direction.addDrawFunction("drawAngle", function(ctx){
            doText({
                //textHalign: FONT_HALIGN_RIGHT,
                fontSize: 10,
                text: (angle * 180 / Math.PI).toFixed(2) + "°",
                x: direction.points[0].x + 25,
                y: direction.points[0].y + 25,
                ctx: ctx
            });
        });
        (function(){
            let gravitySteps = 50, gravityEffect = 1, gravityPoints = [];
            for(let i=0 ; i<gravitySteps ; i++){
                gravityPoints[gravityPoints.length] = new GVector2f();
            }
            direction.addDrawFunction("drawGravity", function(ctx){
                doLine({
                    points: gravityPoints,
                    borderWidth: 1,
                    lineDash: [15, 5],
                    borderColor: "#000000",
                })
            });

            Entity.changeAttr(direction, {
                arrowStartType: LINE_END_ARROW_CLASSIC,
                selectable: false,
                editable: false,
                onChange: function(){
                    let pos = direction.positionA.getClone().sub(direction.positionB);

                    direction.setCenterText((pos.length() / 100).toFixed(2) + "N");
                    angle = Math.atan2(pos.y, pos.x);

                    //CALC gravity
                    gravityPoints[0].set(direction.positionA);

                    pos = direction.positionB.getClone().sub(direction.positionA).div(10);
                    let actPos = gravityPoints[0].getClone();

                    for(let i=1 ; i<gravitySteps ; i++){
                        actPos.add(pos);
                        pos.y += gravityEffect;

                        gravityPoints[i].set(actPos.x, actPos.y);
                    }
                }
            }).change();
        })();

        /********APPEND********/

        Project.scene.addToScene([direction, person, rock, floor]);
        direction.connectATo(person, 3);
        draw();
    }
};