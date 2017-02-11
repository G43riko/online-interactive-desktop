/**
 * Created by Gabriel on 29. 10. 2016.
 */

class ConnectionManager{
	constructor(){
		this._socket 			= false;
		this._user_id 			= false;
		this._user_name 		= PROJECT_AUTHOR;
		this._connectedUsers 	= {};
		this._sharing 			= false;
		this._sender 			= new EventTimer(e => this._sendStack(), CONNECTION_LOOP_TIME);
		this._buffer 			= [];

		this.paint = {
			addPoint 	: (pos, layer)	=> this._paintAction(ACTION_PAINT_ADD_POINT, pos, layer),
			breakLine 	: (layer)		=> this._paintAction(ACTION_PAINT_BREAK_LINE, layer),
			clean 		: (layer)		=> this._paintAction(ACTION_PAINT_CLEAN, layer),
			addPath 	: (layer, path) => this._paintAction(ACTION_PAINT_ADD_PATH, layer, path)
		};
		this.object = {
			move 		: (obj)			=> this._objectAction(ACTION_OBJECT_MOVE, obj),
			change 		: (obj, keys)	=> this._objectAction(ACTION_OBJECT_CHANGE, obj, keys),
			delete 		: (obj)			=> this._objectAction(ACTION_OBJECT_DELETE, obj),
			create 		: (obj)			=> this._objectAction(ACTION_OBJECT_CREATE, obj)
		};
		this.input = {
			mouseMove 	: (dir, pos) 	=> this._inputAction(ACTION_MOUSE_MOVE, dir, pos),
			mouseDown 	: (key, pos) 	=> this._inputAction(ACTION_MOUSE_DOWN, key, pos),
			mouseUp 	: (key, pos)	=> this._inputAction(ACTION_MOUSE_UP, key, pos),
			keyDown 	: (key) 		=> this._inputAction(ACTION_KEY_DOWN, key),
			keyUp 		: (key) 		=> this._inputAction(ACTION_KEY_UP, key)
		};
		this.layer = {
			create 		: (title, type) => this._layerAction(ACTION_LAYER_CREATE, title, type),
			delete 		: (title) 		=> this._layerAction(ACTION_LAYER_DELETE, title),
			clean 		: (title) 		=> this._layerAction(ACTION_LAYER_CLEAN, title),
			visible 	: (title, val) 	=> this._layerAction(ACTION_LAYER_VISIBLE, val),
			rename 		: (title, val) 	=> this._layerAction(ACTION_LAYER_RENAME, val)
		};

		$.post("/create", {content: JSON.stringify({meno:PROJECT_AUTHOR})}, data => {
			this._user_id = data.cookies[CONN_KEY_USER_ID];
		}, "json");

		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}

	/*********************
	 * INITIALIZATIONS
	 ********************/
	startShare(data){
		data[CONN_KEY_TYPE] = CONN_KEY_SHARE;
		this.connect(data);
	}

	startTeach(data){
		data[CONN_KEY_TYPE] = CONN_KEY_TEACH;
		this.connect(data);
	}

	startWatch(data){
		data[CONN_KEY_TYPE] = CONN_KEY_WATCH;

		if(isUndefined(data[CONN_KEY_LESS_ID])){
			Logger.error(getMessage(MSG_MISS_LESS_ID));
			return false;
		}

		this.connect(data);
	}

	startExercise(data){
		data[CONN_KEY_TYPE] = CONN_KEY_EXERCISE;

		if(isUndefined(data[CONN_KEY_LESS_ID])){
			Logger.error(getMessage(MSG_MISS_LESS_ID));
			return false;
		}

		this.connect(data);
	}

