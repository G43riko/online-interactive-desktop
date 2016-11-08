/**
 * Created by Gabriel on 29. 10. 2016.
 */

class ConnectionManager{
	constructor(){
		this._user_id = false;
		this._socket = false;
		this.paint = {
			addPoint: (point, layer) => this._paintAction(ACTION_PAINT_ADD_POINT, point, layer),
			breakLine: (layer) => this._paintAction(ACTION_PAINT_BREAK_LINE, layer),
			clean: (layer) => this._paintAction(ACTION_PAINT_CLEAN, layer),
			addPath: (layer, path) => this._paintAction(ACTION_PAINT_ADD_PATH, layer, path)
		};
		this.object = {
			move: (object) => this._objectAction(ACTION_OBJECT_MOVE, object),
			change: (object, keys) => this._objectAction(ACTION_OBJECT_CHANGE, object, keys),
			delete: (object) => this._objectAction(ACTION_OBJECT_DELETE, object),
			create: (object) => this._objectAction(ACTION_OBJECT_CREATE, object)
		};
		this.input = {
			mouseMove: (dir, pos) => this._inputAction(ACTION_MOUSE_MOVE, dir, pos),
			mouseDown : (key, pos) => this._inputAction(ACTION_MOUSE_DOWN, key, pos),
			mouseUp : (key, pos) => this._inputAction(ACTION_MOUSE_UP, key, pos),
			keyDown : (key) => this._inputAction(ACTION_KEY_DOWN, key),
			keyUp : (key) => this._inputAction(ACTION_KEY_UP, key)
		};
		this._sharing = false;
		this._sender = new EventTimer(e => this._sendStack(), 1000);
		this._buffer = [];
		var inst = this;
		$.post("/create", {content: JSON.stringify({meno:"gabriel"})}, function(data){
			inst._user_id = data["cookies"]["user_id"];
		}, "json");

		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	/*********************
	 * INITIALIZATIONS
	 ********************/
	startShare(data){
		data["type"] = "share";
		this._connect(data);
	}

	startTeach(data){
		data["type"] = "teach";

		this._connect(data);
	}

	startWatch(data){
		data["type"] = "watch";

		if(isUndefined(data["less_id"])){
			Logger.error("nieje zadane less_id");
			return false;
		}

		this._connect(data);
	}

	startExercise(data){
		data["type"] = "exercise";

		if(isUndefined(data["less_id"])){
			Logger.error("nieje zadane less_id");
			return false;
		}

		this._connect(data);
	}

	_connect(data){
		this._socket = io();
		this._startTime = Date.now();
		this._type = data["type"];

		data["resolution"] = window.innerWidth + "_" + window.innerHeight;
		var inst = this;

		this._sharePaints = data["sharePaints"];
		this._shareInput = data["shareInput"];
		this._shareCreator = data["shareCreator"];
		this._shareObjects = data["shareObjects"];
		this._maximalWatchers = data["maxWatchers"];

		this._socket.on('confirmConnection', function(response) {
			inst._less_id = response["data"]["less_id"];
			inst._connectTime = Date.now();
			inst._messageTime = Date.now();
			if(inst._type === "watch" || inst._type === "teach"){
				if(inst._type === "watch")
					Scene.initSecondCanvas();
				inst._watching = true;
				inst._sendMessage("requireAllData", {target: inst._user_id});
			}
			else{
				inst._sharing = true;
			}
		});

		this._socket.on('receivedBuffer', function(response) {

			inst._processStack(response);
		});

		this._socket.on('errorLog', function(response) {
			Alert.danger(response.msg);
		});

		this._socket.on("notifLog", function(response){
			Logger.notif(response.msg);
		});

		this._socket.emit("initConnection", data);
	}

	disconnect(){
		if(isFunction(Menu.disabled)){
			Menu.disabled("sharing", "watch");
			Menu.disabled("sharing", "stopShare");
			Menu.disabled("sharing", "shareOptions");
			Menu.disabled("sharing", "copyUrl");
			Menu.disabled("sharing", "startShare");
		}
		this._user_id = false;
		this._socket.disconnect();
		this._socket = false;
		this._sharing = false;
		this._wathing = false;

		Panel.stopShare();
	}

	/*********************
	 * MESSAGES
	 ********************/
	 _processInputAction(data){

	 }
	 
	_processStack(data){
		console.log("prijaty buffer po: " + (Date.now() - this._messageTime));
		this._messageTime = Date.now();
		var inst = this;
	 	each(data.buffer, function(e){
			//console.log("prijata akcia:" + e["action"]);
			switch(e["action"]){
				case "requireAllData" :
					Handler.processRequireAllData(inst, e["data"]);
					break;
				case "sendAllData" :
					Handler.processSendAllData(e["data"]);
					break;
				case "paintAction" :
					Handler.processPaintAction(e["data"]);
					break;
				case "inputAction" :
					inst._processInputAction(e["data"]);
					break;
				case "creatorAction" :
					Creator.setOpt(e["data"]["key"], e["data"]["value"]);
					draw();
					break;
				case "objectAction" :
					Handler.processObjectAction(e["data"]);
					break;
				default:
					Logger.error("neznáma akcia: " + e["action"]);
			}
	 	});
	}

	_sendStack(){
		if(!this._socket || this._socket.disconnected)
			return;
		if(this._buffer.length === 0){
			return false;
		}
		var result = {
			buffer: this._buffer, 
			user_id: this._user_id
		};
		if(this._less_id)
			result["less_id"] = this._less_id;
		this._socket.emit("sendBuffer", result);
		this._buffer = [];
	}

	_sendMessage(action, data){
		//console.log("odosiela sa akcia: ", action);
		this._buffer.push({action: action, time: Date.now(), data: data});
		this._sender.callIfCan();
	}

	/*********************
	 * UTILS
	 ********************/
	_draw(){
		var canvas = Scene.getSecondCanvas();
		if(!canvas)
			return;

		this._mouseData = data;
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		doArc({
			x: this._mouseData.posX,
			y: this._mouseData.posY,
			fillColor: "rgba(255,0,0,0.1)",
			width: 40,
			height: 40,
			center: true,
			ctx: this._context
		})
	}
	/*********************
	 * ACTIONS
	 ********************/
	creatorChange(key, value){
		if(!this._socket || !this._shareCreator || this._watching)
			return;

		var data = {
			key: key,
			value: value
		};
		this._sendMessage('creatorAction', data);

	}
	_objectAction(type, object, keys){
		if(!this._socket || !this._shareObjects)
			return;
		var data = {
			action: type
		};
		switch(type){
			case ACTION_OBJECT_MOVE:
				data["oId"] = object.id;
				data["oL"] = object.layer;
				data["oX"] = object.position.x;
				data["oY"] = object.position.y;
				data["oW"] = object.size.x;
				data["oH"] = object.size.y;
				break;
			case ACTION_OBJECT_CHANGE:
				data["oId"] = object.id;
				data["oL"] = object.layer;
				data["keys"] = {};
				each(keys, (e, i) => data.msg.keys["i"] = object[i]);
				break;
			case ACTION_OBJECT_DELETE:
				data["oId"] = object.id;
				data["oL"] = object.layer;
				break;
			case ACTION_OBJECT_CREATE:
				data["o"] = object;
				break;
			default:
				Logger.error(type, 2);
				return;
		}
		this._sendMessage('objectAction', data);
	}

	/**
	 * @param type
	 * @param param1 key, direction
	 * @param param2 position
	 * @private
	 */
	_inputAction(type, param1, param2){
		if(!this._socket || !this._shareInput)
			return false;

		var data = {
			type: type
		};

		switch(type){
			case ACTION_KEY_DOWN :
				data["key"] = param1;
				break;
			case ACTION_KEY_UP :
				data["key"] = param1;
				break;
			case ACTION_MOUSE_DOWN :
				data["key"] = param1;
				data["position"] = param2;
				break;
			case ACTION_MOUSE_UP :
				data["key"] = param1;
				data["position"] = param2;
				break;
			case ACTION_MOUSE_MOVE :
				data["direction"] = param1;
				data["position"] = param2;
				break;
			default :
				Logger.error(type, 1);
		}
		this._sendMessage('inputAction', data);
	}

	_paintAction(type, arg1, arg2){
		if(!this._socket || !this._sharePaints)
			return false;

		var data = {
			action: type
		};
		switch(type){
			case ACTION_PAINT_ADD_POINT :
				data["pX"] = arg1.x;
				data["pY"] = arg1.y;
				data["layer"] = arg2;
				break;
			case ACTION_PAINT_BREAK_LINE :
				data["layer"] = arg1;
				break;
			case ACTION_PAINT_CLEAN :
				data["layer"] = arg1;
				break;
			case ACTION_PAINT_ADD_PATH :
				data["layer"] = arg1;
				data["path"] = arg2;
				break;
			case ACTION_PAINT_REMOVE_PATH :
				data["layer"] = arg1;
				break;
			default:
				Logger.error(type, 3);
				return;
		}
		this._sendMessage('paintAction', data);
	}

	/*********************
	 * GETTERS
	 ********************/

	get userId(){
		return this._user_id;
	}

	get sharing(){
		return this._sharing;
	}
	get watching(){
		return this._watching;
	}
}

class Handler{
	static processRequireAllData(inst, data){
		var result = {
			msg: {
				scene: Scene.toObject(),
				creator: Creator.toObject(),
				paint: Paints.toObject()
			},
			target: data["target"]
		};
		//Panel.addWatcher(recData.nickName);
		//inst._actualWatchers.push(recData.nickName);
		inst._sendMessage('sendAllData',result);
	}

