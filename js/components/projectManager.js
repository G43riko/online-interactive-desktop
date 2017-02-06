/*
	compatible:	Date.now, geolocation, JSON parsing 14.9.2016
	JShint 4.2.2017
*/
class ProjectManager{
	constructor(author, title = PROJECT_NAME){
		this._createdAt = Date.now();
		this._title = title;
		this._autor = author;
		this._idCounter = 0;
		this._scene = new SceneManager();
		this._options = new OptionsManager();
		this._input = new InputManager();
		this._gui = new GuiManager();
		this._canvasManager = null;
		this._drawCounter = 0;
		this._connection = null;
		this._analyzer = new Analyzer(URL_ANONYM_DATA);

		try{
			if(typeof ConnectionManager === "function"){
				this._connection = new ConnectionManager();
			}
		}
		catch(e){
			Logger.exception("Nastala chyba pri vytváraní pripojenia", e);
		}

		//PAINT_MANAGER
		//CREATOR
		//TYPE 
		//ALLOWED_COMPONENTS
		
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);

		this._analyzer.sendData();

		if(getCookie("send_data") === ""){
	        setCookie("send_data", 1);
	    }
	}

	initCanvas(){
		this._canvasManager = new CanvasManager(window.innerWidth, window.innerHeight);
	}

	generateId(){
		var s = "000000000" + (this._idCounter++);
		return (this._connection ? this._connection.userId : "") + s.substr(s.length - 6);
	}

	get input(){return this._input;}
	get canvasManager(){return this._canvasManager;}
	get canvas(){return this._canvasManager && this._canvasManager.canvas.canvas;}
	get context(){return this._canvasManager && this._canvasManager.canvas.context;}
	get drawCounter(){return this._drawCounter;}
	get creator(){return this._scene.creator;}
	get scene(){return this._scene;}
	get gui(){return this._gui;}
	get topMenu(){return this._gui.menu;}
	get options(){return this._options;}
	get connection(){return this._connection;}
	get runOnMobile(){return this._browserData.mobile > 0;}

	increaseDrawCounter(){
		this._drawCounter++;
	}

	set autor(val){this._autor = val;};

	get isMobile(){return this._analyzer.isMobile;}

	get title(){return this._title;}
	get autor(){return this._autor;}

	get time(){return Date.now() - this._createdAt; }
}