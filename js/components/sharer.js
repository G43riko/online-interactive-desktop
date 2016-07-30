class Sharer{
	constructor(){
		this._id = false;
		this._socket = false;
		this._sharing = false;
		this.paint = {
			addPoint: (point, layer) => this._paintOperation(ACTION_PAINT_ADD_POINT, point, layer),
			breakLine: (layer) => this._paintOperation(ACTION_PAINT_BREAK_LINE, layer),
			clean: (layer) => this._paintOperation(ACTION_PAINT_CLEAN, layer)
		}
	}

	get isSharing(){return this._sharing;}

	startShare(options){
		this._socket = io();
		this._sharing = true;

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
				shareMenu: options.shareMenu,
				sharePaints: options.sharePaints,
				shareObjects: options.shareObjects
			};

		this._socket.emit('startShare', JSON.stringify(data));

		this._socket.on('notification', function(msg){
			data = JSON.parse(msg);
		});

		this._socket.on('confirmShare', function(msg){
			var data = JSON.parse(msg);
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
		});

		this._socket.on('getAllData', function(recieveData){
			console.log("prišla žiadosť o odoslanie všetkých dát");
			var recData = JSON.parse(recieveData);
			var data = {
				id: inst._id,
				content: Sharer._getContent(),
				target: recData.target
			};
			inst._socket.emit('sendAllData', JSON.stringify(data));
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
		this._socket.emit('changeCreator', JSON.stringify(data));
	}

	getWatcherUrl(){
		return location.href + "watch?id=" + this._id;
	}

	_paintOperation(action, arg1, arg2){
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
		this._socket.emit('paintAction', JSON.stringify(data));
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
		this._socket.emit('mouseData', JSON.stringify(data));
	}

	static _getContent(){
		return Scene.toString();
	}

	objectChange(o, action, keys){
		if(!this._socket)
			return;
		var data;
		switch(action ){
			case ACTION_OBJECT_MOVE:
				data = {
					id: this._id,
					msg:{
						action: action,
						oId: o.id,
						oL: o.layer,
						oX: o.position.x,
						oY: o.position.y,
						oW: o.size.x,
						oH: o.size.y
					}
				};
				break;
			case ACTION_OBJECT_CHANGE:
				data = {
					id: this._id,
					msg:{
						action: action,
						oId: o.id,
						oL: o.layer,
						keys: {}
					}
				};
				keys.forEach((e, i) => data.msg.keys["i"] = o[i]);
				break;
			case ACTION_OBJECT_DELETE:
				data = {
					id: this._id,
					msg:{
						action: action,
						oId: o.id,
						oL: o.layer
					}
				};
				break;
			case ACTION_OBJECT_CREATE:
				data = {
					id: this._id,
					msg: {
						action: action,
						o: o
					}
				};
				break;
			default:
				Logger.error("nastala chyba lebo sa chce vykonať neznáma akcia: " + action);
				return;
		}
		this._socket.emit('action', JSON.stringify(data));
	}

	write(msg){
		this._socket.emit('broadcastMsg', JSON.stringify({id: this._id, msg: msg}));
	}
}