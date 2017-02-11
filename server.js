var express 		= require('express'),
	app 			= express(),
	http 			= require('http').Server(app),
	io 				= require('socket.io')(http),
	redis 			= require('redis'),
	config 			= require('./js/json/config_server.json'),
	utils 			= require('./js/utils/ServerUtils'),
	lessonsManager	= require('./js/utils/LessonsManager'),
	serverLogs		= require('./js/utils/serverLogs'),
	connection 		= require('./js/utils/connectionManager'),
	RedisClient 	= require('./js/utils/RedisClient'),
	client 			= new RedisClient.Redis(redis, config);

lessonsManager.init(utils, config.loopTime);

connection.callLogInit(serverLogs.init);
app.use("/css", express.static(__dirname + '/css'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/build", express.static(__dirname + '/build'));
app.use("/components", express.static(__dirname + '/components'));

app.get('/app', function(req, res) {
	serverLogs.increase("pageLoad");
	var cookies = parseCookies(req);
	/*
	if(typeof cookies.user_id === "undefined"){
		var id = getUserId();
		res.cookie("user_id", id).cookie("last_load", Date.now());
	}
	else*/
		res.cookie("last_load", Date.now());

	res.sendFile('/index.html' , { root : __dirname});
});

app.get('/', function(req, res){
	res.sendFile('/welcomeBootstrap.html' , { root : __dirname});
});

app.get('/frame', function(req, res){
	res.sendFile('/iframe.html' , { root : __dirname});
});

app.get('/overview', function(req, res){
	res.sendFile('/overview.html' , { root : __dirname});
});

app.post('/checkConnectionData', function(req, res){
	processPostData(req, function(data){
		checkConnectionRequest(JSON.parse(data.replace("content=", "")), res);
	})
});

app.post("/anonymousData", function (request) {
	processPostData(request, function(data, req){
		data = JSON.parse(data.replace("content=", ""));
		data["ipAddress"] = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		data["connectedAt"] = data["connectedAt"].replace("+", " ");
		client.storeAnonymousData(data);
		serverLogs.addAnonymData(data);
	});
});

app.get('/anonymousData', function(req, res){
	res.sendFile('/welcomeBootstrap.html' , { root : __dirname});
});

io.on('connection', function(socket){
	serverLogs.increase("connected");
	/*******************
	FROM SHARER
	*******************/
	socket.on("changeCreator", changeCreator);
	socket.on("paintAction", paintAction);
	socket.on("startShare", startShare);
	socket.on('mouseData', mouseData);
	socket.on("action", action);
	socket.on("sendAllData", sendAllData);
	/*******************
	FROM WATCHER
	*******************/
	socket.on('createWatcher', createWatcher);
	/*******************
	FROM ALL
	*******************/
	socket.on('disconnect', disconnect);
	socket.on('chatMessage', chatMessage);
	socket.on("broadcastMsg", broadcastMsg);
	socket.on("sendBuffer", sendBuffer);
	
	/*******************
	FROM OVERVIEW
	*******************/
	socket.on("dataReqiere", dataReqiere);

	/*******************
	 FROM USER
	 *******************/
	socket.on("initConnection", initConnection);


	//socket.on("completeAuth", completeAuth);
	//socket.on("startWatch", startWatch);
});

http.listen(config.port, function(){
	console.log('listening on *:' + config.port);
});

function logError(msg, socket){
	console.log(msg);
	socket.emit("errorLog", {msg: msg});
}

function logNotif(msg, socket){
	console.log(msg);
	socket.emit("notifLog", {msg: msg});
}

function processRequireAllDataAction(data, user_id, less_id){
	var lesson = lessonsManager.getLesson(less_id);

	if(!data){//tu sa pridaju možnosti ked nechce všetko ale iba niečo
		data = {};
	}

	data["target"] = user_id;

	if(lesson.type === "share"){
		lessonsManager.sendMessage(lesson["owner"], "requireAllData", data)
	}
	else if(lesson.type === "teach"){
		data["target"] = lesson["owner"];//vždy sa budu posielať udaje len zakladatelovi
		if(lesson["owner"] == user_id){ //ak ten kto žiada je zakladatelom spojenia
			//if(lessonsManager.isMember(less_id, data["from"]))
			//	lessonsManager.sendMessage(data["from"], "requireAllData", data);
			var members = lessonsManager.getAllMembers(less_id);
			for(var i in members){//vyžiada si udaje od všetkých členov
				if(members.hasOwnProperty(i)){
					lessonsManager.sendMessage(members[i], "requireAllData", data);
				}
			}
		}
		else{//ak nie je, tak sa jedná o nového pripojeného a treba od neho získať všetky udaje a poslať zakladatelovi
			lessonsManager.sendMessage(user_id, "requireAllData", data);
		}
	}
}

function processLayerAction(data, user_id, less_id){
	if(lessonsManager.isSharing(less_id) && lessonsManager.getOwner(less_id) === user_id) {
		lessonsManager.sendMessageAllMembers(less_id, "layerAction", data);
	}
}

function processObjectAction(data, user_id, less_id){
	if(!lessonsManager.isSharing(less_id)){
		return false;
	}

	var owner = lessonsManager.getOwner(less_id);

	if(owner === user_id) {
		lessonsManager.sendMessageAllMembers(less_id, "objectAction", data);
	}
	else{
		lessonsManager.sendMessage(owner, "objectAction", data);
	}
	/*
	var lesson = lessonsManager.getLesson(less_id);
	if(lesson.type === "share" && lesson["owner"] === user_id){
		for(var i in lesson["members"])
			if(lesson["members"].hasOwnProperty(i)){
				lessonsManager.sendMessage(lesson["members"][i], "objectAction", data);
			}
	}
	*/
}

function processCreatorAction(data, user_id, less_id){
	if(lessonsManager.isSharing(less_id) && lessonsManager.getOwner(less_id) === user_id) {
		lessonsManager.sendMessageAllMembers(less_id, "creatorAction", data);
	}
	/*
	var lesson = lessonsManager.getLesson(less_id);
	if(lesson.type === "share" && lesson["owner"] === user_id){
		for(var i in lesson["members"])
			if(lesson["members"].hasOwnProperty(i)){
				lessonsManager.sendMessage(lesson["members"][i], "creatorAction", data);
			}
	}
	*/
}

function processSendAllDataAction(data){
	/*
	data.msg["shareOptions"] = connection.getShareOptions(data.id);
	data.msg["watchOptions"] = connection.getWatchOptions(connection.getWatcher(data.id, data.target));
	*/

	//TODO ak target === server tak uloží aktualny stav používatela do db

	data.msg["shareOptions"] = {
		"share": {
			"objects": true,
			"paints": true,
			"creator": true,
			"menu": true,
			"layers": true
		}
	};

	data.msg["watchOptions"] = {
		"show" : {
			"chat" : false,
			"timeline" : false
		}
	};

	lessonsManager.sendMessage(data["target"], "sendAllData", data.msg);
}

function processInputAction(data, user_id, less_id, type){
	var lesson = lessonsManager.getLesson(less_id);
	if(lesson.type === "share" && lesson["owner"] === user_id){
		for(var i in lesson["members"])
			if(lesson["members"].hasOwnProperty(i)){
				buffer.addMessage(lesson["members"][i], "inputAction", data);
			}
	}
}

function processPaintAction(data, user_id, less_id){
	if(!lessonsManager.isSharing(less_id)){//TOTO pravdepodobne zbytočné
		return false;
	}

	var owner = lessonsManager.getOwner(less_id);

	if(owner === user_id) { //ak zakladatel zdiela === share
		lessonsManager.sendMessageAllMembers(less_id, "paintAction", data);
	}
	else{
		lessonsManager.sendMessage(owner, "paintAction", data);
	}
	/*
	var lesson = lessonsManager.getLesson(less_id);
	if(lesson.type === "share" && lesson["owner"] === user_id){
		for(var i in lesson["members"])
			if(lesson["members"].hasOwnProperty(i)){
				lessonsManager.sendMessage(lesson["members"][i], "paintAction", data);
			}
	}
	*/
}

var startShare, startWatch, completeAuth, broadcastMsg, sendAllData, disconnect, action, mouseData, paintAction, chatMessage, dataReqiere, sendBuffer, createWatcher, initConnection;

initConnection = function(data){
	/*****************
	 * KONTROLY
	 *****************/
	//ak sa pripája k vyučovaniu skontroluje či vyučovanie existuje

	var cookies = parseCookies(this.handshake);


	if(!data.less_id || typeof data.create_new === "undefined"){
		data.create_new = true;
	}

	if(cookies.user_id){
		data.user_id = cookies.user_id;
	}


	var lesson_id = client.initConnection(data);
	var user_id = data.user_id;
	var socket = this;

	if(data.type == "teach" || data.type == "share"){//ak zakladá vyučovanie
		console.log("vytvorilo sa vyucovanie s id: " + lesson_id + "[" + data.type + "]");
		lessonsManager.startLesson(lesson_id, user_id, data.type, this);
	}
	else if(data.type === "exercise" || data.type === "watch"){//ak sa pripája k vyučovaniu
		console.log("k vyucovanie s lesson id " + lesson_id + " sa pripojil " + user_id);

		lessonsManager.sendMessage(lessonsManager.getOwner(lesson_id), "userConnect",{
			user_name : data.user_name,
			user_id : user_id,
		});
		lessonsManager.addMember(lesson_id, user_id, this);
	}

	client.getAllLessonData(lesson_id, function(err, data){
		var date = new Date();
		data.less_id = lesson_id;
		date.setTime(date.getTime() + (24 * 60 * 60 * 1000)); // set 1 day value to expiry
		var expires = "; expires=" + date.toGMTString();
		if(data.type === "teach" || data.type === "watch" || data.type === "exercise"){
			console.log("žiada sa všetko pre usera " + user_id);
			processRequireAllDataAction({}, user_id, data.less_id)
		}
		socket.emit("confirmConnection", {err: err, result: 1, data: data, cookies: cookies});
		socket.handshake.headers.cookie = "less_id=" + lesson_id + expires + "; path=/";
	});
};

sendBuffer = function(data){
	serverLogs.messageRecieve("sendBuffer", data);
	var i, message = null;
	for(i in data.buffer){
		if(data.buffer.hasOwnProperty(i)){
			message = data.buffer[i];
			switch (message.action){
				case "inputAction" :
					processInputAction(message.data, data.user_id, data.less_id);
					break;
				case "requireAllData" :
					processRequireAllDataAction(message.data, data.user_id, data.less_id);
					break;
				case "sendAllData" :
					processSendAllDataAction(message.data);
					break;
				case "paintAction" :
					processPaintAction(message.data, data.user_id, data.less_id);
					break;
				case "creatorAction" :
					processCreatorAction(message.data, data.user_id, data.less_id);
					break;
				case "objectAction" :
					processObjectAction(message.data, data.user_id, data.less_id);
					break;
				case "layerAction" :
					processLayerAction(message.data, data.user_id, data.less_id);
					break;

			}
		}
	}
	//writeToWatchers(connection.getWatchers(data.id), "processBuffer", data.msg);
};

function checkConnectionRequest(data, res){
	try{
		if(typeof data !== "object"){
			res.send(JSON.stringify({
				result: -1,
				msg: "Dáta neprišli v požadovanom tvare"
			}));
		}
		else if(!data.user_name){
			res.send(JSON.stringify({
				result: -2,
				msg: "Meno nieje zadané"
			}));
		}
		else if(!data.type){
			res.send(JSON.stringify({
				result: -3,
				msg: "nie je zadaný typ"
			}));
		}
		else{
			if(data.type === "watch" || data.type === "exercise"){
				if(!data.less_id){
					res.send(JSON.stringify({
						result: -4,
						msg: "nie je zadané id vyučovania"
					}));
				}
				else if(!lessonsManager.existLesson(data.less_id)){
					res.send(JSON.stringify({
						result: -5,
						msg: "vyučovanie s id " + data.less_id + " neexistuje"
					}));
				}
				else {
					var realType = lessonsManager.getMemberType(data.less_id)
					if(realType === "exercise"){//USPECH PRE EXERCISE
						res.send(JSON.stringify({
							result: 1,
							sharePaints: true,
							shareInput: false,
							shareCreator: false,
							shareLayers: false,
							shareObjects: true,
							type : realType
						}));
					}
					else{
						res.send(JSON.stringify({
							result: 1
						}));
					}
				}
			}
			else{
				res.send(JSON.stringify({
					result: 1
				}));
			}
		}
	}
	catch(e){
		res.send(JSON.stringify({
			result: 0,
			msg: "Neznáma chyba",
			error: e
		}));
	}
}

//UTILS

function processPostData(req, func){
	var body = [];
	req.on("data", function(chunk){
		body.push(chunk);
	}).on('end', function() {
		func(decodeURIComponent(Buffer.concat(body).toString()), req);
	});
}

function parseCookies (request) {
	var list = {},
		rc = request.headers.cookie;

	rc && rc.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return list;
}

/*********************************************************************
 * DEPRECATED
 ********************************************************************/

function checkWatchRequest(data, res){
	try{
		if(!connection.existShare(data.shareId)){
			res.send(JSON.stringify({
				result: -1,
				msg: "Zle id zdielania"
			}));
		}
		else if(!connection.checkPassword(data.shareId, data.password))
			res.send(JSON.stringify({
				result: -2,
				msg: "zlé heslo"
			}));
		else if(!data.nickName)
			res.send(JSON.stringify({
				result: -3,
				msg: "Nickname nie je platné meno"
			}));
		else if(!connection.isNickNameAvailable(data.shareId, data.nickName))
			res.send(JSON.stringify({
				result: -4,
				msg: "Nickname je obsadený"
			}));
		else{
			data["userId"] = connection.getUserId();
			connection.setTmpData(data);
			res.send(JSON.stringify({
				result: 1,
				userId: data["userId"]
			}));
		}
	}
	catch(e){
		res.send(JSON.stringify({
			result: 0,
			msg: "Neznáma chyba",
			error: e
		}));
	}
}


/*
 * odpoji watchera alebo sharera
 */
disconnect = function(){
	serverLogs.increase("disconnect");
	serverLogs.messageRecieve("disconnect", "");
	connection.disconnect(this, function(){
		serverLogs.increase("disconnectWatcher")
	}, function(socket, conn){
		serverLogs.increase("disconnectSharer");
		writeToWatchers(conn.id, socket, "endShare", "nieco");
	});
};


/*
 * odošle spravu všetkym pripojeným
 */
broadcastMsg = function(data){
	serverLogs.messageRecieve("broadcastMsg", data);
	writeToWatchers(connection.getWatchers(data.id), "notification", {msg: data.msg});
};

app.get('/watch', function(req, res){
	res.sendFile('/watch.html' , { root : __dirname});
	serverLogs.increase("watchLoad");
});

app.get('/watcher', function(req, res){
	res.sendFile('/watchIndex.html' , { root : __dirname});
});

app.post('/create', function(req, res){
	processPostData(req, function(data){
		try{
			createConnection(JSON.parse(data.replace("content=", "")), res, req);
		}
		catch(e){
			res.send(JSON.stringify({result: -1, error: e && "unknown error"}));
		}
	})
});

createConnection = function(data, res, req){
	if(typeof data !== "object"){
		data = {};
	}

	data.action = "create";

	var cookies = parseCookies(req);

	if(!data.user_id && cookies.user_id){
		data.user_id = cookies.user_id;
	}

	if(cookies.last_load){
		data.last_load = cookies.last_load;
	}


	var realId = client.createUser(data);

	client.getAllUserData(realId, function(err, data){
		res.cookie("user_id", realId)
			.cookie("last_connection", Date.now())
			.send(JSON.stringify({err: err, result: 1, data: data, cookies: cookies}));
	});
};

app.post('/update', function(req, res){
	processPostData(req, function(data){
		try{
			updateConnection(JSON.parse(data.replace("content=", "")), res, req);
		}
		catch(e){
			res.send(JSON.stringify({result: -1, error: e && "unknown error"}));
		}
	})
});

updateConnection = function(data, res, req){
	if(typeof data !== "object"){
		data = {};
	}

	data.action = "update";
	/*
	 * operations:
	 * -saveScene - uloží scenu
	 * -deleteScene - zmaže scenu
	 */
	var cookies = parseCookies(req);

	if(cookies.user_id){
		data.user_id = cookies.user_id;
	}
};



app.post('/checkWatchData', function(req, res){
	processPostData(req, function(data){
		checkWatchRequest(JSON.parse(data.replace("content=", "")), res);
	})
});

/*
 * prijme od sharera všetky aktualne dáta
 */
sendAllData = function(data){
	serverLogs.messageRecieve("sendAllData", data);
	data.msg["shareOptions"] = connection.getShareOptions(data.id);
	data.msg["watchOptions"] = connection.getWatchOptions(connection.getWatcher(data.id, data.target));
	console.log("boly prijatá všetky dáta od sharera a odosielju sa uživatelovy s id " + data.target);

	connection.getWatcher(data.id, data.target).socket.emit("sendAllData", data.msg);//TOREMOVE
};


paintAction = function(data){
	serverLogs.messageRecieve("paintAction", data);
	writeToWatchers(connection.getWatchers(data.id), "paintAction", data.msg);
};

chatMessage = function(data){
	serverLogs.messageRecieve("chatMessage", data);

	writeToAllExcept(data.id, this, "chatMessage", data.msg);
};

dataReqiere = function(data){
	serverLogs.addOverviewSocket(this);
};

action = function(data){
	serverLogs.messageRecieve("action", data);
	writeToWatchers(connection.getWatchers(data.id), "action", data.msg);
};

mouseData = function(data){
	serverLogs.messageRecieve("mouseData", data);
	if(connection.existShare(data.id)){
		writeToWatchers(connection.getWatchers(data.id), "mouseData", data.msg);
	}
	else{
		console.log("id " + data.id + " neexistuje v zozname ideciek");
	}
};

changeCreator = function(data){
	serverLogs.messageRecieve("changeCreator", data);
	writeToWatchers(connection.getWatchers(data.id), "changeCreator", data.msg);
};

createWatcher = function(data){
	connection.setUpWatcher(this, data["userId"]);
	//TODO overiť či je shareId aj userId správne
	var nickName = connection.getWatcher(data.shareId, this).nickName;
	connection.getOwner(data.shareId).emit("getAllData", {target: this.id, nickName: nickName});
};

function writeToAllExcept(id, socket, type, msg){
	var watchers = connection.getWatchers(id);
	for(var i in watchers){
		if(watchers.hasOwnProperty(i) && watchers[i].socket != socket){
			watchers[i].socket.emit(type, msg);
		}
	}

	var owner = connection.getOwner(id);
	if(owner != socket){
		owner.emit(type, msg)
	}
}

function writeToWatchers(watchers, type, msg){
	for(var i in watchers){
		if(watchers.hasOwnProperty(i)){
			watchers[i].socket.emit(type, msg);
		}
	}
}

function getUserId(){
	return Math.floor(Math.random() * config.maximumUsers);
}

function getChatId(){
	return Math.floor(Math.random() * config.maximumChats);
}

/*
 * dostane správu že uživaťel chce začať zdielať obrazovku
 */
startShare = function(data){
	var id = getChatId();
	serverLogs.increase("startShare");
	serverLogs.messageRecieve("startShare", data);
	console.log("začina zdielať: ", data, "id: " + id);
	connection.startShare(id, this, data);

	this.emit("confirmShare", {id: id});
};