	connect(data){
		this._socket = io(URL_CHAT);
		this._startTime = Date.now();
		this._type = data[CONN_KEY_TYPE];
		this._user_name = data[CONN_KEY_USER_NAME] || this._user_name;
		data.resolution = window.innerWidth + "_" + window.innerHeight;
		//var inst = this;
		this.resetLives();

		this._sharePaints		= data.sharePaints;
		this._shareInput		= data.shareInput;
		this._shareCreator		= data.shareCreator;
		this._shareLayers		= data.shareLayers;
		this._shareObjects		= data.shareObjects;
		this._maximalWatchers	= data.maxWatchers;

		this._socket.on("connect_failed", function(){
			Logger.error(getMessage(MSG_CONN_FAILED));
		});

		this._socket.on("connect_error", () => {
			this._lives === CONNECTION_TRIES && Logger.error(getMessage(MSG_CONN_ERROR));
			this._lives--;
			if(this._lives === 0){
				this.disconnect();
			}
		});

		this._socket.on("reconnect", () => {
			this.resetLives();
			Logger.write(getMessage(MSG_CONN_RECONNECT));
		});


		this._socket.on('confirmConnection', response => {
			this._less_id = response[CONN_KEY_DATA][CONN_KEY_LESS_ID];
			this._connectTime = Date.now();
			this._messageTime = Date.now();
			if(this._type === CONN_KEY_WATCH || this._type === CONN_KEY_TEACH){
				if(this._type === CONN_KEY_WATCH){
					Scene.initSecondCanvas();
				}
				//this._sendMessage("requireAllData", {target: this._user_id});
				this._watching = true;
			}
			else{
				this._sharing = true;
			}


			//upraví menu a dá vedieť používatelovi
			Logger.write(getMessage(MSG_CONN_CONFIRM));
			if(isFunction(Menu.disabled)) {
				Menu.disabled("sharing", "watch");
				Menu.disabled("sharing", "stopShare");
				Menu.disabled("sharing", "shareOptions");
				Menu.disabled("sharing", "copyUrl");
				Menu.disabled("sharing", "startShare");
			}
		});

		this._socket.on('receivedBuffer', this._processStack);

		this._socket.on('errorLog', response => Logger.error(response.msg));

		this._socket.on("notifLog", response => Logger.write(response.msg));

		this._socket.emit("initConnection", data);
	}

	pdraw(ctx){
		if(this._mousePosition){
			doArc({
				x: this._mousePosition.posX,
				y: this._mousePosition.posY,
				fillColor: "rgba(255,0,0,0.1)",
				width: 40,
				height: 40,
				center: true,
				ctx: ctx
			});
		}
	}

	disconnect(){
		if(isFunction(Menu.disabled)){
			Menu.disabled("sharing", CONN_KEY_WATCH);
			Menu.disabled("sharing", "stopShare");
			Menu.disabled("sharing", "shareOptions");
			Menu.disabled("sharing", "copyUrl");
			Menu.disabled("sharing", "startShare");
		}
		this._socket.disconnect();
		this._user_id	= false;
		this._socket	= false;
		this._sharing	= false;
		this._watching	= false;
		Logger.write(getMessage(MSG_CONN_DISCONNECT));
		if(Project.panel){
			Project.panel.stopShare();
		}
	}

	/*********************
	 * MESSAGES
	 ********************/
	 _processInputAction(data){
	 	if(data.type === ACTION_MOUSE_MOVE){
	 		this._mousePosition = data.position;
	 	}
	 	else if(data.type === ACTION_KEY_DOWN){
	 		glob.showKey(data.key);
	 	}
	 }
	 
	_processStack(data){
		Logger.log("prijaty buffer po: " + (Date.now() - this._messageTime), LOGGER_STACK_RECIEVED);
		this._messageTime = Date.now();
	 	each(data.buffer, e => {
			//console.log("prijata akcia:" + e.action);
			switch(e.action){
				case "requireAllData" :
					Handler.processRequireAllData(this, e[CONN_KEY_DATA]);
					break;
				case "sendAllData" :
					Handler.processSendAllData(this, e[CONN_KEY_DATA]);
					break;
				case "userDisconnect" :
					Handler.processUserDisconnect(this, e[CONN_KEY_DATA]);
					break;
				case "userConnect" :
					Handler.processUserConnect(this, e[CONN_KEY_DATA]);
					break;
				case "paintAction" :
					Handler.processPaintAction(e[CONN_KEY_DATA], this._type);
					break;
				case "layerAction" :
					Handler.processLayerAction(e[CONN_KEY_DATA]);
					break;
				case "inputAction" :
					this._processInputAction(e[CONN_KEY_DATA]);
					break;
				case "creatorAction" :
					Creator.setOpt(e[CONN_KEY_DATA].key, e[CONN_KEY_DATA][CONN_KEY_VALUE]);
					draw();
					break;
				case "objectAction" :
					Handler.processObjectAction(e[CONN_KEY_DATA], this._type);
					break;
				default:
					Logger.error(getMessage(MSG_UNKNOW_ACTION, e.action));
			}
	 	});
	}

