/**
 * Created by Gabriel on 29. 10. 2016.
 */
const REFRESH_TIME = 1000;

const KEY_USER_NAME	= "user_name";
const KEY_USER_ID	= "user_id";
const KEY_LESS_ID	= "less_id";
const KEY_TARGET	= "target";
const KEY_TYPE		= "type";
const KEY_LAYER		= "layer";
const KEY_WATCH		= "watch";
const KEY_SHARE		= "share";
const KEY_TITLE		= "title";
const KEY_VALUE		= "value";
const KEY_TEACH		= "teach";
const KEY_DATA		= "data";
const KEY_EXERCISE	= "exercise";

class ConnectionManager{
	constructor(){
		this._user_id = false;
		this._socket = false;
		this._user_name = DEFAULT_USER_NAME;
        this._connectedUsers = {};
		this.paint = {
			addPoint : (point, layer) => this._paintAction(ACTION_PAINT_ADD_POINT, point, layer),
			breakLine : (layer) => this._paintAction(ACTION_PAINT_BREAK_LINE, layer),
			clean : (layer) => this._paintAction(ACTION_PAINT_CLEAN, layer),
			addPath : (layer, path) => this._paintAction(ACTION_PAINT_ADD_PATH, layer, path)
		};
		this.object = {
			move : (object) => this._objectAction(ACTION_OBJECT_MOVE, object),
			change : (object, keys) => this._objectAction(ACTION_OBJECT_CHANGE, object, keys),
			delete : (object) => this._objectAction(ACTION_OBJECT_DELETE, object),
			create : (object) => this._objectAction(ACTION_OBJECT_CREATE, object)
		};
		this.input = {
			mouseMove : (dir, pos) => this._inputAction(ACTION_MOUSE_MOVE, dir, pos),
			mouseDown : (key, pos) => this._inputAction(ACTION_MOUSE_DOWN, key, pos),
			mouseUp : (key, pos) => this._inputAction(ACTION_MOUSE_UP, key, pos),
			keyDown : (key) => this._inputAction(ACTION_KEY_DOWN, key),
			keyUp : (key) => this._inputAction(ACTION_KEY_UP, key)
		};
		this.layer = {
            create : (title, type) => this._layerAction(ACTION_LAYER_CREATE, title, type),
            delete : (title) => this._layerAction(ACTION_LAYER_DELETE, title),
            clean : (title) => this._layerAction(ACTION_LAYER_CLEAN, title),
            visible : (title, val) => this._layerAction(ACTION_LAYER_VISIBLE, val),
            rename : (title, val) => this._layerAction(ACTION_LAYER_RENAME, val)
        };
		this._sharing = false;
		this._sender = new EventTimer(e => this._sendStack(), REFRESH_TIME);
		this._buffer = [];
		var inst = this;
		$.post("/create", {content: JSON.stringify({meno:"gabriel"})}, function(data){
			inst._user_id = data["cookies"][KEY_USER_ID];
		}, "json");

		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	/*********************
	 * INITIALIZATIONS
	 ********************/
	startShare(data){
		data[KEY_TYPE] = KEY_SHARE;
		this.connect(data);
	}

	startTeach(data){
		data[KEY_TYPE] = KEY_TEACH;
		this.connect(data);
	}

	startWatch(data){
		data[KEY_TYPE] = KEY_WATCH;

		if(isUndefined(data[KEY_LESS_ID])){
			Logger.error("nieje zadane less_id");
			return false;
		}

		this.connect(data);
	}

	startExercise(data){
		data[KEY_TYPE] = KEY_EXERCISE;

		if(isUndefined(data[KEY_LESS_ID])){
			Logger.error("nieje zadane less_id");
			return false;
		}

		this.connect(data);
	}

	connect(data){
		this._socket = io();
		this._startTime = Date.now();
		this._type = data[KEY_TYPE];
		this._user_name = data[KEY_USER_NAME] || this._user_name;
		data["resolution"] = window.innerWidth + "_" + window.innerHeight;
		var inst = this;

		this._sharePaints = data["sharePaints"];
		this._shareInput = data["shareInput"];
		this._shareCreator = data["shareCreator"];
        this._shareLayers = data["shareLayers"];
		this._shareObjects = data["shareObjects"];
		this._maximalWatchers = data["maxWatchers"];


		this._socket.on('confirmConnection', function(response) {
			inst._less_id = response[KEY_DATA][KEY_LESS_ID];
			inst._connectTime = Date.now();
			inst._messageTime = Date.now();
			if(inst._type === KEY_WATCH || inst._type === KEY_TEACH){
				if(inst._type === KEY_WATCH)
					Scene.initSecondCanvas();
				//inst._sendMessage("requireAllData", {target: inst._user_id});
				inst._watching = true;
			}
			else{
				inst._sharing = true;
			}


			//upraví menu a dá vedieť používatelovi
			Logger.notif("jupíííí spojenie bolo úspešné");
			if(isFunction(Menu.disabled)) {
				Menu.disabled("sharing", "watch");
				Menu.disabled("sharing", "stopShare");
				Menu.disabled("sharing", "shareOptions");
				Menu.disabled("sharing", "copyUrl");
				Menu.disabled("sharing", "startShare");
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
			Menu.disabled("sharing", KEY_WATCH);
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
					Handler.processRequireAllData(inst, e[KEY_DATA]);
					break;
				case "sendAllData" :
					Handler.processSendAllData(inst, e[KEY_DATA]);
					break;
                case "userDisconnect" :
                    Handler.processUserDisconnect(inst, e[KEY_DATA]);
                    break;
                case "userConnect" :
                    Handler.processUserConnect(inst, e[KEY_DATA]);
                    break;
				case "paintAction" :
					Handler.processPaintAction(e[KEY_DATA]);
					break;
                case "layerAction" :
                    Handler.processLayerAction(e[KEY_DATA]);
                    break;
				case "inputAction" :
					inst._processInputAction(e[KEY_DATA]);
					break;
				case "creatorAction" :
					Creator.setOpt(e[KEY_DATA]["key"], e[KEY_DATA][KEY_VALUE]);
					draw();
					break;
				case "objectAction" :
					Handler.processObjectAction(e[KEY_DATA]);
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
			result[KEY_LESS_ID] = this._less_id;
		this._socket.emit("sendBuffer", result);
		this._buffer = [];
	}

	_sendMessage(action, data){
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

	_layerAction(type, arg1, arg2){
        if(!this._socket || !this._shareLayers)
            return;
        var data = {
            action: type
        };

        switch(type){
            case ACTION_LAYER_CREATE :
                data[KEY_TITLE] = arg1;
                data[KEY_TYPE] = arg2;
                break;
            case ACTION_LAYER_DELETE :
                data[KEY_TITLE] = arg1;
                break;
            case ACTION_LAYER_CLEAN :
                data[KEY_TITLE] = arg1;
                break;
            case ACTION_LAYER_VISIBLE :
                data[KEY_TITLE] = arg1;
                data[KEY_VALUE] = arg2;
                break;
            case ACTION_LAYER_RENAME :
                data[KEY_TITLE] = arg1;
                data[KEY_VALUE] = arg2;
                break;
        }

        this._sendMessage('layerAction', data);
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
				data[KEY_LAYER] = arg2;
				break;
			case ACTION_PAINT_BREAK_LINE :
				data[KEY_LAYER] = arg1;
				break;
			case ACTION_PAINT_CLEAN :
				data[KEY_LAYER] = arg1;
				break;
			case ACTION_PAINT_ADD_PATH :
				data[KEY_LAYER] = arg1;
				data["path"] = arg2;
				break;
			case ACTION_PAINT_REMOVE_PATH :
				data[KEY_LAYER] = arg1;
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
        Logger.notif("používatel " + data[KEY_USER_NAME] + "[ " + data[KEY_USER_ID] + "] sa odpojil");
        var user = inst._connectedUsers[data[KEY_USER_ID]];
        if(user){
            user.status = STATUS_DISCONNECTED,
            lastConnectionTime = Date.now();
        }
    }

    static processUserConnect(inst, data){
        inst._connectedUsers[data[KEY_USER_ID]] = {
            user_name : data[KEY_USER_NAME],
            status : STATUS_CONNECTED,
            connectTime : Date.now()
        };
        if(inst._type === KEY_TEACH){
            //Scene.createLayer(data[KEY_USER_NAME]);
			//inst._sendMessage("requireAllData", {target: inst._user_id, from: data[KEY_USER_ID]});
        }
        Logger.notif("používatel" + data[KEY_USER_NAME] + "[" + data[KEY_USER_ID] + "] sa pripojil");
        //draw();
    }

	static processRequireAllData(inst, data){
		console.log("prijal som žiadosť o všetky udaje pre " + data[KEY_TARGET]);
        var result = {};
        if(inst._type === KEY_SHARE){
            result = {
                msg: {
                    scene: Scene.toObject(),
                    creator: Creator.toObject(),
                    paint: Paints.toObject(),
					user_name : inst._user_name
                },
                target: data[KEY_TARGET]
            };
            //Panel.addWatcher(recData.nickName);
            //inst._actualWatchers.push(recData.nickName);
            inst._sendMessage('sendAllData',result);
        }
        else if(inst._type === KEY_EXERCISE){
            result = {
                msg: {
                    scene: Scene.toObject(),
					paint: Paints.toObject(),
					user_name : inst._user_name
                },
                target: data[KEY_TARGET]
            };
            inst._sendMessage('sendAllData',result);
        }
	}

	static processSendAllData(inst, data){
		console.log("prijal som všetky udaje ");
        if(inst._type == KEY_WATCH){//chce udaje všetko dostupné o 1 používatelovi
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
        else if(inst._type == KEY_TEACH){//volá sa pre každého pripojeného študenta
			if(Scene.getLayer(data[KEY_USER_NAME]))
				Scene.deleteLayer(data[KEY_USER_NAME]);
			Scene.createLayer(data[KEY_USER_NAME], LAYER_USER);
            Scene.fromObjectToSingleLayer(data[KEY_USER_NAME], data.scene);
			Paints.fromObjectToSingleLayer(data[KEY_USER_NAME], data.paint);
            //TODO načíta všetky kresby
        }
        draw();
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

	static processLayerAction(data){
        switch(data.action){
            case ACTION_LAYER_CREATE :
                Project.scene.createLayer(data[KEY_TITLE], data[KEY_TYPE]);
                break;
            case ACTION_LAYER_DELETE :
                Project.scene.deleteLayer(data[KEY_TITLE]);
                break;
            case ACTION_LAYER_CLEAN :
                var layer = Project.scene.getLayer(data[KEY_TITLE]);
                if(layer)
                    layer.cleanUp();
                break;
            case ACTION_LAYER_VISIBLE :
                var layer = Project.scene.getLayer(data[KEY_TITLE]);
                if(layer)
                    layer.visible = data[KEY_VALUE];
                break;
            case ACTION_LAYER_RENAME :
                var layer = Project.scene.getLayer(data[KEY_TITLE]);
                if(layer)
                    layer.rename(data[KEY_VALUE]);
                break;
        }
    }

	static processPaintAction(data){
		switch(data.action){
			case ACTION_PAINT_ADD_POINT :
				Paints.addPoint(new GVector2f(data["pX"], data["pY"]), data[KEY_LAYER]);
				break;
			case ACTION_PAINT_BREAK_LINE :
				Paints.breakLine(data[KEY_LAYER]);
				break;
			case ACTION_PAINT_CLEAN :
				Paints.cleanUp(data[KEY_LAYER]);
				break;
			case ACTION_PAINT_ADD_PATH :
				Paints.addPath(data[KEY_LAYER], data["path"]);
				break;
			default :
				Logger.error("bola prijatá neznáma akcia: " + data["action"]);
		}
		draw();
	}
}

function testExercise(lessId, name){
    Project.connection.startExercise({
        user_name : name,
        less_id: lessId
    });
}

function testTeach(name = "teacherName"){
    Project.connection.startTeach({
        user_name : name,
        user_id: name
    });
}

function testWatch(lessId, name = "watcherName"){
    Project.connection.startWatch({
        user_name : name,
        less_id: lessId
    });
}

function testShare (name = "SharerName", watchers = 100){
    Project.connection.startShare({
        user_name : name,
        sharePaints: true,
        shareCreator: true,
        shareObjects: true,
        shareLayers: true,
        maxWatchers: watchers});

}
