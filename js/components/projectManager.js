/*
	compatible:	Date.now, geolocation, JSON parsing 14.9.2016
	JShint 4.2.2017
*/
class ProjectManager{
	constructor(author, title = PROJECT_NAME){
		this._createdAt 	= Date.now();
		this._title 		= title;
		this._autor			= author;
		this._scene 		= new SceneManager();
		this._options 		= new OptionsManager();
		this._input 		= new InputManager();
		this._gui 			= new GuiManager();
		this._panel			= null;
		this._files 		= new FileManager();
		this._content 		= new ContentManager();
		this._listeners 	= new ListenersManager();
		this._analyzer 		= new Analyzer(URL_ANONYM_DATA);
		this._canvasManager = null;
		this._connection 	= null;
		this._drawCounter 	= 0; //pocita kolko krat sa vykreslila obrazovka
		this._idCounter 	= 0;
        this._pressedKeys   = 0;
        this._clickCounter  = 0;
        this._objectCreated = 0;
        this._objectRemoved = 0;
        this._mouseMoves	= 0;

		try{
			if(isFunction(ConnectionManager)){
				this._connection = new ConnectionManager();
			}
		}
		catch(e){
			Logger.exception(getMessage(MSG_CREATE_PROJECT_ERROR), e);
		}

		//PAINT_MANAGER
		//CREATOR
		//TYPE 
		//ALLOWED_COMPONENTS
		
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);

		this._analyzer.sendData();

		if(glob.getCookie("send_data") === ""){
	        glob.setCookie("send_data", 1);
	    }
	}

	fromObject(obj){
		obj.paint && Paints.fromObject(obj.paint);
		obj.scene && this.scene.fromObject(obj.scene);
		obj.creator && this.creator.fromObject(obj.creator);
		obj.options && this.options.fromObject(obj.options);

		this._title = obj.title;
		this._autor = obj.autor;
	}

	toObject(param = {}){
        let result = {
			unloadTime: Date.now(),
			title : this._title,
			autor: this._autor
		};
		if(param.scene !== false){
			result.scene = this.scene.toObject();
		}
		if(param.creator !== false){
			result.creator = this.creator.toObject();
		}
		if(param.paint !== false){
			result.paint = Paints.toObject();
		}
		if(param.options !== false){
			result.options = this.options.toObject();
		}

		return result;
	}

	initCanvas(){
		this._canvasManager = new CanvasManager(window.innerWidth, window.innerHeight);
	}

	setForm(data){
		this._form = new FormManager(data);
	}

	generateId(){
        let s = "000000000" + (this._idCounter++);
		return (this._connection ? this._connection.userId : "") + s.substr(s.length - 6);
	}

	mouseDown(){this._clickCounter++;}
    keyDown(){this._pressedKeys++;}
    mouseMove(){this._mouseMoves++;}
    createObject(){this._objectCreated++;}
    removeObject(){this._objectRemoved++;}

    get analyzeData(){
		return {
			mouseDowns: this._clickCounter,
            keyDowns: this._pressedKeys,
            mouseMoves: this._mouseMoves,
			objectsCreated: this._objectCreated,
			objectsRemoved: this._objectRemoved,
			draws: this._drawCounter,
			actualId: this._idCounter,
			time: Date.now() - this._createdAt
		};
	}

	showStat(){
        let data = this.analyzeData;
        let message = "clicks: " + data.mouseDowns+ "\n";
        message += "keys: " + data.keyDowns + "\n";
        //message += "moves: " + data.mouseMoves + "\n";
        message += "created: " + data.objectsCreated + "\n";
        message += "removed: " + data.objectsRemoved + "\n";
        message += "draws: " + data.draws+ "\n";
        message += "actual id: " + data.actualId + "\n";
        message += "time: " + data.time + "\n";
        alert(message);
	}

	get autor(){return this._autor;}
	get canvas(){return this._canvasManager && this._canvasManager.canvas.canvas;}
	get canvasManager(){return this._canvasManager;}
	get connection(){return this._connection;}
	get content(){return this._content;}
	get context(){return this._canvasManager && this._canvasManager.canvas.context;}
	get creator(){return this._scene.creator;}
	get drawCounter(){return this._drawCounter;}
	get files(){return this._files;}
	get form(){return this._form;}
	get gui(){return this._gui;}
	get input(){return this._input;}
	get isMobile(){return this._analyzer.isMobile;}
	get listeners(){return this._listeners;}
	get options(){return this._options;}
	get panel(){return this._panel;}
	get runOnMobile(){return this._browserData.mobile > 0;}
	get scene(){return this._scene;}
	get time(){return Date.now() - this._createdAt; }
	get title(){return this._title;}
	get topMenu(){return this._gui.menu;}

	increaseDrawCounter(){
		this._drawCounter++;
	}

	set autor(val){this._autor = val;}
}