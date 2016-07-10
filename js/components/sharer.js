class Sharer{
	constructor(){
		this._id = false;
		this._socket = false;
		this._sharing = false;
		this.paint = {
			addPoint: (point, color) => this._pointOperation(ACTION_PAINT_ADD_POINT, point, color),
			breakLine: () => this._pointOperation(ACTION_PAINT_BREAK_LINE),
			clean: () => this._pointOperation(ACTION_PAINT_CLEAN),
			changeBrush: (brush) => this._pointOperation(ACTION_PAINT_CHANGE_BRUSH, brush)
		}
	}

	get isSharing(){return this._sharing;}

	startShare(password = "1234", limit = 100){
		this._socket = io();
		this._sharing = true;

		var inst = this,
			data = {
				res: {
					x: window.innerWidth,
					y: window.innerHeight
				},
				pass: password,
				limit: limit
			};

		this._socket.emit('startShare', JSON.stringify(data));

		this._socket.on('notification', function(msg){
			data = JSON.parse(msg);
			console.log(data["msg"]);
		});

		this._socket.on('confirmShare', function(msg){
			var data = JSON.parse(msg);
			this._link = location.href + "watch?id=" + data["id"];
			console.log("zdiela sa na adrese: " + this._link);
			inst._id = data["id"];
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

	_pointOperation(action, arg1, arg2){
		var data;
		switch(action){
			case ACTION_PAINT_ADD_POINT :
				data = {
					id: this._id,
					msg: {
						action: action,
						pX: arg1.x,
						pY: arg1.y,
						color: arg2
					}
				};
				break;
			case ACTION_PAINT_BREAK_LINE :
				data = {
					id: this._id,
					msg: {
						action: action
					}
				};
				break;
			case ACTION_PAINT_CHANGE_BRUSH :
				data = {
					id: this._id,
					msg: {
						action: action,
						brush: arg1
					}
				};
				break;
			case ACTION_PAINT_CLEAN :
				data = {
					id: this._id,
					msg: {
						action: action
					}
				};
				break;
			default:
				Logger.error("nastala chyba lebo sa chce vykonať neznáma paintAction: " + action);
				return;
		}
		this._socket.emit('paintAction', JSON.stringify(data));
	}

	mouseChange(){
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
		//console.log("vola sa akcia");
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