	static processSendAllData(data){
		var shareOptions = data.shareOptions;
		var watchOptions = data.watchOptions;

		if(shareOptions.share.objects)
			Scene.fromObject(data.scene);
		if(shareOptions.share.creator)
			Creator.fromObject(data.creator);
		if(shareOptions.share.paints)
			Paints.fromObject(data.paint);


		if(watchOptions.show.chat){
			/*
			 chatViewer = new ChatViewer(Project.title + "'s chat", watchOptions.nickName, sendMessage);
			 chatViewer.show();
			 */
			Panel.startWatch(sendMessage);
		}

		if(watchOptions.show.timeLine)
			timeLine = new TimeLine();

		Project.autor = watchOptions.nickName;

		console.log("nastavuje sa", data);
		Menu.visible = shareOptions.share.menu;
		Creator.visibleView = shareOptions.share.menu;
		Options.setOpt("showLayersViewer", shareOptions.share.layers);
	}

	static processObjectAction(data){
		var obj;
		switch(data.action){
			case ACTION_OBJECT_MOVE:
				obj = Scene.get(data.oL, data.oId);
				obj.position.set(data.oX, data.oY);
				obj.size.set(data.oW, data.oH);
				break;
			case ACTION_OBJECT_DELETE:
				Scene.remove(Scene.get(data.oL, data.oId), data.oL, false);
				break;
			case ACTION_OBJECT_CHANGE:
				obj = Scene.get(data.oL, data.oId);
				each(data.keys, (e, i) => obj[i] = e);
				break;
			case ACTION_OBJECT_CREATE:
				Creator.create(data.o);
				break;
			default :
				Logger.error("bola prijatá neznáma akcia: " + data.action);
		}
		draw();
	}

	static processPaintAction(data){
		switch(data.action){
			case ACTION_PAINT_ADD_POINT :
				Paints.addPoint(new GVector2f(data["pX"], data["pY"]), data["layer"]);
				break;
			case ACTION_PAINT_BREAK_LINE :
				Paints.breakLine(data["layer"]);
				break;
			case ACTION_PAINT_CLEAN :
				Paints.clean(data["layer"]);
				break;
			case ACTION_PAINT_ADD_PATH :
				Paints.addPath(data["layer"], data["path"]);
				break;
			default :
				Logger.error("bola prijatá neznáma akcia: " + data["action"]);
		}
		draw();
	}
}

