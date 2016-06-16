/******************************
 *CHAT MANAGER
 *****************************/

class ChatManager{
	constructor(maxID = 10){
		this._connections		= {};
		this._sharers			= {};
		this._watchers			= {};
		this._numberOfChats		= 0;
		this._numberOfWatchers	= 0;
		this._usedIdes			= [];
		this._maxID				= maxID;
	}

	static tests(){
		/*
		 * + LIMIT PRIPOJENI
		 * + VYMAZAVANIE SHAREROV
		 * + VYMAZAVANIE WATCHEROV
		 * + PRIDAVANIE VIACERICH CHATOV
		 * + ODOSIELANIE SPRAV
		 * + POCTY
		 */
		var g = new ChatManager();

		if(g._numberOfChats != 0)
			console.error("na zaciatku nesedi pocet chatov: " + g._numberOfChats);
		if(g._numberOfWatchers != 0)
			console.error("na zaciatku nesedi pocet watcherov: " + g._numberOfWatchers);

		g.addChat({id:1234}, {res:"nieco", pass:1234, limit: 10}, 4);

		g.addWatcher(4, {id: 555}, "nieco");

		g.addWatcher(4, {id: 555}, "nieco");
		//mala by nastať chyba

		g.addWatcher(4, {id: 5555}, "nieco");

		if(g._numberOfChats != 1)
			console.error("nesedi pocet chatov: " + g._numberOfChats);
		if(g._numberOfWatchers != 2)
			console.error("nesedi pocet watcherov: " + g._numberOfWatchers);

		g.userDisconect({id: 5555});

		if(g._numberOfChats != 1)
			console.error("nesedi pocet chatov: " + g._numberOfChats);
		if(g._numberOfWatchers != 1)
			console.error("nesedi pocet watcherov: " + g._numberOfWatchers);


		g.addChat({id:12345}, {res:"nieco", pass:1234, limit: 10}, 5);

		if(g._numberOfChats != 2)
			console.error("nesedi pocet chatov: " + g._numberOfChats);
		
		if(g._numberOfWatchers != 1)
			console.error("nesedi pocet watcherov: " + g._numberOfWatchers);

		g.userDisconect({id: 1234});
		g.userDisconect({id: 12345});

		if(g._numberOfChats != 0)
			console.error("na konci nesedi pocet chatov: " + g._numberOfChats);
		if(g._numberOfWatchers != 0)
			console.error("na konci nesedi pocet watcherov: " + g._numberOfWatchers);

	}

	addChat(socket, data, chatID = ChatManager._getId()){
		if(typeof this._connections[chatID] !== "undefined")
			return console.error("vygenerovalo sa IDčko už existujúceho chatu");

		if(typeof this._sharers[socket.id] !== "undefined" && typeof this._sharers[socket.id]["active"])
			return console.error("snaží sa zdielať sharer ktorý už zdiela");

		this._connections[chatID] = new Chat(socket, chatID, data["res"], data["pass"], data["limit"]);

		this._sharers[socket.id] = {
			chatID: chatID,
			active: true
		};

		this._numberOfChats++;

	};

	addWatcher(chatID, socket, res){
		if(typeof this._connections[chatID] === "undefined")
			return console.error("pridáva sa uživatel do neexistujúceho chatu");

		if(typeof this._watchers[socket.id] !== "undefined" && typeof this._watchers[socket.id]["active"])
			return console.error("snaží sa pridať watcher ktorý už existuje");

		this._connections[chatID].addWatcher(socket, res);

		this._watchers[socket.id] = {
			chatID: chatID,
			active: true
		};


		this._numberOfWatchers++;
	}

	userDisconect(socket){
		var res = this._sharers[socket.id];
		if(typeof res !== "undefined"){
			res["active"] = false;
			this._stopShare(socket, res["chatID"]);
			return true;
		}
		res = this._watchers[socket.id];
		if(typeof res !== "undefined"){
			res["active"] = false;
			this._stopWatch(socket, res["chatID"]);
			return true;
		}
		
		console.error("snaží sa vymazať user ktorý neexistuje");
		return false;
	}

	_stopShare(socket, chatID){
		this._numberOfChats--;
		this._numberOfWatchers -= this._connections[chatID].getWatchersNumber();

		this._connections[chatID].stopShare();

		delete this._usedIdes[res.chatID]
	}

	_stopWatch(socket, chatID){
		this._numberOfWatchers--;
		this._connections[chatID].removeWatcher(socket);
	}

	static _getId(){
		var id = Math.floor(Math.random() * this._maxID);
		while(typeof this._usedIdes[id] !== "undefined")
			id = Math.floor(Math.random() * this._maxID);

		this._usedIdes[id] = true;
		return id;
	}
}

/******************************
 *CHAT
 *****************************/
class Chat{
	constructor(owner, id, res, pass, limit){
		this._id 					= id;
		this._res 					= res;
		this._pass 					= pass;
		this._owner 				= owner;
		this._limit 				= limit;
		this._watchers 				= [];
		this._numberOfWatchers 		= 0;
		this._numberOfSendMessages 	= {total: 0};
	}

	sendMessageToWatchers(type, msg = ""){
		if(typeof this._numberOfSendMessages[type] === "undefined")
			this._numberOfSendMessages[type] = 0;

		for(var i in this._watchers)
			if(this._watchers.hasOwnProperty(i))
				this._watchers[i].sendMessage(type, msg);

		this._numberOfSendMessages[type]++;
		this._numberOfSendMessages["total"]++;
	}

	addWatcher(socket, res){
		this._watchers[socket.id] = new Watcher(socket, res);
		this._numberOfWatchers++;
	}

	stopShare(){
		this.sendMessageToWatchers("endShare");
	}

	removeWatcher(socket, sendMessage = false){
		delete this._watchers[socket.id];
		this._numberOfWatchers--;	
	}

	getWatchersNumber(){
		return this._numberOfWatchers;
	}
}

/******************************
 *WATCHER
 *****************************/
class Watcher{
	constructor(socket, res){
		this._resolution 			= res;
		this._valid 				= false;
		this._socket 				= socket;
		this._numberOfSendMessages 	= {total: 0};
	}

	sendMessage(type, msg){
		this._numberOfSendMessages[type]++;
		this._numberOfSendMessages["total"]++;
		//TODO dorobiť odosielanie správ
	}

	validate(){
		this._valid = true;
	}
}	