	_sendStack(){
		if(!this._socket || this._socket.disconnected){
			return;
		}
		if(this._buffer.length === 0){
			return false;
		}
		var result = {
			buffer: this._buffer, 
			user_id: this._user_id
		};
		if(this._less_id){
			result[CONN_KEY_LESS_ID] = this._less_id;
		}
		this._socket.emit("sendBuffer", result);
		this._buffer = [];
	}

	_sendMessage(action, data){
		this._buffer[this._buffer.length] = {action: action, time: Date.now(), data: data};
		this._sender.callIfCan();
	}

	/*********************
	 * UTILS
	 ********************/
	/*
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
	*/
	/*********************
	 * ACTIONS
	 ********************/

	resetLives(){
		this._lives = CONNECTION_TRIES;
	}

	creatorChange(key, value){
		if(!this._socket || !this._shareCreator || this.watching){
			return;
		}

		var data = {
			key: key,
			value: value
		};
		this._sendMessage('creatorAction', data);
	}

	_layerAction(type, arg1, arg2){
		if(!this._socket || !this._shareLayers || this.watching){
			return;
		}
		var data = {
			action: type
		};

		switch(type){
			case ACTION_LAYER_CREATE :
				data[CONN_KEY_TITLE] = arg1;
				data[CONN_KEY_TYPE]	= arg2;
				break;
			case ACTION_LAYER_DELETE :
				data[CONN_KEY_TITLE] = arg1;
				break;
			case ACTION_LAYER_CLEAN :
				data[CONN_KEY_TITLE] = arg1;
				break;
			case ACTION_LAYER_VISIBLE :
				data[CONN_KEY_TITLE] = arg1;
				data[CONN_KEY_VALUE] = arg2;
				break;
			case ACTION_LAYER_RENAME :
				data[CONN_KEY_TITLE] = arg1;
				data[CONN_KEY_VALUE] = arg2;
				break;
		}

		this._sendMessage('layerAction', data);
	}

