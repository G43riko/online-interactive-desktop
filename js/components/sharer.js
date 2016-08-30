class SharerManager{
	constructor(){
		this._id = false;
		this._socket = false;
		this._sharing = false;
		this.paint = {
			addPoint: (point, layer) => this._paintOperation(ACTION_PAINT_ADD_POINT, point, layer),
			breakLine: (layer) => this._paintOperation(ACTION_PAINT_BREAK_LINE, layer),
			clean: (layer) => this._paintOperation(ACTION_PAINT_CLEAN, layer)
		};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	get isSharing(){return this._sharing;}

	startShare(options){
		this._socket = io();
		this._sharing = true;

		this._sharePaints = options.sharePaints;
		this._shareCreator = options.shareCreator;
		this._shareObjects = options.shareObjects;

		var inst = this,
			data = {
				res: {
					x: window.innerWidth,
					y: window.innerHeight
				},
				pass: options.password,
				limit: options.maxWatchers,
				realTime: options.realTime,
				detailMovement: options.detailMovement,
				share: {
					menu: options.shareMenu,
					paints: this._sharePaints,
					creator: this._shareCreator,
					objects: this._shareObjects
				}
			};

		this._socket.on('chatMessage',function(data){
			chatViewer.recieveMessage(data["text"], data["sender"]);
		});

		this._socket.emit('startShare', data);

		this._socket.on('notification', function(data){
			Logger.notif("prijatá správa: " + data["msg"]);
			console.log(data["msg"]);
		});

		this._socket.on('confirmShare', function(data){
			inst._id = data["id"];

			var a = document.createElement("a");
			a.setAttribute("target", "_blank");
			a.setAttribute("href", inst.getWatcherUrl());
			a.appendChild(document.createTextNode("adrese"));
			a.style.float="none";

			var span = document.createElement("span");
			span.appendChild(document.createTextNode("zdiela sa na "));
			span.appendChild(a);

			Logger.notif(span);
			Menu.disabled("sharing", "watch", false);
			Menu.disabled("sharing", "stopShare", false);
			Menu.disabled("sharing", "shareOptions", false);
			Menu.disabled("sharing", "startShare", true);
			chatViewer.show();
		});

		this._socket.on('getAllData', function(recData){
			console.log("prišla žiadosť o odoslanie všetkých dát");
			var data = {
				id: inst._id,
				msg: {
					scene: Scene.toObject(),
					creator: Creator.toObject(),
					paint: Paints.toObject()
				},
				target: recData.target
			};
			inst._socket.emit('sendAllData', data);
		});
	}

	changeCreator(key, val){
		var data = {
			id: this._id,
			msg: {
				key: key,
				val: val
			}
		};
		this._socket.emit('changeCreator', data);
	}

	getWatcherUrl(){
		return location.href + "watch?id=" + this._id;
	}

	_paintOperation(action, arg1, arg2){
		if(!this._sharePaints)
			return false;

		var data = {
			id: this._id,
			msg : {
				action: action
			}
		};
		switch(action){
			case ACTION_PAINT_ADD_POINT :
				data["msg"]["pX"] = arg1.x;
				data["msg"]["pY"] = arg1.y;
				data["msg"]["layer"] = arg2;
				break;
			case ACTION_PAINT_BREAK_LINE :
				data["msg"]["layer"] = arg1;
				break;

			case ACTION_PAINT_CLEAN :
				data["msg"]["layer"] = arg1;
				break;
			default:
				Logger.error("nastala chyba lebo sa chce vykonať neznáma paintAction: " + action);
				return;
		}
		this._socket.emit('paintAction', data);
	}

	sendMessage(text, sender){
		var data = {
			id: this._id,
			msg: {
				text: text,
				sender: sender
			}
		};
		this._socket.emit('chatMessage', data);
	}

	mouseChange(){
		if(!this._id)
			return false;
		var data = {
			id: this._id,
			msg: {
				posX: Input.mousePos.x,
				posY: Input.mousePos.y,
				buttonDown: Input.isButtonDown(LEFT_BUTTON)
			}
		};
		this._socket.emit('mouseData', data);
	}

	objectChange(o, action, keys){
		if(!this._socket)
			return;
		var data = {
			id: this._id,
			msg:{
				action: action
			}
		};
		switch(action ){
			case ACTION_OBJECT_MOVE:
				data["msg"]["oId"] = o.id;
				data["msg"]["oL"] = o.layer;
				data["msg"]["oX"] = o.position.x;
				data["msg"]["oY"] = o.position.y;
				data["msg"]["oW"] = o.size.x;
				data["msg"]["oH"] = o.size.y;
				break;
			case ACTION_OBJECT_CHANGE:
				data["msg"]["oId"] = o.id;
				data["msg"]["oL"] = o.layer;
				data["msg"]["keys"] = {};
				keys.forEach((e, i) => data.msg.keys["i"] = o[i]);
				break;
			case ACTION_OBJECT_DELETE:
				data["msg"]["oId"] = o.id;
				data["msg"]["oL"] = o.layer;
				break;
			case ACTION_OBJECT_CREATE:
				data["msg"]["o"] = o;
				break;
			default:
				Logger.error("nastala chyba lebo sa chce vykonať neznáma akcia: " + action);
				return;
		}
		this._socket.emit('action', data);
	}

	write(msg){
		this._socket.emit('broadcastMsg', {id: this._id, msg: msg});
	}
}