	_objectAction(type, object, keys){
		if(!this._socket || !this._shareObjects || this.watching){
			return;
		}
		var data = {
			action: type,
			user_name : this._user_name
		};
		switch(type){
			case ACTION_OBJECT_MOVE:
				data.oId	= object.id;
				data.oL	= object.layer;
				data.oX	= object.position.x;
				data.oY	= object.position.y;
				data.oW	= object.size.x;
				data.oH	= object.size.y;
				break;
			case ACTION_OBJECT_CHANGE:
				data.oId		= object.id;
				data.oL		= object.layer;
				data.keys	= {};
				each(keys, (e, i) => data.keys.i = object[i]);
				break;
			case ACTION_OBJECT_DELETE:
				data.oId	= object.id;
				data.oL	= object.layer;
				break;
			case ACTION_OBJECT_CREATE:
				data.o = object;
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
		if(!this._socket || !this._shareInput || this.watching){
			return false;
		}

		var data = {
			type: type
		};

		switch(type){
			case ACTION_KEY_DOWN :
				data.key = param1;
				break;
			case ACTION_KEY_UP :
				data.key = param1;
				break;
			case ACTION_MOUSE_DOWN :
				data.key = param1;
				data.position = param2;
				break;
			case ACTION_MOUSE_UP :
				data.key = param1;
				data.position = param2;
				break;
			case ACTION_MOUSE_MOVE :
				data.direction = param1;
				data.position = param2;
				break;
			default :
				Logger.error(type, 1);
		}
		this._sendMessage('inputAction', data);
	}

	_paintAction(type, arg1, arg2){
		if(!this._socket || !this._sharePaints || this.watching){
			return false;
		}

		var data = {
			action: type,
			user_name : this._user_name
		};
		switch(type){
			case ACTION_PAINT_ADD_POINT :
				data.pX = arg1.x;
				data.pY = arg1.y;
				data[CONN_KEY_LAYER] = arg2;
				break;
			case ACTION_PAINT_BREAK_LINE :
				data[CONN_KEY_LAYER] = arg1;
				break;
			case ACTION_PAINT_CLEAN :
				data[CONN_KEY_LAYER] = arg1;
				break;
			case ACTION_PAINT_ADD_PATH :
				data[CONN_KEY_LAYER] = arg1;
				data.path = arg2;
				break;
			case ACTION_PAINT_REMOVE_PATH :
				data[CONN_KEY_LAYER] = arg1;
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
	static processUserDisconnect(inst, data){
		Logger.write(getMessage(MSG_USER_DISCONNECT, data[CONN_KEY_USER_NAME], data[CONN_KEY_USER_ID]));
		
		var user = inst._connectedUsers[data[CONN_KEY_USER_ID]];
		if(user){
			user.status = STATUS_DISCONNECTED;
			lastConnectionTime = Date.now();
		}
	}

	static processUserConnect(inst, data){
		inst._connectedUsers[data[CONN_KEY_USER_ID]] = {
			user_name : data[CONN_KEY_USER_NAME],
			status : STATUS_CONNECTED,
			connectTime : Date.now()
		};
		if(inst._type === CONN_KEY_TEACH){
			//Scene.createLayer(data[CONN_KEY_USER_NAME]);
			//inst._sendMessage("requireAllData", {target: inst._user_id, from: data[CONN_KEY_USER_ID]});
		}
		//Logger.write("používatel" + data[CONN_KEY_USER_NAME] + ". +ata[CONN_KEY_USER_ID] + "] sa pripojil");
		Logger.write(getMessage(MSG_USER_CONNECT, data[CONN_KEY_USER_NAME], data[CONN_KEY_USER_ID]));

		//draw();
	}

	static processRequireAllData(inst, data){
		//console.log("prijal som žiadosť o všetky udaje pre " + data[CONN_KEY_TARGET]);
		var result = {};
		if(inst._type === CONN_KEY_SHARE){
			result = {
				msg: {
					scene: Scene.toObject(),
					creator: Creator.toObject(),
					paint: Paints.toObject(),
					user_name : inst._user_name
				},
				target: data[CONN_KEY_TARGET]
			};
			//Project.panel.addWatcher(recData.nickName);
			inst._sendMessage('sendAllData',result);
		}
		else if(inst._type === CONN_KEY_EXERCISE){
			result = {
				msg: {
					scene: Scene.toObject(),
					paint: Paints.toObject(),
					user_name : inst._user_name
				},
				target: data[CONN_KEY_TARGET]
			};
			inst._sendMessage('sendAllData',result);
		}
	}

	static processSendAllData(inst, data){
		//console.log("prijal som všetky udaje ");
		if(inst._type == CONN_KEY_WATCH){//chce udaje všetko dostupné o 1 používatelovi
			var shareOptions = data.shareOptions;
			var watchOptions = data.watchOptions;

			if(shareOptions.share.objects){
				Scene.fromObject(data.scene);
			}
			if(shareOptions.share.creator){
				Creator.fromObject(data.creator);
			}
			if(shareOptions.share.paints){
				Paints.fromObject(data.paint);
			}


			if(watchOptions.show.chat){
				/*
				 chatViewer = new ChatViewer(Project.title + "'s chat", watchOptions.nickName, sendMessage);
				 chatViewer.show();
				 */
				if(Project.panel){
					Project.panel.startWatch(sendMessage);
				}
			}

			if(watchOptions.show.timeLine){
				timeLine = new TimeLine();
			}

			Project.autor = watchOptions.nickName;

			//console.log("nastavuje sa", data);
			Menu.visible = shareOptions.share.menu;
			Creator.visibleView = shareOptions.share.menu;
			Options.setOpt("showLayersViewer", shareOptions.share.layers);
		}
		else if(inst._type == CONN_KEY_TEACH){//volá sa pre každého pripojeného študenta
			if(Scene.getLayer(data[CONN_KEY_USER_NAME])){
				Scene.deleteLayer(data[CONN_KEY_USER_NAME]);
			}
			Scene.createLayer(data[CONN_KEY_USER_NAME], LAYER_USER);
			Scene.fromObjectToSingleLayer(data[CONN_KEY_USER_NAME], data.scene);
			Paints.fromObjectToSingleLayer(data[CONN_KEY_USER_NAME], data.paint);
			//TODO načíta všetky kresby
		}
		draw();
	}

	static processObjectAction(data, type){
		var obj, layer = type === "teach" ? data.user_name : data.oL;
		switch(data.action){
			case ACTION_OBJECT_MOVE:
				obj = Scene.getObject(layer, data.oId);
				obj.position.set(data.oX, data.oY);
				obj.size.set(data.oW, data.oH);
				break;
			case ACTION_OBJECT_DELETE:
				Scene.remove(Scene.getObject(layer, data.oId), data.oL, false);
				break;
			case ACTION_OBJECT_CHANGE:
				obj = Scene.getObject(layer, data.oId);
				each(data.keys, (e, i) => obj[i] = e);
				break;
			case ACTION_OBJECT_CREATE:
				data.o._layer = layer;
				Creator.create(data.o);
				break;
			default :
				Logger.error(getMessage(MSG_RECIEVED_UNKNOWN_ACTION, data.action));
		}
		draw();
	}

	static processLayerAction(data){
		var layer = Project.scene.getLayer(data[CONN_KEY_TITLE]);
		switch(data.action){
			case ACTION_LAYER_CREATE :
				if(!layer){
					Project.scene.createLayer(data[CONN_KEY_TITLE], data[CONN_KEY_TYPE]);
				}
				break;
			case ACTION_LAYER_DELETE :
				if(layer){
					Project.scene.deleteLayer(data[CONN_KEY_TITLE]);
				}
				break;
			case ACTION_LAYER_CLEAN :
				if(layer){
					layer.cleanUp();
				}
				break;
			case ACTION_LAYER_VISIBLE :
				if(layer){
					layer.visible = data[CONN_KEY_VALUE];
				}
				break;
			case ACTION_LAYER_RENAME :
				if(layer){
					layer.rename(data[CONN_KEY_VALUE]);
				}
				break;
		}
	}

	static processPaintAction(data, type){
		var layer = data[CONN_KEY_LAYER];
		if(type === CONN_KEY_TEACH){
			layer = data[CONN_KEY_USER_NAME];
		}

		switch(data.action){
			case ACTION_PAINT_ADD_POINT :
				Paints.addPoint(new GVector2f(data.pX, data.pY), layer);
				break;
			case ACTION_PAINT_BREAK_LINE :
				Paints.breakLine(layer);
				break;
			case ACTION_PAINT_CLEAN :
				Paints.cleanUp(layer);
				break;
			case ACTION_PAINT_ADD_PATH :
				Paints.addPath(layer, data.path);
				break;
			default :
				Logger.error(getMessage(MSG_RECIEVED_UNKNOWN_ACTION, data.action));
		}
		draw();
	}
}
/*
glob.testExercise = function(lessId, name){
	Project.connection.startExercise({
		user_name : name,
		less_id: lessId
	});
};

glob.testTeach = function(name = "teacherName"){
	Project.connection.startTeach({
		user_name : name,
		user_id: name
	});
};

glob.testWatch = function(lessId, name = "watcherName"){
	Project.connection.startWatch({
		user_name : name,
		less_id: lessId
	});
};

glob.testShare = function (name = "SharerName", watchers = 100){
	Project.connection.startShare({
		user_name : name,
		sharePaints: true,
		shareCreator: true,
		shareObjects: true,
		shareLayers: true,
		maxWatchers: watchers});
};
*/
